import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { useIsTauri } from '../hooks/useIsTauri';
import Swal from 'sweetalert2'; // <-- IMPORTAR Swal

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
      const healthCheckUrl = `${Api.defaults.baseURL}/health`;
      const response = await fetcher(healthCheckUrl, {
        method: 'GET',
        timeout: 5000,
        // La opción 'cache' no es soportada por tauri-plugin-http, se elimina.
      });

      if (!response.ok) {
        const errorMsg = `Health check falló con estado: ${response.status}. URL: ${healthCheckUrl}`;
        Swal.fire({
          title: 'Error de Conectividad',
          text: errorMsg,
          icon: 'error',
          didOpen: () => { document.querySelector('.swal2-container').style.zIndex = '99999'; }
        });
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const reallyOnline = data.db === true;

      if (!reallyOnline) {
        Swal.fire({
          title: 'Base de Datos Desconectada',
          text: `El backend está accesible, pero no puede conectar con la base de datos. URL: ${healthCheckUrl}`,
          icon: 'warning',
          didOpen: () => { document.querySelector('.swal2-container').style.zIndex = '99999'; }
        });
      }

      setIsOnline(prev => {
        if (prev !== reallyOnline) {
          // console.log(`[AuthContext] 🔄 Estado de conexión (Activo) cambiado a: ${reallyOnline ? 'ONLINE' : 'OFFLINE'}`); // No visible en build
        }
        return reallyOnline;
      });
    } catch (error) {
      const errorDetails = error?.message || error?.toString() || 'Error desconocido';
      console.error('[AuthContext] Error completo:', error);
      
      Swal.fire({
        title: 'Error de Conectividad',
        text: `Error en health check: ${errorDetails}. URL: ${Api.defaults.baseURL}/health`,
        icon: 'error',
        didOpen: () => { document.querySelector('.swal2-container').style.zIndex = '99999'; }
      });
      // console.error('[AuthContext] Error en health check:', error); // No visible en build
      setIsOnline(prev => {
        if (prev !== false) {
          // console.log('[AuthContext] 🔄 Cambiando a OFFLINE por error en chequeo activo:', error.message); // No visible en build
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