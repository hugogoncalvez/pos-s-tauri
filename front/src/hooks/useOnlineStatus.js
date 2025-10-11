import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useOnlineStatus = () => {
  const { isOnline } = useContext(AuthContext);
  // El estado principal de conexión ahora se gestiona en AuthContext.
  // Devolvemos el isOnline de AuthContext, y otros placeholders para compatibilidad.
  return { isOnline: isOnline, isInternetOnline: isOnline, isServerOnline: isOnline };
};
