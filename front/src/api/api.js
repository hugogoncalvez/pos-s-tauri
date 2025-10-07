import axios from 'axios';
import { API_BASE_URL } from '../config'; // <-- Importar la URL

export const Api = axios.create({
    baseURL: API_BASE_URL, // <-- Usar la URL base absoluta
    withCredentials: true // Importante para enviar cookies de sesión
});

//export const getLowStockAlerts = () => Api.get('/audit/low-stock-alerts');
