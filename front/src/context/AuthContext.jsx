import React, { createContext, useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';

import { useIsTauri } from '../hooks/useIsTauri';
import { exit } from '@tauri-apps/plugin-process';
import { debounce } from '../functions/Debounce'; // Importar debounce
import { info, error } from '@tauri-apps/plugin-log';
import { onlineManager } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

export const AuthContext = createContext({
  usuario: null,
  isAuthenticated: false,
  isLoading: true,
  permisos: [],
  login: async () => { },
  logout: async () => { },
  logoutAndExit: async () => { },
  verificarSesion: async () => { },
  updateUserTheme: () => { },
  isOnline: navigator.onLine,
});
export const useAuth = () => useContext(AuthContext);

const MAX_CONSECUTIVE_ERRORS = 8; // Más tolerante para la nube
const MIN_CONSECUTIVE_SUCCESS = 1;

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();
  const queryClient = useQueryClient();

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
    try {
      // Timeout extendido a 10 segundos (más tolerante a la latencia de la nube)
      const response = await Api.get('/health', { timeout: 10000 }); 
      const data = response.data;

      // Si el servidor responde (aunque diga warning), estamos ONLINE (el servidor está vivo)
      if (data && (data.status === 'ok' || data.status === 'warning')) {
        errorCountRef.current = 0;

        if (!isOnline) {
          successCountRef.current += 1;
          if (successCountRef.current >= MIN_CONSECUTIVE_SUCCESS) {
            info(`[AuthContext] 🔄 Conexión restablecida. Cambiando a ONLINE.`);
            onlineManager.setOnline(true);
            setIsOnline(true);
            successCountRef.current = 0;
          }
        }
      } else {
        throw new Error('Servidor respondió pero el estado no es saludable.');
      }
    } catch (err) {
      successCountRef.current = 0;
      errorCountRef.current += 1;

      if (isOnline && errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
        error(`[AuthContext] ⚠️ Conexión perdida tras ${errorCountRef.current} intentos. Cambiando a OFFLINE.`);
        onlineManager.setOnline(false);
        setIsOnline(false);
        errorCountRef.current = 0;
      }
    }
  }, [isOnline]);

  useEffect(() => {
    if (isTauriLoading) return;

    info('[AuthContext] 🌐 Verificación activa de conectividad.');
    checkRealConnectivity(); // chequeo inicial
    // Intervalo aumentado a 15s para reducir carga de red
    checkIntervalRef.current = setInterval(checkRealConnectivity, 15000);
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
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
    info('[AuthContext] 🚪 Ejecutando logout...');
    try {
      if (isOnline) {
        await Api.post('/auth/logout');
      }
    } catch (err) {
      error(`[AuthContext] Error al notificar al backend sobre el logout. Procediendo con limpieza local: ${err}`);
    } finally {
      // Limpieza profunda del estado de la aplicación
      setUsuario(null);
      setIsAuthenticated(false);
      setPermisos([]);
      localStorage.removeItem('sessionID');
      
      // Limpiar la sesión de caja activa de la base de datos local
      await db.active_cash_session.clear();

      // Limpiar la caché de React Query para eliminar todos los datos del usuario anterior
      queryClient.clear();

      info('[AuthContext] ✅ Limpieza de sesión completa. Redirigiendo a login.');

      // Forzar recarga a la página de login para un estado 100% limpio.
      window.location.href = '/auth';
    }
  }, [isOnline, queryClient]);

  const logoutAndExit = useCallback(async () => {
    info('[AuthContext] 🚪 Ejecutando logoutAndExit...');

    // Set state to logged out to prevent new operations
    setUsuario(null);
    setIsAuthenticated(false);
    setPermisos([]);

    try {
      if (isOnline) {
        // Fire and forget is fine, we are exiting anyway
        Api.post('/auth/logout');
      }
    } catch (err) {
      error(`[AuthContext] Error al notificar al backend sobre el logout: ${err}`);
    } finally {
      // Limpiar la caché de React Query primero
      queryClient.clear();

      localStorage.clear();
      sessionStorage.clear();
      info('[AuthContext] ✅ Limpieza de storage completada. Cerrando aplicación en 300ms.');
      setTimeout(() => {
        exit(0);
      }, 300);
    }
  }, [isOnline, queryClient]);

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