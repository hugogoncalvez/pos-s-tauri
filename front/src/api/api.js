import axios from 'axios';

// La URL se toma directamente de las variables de entorno de Vite.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.100.10:8000';

export const Api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('🔧 API configurada con baseURL:', API_BASE_URL);

// Interceptor para manejar sessionID en cada petición
Api.interceptors.request.use((config) => {
  const sessionID = localStorage.getItem('sessionID');
  if (sessionID) {
    config.headers['X-Session-ID'] = sessionID;
  }
  return config;
});

// Interceptor para guardar sessionID de las respuestas
Api.interceptors.response.use(
  (response) => {
    const sessionID = response.headers['x-session-id'];
    if (sessionID) {
      localStorage.setItem('sessionID', sessionID);
    }
    return response;
  },
  (error) => {
    // Limpiar sessionID en caso de un error de autenticación (401)
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionID');
      console.warn('Interceptor: sessionID eliminado por respuesta 401.');
    }
    return Promise.reject(error);
  }
);
