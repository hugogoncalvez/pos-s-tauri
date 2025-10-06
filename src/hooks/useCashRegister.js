import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Asumo que AuthContext proporciona el usuario
import { Api } from '../api/api'; // Asumo que tienes una instancia de Axios configurada
import { UseFetchQuery } from './useQuery'; // Para obtener la sesión activa
import { useSubmit } from './useSubmit'; // Para enviar el movimiento
import Swal from 'sweetalert2';

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

    // Query para obtener la sesión de caja activa
    const { data: activeSessionData, isLoading: isLoadingActiveSession, refetch: refetchActiveSession } = UseFetchQuery(
        ['activeCashSession', userId], // Clave de caché única por usuario
        `/cash-sessions/active/${userId}`, // Endpoint para obtener la sesión activa
        !authLoading && !!userId // Habilitar la query solo si AuthContext ha terminado de cargar Y hay un userId
    );

    /** @type {CashSession | null} */
    const activeSession = activeSessionData?.session || null;

    // Hook para enviar datos al backend (para crear movimientos)
    const { mutateAsync: submitMovement, isLoading: isSavingMovement } = useSubmit();

    /**
     * @function createCashMovement
     * @description Registra un nuevo movimiento de efectivo (ingreso/egreso) en la sesión activa.
     * @param {'ingreso' | 'egreso'} type - Tipo de movimiento.
     * @param {number} amount - Monto del movimiento.
     * @param {string} description - Descripción del movimiento.
     * @returns {Promise<boolean>} True si el movimiento se registró con éxito, false en caso contrario.
     */
    const createCashMovement = useCallback(async (movementData) => { // Changed arguments to a single object
        const { amount, type, description } = movementData; // Destructure movementData
        if (!activeSession?.id) {
            Swal.fire('Error', 'No hay una sesión de caja activa para registrar movimientos.', 'error');
            return false;
        }

        try {
            await submitMovement({
                url: '/cash-sessions/movement',
                values: {
                    cash_session_id: activeSession.id,
                    amount,
                    type,
                    description
                },
                method: 'post' // Asegurarse de que sea un POST
            });
            refetchActiveSession(); // Refrescar la sesión activa para actualizar el monto actual
            return true;
        } catch (error) {
            console.error('Error al crear movimiento de caja:', error);
            const errorMessage = error.response?.data?.message || 'Error al registrar el movimiento.';
            Swal.fire('Error', errorMessage, 'error');
            return false;
        }
    }, [activeSession, submitMovement, refetchActiveSession]);

    return {
        activeSession,
        isLoadingActiveSession,
        createCashMovement,
        refreshActiveSession: refetchActiveSession,
        isSavingMovement,
        userName // Exportar el nombre de usuario para el modal
    };
};
