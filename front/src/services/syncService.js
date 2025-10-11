import { db, setLastSyncTime } from '../db/offlineDB';
import { Api } from '../api/api';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.MAX_RETRIES = 3; // Máximo número de reintentos para una venta fallida
    this.queryClient = null; // Para invalidar queries de React Query
  }

  // Método para inyectar el queryClient desde la app
  setQueryClient(client) {
    this.queryClient = client;
  }

  // Suscribirse a eventos de sincronización (para la UI)
  onSyncStatusChange(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  // Notificar a los listeners sobre el estado de la sincronización
  notifyListeners(status) {
    this.syncListeners.forEach(cb => cb(status));
  }

  /**
   * Carga todos los datos maestros desde el servidor y los guarda en IndexedDB.
   * Esta es la principal función de sincronización descendente.
   */
  async loadReferenceData(userId) {
    if (!userId) return false; // No hacer nada si no hay ID de usuario

    if (this.isSyncing) {
      console.log('Sincronización ya en progreso.');
      return false;
    }
    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', message: 'Cargando datos maestros...' });
    console.log('📥 Cargando datos de referencia...');

    try {
      // 1. Obtener todos los datos en paralelo
      const [
        stockRes,
        categoriesRes,
        customersRes,
        promotionsRes,
        combosRes,
        paymentMethodsRes,
        activeCashSessionRes,
        elementsRes, // <--- Nuevo
        themeSettingsRes,
        unitsRes // <--- ADD unitsRes
      ] = await Promise.all([
        Api.get('/stock?limit=10000'),
        Api.get('/category'),
        Api.get('/customers'),
        Api.get('/promotions'),
        Api.get('/combos'),
        Api.get('/payment'),
        Api.get(`/cash-sessions/active/${userId}`),
        Api.get('/elements'), // <--- Nuevo
        Api.get('/theme'),
        Api.get('/units') // <--- ADD Api.get('/units')
      ]);

      // 2. Limpiar tablas antiguas y guardar los nuevos datos en una transacción atómica
      await db.transaction('rw', [
        db.stock, db.presentations, db.categories, db.customers,
        db.promotions, db.combos, db.payment_methods, db.active_cash_session,
        db.elements, db.theme_settings, db.units // <--- ADD db.units
      ], async () => {
        // Limpiar datos viejos
        await Promise.all([
          db.stock.clear(),
          db.presentations.clear(),
          db.categories.clear(),
          db.customers.clear(),
          db.promotions.clear(),
          db.combos.clear(),
          db.payment_methods.clear(),
          db.active_cash_session.clear(), // <--- AÑADIDO: Limpiar sesión activa vieja
          db.elements.clear(), // <--- Nuevo
          db.theme_settings.clear(),
          db.units.clear() // <--- ADD db.units.clear()
        ]);

        // Extraer datos de la respuesta de la API
        const stockData = stockRes.data.products || [];
        const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        const customersData = Array.isArray(customersRes.data) ? customersRes.data : [];
        const promotionsData = Array.isArray(promotionsRes.data) ? promotionsRes.data : [];
        const combosData = Array.isArray(combosRes.data) ? combosRes.data : [];
        const paymentMethodsData = Array.isArray(paymentMethodsRes.data) ? paymentMethodsRes.data : [];
        const elementsData = Array.isArray(elementsRes.data) ? elementsRes.data : []; // <--- Nuevo
        const themeSettingsData = themeSettingsRes.data;
        const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : []; // <--- ADD unitsData

        // Extraer y guardar stock y presentaciones
        const allPresentations = [];
        stockData.forEach(product => {
          if (product.presentations && product.presentations.length > 0) {
            product.presentations.forEach(pres => {
              allPresentations.push({ ...pres, stock_id: product.id });
            });
          }
        });
        
        await db.stock.bulkPut(stockData);
        if (allPresentations.length > 0) {
          await db.presentations.bulkPut(allPresentations);
        }

        // Guardar resto de los datos
        await db.categories.bulkPut(categoriesData);
        await db.customers.bulkPut(customersData);
        await db.promotions.bulkPut(promotionsData);
        await db.combos.bulkPut(combosData);
        await db.payment_methods.bulkPut(paymentMethodsData);
        await db.elements.bulkPut(elementsData); // <--- Nuevo
        await db.units.bulkPut(unitsData); // <--- ADD db.units.bulkPut(unitsData)

        // Guardar la sesión de caja activa
        if (activeCashSessionRes.data && activeCashSessionRes.data.session) {
          await db.active_cash_session.put(activeCashSessionRes.data.session);
        }

        // Guardar la configuración del tema
        if (themeSettingsData) {
          // Asegurarse de que tenga un ID fijo para poder recuperarlo fácilmente
          await db.theme_settings.put({ id: 1, ...themeSettingsData }); // <--- Nuevo
        }
      });

      // 3. Actualizar la marca de tiempo de la sincronización
      await setLastSyncTime(Date.now());

      // Limpiar cualquier venta pendiente ya sincronizada después de una carga exitosa de datos de referencia
      await this.clearPendingSales();

      console.log('✅ Datos de referencia cargados exitosamente.');
      this.notifyListeners({ status: 'success', message: 'Datos actualizados.' });
      return true;

    } catch (error) {
      console.error('❌ Error cargando datos de referencia:', error);
      this.notifyListeners({ status: 'error', message: 'Error al cargar datos.' });
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Guarda una venta. Funciona tanto online como offline.
   * 1. Siempre guarda la venta en la cola local `pending_sales`.
   * 2. Si hay conexión, intenta sincronizarla inmediatamente.
   * 3. Actualiza el stock en la base de datos local.
   * @param {object} saleData - Los datos de la venta.
   * @param {boolean} isOnline - El estado de la conexión.
   * @returns {Promise<object>} - Un objeto con el resultado de la operación.
   */
  async saveSale(saleData, isOnline) {
    const timestamp = Date.now();
    let sessionId = -1; // ID provisional para ventas offline

    try {
      const activeCashSessionLocal = await db.active_cash_session.toCollection().first();
      if (activeCashSessionLocal && activeCashSessionLocal.id) {
        sessionId = activeCashSessionLocal.id;
      }
    } catch (e) {
      console.warn('[SyncService] No se pudo leer active_cash_session local:', e);
    }

    // Si estamos online y no hemos podido obtener un sessionId válido de la DB local,
    // significa que no hay una sesión activa para esta venta online.
    if (isOnline && sessionId === -1) {
      console.error('No hay una sesión de caja activa para registrar la venta en modo online.');
      throw new Error('No hay una sesión de caja activa online.');
    }

    const saleToQueue = {
      ...saleData,
      timestamp,
      synced: 0,
      server_id: null,
      cash_session_id: sessionId, // Usar el ID de sesión correspondiente
      retryCount: 0, // Inicializar contador de reintentos
      lastError: null, // Inicializar último error
    };

    // 1. Siempre guardar localmente PRIMERO
    const localId = await db.pending_sales.add(saleToQueue);
    console.log(`[SyncService] 🛍️ Venta guardada localmente con ID: ${localId}. Estado online: ${isOnline}`);

    // 2. Actualizar el stock local inmediatamente
    await this.updateLocalStock(saleData.tempValues);

    // 3. Si hay conexión, intentar sincronizar inmediatamente (si la sesión es válida)
    if (isOnline && sessionId !== -1) {
      try {
        console.log(`🔄 Intentando sincronización inmediata para la venta ${localId}...`);
        const response = await Api.post('/sales', saleData);
        
        await db.pending_sales.update(localId, {
          synced: 1,
          server_id: response.data.id
        });

        // Invalidar queries para refrescar la UI
        if (this.queryClient) {
          console.log(`[SyncService] Invalidando caché para la sesión: ${sessionId}`);
          await this.queryClient.invalidateQueries(['activeCashSession', saleData.user_id]);
          await this.queryClient.invalidateQueries(['sessionDetails', sessionId]);
        }
        
        console.log(`[SyncService] ✅ Venta ${localId} sincronizada inmediatamente (ID Servidor: ${response.data.id})`);
        
        this.triggerSyncStatusUpdate();
        return { success: true, id: response.data.id, localId, synced: true };
      } catch (error) {
        console.error(`[SyncService] ⚠️ Error en la sincronización inmediata de la venta ${localId}. Queda pendiente.`, error);
        
        this.triggerSyncStatusUpdate();
        return { success: true, localId, synced: false, error: 'Error en la sincronización inmediata' };
      }
    }
    
    // Si estamos offline, la operación ya es un éxito a nivel local
    console.log(`[SyncService] 💾 Venta ${localId} guardada localmente, pendiente de sincronización.`);
    
    this.triggerSyncStatusUpdate();
    return { success: true, localId, synced: false };
  }

  /**
   * Actualiza el stock de los productos en IndexedDB después de una venta.
   * @param {Array<object>} items - Los items de la venta.
   */
  async updateLocalStock(items) {
    for (const item of items) {
      if (item.tipo === 'producto' && item.id) {
        try {
          await db.stock.where('id').equals(item.id).modify(product => {
            product.stock -= item.quantity;
          });
        } catch (error) {
          console.error(`Error actualizando el stock local para el producto ${item.id}:`, error);
        }
      }
      // Aquí se podría añadir lógica para combos si descuentan stock
    }
    console.log('📦 Stock local actualizado.');
  }

  /**
   * Sincroniza las ventas pendientes de la cola local con el servidor.
   */
  async syncPendingSales() {
    if (this.isSyncing) {
      console.log('⏳ Ya hay una sincronización en curso.');
      return { synced: 0, failed: 0, alreadySyncing: true };
    }

    // Solo obtener ventas pendientes que no hayan excedido el límite de reintentos
    const pendingSales = await db.pending_sales
      .where('synced').equals(0)
      .filter(sale => (sale.retryCount || 0) < this.MAX_RETRIES)
      .toArray();

    if (pendingSales.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', message: `Sincronizando ${pendingSales.length} ventas...` });
    console.log(`📤 Sincronizando ${pendingSales.length} venta(s) pendientes...`);

    let syncedCount = 0;
    let failedCount = 0;

    for (const sale of pendingSales) {
      try {
        // Excluir campos locales antes de enviar al backend
        const { local_id, synced, server_id, retryCount, lastError, ...saleData } = sale;
        console.log('[Sync Service - DEBUG] Datos de venta enviados al backend:', JSON.stringify(saleData, null, 2));
        const response = await Api.post('/sales', saleData);
        
        await db.pending_sales.update(local_id, {
          synced: 1, // Marcar como sincronizado
          server_id: response.data.id,
          lastError: null, // Limpiar error si se sincroniza
        });
        
        syncedCount++;
        console.log(`✅ Venta local ${local_id} sincronizada (ID Servidor: ${response.data.id})`);
      } catch (error) {
        failedCount++;
        const newRetryCount = (sale.retryCount || 0) + 1;
        const errorMessage = error.response?.data?.error || error.message;

        if (newRetryCount >= this.MAX_RETRIES) {
          // Marcar como fallida permanentemente
          await db.pending_sales.update(sale.local_id, {
            synced: -1, // Usar -1 para indicar fallo permanente
            lastError: `Fallo permanente: ${errorMessage}`,
            retryCount: newRetryCount,
          });
          console.error(`❌ Venta local ${sale.local_id} marcada como fallida permanentemente después de ${newRetryCount} intentos. Error: ${errorMessage}`);
        } else {
          // Incrementar contador de reintentos y guardar el error
          await db.pending_sales.update(sale.local_id, {
            retryCount: newRetryCount,
            lastError: errorMessage,
          });
          console.error(`❌ Error sincronizando venta local ${sale.local_id}. Intento ${newRetryCount}/${this.MAX_RETRIES}. Error: ${errorMessage}`);
        }
      }
    }

    this.isSyncing = false;
    const permanentlyFailedCount = await db.pending_sales.where('synced').equals(-1).count();
    const finalMessage = `${syncedCount} ventas sincronizadas${failedCount > 0 ? `, ${failedCount} fallaron` : ''}${permanentlyFailedCount > 0 ? `, ${permanentlyFailedCount} fallaron permanentemente` : ''}`;
    this.notifyListeners({ status: 'completed', message: finalMessage });
    console.log(`🏁 Sincronización completada: ${finalMessage}`);

    return { synced: syncedCount, failed: failedCount, permanentlyFailed: permanentlyFailedCount };
  }

  /**
   * Sincroniza las ventas pendientes con un ID de sesión de caja real.
   * @param {number} realCashSessionId - El ID de la sesión de caja creada en el servidor.
   * @param {function} onProgress - Callback para notificar el progreso (ej. onProgress({ current, total })).
   */
  async syncPendingSalesWithSession(realCashSessionId, onProgress) {
    console.log(`[SyncService] 🚀 Iniciando sincronización de ventas pendientes con sesión de caja real: ${realCashSessionId}`);
    
    // Solo obtener ventas pendientes que no hayan excedido el límite de reintentos
    const pendingSales = await db.pending_sales
      .where('synced').equals(0)
      .filter(sale => (sale.retryCount || 0) < this.MAX_RETRIES)
      .toArray();
    
    const total = pendingSales.length;

    if (total === 0) {
      return { synced: 0, failed: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < total; i++) {
      const sale = pendingSales[i];
      onProgress({ current: i + 1, total });
      console.log(`[SyncService] 📤 Procesando venta local ${sale.local_id} para sincronizar...`);

      try {
        // Actualizar la venta con el ID de sesión real
        // Excluir campos locales antes de enviar al backend
        const { local_id, synced, server_id, retryCount, lastError, ...saleData } = sale;
        saleData.cash_session_id = realCashSessionId; // Asegurar que el ID de sesión real se use

        console.log('[SyncService - DEBUG] Enviando venta al backend:', JSON.stringify(saleData, null, 2));

        const response = await Api.post('/sales', saleData);
        
        await db.pending_sales.update(local_id, {
          synced: 1,
          server_id: response.data.id,
          lastError: null, // Limpiar error si se sincroniza
        });
        
        syncedCount++;
        console.log(`[SyncService] ✅ Venta local ${local_id} sincronizada (ID Servidor: ${response.data.id})`);
      } catch (error) {
        failedCount++;
        const newRetryCount = (sale.retryCount || 0) + 1;
        const errorMessage = error.response?.data?.error || error.message;

        if (newRetryCount >= this.MAX_RETRIES) {
          // Marcar como fallida permanentemente
          await db.pending_sales.update(sale.local_id, {
            synced: -1, // Usar -1 para indicar fallo permanente
            lastError: `Fallo permanente: ${errorMessage}`,
            retryCount: newRetryCount,
          });
          console.error(`❌ Venta local ${sale.local_id} marcada como fallida permanentemente después de ${newRetryCount} intentos. Error: ${errorMessage}`);
        } else {
          // Incrementar contador de reintentos y guardar el error
          await db.pending_sales.update(sale.local_id, {
            retryCount: newRetryCount,
            lastError: errorMessage,
          });
          console.error(`[SyncService] ❌ Error sincronizando venta ${sale.local_id}. Intento ${newRetryCount}/${this.MAX_RETRIES}. Error: ${errorMessage}`);
        }
      }
    }

    const permanentlyFailedCount = await db.pending_sales.where('synced').equals(-1).count();
    return { synced: syncedCount, failed: failedCount, permanentlyFailed: permanentlyFailedCount };
  }

  /**
   * Obtiene estadísticas de la cola de sincronización.
   */
  async getSyncStats() {
    const pendingSalesCount = await db.pending_sales
      .where('synced').equals(0)
      .filter(sale => (sale.retryCount || 0) < this.MAX_RETRIES)
      .count();
    
    const permanentlyFailedSalesCount = await db.pending_sales.where('synced').equals(-1).count();

    console.log(`[SyncService] 📊 Ventas pendientes detectadas: ${pendingSalesCount}, Fallidas permanentemente: ${permanentlyFailedSalesCount}`);
    return { pendingSales: pendingSalesCount, permanentlyFailedSales: permanentlyFailedSalesCount };
  }

  /**
   * Obtiene las estadísticas de sincronización y notifica a los listeners.
   * Útil para forzar una actualización de la UI desde fuera del servicio.
   */
  async triggerSyncStatusUpdate() {
    console.log('[SyncService] 🔄 Forzando actualización del estado de sincronización...');
    const stats = await this.getSyncStats();
    this.notifyListeners(stats);
  }

  /**
   * Elimina todas las ventas pendientes (synced: 0) de la cola local.
   * Útil para limpiar registros que no se pudieron sincronizar.
   */
  async clearPendingSales() {
    try {
      // Eliminar ventas que están sincronizadas (1) o fallaron permanentemente (-1)
      const count = await db.pending_sales.where('synced').anyOf(1, -1).delete();
      console.log(`🗑️ ${count} ventas sincronizadas o fallidas permanentemente eliminadas de la cola local.`);
      this.notifyListeners({ status: 'cleaned', message: `${count} ventas limpiadas.` });
      return { success: true, count };
    } catch (error) {
      console.error('❌ Error al limpiar ventas pendientes:', error);
      this.notifyListeners({ status: 'error', message: 'Error al limpiar ventas pendientes.' });
      return { success: false, error };
    }
  }
}

export const syncService = new SyncService();
