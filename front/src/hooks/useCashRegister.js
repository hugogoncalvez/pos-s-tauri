import { useContext, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AuthContext } from '../context/AuthContext';
import { db } from '../db/offlineDB';
import { UseFetchQuery } from './useQuery';
import { useOnlineStatus } from './useOnlineStatus';
import { useSubmit } from './useSubmit';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';

export const useCashRegister = () => {
    const theme = useTheme(); // <--- AÑADIDO
    const { usuario: user, isLoading: authLoading } = useContext(AuthContext);
    const userId = user?.id;
    const userName = user?.username;
    const { isOnline } = useOnlineStatus();
    const queryClient = useQueryClient();

    const { mutateAsync, isLoading: isSavingMovement } = useSubmit();

    const { data: rawActiveSessionData, isLoading: isLoadingOnlineSession, refetch: refetchOnlineSession } = UseFetchQuery(
        ['activeCashSession', userId],
        `/cash-sessions/active/${userId}`,
        !authLoading && !!userId && isOnline,
        0
    );

    const localSession = useLiveQuery(
        async () => {
            if (!userId) return null;
            try {
                const session = await db.active_cash_session.toCollection().first();
                return session || null;
            } catch (error) {
                console.error('[useCashRegister] Error leyendo sesión desde Dexie:', error);
                return null;
            }
        },
        [userId]
    );

    const activeSession = useMemo(() => {
        if (isOnline) {
            if (rawActiveSessionData?.hasActiveSession) {
                return rawActiveSessionData.session;
            } else if (isLoadingOnlineSession && localSession) {
                return localSession;
            } else {
                return null;
            }
        } else {
            return localSession;
        }
    }, [isOnline, rawActiveSessionData, localSession, isLoadingOnlineSession]);

    const isLoadingActiveSession = useMemo(() => {
        if (authLoading) return true;
        if (isOnline) return isLoadingOnlineSession;
        return localSession === undefined;
    }, [authLoading, isOnline, isLoadingOnlineSession, localSession]);

    const createCashMovement = useCallback(async (payload) => {
        if (!userId || !activeSession?.id) {
            const errorMessage = "No hay una sesión de caja activa para registrar el movimiento.";
            mostrarError(errorMessage, theme);
            throw new Error(errorMessage);
        }

        try {
            if (isOnline) {
                // MODO ONLINE: Intentar guardar directamente en el backend
                await mutateAsync({
                    url: '/cash-sessions/movement',
                    values: payload,
                    method: 'post',
                });
                mostrarExito('Movimiento de caja registrado con éxito.', theme);
            } else {
                // MODO OFFLINE: Guardar en la cola de Dexie
                const movementToQueue = {
                    ...payload,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    synced: 0,
                    retryCount: 0,
                    lastError: null,
                };
                await db.pending_cash_movements.add(movementToQueue);
                mostrarExito('Movimiento guardado localmente. Se sincronizará al recuperar la conexión.', theme);
            }

            // Refrescar datos en ambos casos para consistencia de la UI
            await queryClient.invalidateQueries(['activeCashSession', userId]);
            if (isOnline) {
                await refetchOnlineSession();
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al registrar el movimiento de caja.';
            mostrarError(errorMessage, theme);
            throw error;
        }
    }, [isOnline, userId, activeSession?.id, mutateAsync, queryClient, refetchOnlineSession, theme]);


    return {
        activeSession,
        isLoadingActiveSession,
        refreshActiveSession: async () => {
            if (isOnline) {
                await refetchOnlineSession();
            }
        },
        createCashMovement,
        isSavingMovement,
        userName
    };
};
