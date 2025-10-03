import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';

// 1. Crear el contexto
export const AuthContext = createContext();

// Hook para consumir el contexto de forma sencilla
export const useAuth = () => useContext(AuthContext);

// 2. Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {
  console.log('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateUserTheme = (newTheme) => {
    setUsuario(prev => (prev && prev.theme_preference !== newTheme) ? { ...prev, theme_preference: newTheme } : prev);
  };

  const verificarSesion = useCallback(async () => {
    if (!isOnline) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await Api.get('/auth/estado');
      if (data.estaLogueado) {
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);
      } else {
        setUsuario(null);
        setIsAuthenticated(false);
        setPermisos([]);
      }
    } catch (error) {
      setUsuario(null);
      setIsAuthenticated(false);
      setPermisos([]);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsuario(null);
    setPermisos([]);
    if (isOnline) {
      try {
        Api.post('/auth/logout');
      } catch (error) {
        console.error('Error al cerrar sesión en el backend:', error);
      }
    }
  }, [isOnline]);

  const login = async (username, password) => {
    if (isOnline) {
      try {
        const { data } = await Api.post('/auth/login', { username, password });
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);
        return { success: true, usuario: data.usuario };
      } catch (error) {
        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: error.response?.data?.error || 'Error al iniciar sesión.' };
      }
    } else {
      // --- Lógica de Login Offline ---
      try {
        const offlineUserConfig = await db.offline_config.get('OFFLINE_USER');
        if (!offlineUserConfig) {
          return { success: false, error: 'Configuración offline no encontrada.' };
        }
        const offlineUser = offlineUserConfig.value;

        if (username === offlineUser.username && password === offlineUser.password) {
          setUsuario(offlineUser);
          setIsAuthenticated(true);
          setPermisos(offlineUser.permisos || []);
          return { success: true, usuario: offlineUser };
        } else {
          return { success: false, error: 'Credenciales offline incorrectas.' };
        }
      } catch (error) {
        return { success: false, error: 'Error al acceder a la base de datos local.' };
      }
    }
  };

  useEffect(() => {
    verificarSesion();

    const interceptor = Api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (isOnline && error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      Api.interceptors.response.eject(interceptor);
    };
  }, [verificarSesion, logout, isOnline]);



  const value = {
    usuario,
    isAuthenticated,
    isLoading,
    permisos,
    login,
    logout,
    verificarSesion,
    updateUserTheme,
    isOnline,
  };

  console.log('[DEBUG] AuthProvider render END');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

