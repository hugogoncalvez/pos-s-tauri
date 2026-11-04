import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('Error Crítico: La variable de entorno VITE_API_URL no está definida. La aplicación no puede conectarse al backend.');
}

export const Api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

//console.log('🔧 API configurada con baseURL:', API_BASE_URL);

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
  (error) => Promise.reject(error)
);
