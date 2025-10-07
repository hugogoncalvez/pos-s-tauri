import axios from 'axios';
import { API_BASE_URL } from '../config'; // <-- Importar la URL

export const Api = axios.create({
    baseURL: API_BASE_URL, // <-- Usar la URL base absoluta
    withCredentials: true // Importante para enviar cookies de sesión
});

// Add a request interceptor to attach the session ID
Api.interceptors.request.use(
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

//export const getLowStockAlerts = () => Api.get('/audit/low-stock-alerts');
