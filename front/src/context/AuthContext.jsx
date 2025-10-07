import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Api } from '../api/api';
import { db } from '../db/offlineDB';
import { syncService } from '../services/syncService';
import { mostrarHTML } from '../functions/mostrarHTML'; // <--- IMPORTAR

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
      console.error("Error detallado de verificarSesion:", error);

      const errorDetails = `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 0.85rem;">
          <p>Ocurrió un error de red al verificar la sesión.</p>
          <hr>
          <strong>Detalles Técnicos:</strong>
          <ul>
            <li><strong>Mensaje:</strong> ${error.message}</li>
            <li><strong>URL de la Petición:</strong> ${error.config?.url}</li>
            <li><strong>Método:</strong> ${error.config?.method?.toUpperCase()}</li>
            <li><strong>Código de Error:</strong> ${error.code || 'N/A'}</li>
            <li><strong>Estado de la Respuesta:</strong> ${error.response?.status || 'N/A'}</li>
          </ul>
        </div>
      `;

      mostrarHTML({
        title: 'Error de Verificación de Sesión',
        html: errorDetails,
        icon: 'error'
      });

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
    localStorage.removeItem('sessionID'); // Clear sessionID from localStorage
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
        // Store sessionID manually
        if (data.sessionID) {
            localStorage.setItem('sessionID', data.sessionID);
        }
        return { success: true, usuario: data.usuario };
      } catch (error) {
        console.error("Error detallado de login:", error);

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
              <li>Consulte la configuración del router por una opción llamada "AP Isolation" y desactívela.</li>
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
        // Temporalmente comentado para depuración.
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

