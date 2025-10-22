import { useEffect, useState, useContext, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncService } from '../services/syncService';
import { AuthContext } from '../context/AuthContext';
import { db } from '../db/offlineDB'; // Import db
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

export const useSyncManager = () => {
  const { isOnline } = useOnlineStatus();
  const { isAuthenticated, usuario } = useContext(AuthContext);
  const queryClient = useQueryClient(); // Get queryClient
  const [pendingSync, setPendingSync] = useState({ pendingSales: 0, pendingTickets: 0, permanentlyFailedSales: 0 });
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleSyncClick = useCallback(async () => {
    if (!isOnline) {
      console.warn('[SyncManager] No hay conexión, saltando sincronización manual.');
      return;
    }
    if (!usuario?.id) {
      console.warn('[SyncManager] No hay usuario logueado, saltando sincronización manual.');
      return;
    }

    setShowSyncModal(true); // Show modal while syncing

    try {
      // recargar referencia (repoblar Dexie)
      await syncService.loadReferenceData(usuario.id);
      
      // si existen ventas pendientes, sincronizarlas
      const activeSession = await db.active_cash_session.toCollection().first();
      if (activeSession && activeSession.id) {
        await syncService.syncPendingSalesWithSession(activeSession.id, usuario.id, (p)=>console.log('sync progress', p));
      } else {
        await syncService.syncPendingSales(usuario.id);
      }
      
      // Invalidar queries para refrescar la UI después de la sincronización
      queryClient.invalidateQueries(); // Invalidate all queries for a full refresh
      
    } catch (err) {
      console.error('Error en sincronización manual:', err);
      // Optionally show a Swal error here
    } finally {
      // setShowSyncModal(false); // Modal will be closed by handleSyncComplete
    }
  }, [isOnline, usuario, queryClient]);

  const handleSyncComplete = useCallback(() => {
    setShowSyncModal(false);
    // Optionally refetch stats here if not already done by syncService.onSyncStatusChange
  }, []);

  useEffect(() => {
    const updateSyncStats = async () => {
      if (usuario?.id) { // Only update if user is logged in
        const stats = await syncService.getSyncStats(usuario.id);
        setPendingSync(stats);
      } else {
        setPendingSync({ pendingSales: 0, permanentlyFailedSales: 0 }); // Clear stats if no user
      }
    };

    // Carga inicial de estadisticas
    updateSyncStats();

    // Se suscribe a los cambios en la base de datos para obtener actualizaciones en tiempo real.
    // Esto es mucho más eficiente que sondear con setInterval.
    const unsubscribe = syncService.onSyncStatusChange(updateSyncStats);

    // Limpia la suscripción cuando el componente se desmonta.
    return () => {
      unsubscribe();
    };
  }, [usuario?.id]); // Add usuario.id as a dependency

  console.log("[useSyncManager] Retornando pendingSync:", pendingSync);
  return {
    pendingSync,
    showSyncModal,
    setShowSyncModal,
    handleSyncClick,
    handleSyncComplete
  };
};
