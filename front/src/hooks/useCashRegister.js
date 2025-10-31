import { useContext, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AuthContext } from '../context/AuthContext';
import { db } from '../db/offlineDB';
import { UseFetchQuery } from './useQuery';
import { useOnlineStatus } from './useOnlineStatus';
import { useSubmit } from './useSubmit'; // Importar useSubmit
import { useQueryClient } from '@tanstack/react-query'; // Importar useQueryClient

export const useCashRegister = () => {
    const { usuario: user, isLoading: authLoading } = useContext(AuthContext);
    const userId = user?.id;
    const userName = user?.username;
    const { isOnline } = useOnlineStatus();
    const queryClient = useQueryClient(); // Obtener el cliente de query

    // Hook de mutación para manejar el guardado
    const { mutateAsync, isLoading: isSavingMovement } = useSubmit();

    // Query para obtener la sesión de caja activa desde la API (solo si está online)
    const { data: rawActiveSessionData, isLoading: isLoadingOnlineSession, refetch: refetchOnlineSession } = UseFetchQuery(
        ['activeCashSession', userId],
        `/cash-sessions/active/${userId}`,
        !authLoading && !!userId && isOnline,
        0
    );

    // useLiveQuery se suscribe automáticamente a cambios en la base de datos
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
        [userId] // Dependencias: re-ejecutar cuando userId cambie
    );

    // Combinar los resultados de la API y Dexie
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

    // Calcular el estado de carga
    const isLoadingActiveSession = useMemo(() => {
        if (authLoading) return true;
        if (isOnline) return isLoadingOnlineSession;
        return localSession === undefined;
    }, [authLoading, isOnline, isLoadingOnlineSession, localSession]);

    // --- IMPLEMENTACIÓN DE createCashMovement ---
    const createCashMovement = useCallback(async (payload) => {
        if (!userId) throw new Error("Usuario no autenticado.");

        if (isOnline) {
            // Lógica para guardar en el backend
            await mutateAsync({
                url: '/cash-movements', // Asumiendo este endpoint
                values: payload,
                method: 'POST',
            });
            // Invalidar queries relacionadas si es necesario
            queryClient.invalidateQueries(['cashMovements', payload.cash_session_id]);
        } else {
            // Lógica para guardar en Dexie (modo offline)
            const movementToQueue = {
                ...payload,
                user_id: userId,
                created_at: new Date().toISOString(),
                synced: 0, // 0 = pendiente de sincronización
            };
            await db.pending_cash_movements.add(movementToQueue);
            // Opcional: invalidar una query local si se muestra en algún lado
            queryClient.invalidateQueries(['pendingMovements']);
        }
    }, [isOnline, userId, mutateAsync, queryClient]);


    return {
        activeSession,
        isLoadingActiveSession,
        refreshActiveSession: async () => {
            if (isOnline) {
                await refetchOnlineSession();
            }
            // En offline, useLiveQuery actualiza automáticamente
        },
        createCashMovement, // <-- Devolver la función implementada
        isSavingMovement, // <-- Devolver el estado de carga
        userName
    };
};
