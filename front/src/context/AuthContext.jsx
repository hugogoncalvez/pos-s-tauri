import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { useIsTauri } from '../hooks/useIsTauri';
import { debounce } from '../functions/Debounce'; // Importar debounce

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();

  console.log('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Inicializar con navigator.onLine
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    const healthCheckUrl = `${import.meta.env.VITE_API_URL || 'http://192.168.100.10:8000'}/api/health`;
    try {
      const fetcher = isTauri ? tauriFetch : fetch;
      const response = await fetcher(healthCheckUrl, {
        method: 'GET',
        timeout: 5000,
        cache: 'no-store' // Evitar caché para el health check
      });

      if (!response.ok) {
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
          console.log(`[AuthContext] 🔄 Estado de conexión cambiado a: ${reallyOnline ? 'ONLINE' : 'OFFLINE'}`);
        }
        return reallyOnline;
      });

    } catch (error) {
      setIsOnline(prev => {
        if (prev !== false) {
          console.log('[AuthContext] ⚠️ Error en health-check, cambiando a OFFLINE:', error.message);
        }
        return false;
      });
    }
  }, [isTauri]);

  useEffect(() => {
    if (isTauriLoading) return;

    if (isTauri) {
      console.log('[AuthContext] 🌐 Modo Tauri: verificación activa de conectividad habilitada.');
      checkRealConnectivity(); // chequeo inicial
      checkIntervalRef.current = setInterval(checkRealConnectivity, 15000);
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    } else {
      console.log('[AuthContext] 💻 Modo Web/Dev: usando eventos navigator.onLine');
      const handleOnline = debounce(() => {
        console.log('[AuthContext] 🌐 Evento: ONLINE');
        setIsOnline(true);
        checkRealConnectivity(); // También verificar la conectividad real al backend
      }, 300);
      const handleOffline = debounce(() => {
        console.log('[AuthContext] 🔌 Evento: OFFLINE');
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
    console.log('[AuthContext] 🔍 Verificando sesión...');

    if (!isOnline) {
      console.log('[AuthContext] ⚠️ Sin conexión, saltando verificación de sesión.');
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
          console.log('[AuthContext] ✅ Sesión activa verificada.');
          setUsuario(data.usuario);
          setIsAuthenticated(true);
          setPermisos(data.usuario.permisos || []);
          // ✅ Sincroniza datos locales tras verificar sesión
          await syncService.loadReferenceData(data.usuario.id);
        } else {
          console.log('[AuthContext] ℹ️ No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('[AuthContext] ℹ️ Servidor responde 401. No hay sesión activa.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          setIsLoading(false);
          return;
        }
        console.warn(`[AuthContext] Intento ${attempt}/${maxRetries} fallido.`, error.message);
        if (attempt < maxRetries) await delay(retryDelay);
      }
    }
    setIsLoading(false);
  }, [isOnline, isTauriLoading]);

  const logout = useCallback(() => {
    console.log('[AuthContext] 🚪 Ejecutando logout...');
    setIsAuthenticated(false);
    setUsuario(null);
    setPermisos([]);
    localStorage.removeItem('sessionID');

    if (isOnline) {
      Api.post('/auth/logout').catch(err =>
        console.error('[AuthContext] Error al cerrar sesión en backend:', err)
      );
    }
  }, [isOnline]);

  const login = async (username, password) => {
    if (isOnline) {
      console.log('[AuthContext] 🔐 Login online...');
      try {
        const { data } = await Api.post('/auth/login', { username, password });
        console.log('[AuthContext] ✅ Login exitoso:', data);

        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);
        if (data.sessionID) localStorage.setItem('sessionID', data.sessionID);

        // ✅ Sincroniza BD local al loguear
        await syncService.loadReferenceData(data.usuario.id);

        return { success: true, usuario: data.usuario };
      } catch (error) {
        console.error('[AuthContext] ❌ Error en login:', error);
        mostrarHTML({
          title: 'Error de Conexión',
          html: `<p>Ocurrió un error de red: ${error.message}</p>`,
          icon: 'error'
        });
        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: 'Error de red' };
      }
    } else {
      console.log('[AuthContext] 🔐 Login offline...');
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
          console.log('[AuthContext] ⚠️ Interceptor detectó 401.');
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