import React, { createContext, useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';

import { useIsTauri } from '../hooks/useIsTauri';
import { exit } from '@tauri-apps/plugin-process';
import { debounce } from '../functions/Debounce'; // Importar debounce
import { info, error } from '@tauri-apps/plugin-log';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const MAX_CONSECUTIVE_ERRORS = 3; // Requerir 3 fallos para pasar a OFFLINE
const MIN_CONSECUTIVE_SUCCESS = 2; // Requerir 2 éxitos para volver a ONLINE

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();

  info('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Usar useRef para los contadores para no disparar re-renders
  const errorCountRef = useRef(0);
  const successCountRef = useRef(0);
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    const healthCheckUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/health`;
    await info(`[AuthContext] Verificando conexión a: ${healthCheckUrl} (Errores: ${errorCountRef.current}, Éxitos: ${successCountRef.current})`);

    try {
      const response = await Api.get('/health', { timeout: 15000 });
      const data = response.data;

      if (data && data.db === true) {
        errorCountRef.current = 0;

        if (!isOnline) {
          successCountRef.current += 1;
          if (successCountRef.current >= MIN_CONSECUTIVE_SUCCESS) {
            info(`[AuthContext] 🔄 Conexión restablecida. Cambiando a ONLINE.`);
            setIsOnline(true);
            successCountRef.current = 0;
          }
        } else {
          // Si ya estamos online, simplemente reiniciamos el contador de éxitos si es necesario.
          if (successCountRef.current > 0) {
            successCountRef.current = 0;
          }
        }
      } else {
        throw new Error('La respuesta del Health-check no fue la esperada.');
      }
    } catch (err) {
      successCountRef.current = 0;
      errorCountRef.current += 1;
      await error(`[AuthContext] ⚠️ Fallo en health-check N°${errorCountRef.current}: ${err.message}`);

      if (isOnline && errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
        error(`[AuthContext] ⚠️ Conexión perdida. Cambiando a OFFLINE.`);
        setIsOnline(false);
        errorCountRef.current = 0;
      }
    }
  }, [isOnline]); // La dependencia ahora es solo isOnline, que es estable hasta que realmente cambia.


  useEffect(() => {
    if (isTauriLoading) return;

    if (isTauri) {
      info('[AuthContext] 🌐 Modo Tauri: verificación activa de conectividad habilitada.');
      checkRealConnectivity(); // chequeo inicial
      checkIntervalRef.current = setInterval(checkRealConnectivity, 30000); // Intervalo de 30 segundos
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
        checkRealConnectivity();
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
          syncService.loadReferenceData(data.usuario.id);
        } else {
          info('[AuthContext] ℹ️ No hay sesión activa. Limpiando datos sensibles.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          localStorage.removeItem('sessionID');
        }
        setIsLoading(false);
        return;
      } catch (err) {
        if (err.response?.status === 401) {
          info('[AuthContext] ℹ️ Servidor responde 401. Limpiando datos sensibles.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
          localStorage.removeItem('sessionID');
          setIsLoading(false);
          return;
        }
        error(`[AuthContext] Intento ${attempt}/${maxRetries} fallido. ${err.message}`);
        if (attempt < maxRetries) await delay(retryDelay);
      }
    }
    setIsLoading(false);
  }, [isOnline, isTauriLoading]);

  const logout = useCallback(async () => {
    info('[AuthContext] 🚪 Ejecutando logout y limpieza destructiva...');
    try {
      if (isOnline) {
        await Api.post('/auth/logout');
      }
    } catch (err) {
      error(`[AuthContext] Error al notificar al backend sobre el logout. Procediendo con limpieza local: ${err}`);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }, [isOnline]);

  const logoutAndExit = useCallback(async () => {
    info('[AuthContext] 🚪 Ejecutando logoutAndExit...');
    try {
      if (isOnline) {
        await Api.post('/auth/logout');
      }
    } catch (err) {
      error(`[AuthContext] Error al notificar al backend sobre el logout: ${err}`);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      info('[AuthContext] ✅ Limpieza de storage completada. Cerrando aplicación.');
      await exit(0);
    }
  }, [isOnline]);

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
  }, [verificarSesion, isTauriLoading]);

  const value = useMemo(() => ({
    usuario,
    isAuthenticated,
    isLoading,
    permisos,
    login,
    logout,
    logoutAndExit,
    verificarSesion,
    updateUserTheme,
    isOnline,
  }), [usuario, isAuthenticated, isLoading, permisos, isOnline, login, logout, logoutAndExit, verificarSesion, updateUserTheme]);

  if (isTauriLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};