import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/api";
import { db } from "../db/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";

// Mapeo de endpoints a tablas de Dexie
const ENDPOINT_TO_TABLE = {
  '/stock': 'stock',
  '/category': 'categories',
  '/customers': 'customers',
  '/promotions': 'promotions',
  '/combos': 'combos',
  '/payment': 'payment_methods',
  '/cash-sessions/active': 'active_cash_session',
  '/units': 'units',
  '/pending-tickets': 'pending_tickets',
  '/elements': 'elements',
  '/theme': 'theme_settings' // Asumiendo que tienes una tabla para esto
};

const handleOfflineQuery = async (url) => {
  // Usamos el constructor de URL para parsear fácilmente la ruta y los parámetros
  const urlObject = new URL(url, window.location.origin);
  const baseUrl = urlObject.pathname;

  // Lógica de coincidencia mejorada para manejar URLs dinámicas (ej: /path/id)
  const matchedKey = Object.keys(ENDPOINT_TO_TABLE).find(key => baseUrl.startsWith(key));
  const tableName = matchedKey ? ENDPOINT_TO_TABLE[matchedKey] : null;

  if (tableName && db[tableName]) {
    console.log(`[Offline Query] Interceptada URL: ${url}`);
    console.log(`[Offline Query] Consultando tabla de Dexie: [${tableName}]`);

    if (tableName === 'stock') {
      const searchTerm = urlObject.searchParams.get('name') || '';
      console.log(`[Offline Query] Término de búsqueda para stock: "${searchTerm}"`);
      try {
        let data;
        if (searchTerm) {
          const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
          data = await db.stock.filter(product => {
            if (!product.name) return false;
            const productNameLower = product.name.toLowerCase();
            return searchWords.every(word => productNameLower.includes(word));
          })
            .limit(100)
            .toArray();
        } else {
          data = await db.stock.limit(100).toArray();
        }
        console.log(`[Offline Query] Resultados encontrados en Dexie: ${data.length}`);
        return { products: data };
      } catch (error) {
        console.error('[Offline Query] Error al consultar Dexie:', error);
        return { products: [] }; // Devolver vacío en caso de error
      }
    }

    // Lógica para la sesión de caja activa
    if (tableName === 'active_cash_session') {
      // Esta tabla solo debería tener un registro
      const sessions = await db.active_cash_session.toArray();
      console.log('[Offline Query - DEBUG] Contenido de la tabla active_cash_session:', sessions);
      if (sessions.length > 0) {
        console.log('[Offline Query] Sesión de caja activa encontrada localmente.');
        return { hasActiveSession: true, session: sessions[0] };
      } else {
        console.log('[Offline Query] No se encontró sesión de caja activa local.');
        return { hasActiveSession: false, session: null };
      }
    }

    // Lógica para la configuración del tema
    if (tableName === 'theme_settings') {
      const theme = await db.theme_settings.get(1); // Asumimos que siempre se guarda con id: 1
      if (theme) {
        console.log('[Offline Query] Configuración de tema encontrada localmente.');
        return theme;
      } else {
        console.log('[Offline Query] No se encontró configuración de tema local.');
        return null; // O un objeto de tema por defecto si es necesario
      }
    }

    // Lógica general para otras tablas (devolver todo)
    const data = await db[tableName].toArray();
    if (tableName === 'customers') {
      console.log(`[Offline Query - Customers] Data from Dexie:`, data);
    }
    return data;
  }

  console.warn(`[Offline Query] No se encontró un mapeo para la URL ${url}`);
  return [];
};

export const UseFetchQuery = (key, queryFnOrUrl, enable = true, stale = 0, options = {}) => {
  const { isOnline } = useOnlineStatus();
  // Añadir isOnline a la queryKey para que React Query diferencie entre la caché online y la offline.
  const queryKey = Array.isArray(key) ? [...key, isOnline] : [key, isOnline];

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      if (typeof queryFnOrUrl === 'function') {
        return queryFnOrUrl(); // Ejecutar función personalizada si se provee
      }

      if (!isOnline) {
        return handleOfflineQuery(queryFnOrUrl);
      }

      // Comportamiento online normal
      const res = await Api.get(queryFnOrUrl);
      return res.data;
    },
    enabled: enable,
    staleTime: stale,
    retry: isOnline ? 3 : 0, // No reintentar si estamos offline
    ...options,
  });
  return result;
};

export const UseQueryWithCache = (key, queryFnOrUrl = null, enable = true, stale = 0, options = {}) => {
  const { isOnline } = useOnlineStatus();
  // Añadir isOnline a la queryKey
  const queryKey = Array.isArray(key) ? [...key, isOnline] : [key, isOnline];

  const result = useQuery({
    queryKey,
    queryFn: queryFnOrUrl ? async () => {
      if (typeof queryFnOrUrl === 'function') {
        return queryFnOrUrl();
      }

      if (!isOnline) {
        return handleOfflineQuery(queryFnOrUrl);
      }

      const res = await Api.get(queryFnOrUrl);
      console.log(`[API Response - ${queryFnOrUrl}]`, res.data); // Log the response
      return res.data;
    } : undefined,
    enabled: enable,
    staleTime: stale,
    retry: isOnline ? 3 : 0, // No reintentar si estamos offline
    ...options,
  });
  return result;
};
