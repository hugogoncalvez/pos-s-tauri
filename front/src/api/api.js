import axios from 'axios';
import { getBackendUrl } from '../config/appConfig';

// Patrón de inicialización lazy para la instancia de la API.
// La instancia real solo se crea una vez, la primera vez que se necesita.
let apiInstancePromise = null;

function createApiInstance() {
  // Si la promesa de inicialización ya existe, la retornamos para no duplicar.
  if (apiInstancePromise) return apiInstancePromise;

  // Creamos una promesa que se resolverá con la instancia de Axios configurada.
  apiInstancePromise = (async () => {
    const backendUrl = await getBackendUrl();
    const baseURL = `${backendUrl}/api`; // Añadimos /api a la URL base

    console.log('📡 Configurando API con baseURL:', baseURL);

    const api = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 10000,
    });

    // Interceptor de Request: Adjunta el session ID
    api.interceptors.request.use(
      (config) => {
        const sessionID = localStorage.getItem('sessionID');
        if (sessionID) {
          config.headers['X-Session-ID'] = sessionID;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de Response: Guarda el session ID si viene en la cabecera
    api.interceptors.response.use(
      (response) => {
        const sessionID = response.headers['x-session-id'];
        if (sessionID && localStorage.getItem('sessionID') !== sessionID) {
          localStorage.setItem('sessionID', sessionID);
        }
        return response;
      },
      (error) => {
        console.error('[API] ❌ Error en respuesta:', error.config?.url, error.message);
        return Promise.reject(error);
      }
    );

    return api;
  })();

  return apiInstancePromise;
}

// Exportamos un Proxy. Esto nos permite usar `Api.get`, `Api.post`, etc.,
// como si la instancia de Axios siempre estuviera disponible.
// El Proxy intercepta la llamada, espera a que `createApiInstance` se resuelva,
// y luego ejecuta la llamada en la instancia real de Axios.
export const Api = new Proxy(
  {},
  {
    get(target, prop) {
      return async (...args) => {
        const instance = await createApiInstance();
        // Asegurarnos de que la propiedad exista en la instancia de axios antes de llamarla
        if (typeof instance[prop] === 'function') {
          return instance[prop](...args);
        }
        // Devolver undefined si la propiedad no es una función para evitar errores
        return undefined;
      };
    },
  }
);