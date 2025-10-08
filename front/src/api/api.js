import axios from 'axios';
import { API_BASE_URL } from '../config';

export const Api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor - adjunta el session ID a cada petición
Api.interceptors.request.use(
    (config) => {
        const sessionID = localStorage.getItem('sessionID');
        if (sessionID) {
            config.headers['X-Session-ID'] = sessionID;
            console.log('[API] 📤 Request con sessionID:', sessionID.substring(0, 8) + '...', 'a', config.url);
        } else {
            console.warn('[API] ⚠️ Request SIN sessionID a', config.url);
        }
        return config;
    },
    (error) => {
        console.error('[API] ❌ Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - guarda el session ID SOLO si viene en el response
Api.interceptors.response.use(
    (response) => {
        const sessionID = response.headers['x-session-id'];

        // CRÍTICO: Solo actualizar si viene el header
        if (sessionID) {
            const currentSessionID = localStorage.getItem('sessionID');

            if (currentSessionID !== sessionID) {
                console.log('[API] 💾 Guardando nuevo sessionID:', sessionID.substring(0, 8) + '...');
                localStorage.setItem('sessionID', sessionID);
            } else {
                console.log('[API] ✅ SessionID confirmado en response');
            }
        }

        return response;
    },
    (error) => {
        console.error('[API] ❌ Error response:', error.response?.status, 'URL:', error.config?.url);

        // NO limpiar sessionID automáticamente
        // Solo se limpia en logout() explícito

        return Promise.reject(error);
    }
);