import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { useIsTauri } from '../hooks/useIsTauri';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();

  console.log('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    try {
      const fetcher = isTauri ? tauriFetch : fetch;
      const response = await fetcher(`${Api.defaults.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data = await response.json();
      const reallyOnline = data.db === true;

      setIsOnline(prev => {
        if (prev !== reallyOnline) {
          console.log(`[AuthContext] 🔄 Estado de conexión (Activo) cambiado a: ${reallyOnline ? 'ONLINE' : 'OFFLINE'}`);
        }
        return reallyOnline;
      });
    } catch (error) {
      setIsOnline(prev => {
        if (prev !== false) {
          console.log('[AuthContext] 🔄 Cambiando a OFFLINE por error en chequeo activo:', error.message);
        }
        return false;
      });
    }
  }, [isTauri]);

  useEffect(() => {
    if (isTauriLoading) return;

    if (isTauri) {
      console.log('[AuthContext]  Tauri detectado. Configurando verificación activa de conectividad.');
      checkRealConnectivity();
      checkIntervalRef.current = setInterval(checkRealConnectivity, 20000);
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    } else {
      console.log('[AuthContext] Entorno Web/Dev. Usando eventos estándar de navigator.onLine.');
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isTauri, isTauriLoading, checkRealConnectivity]);

  const updateUserTheme = (newTheme) => {
    setUsuario(prev => (prev && prev.theme_preference !== newTheme) ? { ...prev, theme_preference: newTheme } : prev);
  };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const verificarSesion = useCallback(async () => {
    if (isTauriLoading || !isOnline) {
      console.log('[AuthContext] ⚠️ Sin conexión o cargando entorno, saltando verificación de sesión.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const maxRetries = 3;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        setIsLoading(false);
        return;
      } catch (error) {
        if (error.response?.status === 401) {
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          setIsLoading(false);
          return;
        }
        if (attempt >= maxRetries) {
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        } else {
          await delay(retryDelay);
        }
      }
    }
    setIsLoading(false);
  }, [isOnline, isTauriLoading]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsuario(null);
    setPermisos([]);
    localStorage.removeItem('sessionID');
    if (isOnline) {
      try {
        Api.post('/auth/logout');
      } catch (error) {
        console.error('[AuthContext] Error al cerrar sesión en el backend:', error);
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
        if (data.sessionID) {
          localStorage.setItem('sessionID', data.sessionID);
        }
        return { success: true, usuario: data.usuario };
      } catch (error) {
        mostrarHTML({
          title: 'Error de Conexión',
          html: `Ocurrió un error de red al intentar iniciar sesión.`,
          icon: 'error'
        });
        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: 'Error de red.' };
      }
    } else {
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
    if (isTauriLoading) return;
    verificarSesion();
    const interceptor = Api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('[AuthContext] ⚠️ Interceptor detectó 401 (manejado en api.js)');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      Api.interceptors.response.eject(interceptor);
    };
  }, [verificarSesion, isOnline, isTauriLoading]);

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

  if (isTauriLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};