import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';

import { useIsTauri } from '../hooks/useIsTauri';
import { debounce } from '../functions/Debounce'; // Importar debounce
import { info, error } from '@tauri-apps/plugin-log';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();

  info('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Inicializar con navigator.onLine
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    const healthCheckUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/health`;

    await info(`[AuthContext] Verificando conexión a: ${healthCheckUrl}`);
    try {
      const response = await Api.get('/health'); // Use Axios directly
      const data = response.data; // Axios response has data directly

      const reallyOnline = data && data.db === true;
      setIsOnline(prev => {
        if (prev !== reallyOnline) {
          info(`[AuthContext] 🔄 Estado de conexión cambiado a: ${reallyOnline ? 'ONLINE' : 'OFFLINE'}`);
        }
        return reallyOnline;
      });

    } catch (err) {
      await error(`[AuthContext] ⚠️ Error en health-check para URL ${healthCheckUrl}: ${JSON.stringify(err)}`);
      setIsOnline(prev => {
        if (prev !== false) {
          error(`[AuthContext] ⚠️ Error en health-check, cambiando a OFFLINE: ${err.message}`);
        }
        return false;
      });
    }
  }, [isTauri]);

  useEffect(() => {
    if (isTauriLoading) return;

    if (isTauri) {
      info('[AuthContext] 🌐 Modo Tauri: verificación activa de conectividad habilitada.');
      checkRealConnectivity(); // chequeo inicial
      checkIntervalRef.current = setInterval(checkRealConnectivity, 15000);
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    } else {
      info('[AuthContext] 💻 Modo Web/Dev: usando eventos navigator.onLine');
      const handleOnline = debounce(() => {
        info('[AuthContext] 🌐 Evento: ONLINE');
        setIsOnline(true);
        checkRealConnectivity(); // También verificar la conectividad real al backend
      }, 300);
      const handleOffline = debounce(() => {
        info('[AuthContext] 🔌 Evento: OFFLINE');
        setIsOnline(false);
      }, 300);
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
    info('[AuthContext] 🔍 Verificando sesión...');

    if (!isOnline) {
      info('[AuthContext] ⚠️ Sin conexión, saltando verificación de sesión.');
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
          info('[AuthContext] ✅ Sesión activa verificada.');
          setUsuario(data.usuario);
          setIsAuthenticated(true);
          setPermisos(data.usuario.permisos || []);
          // ✅ Sincroniza datos locales tras verificar sesión (sin esperar)
          syncService.loadReferenceData(data.usuario.id);
        } else {
          info('[AuthContext] ℹ️ No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        }
        setIsLoading(false);
        return;
      } catch (err) {
        if (err.response?.status === 401) {
          info('[AuthContext] ℹ️ Servidor responde 401. No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          setIsLoading(false);
          return;
        }
        error(`[AuthContext] Intento ${attempt}/${maxRetries} fallido. ${err.message}`);
        if (attempt < maxRetries) await delay(retryDelay);
      }
    }
    setIsLoading(false);
  }, [isOnline, isTauriLoading]);

  const logout = useCallback(() => {
    info('[AuthContext] 🚪 Ejecutando logout...');
    setIsAuthenticated(false);
    setUsuario(null);
    setPermisos([]);
    localStorage.removeItem('sessionID');

    if (isOnline) {
                                    Api.post('/auth/logout').catch(err =>
                                      error(`[AuthContext] Error al cerrar sesión en backend: ${err}`)
                                    );    }  }, [isOnline]);

  const login = async (username, password) => {
    if (isOnline) {
      info('[AuthContext] 🔐 Login online...');
      try {
        const { data } = await Api.post('/auth/login', { username, password });
        info(`[AuthContext] ✅ Login exitoso: ${JSON.stringify(data)}`);

        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);
        if (data.sessionID) localStorage.setItem('sessionID', data.sessionID);

        // ✅ Sincroniza BD local al loguear (sin esperar)
        syncService.loadReferenceData(data.usuario.id);

        return { success: true, usuario: data.usuario };
      } catch (err) {
        error(`[AuthContext] ❌ Error en login: ${err.message}`);
        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: 'Error de red' };
      }
    } else {
      info('[AuthContext] 🔐 Login offline...');
      try {
        const offlineUserConfig = await db.offline_config.get('OFFLINE_USER');
        if (!offlineUserConfig) return { success: false, error: 'Configuración offline no encontrada.' };

        const offlineUser = offlineUserConfig.value;
        if (username === offlineUser.username && password === offlineUser.password) {
          setUsuario(offlineUser);
          setIsAuthenticated(true);
          setPermisos(offlineUser.permisos || []);
          return { success: true, usuario: offlineUser };
        } else {
          return { success: false, error: 'Credenciales offline incorrectas.' };
        }
      } catch {
        return { success: false, error: 'Error al acceder a la base local.' };
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
          info('[AuthContext] ⚠️ Interceptor detectó 401.');
        }
        return Promise.reject(error);
      }
    );
    return () => Api.interceptors.response.eject(interceptor);
  }, [verificarSesion, isTauriLoading]); // isOnline ya no es una dependencia directa aquí

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