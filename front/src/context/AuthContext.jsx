import React, { createContext, useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML';

import { useIsTauri } from '../hooks/useIsTauri';
import { exit } from '@tauri-apps/plugin-process';
import { debounce } from '../functions/Debounce';
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
  isOnline: true,
  connectionStatus: 'online', // 'online' | 'degraded' | 'offline'
});
export const useAuth = () => useContext(AuthContext);

// Pings de confirmación antes de declarar offline definitivo
const CONFIRMATION_PINGS = 2;
const CONFIRMATION_DELAY_MS = 3000;

export const AuthProvider = ({ children }) => {
  const { isTauri, isLoading: isTauriLoading } = useIsTauri();
  const queryClient = useQueryClient();

  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);

  // Sistema de 3 estados: 'online' | 'degraded' | 'offline'
  const [connectionStatus, setConnectionStatus] = useState('online');

  const checkIntervalRef = useRef(null);
  const isConfirmingRef = useRef(false); // evita múltiples loops de confirmación en paralelo
  // Ref para leer el estado actual sin stale closures
  const connectionStatusRef = useRef('online');

  // isOnline como derivado para compatibilidad con el resto del código
  const isOnline = connectionStatus !== 'offline';

  // Sincronizar ref con estado
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  // Ping único: retorna true/false sin excepciones
  const doPing = useCallback(async () => {
    try {
      const response = await Api.get('/health', { timeout: 10000 });
      const data = response.data;
      const isOk = data && (data.status === 'ok' || data.status === 'warning');
      if (!isOk) {
        info(`[AuthContext] ⚠️ Ping respondió pero estado inesperado: ${JSON.stringify(data)}`);
      }
      return isOk;
    } catch (err) {
      const errMsg = err.code || err.message || 'Error desconocido';
      const status = err.response?.status || 'sin respuesta';
      info(`[AuthContext] ❌ Ping falló: ${errMsg} | status: ${status} | timeout: ${err.code === 'ECONNABORTED' ? 'SÍ' : 'NO'}`);
      return false;
    }
  }, []);

  // Loop de confirmación: lanza N pings con delay.
  // Si alguno funciona → vuelve a ONLINE. Si todos fallan → OFFLINE.
  const runConfirmationLoop = useCallback(async () => {
    if (isConfirmingRef.current) return;
    isConfirmingRef.current = true;
    info(`[AuthContext] 🟡 Conexión inestable. Iniciando ${CONFIRMATION_PINGS} pings de confirmación...`);

    let recovered = false;
    for (let i = 0; i < CONFIRMATION_PINGS; i++) {
      await new Promise(res => setTimeout(res, CONFIRMATION_DELAY_MS));
      const ok = await doPing();
      if (ok) {
        recovered = true;
        break;
      }
      info(`[AuthContext] ❌ Confirmación ${i + 1}/${CONFIRMATION_PINGS} fallida.`);
    }

    if (recovered) {
      info(`[AuthContext] 🟢 Conexión recuperada durante confirmación. Volviendo a ONLINE.`);
      onlineManager.setOnline(true);
      setConnectionStatus('online');
    } else {
      error(`[AuthContext] 🔴 Sin conexión confirmado. Cambiando a OFFLINE.`);
      onlineManager.setOnline(false);
      setConnectionStatus('offline');
    }

    isConfirmingRef.current = false;
  }, [doPing]);

  const checkRealConnectivity = useCallback(async () => {
    // No interferir si hay un loop de confirmación en curso
    if (isConfirmingRef.current) return;

    const ok = await doPing();
    const current = connectionStatusRef.current;

    if (ok) {
      if (current !== 'online') {
        info(`[AuthContext] 🟢 Conexión restaurada. Cambiando a ONLINE.`);
        onlineManager.setOnline(true);
        setConnectionStatus('online');
      }
    } else {
      if (current === 'online') {
        // Primer fallo: pasar a DEGRADADO e iniciar confirmación en paralelo (sin bloquear el intervalo)
        info(`[AuthContext] 🟡 Primer fallo detectado. Cambiando a DEGRADADO.`);
        setConnectionStatus('degraded');
        connectionStatusRef.current = 'degraded';
        runConfirmationLoop();
      }
      // Si ya estamos en 'degraded' → runConfirmationLoop ya está corriendo
      // Si ya estamos en 'offline' → esperamos a que un ping futuro funcione (rama ok arriba)
    }
  }, [doPing, runConfirmationLoop]);

  useEffect(() => {
    if (isTauriLoading) return;

    info('[AuthContext] 🌐 Verificación activa de conectividad (3 estados).');
    checkRealConnectivity();
    checkIntervalRef.current = setInterval(checkRealConnectivity, 15000);
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
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
      setUsuario(null);
      setIsAuthenticated(false);
      setPermisos([]);
      localStorage.removeItem('sessionID');
      await db.active_cash_session.clear();
      queryClient.clear();
      info('[AuthContext] ✅ Limpieza de sesión completa. Redirigiendo a login.');
      window.location.href = '/auth';
    }
  }, [isOnline, queryClient]);

  const logoutAndExit = useCallback(async () => {
    info('[AuthContext] 🚪 Ejecutando logoutAndExit...');
    setUsuario(null);
    setIsAuthenticated(false);
    setPermisos([]);

    try {
      if (isOnline) {
        Api.post('/auth/logout');
      }
    } catch (err) {
      error(`[AuthContext] Error al notificar al backend sobre el logout: ${err}`);
    } finally {
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      info('[AuthContext] ✅ Limpieza de storage completada. Cerrando aplicación en 300ms.');
      setTimeout(() => { exit(0); }, 300);
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
    connectionStatus,
  }), [usuario, isAuthenticated, isLoading, permisos, isOnline, connectionStatus, login, logout, logoutAndExit, verificarSesion, updateUserTheme]);

  if (isTauriLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};