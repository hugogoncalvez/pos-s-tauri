import axios from 'axios';
import { getBackendUrl } from '../config/appConfig';

// Función asíncrona para crear y configurar la instancia de la API
async function createApiInstance() {
    const baseURL = await getBackendUrl();

    const api = axios.create({
        baseURL: baseURL + '/api', // Añadimos /api a la URL base
        withCredentials: true,
        timeout: 10000
    });

    // Request interceptor - adjunta el session ID a cada petición
    api.interceptors.request.use(
        (config) => {
            const sessionID = localStorage.getItem('sessionID');
            if (sessionID) {
                config.headers['X-Session-ID'] = sessionID;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - guarda el session ID SOLO si viene en el response
    api.interceptors.response.use(
        (response) => {
            const sessionID = response.headers['x-session-id'];
            if (sessionID) {
                const currentSessionID = localStorage.getItem('sessionID');
                if (currentSessionID !== sessionID) {
                    localStorage.setItem('sessionID', sessionID);
                }
            }
            return response;
        },
        (error) => {
            console.error('[API] ❌ Error response:', error.response?.status, 'URL:', error.config?.url);
            return Promise.reject(error);
        }
    );

    return api;
}

// Usamos top-level await para esperar la configuración asíncrona.
// El módulo no se resolverá hasta que la instancia de la API esté lista.
export const Api = await createApiInstance();
