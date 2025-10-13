import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { useIsTauri } from '../hooks/useIsTauri';
import { debounce } from '../functions/Debounce'; // Importar debounce

// 🔧 Logger universal compatible con Web + Tauri
const log = async (msg, type = 'info') => {
  try {
    if (window.__TAURI__) {
      const { info, error } = await import('@tauri-apps/plugin-log');
      if (type === 'error') await error(msg);
      else await info(msg);
    } else {
      if (type === 'error') console.error(msg);
      else console.log(msg);
    }
  } catch (err) {
    console.error("Log error:", err);
  }
};

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();

  log('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Inicializar con navigator.onLine
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    const healthCheckUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/health`;

    await log(`[AuthContext] Verificando conexión a: ${healthCheckUrl}`);
    try {
      const fetcher = (isTauri && process.env.NODE_ENV !== 'development') ? tauriFetch : fetch;
      const response = await fetcher(healthCheckUrl, {
        method: 'GET',
        timeout: 5000,
        cache: 'no-store' // Evitar caché para el health check
      });

      if (!response.ok) {
        await log(`[AuthContext] Health check falló con estado: ${response.status} para URL: ${healthCheckUrl}`, 'error');
        throw new Error(`Health check falló con estado: ${response.status}`);
      }

      let data;
      if (isTauri) {
        data = response.data || await response.json();
      } else {
        data = await response.json();
      }

      const reallyOnline = data && data.db === true;
      setIsOnline(prev => {
        if (prev !== reallyOnline) {
          log(`[AuthContext] 🔄 Estado de conexión cambiado a: ${reallyOnline ? 'ONLINE' : 'OFFLINE'}`);
        }
        return reallyOnline;
      });

    } catch (err) {
      await log(`[AuthContext] ⚠️ Error en health-check para URL ${healthCheckUrl}: ${JSON.stringify(err)}`, 'error');
      setIsOnline(prev => {
        if (prev !== false) {
          log(`[AuthContext] ⚠️ Error en health-check, cambiando a OFFLINE: ${err.message}`, 'error');
        }
        return false;
      });
    }
  }, [isTauri]);

  useEffect(() => {
    if (isTauriLoading) return;

    if (isTauri) {
      log('[AuthContext] 🌐 Modo Tauri: verificación activa de conectividad habilitada.');
      checkRealConnectivity(); // chequeo inicial
      checkIntervalRef.current = setInterval(checkRealConnectivity, 15000);
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    } else {
      log('[AuthContext] 💻 Modo Web/Dev: usando eventos navigator.onLine');
      const handleOnline = debounce(() => {
        log('[AuthContext] 🌐 Evento: ONLINE');
        setIsOnline(true);
        checkRealConnectivity(); // También verificar la conectividad real al backend
      }, 300);
      const handleOffline = debounce(() => {
        log('[AuthContext] 🔌 Evento: OFFLINE');
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
    log('[AuthContext] 🔍 Verificando sesión...');

    if (!isOnline) {
      log('[AuthContext] ⚠️ Sin conexión, saltando verificación de sesión.');
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
          log('[AuthContext] ✅ Sesión activa verificada.');
          setUsuario(data.usuario);
          setIsAuthenticated(true);
          setPermisos(data.usuario.permisos || []);
          // ✅ Sincroniza datos locales tras verificar sesión
          await syncService.loadReferenceData(data.usuario.id);
        } else {
          log('[AuthContext] ℹ️ No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        if (error.response?.status === 401) {
          log('[AuthContext] ℹ️ Servidor responde 401. No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          setIsLoading(false);
          return;
        }
        log(`[AuthContext] Intento ${attempt}/${maxRetries} fallido. ${error.message}`, 'error');
        if (attempt < maxRetries) await delay(retryDelay);
      }
    }
    setIsLoading(false);
  }, [isOnline, isTauriLoading]);

  const logout = useCallback(() => {
    log('[AuthContext] 🚪 Ejecutando logout...');
    setIsAuthenticated(false);
    setUsuario(null);
    setPermisos([]);
    localStorage.removeItem('sessionID');

    if (isOnline) {
                        Api.post('/auth/logout').catch(err =>
                          log(`[AuthContext] Error al cerrar sesión en backend: ${err}`, 'error')
                        );    }  }, [isOnline]);

  const login = async (username, password) => {
    if (isOnline) {
      log('[AuthContext] 🔐 Login online...');
      try {
        const { data } = await Api.post('/auth/login', { username, password });
        log(`[AuthContext] ✅ Login exitoso: ${JSON.stringify(data)}`);

        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);
        if (data.sessionID) localStorage.setItem('sessionID', data.sessionID);

        // ✅ Sincroniza BD local al loguear
        await syncService.loadReferenceData(data.usuario.id);

        return { success: true, usuario: data.usuario };
      } catch (error) {
        log(`[AuthContext] ❌ Error en login: ${error}`, 'error');
        await log(`[AuthContext] ❌ Error en login: ${error.message}`, 'error');
        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: 'Error de red' };
      }
    } else {
      log('[AuthContext] 🔐 Login offline...');
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
          log('[AuthContext] ⚠️ Interceptor detectó 401.');
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