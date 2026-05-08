import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook para acceder al estado de conectividad.
 * connectionStatus: 'online' | 'degraded' | 'offline'
 * isOnline: true si no es 'offline' (compatible con código existente)
 */
export const useOnlineStatus = () => {
  const { isOnline, connectionStatus } = useContext(AuthContext);
  return {
    isOnline,
    connectionStatus,
    isInternetOnline: isOnline,
    isServerOnline: isOnline,
    isDegraded: connectionStatus === 'degraded',
  };
};
