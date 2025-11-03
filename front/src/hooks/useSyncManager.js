import { useState, useContext, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { syncService } from '../services/syncService';
import { AuthContext } from '../context/AuthContext';

export const useSyncManager = () => {
  const { usuario } = useContext(AuthContext);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // 1. Usar useLiveQuery para obtener estadísticas reactivas
  const pendingSync = useLiveQuery(
    async () => {
      if (usuario?.id) {
        return syncService.getSyncStats(usuario.id);
      }
      // Si no hay usuario, devolver un objeto con ceros.
      return { pendingSales: 0, pendingTickets: 0, pendingCashMovements: 0, pendingSessions: 0, permanentlyFailedSales: 0 };
    },
    [usuario?.id] // La dependencia es el ID del usuario
  ) || { pendingSales: 0, pendingTickets: 0, pendingCashMovements: 0, pendingSessions: 0, permanentlyFailedSales: 0 }; // Valor por defecto mientras carga


  const handleSyncClick = useCallback(() => {
    setShowSyncModal(true);
  }, []);

  const handleSyncComplete = useCallback(() => {
    setShowSyncModal(false);
    // Ya no es necesario llamar a updateSyncStats manualmente,
    // useLiveQuery lo hará automáticamente.
  }, []);

  //console.log("[useSyncManager] Retornando pendingSync:", pendingSync);

  return {
    pendingSync,
    showSyncModal,
    setShowSyncModal,
    handleSyncClick,
    handleSyncComplete
  };
};