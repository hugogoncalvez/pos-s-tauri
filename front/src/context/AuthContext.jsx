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
  console.log('[DEBUG] AuthProvider render START');
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permisos, setPermisos] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isTauri } = useIsTauri();
  const checkIntervalRef = useRef(null);

  const checkRealConnectivity = useCallback(async () => {
    try {
      const fetcher = isTauri ? tauriFetch : fetch;
      const response = await fetcher(`${Api.defaults.baseURL}/health`, {
        method: 'GET',
        timeout: 5000,
        cache: 'no-store'
      });

      if (!response.ok) { // Chequeo universal para status no-2xx
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const data = await response.json(); // Método universal para obtener el cuerpo JSON
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
    if (isTauri) {
      console.log('[AuthContext]  Tauri detectado. Configurando verificación activa de conectividad.');
      checkRealConnectivity(); // Chequeo inicial
      checkIntervalRef.current = setInterval(checkRealConnectivity, 20000); // Chequeo cada 20 segundos
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
  }, [isTauri, checkRealConnectivity]);


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
    const retryDelay = 2000; // 2 segundos

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data } = await Api.get('/auth/estado');
        
        // Respuesta definitiva del servidor, no se necesita reintentar.
        if (data.estaLogueado) {
          console.log('[AuthContext] ✅ Sesión re-verificada exitosamente.');
          setUsuario(data.usuario);
          setIsAuthenticated(true);
          setPermisos(data.usuario.permisos || []);
        } else {
          console.log('[AuthContext] ℹ️ Servidor confirma que no hay sesión activa. Cerrando sesión.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        }
        setIsLoading(false);
        return; // Salir de la función, ya tenemos una respuesta.

      } catch (error) {
        // Este bloque se ejecuta solo en errores de RED (el servidor no es alcanzable)
        console.warn(`[AuthContext] Intento ${attempt}/${maxRetries} de verificar sesión falló (error de red).`);
        
        if (attempt >= maxRetries) {
          console.error('[AuthContext] ❌ Todos los intentos de verificar sesión fallaron. Cerrando sesión.');
          setUsuario(null);
          setIsAuthenticated(false);
          setPermisos([]);
        } else {
          await delay(retryDelay); // Esperar antes del siguiente intento
        }
      }
    }
    setIsLoading(false);
  }, [isOnline]);

  const logout = useCallback(() => {
    console.log('[AuthContext] 🚪 Ejecutando logout...');
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
      console.log('[AuthContext] 🔐 Intentando login online...');
      try {
        const { data } = await Api.post('/auth/login', { username, password });
        console.log('[AuthContext] ✅ Login exitoso:', data);

        setUsuario(data.usuario);
        setIsAuthenticated(true);
        setPermisos(data.usuario.permisos || []);

        if (data.sessionID) {
          localStorage.setItem('sessionID', data.sessionID);
        }

        return { success: true, usuario: data.usuario };

      } catch (error) {
        console.error('[AuthContext] ❌ Error en login:', error);

        const errorDetails = `
          <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 0.85rem;">
            <p>Ocurrió un error de red al intentar iniciar sesión.</p>
            <p>Esto generalmente se debe a que el cliente no puede contactar al servidor.</p>
            <hr>
            <strong>Detalles Técnicos:</strong>
            <ul>
              <li><strong>Mensaje:</strong> ${error.message}</li>
              <li><strong>URL de la Petición:</strong> ${error.config?.url}</li>
              <li><strong>Método:</strong> ${error.config?.method?.toUpperCase()}</li>
              <li><strong>Código de Error:</strong> ${error.code || 'N/A'}</li>
              <li><strong>Estado de la Respuesta:</strong> ${error.response?.status || 'N/A'}</li>
            </ul>
            <hr>
            <p><strong>Posibles Soluciones:</strong></p>
            <ol>
              <li>Verifique que el servidor backend esté en ejecución.</li>
              <li>Asegúrese de que la IP en la URL de la petición sea correcta y accesible.</li>
              <li>Revise que no haya otro firewall o un antivirus bloqueando la conexión.</li>
            </ol>
          </div>
        `;

        mostrarHTML({
          title: 'Error de Conexión',
          html: errorDetails,
          icon: 'error'
        });

        setIsAuthenticated(false);
        setUsuario(null);
        setPermisos([]);
        return { success: false, error: 'Error de red. Revisa los detalles en la alerta.' };
      }
    } else {
      // --- Lógica de Login Offline ---
      console.log('[AuthContext] 🔐 Intentando login offline...');
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
        if (error.response?.status === 401) {
          console.log('[AuthContext] ⚠️ Interceptor detectó 401 (manejado en api.js)');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      Api.interceptors.response.eject(interceptor);
    };
  }, [verificarSesion, isOnline]);

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
