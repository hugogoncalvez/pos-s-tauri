// front/src/config.js
// La URL base de la API se obtiene de una variable de entorno de Vite.
// VITE_API_URL se define en el archivo .env en la raíz de /front.
// Si la variable no está definida, se usa localhost por defecto para desarrollo.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';