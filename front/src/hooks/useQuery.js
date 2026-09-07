import { useEffect } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Api } from "../api/api";
import { db, OFFLINE_USER, OFFLINE_LANDING_ELEMENTS, getVisiblePendingTickets, syncServerTicketsToLocal, getVisibleComandas, syncServerComandasToLocal } from "../db/offlineDB";
import { useOnlineStatus } from "./useOnlineStatus";

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
  '/comandas': 'comandas',
  '/elements': 'elements',
  '/theme': 'theme_settings',
  '/business-config': 'business_configs',
  '/users': 'users',
  '/sales': 'pending_sales'
};

const handleOfflineQuery = async (url) => {
  const urlObject = new URL(url, window.location.origin);
  const baseUrl = urlObject.pathname;

  const matchedKey = Object.keys(ENDPOINT_TO_TABLE).find(key => baseUrl.startsWith(key));
  const tableName = matchedKey ? ENDPOINT_TO_TABLE[matchedKey] : null;

  if (tableName && db[tableName]) {
    //console.log(`[Offline Query] Interceptada URL: ${url}`);
    //console.log(`[Offline Query] Consultando tabla de Dexie: [${tableName}]`);

    if (tableName === 'stock') {
      const searchTerm = urlObject.searchParams.get('name') || '';
      //console.log(`[Offline Query] Término de búsqueda para stock: "${searchTerm}"`);
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
        //console.log(`[Offline Query] Resultados encontrados en Dexie: ${data.length}`);
        return { products: data };
      } catch (error) {
        console.error('[Offline Query] Error al consultar Dexie:', error);
        return { products: [] };
      }
    }

    if (tableName === 'active_cash_session') {
      const sessions = await db.active_cash_session.toArray();
      //console.log('[Offline Query - DEBUG] Contenido de la tabla active_cash_session:', sessions);
      if (sessions.length > 0) {
        //console.log('[Offline Query] Sesión de caja activa encontrada localmente.');
        // Mimic the online response structure
        return { hasActiveSession: true, session: sessions[0] };
      } else {
        //console.log('[Offline Query] No se encontró sesión de caja activa local.');
        // Mimic the online response structure for no active session
        return { hasActiveSession: false, session: null };
      }
    }

    if (tableName === 'elements') {
      //console.log('[Offline Query] Modo offline detectado para /elements.');
      
      const filteredCards = OFFLINE_LANDING_ELEMENTS.filter(card => 
        OFFLINE_USER.permisos.includes(card.permiso_requerido)
      ).sort((a, b) => a.orden - b.orden);

      //console.log(`[Offline Query] ✅ Retornando ${filteredCards.length} tarjetas para /elements.`);
      return filteredCards;
    }

    if (tableName === 'theme_settings') {
      const theme = await db.theme_settings.get(1);
      if (theme) {
        //console.log('[Offline Query] Configuración de tema encontrada localmente.');
        return theme;
      } else {
        //console.log('[Offline Query] No se encontró configuración de tema local.');
        return null;
      }
    }

    if (tableName === 'pending_tickets') {
      //console.log('[Offline Query] Consultando tickets pendientes visibles.');
      return getVisiblePendingTickets();
    }

    if (tableName === 'comandas') {
      //console.log('[Offline Query] Consultando comandas visibles.');
      return getVisibleComandas();
    }

    const data = await db[tableName].toArray();
    if (tableName === 'customers') {
      //console.log(`[Offline Query - Customers] Data from Dexie:`, data);
    }
    return data;
  }

  console.warn(`[Offline Query] No se encontró un mapeo para la URL ${url}`);
  return [];
};

export const UseFetchQuery = (key, queryFnOrUrl, enable = true, stale = 0, options = {}) => {
  const { isOnline } = useOnlineStatus();
  const queryKey = Array.isArray(key) ? [...key, isOnline] : [key, isOnline];

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      if (typeof queryFnOrUrl === 'function') {
        return queryFnOrUrl();
      }

      //console.log(`[UseFetchQuery - queryFn] isOnline: ${isOnline}, URL: ${queryFnOrUrl}`);

      if (!isOnline) {
        return handleOfflineQuery(queryFnOrUrl);
      }

      const res = await Api.get(queryFnOrUrl);
      //console.log(`[UseFetchQuery - API Response] URL: ${queryFnOrUrl}, Data:`, res.data);
      return res.data;
    },
    enabled: enable,
    staleTime: stale,
    retry: isOnline ? 3 : 0,
    networkMode: 'offlineFirst', // 👈 Permite que queries funcionen offline
    ...options,
  });
  return result;
};

export const UseQueryWithCache = (key, queryFnOrUrl = null, enable = true, stale = 0, options = {}) => {
  const { isOnline } = useOnlineStatus();
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

      // Special handling for pending tickets to ensure data consistency
      if (queryFnOrUrl === '/pending-tickets') {
        //console.log("🔄 Fetching pending tickets state...");
        // When online, we fetch from the API and then synchronize with local Dexie DB.
        if (isOnline) {
          try {
            const res = await Api.get(queryFnOrUrl);
            await syncServerTicketsToLocal(res.data); // Update local Dexie with server data
          } catch (error) {
            console.error("Error fetching or syncing pending tickets from API:", error);
            // Fallback to local data even if API fetch fails
          }
        }
        return getVisiblePendingTickets(); // Always return local data for UI consistency (now potentially updated)
      }

      // Comandas: igual que tickets — sincronizar servidor->local y devolver Dexie
      // para que la UI siempre reciba forma { local_id, server_id, status, data, sync_status }
      if (queryFnOrUrl === '/comandas') {
        if (isOnline) {
          try {
            const res = await Api.get(queryFnOrUrl);
            await syncServerComandasToLocal(res.data);
          } catch (error) {
            console.error("Error fetching comandas from API:", error);
          }
        }
        return getVisibleComandas();
      }

      const res = await Api.get(queryFnOrUrl);
      //console.log(`[API Response - ${queryFnOrUrl}]`, res.data);
      return res.data;
    } : undefined,
    enabled: enable,
    staleTime: stale,
    retry: isOnline ? 3 : 0,
    networkMode: 'offlineFirst', // 👈 CORRECCIÓN: También aquí
    ...options,
  });
  return result;
};