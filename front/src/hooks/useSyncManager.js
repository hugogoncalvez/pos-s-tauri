import { useEffect, useState, useContext } from 'react'; // Removed useCallback for now
import { useOnlineStatus } from './useOnlineStatus';
import { syncService } from '../services/syncService';
import { AuthContext } from '../context/AuthContext';

export const useSyncManager = () => {
  const { isOnline } = useOnlineStatus(); // Call useOnlineStatus once at the top level
  const { isAuthenticated, usuario } = useContext(AuthContext);
  const [pendingSync, setPendingSync] = useState({ pendingSales: 0, permanentlyFailedSales: 0 });
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    const updateSyncStats = async () => {
      const stats = await syncService.getSyncStats();
      setPendingSync(stats);
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
  }, []); // El array vacío asegura que la suscripción se configure una sola vez.

  console.log("[useSyncManager] Retornando pendingSync:", pendingSync);
  return {
    pendingSync,
    showSyncModal,
    setShowSyncModal
  };
};
