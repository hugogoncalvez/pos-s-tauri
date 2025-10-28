import { useState, useCallback } from 'react';
import { useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext'; // Asumo que AuthContext proporciona el usuario
import { UseFetchQuery } from './useQuery'; // Para obtener la sesión activa
import { syncService } from '../services/syncService';
import { useOnlineStatus } from './useOnlineStatus';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';


/**
 * @typedef {object} CashSession
 * @property {number} id - ID de la sesión de caja.
 * @property {number} user_id - ID del usuario que abrió la sesión.
 * @property {number} opening_amount - Monto inicial de la sesión.
 * @property {string} status - Estado de la sesión (e.g., 'abierta', 'cerrada').
 * @property {string} opened_at - Fecha y hora de apertura.
 * @property {number} current_cash - Monto actual en efectivo (calculado en backend).
 * @property {object} usuario - Objeto con datos del usuario (id, username, rol).
 */

/**
 * @hook useCashRegister
 * @description Hook personalizado para gestionar la sesión de caja activa del usuario.
 * Proporciona la sesión activa, estado de carga y funciones para crear movimientos.
 */
export const useCashRegister = () => {
    const { usuario: user, isLoading: authLoading } = useContext(AuthContext); // Obtener el usuario autenticado y el estado de carga de AuthContext
    const userId = user?.id; // ID del usuario
    const userName = user?.username; // Nombre del usuario
    const { isOnline } = useOnlineStatus();
    const [isSavingMovement, setIsSavingMovement] = useState(false);
    const theme = useTheme();

    console.log(`[useCashRegister] Query enabled condition: !authLoading (${!authLoading}) && !!userId (${!!userId}) = ${!authLoading && !!userId}`);

    // Query para obtener la sesión de caja activa
    const { data: rawActiveSessionData, isLoading: isLoadingActiveSession, refetch: refetchActiveSession } = UseFetchQuery(
        ['activeCashSession', userId], // Clave de caché única por usuario
        `/cash-sessions/active/${userId}`,
        !authLoading && !!userId, // Habilitar la query solo si AuthContext ha terminado de cargar Y hay un userId
        0 // staleTime: 0 para que siempre se considere stale y se intente refetch al backend cuando isOnline es true
    );

    /** @type {CashSession | null} */
    const activeSession = rawActiveSessionData?.hasActiveSession ? rawActiveSessionData.session : null;

    /**
     * @function createCashMovement
     * @description Registra un nuevo movimiento de efectivo (ingreso/egreso) en la sesión activa.
     * @param {object} movementData - Objeto con { amount, type, description }.
     * @returns {Promise<boolean>} True si el movimiento se registró con éxito, false en caso contrario.
     */
    const createCashMovement = useCallback(async (movementData) => {
        setIsSavingMovement(true);
        try {
            const result = await syncService.saveCashMovement(movementData);

            if (result.success) {
                mostrarExito('Movimiento guardado localmente. Se sincronizará más tarde.', theme);
                
                // Si estamos online, refrescamos la sesión para que el usuario vea el cambio,
                // aunque el dato real se actualizará tras la sincronización.
                if (isOnline) {
                    refetchActiveSession();
                }
                return true;
            }
            return false; // Should not be reached if saveCashMovement throws on failure
        } catch (error) {
            console.error('Error al crear movimiento de caja:', error);
            mostrarError(error.message || 'Error al registrar el movimiento.', theme);
            return false;
        } finally {
            setIsSavingMovement(false);
        }
    }, [isOnline, refetchActiveSession, theme]);

    return {
        activeSession,
        isLoadingActiveSession,
        createCashMovement,
        refreshActiveSession: refetchActiveSession,
        isSavingMovement,
        userName // Exportar el nombre de usuario para el modal
    };
};
