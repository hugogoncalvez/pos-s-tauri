import { db, setLastSyncTime, addLocalPendingTicket, closeLocalPendingTicket } from '../db/offlineDB';
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
      await this.clearPendingSales(userId);

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
      user_id: saleData.user_id, // Add user_id
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
        
        this.triggerSyncStatusUpdate(saleData.user_id);
        return { success: true, id: response.data.id, localId, synced: true };
      } catch (error) {
        console.error(`[SyncService] ⚠️ Error en la sincronización inmediata de la venta ${localId}. Queda pendiente.`, error);
        
        this.triggerSyncStatusUpdate(saleData.user_id);
        return { success: true, localId, synced: false, error: 'Error en la sincronización inmediata' };
      }
    }
    
    // Si estamos offline, la operación ya es un éxito a nivel local
    console.log(`[SyncService] 💾 Venta ${localId} guardada localmente, pendiente de sincronización.`);
    
    this.triggerSyncStatusUpdate(saleData.user_id);
    return { success: true, localId, synced: false };
  }

  async savePendingTicket(ticketData, isOnline) {
    if (isOnline) {
      try {
        // When online, just send to the server. The onSuccess in the component will handle local sync.
        const response = await Api.post('/pending-tickets', ticketData);
        console.log(`[SyncService] 🎫 Ticket pendiente enviado al servidor (ID: ${response.data.ticket.id})`);
        return { success: true, synced: true, id: response.data.ticket.id };
      } catch (error) {
        console.error('[SyncService] ⚠️ Error enviando el ticket pendiente al servidor.', error);
        // Even if online fails, we save it locally to not lose data.
        const localId = await addLocalPendingTicket(ticketData);
        return { success: true, synced: false, localId, error: 'Error en la sincronización' };
      }
    } else {
      // When offline, save it locally with 'created' status.
      const localId = await addLocalPendingTicket(ticketData);
      console.log(`[SyncService] 💾 Ticket pendiente guardado localmente con ID: ${localId}.`);
      this.triggerSyncStatusUpdate(ticketData.user_id);
      return { success: true, synced: false, localId };
    }
  }

  async deletePendingTicket(ticket, isOnline) {
    if (isOnline) {
      try {
        // If the ticket has a server_id, delete it from the server.
        if (ticket.server_id) {
          await Api.delete(`/pending-tickets/${ticket.server_id}`);
        }
        // Regardless, we remove it from the local DB immediately for UI consistency.
        await db.pending_tickets.delete(ticket.local_id);
        console.log(`[SyncService] 🗑️ Ticket ${ticket.local_id} eliminado del servidor y localmente.`);
        return { success: true, synced: true };
      } catch (error) {
        console.error('[SyncService] ⚠️ Error eliminando ticket en modo online. Marcando para eliminación local.', error);
        await closeLocalPendingTicket(ticket.local_id);
        return { success: true, synced: false, error: 'Error en la sincronización' };
      }
    } else {
      // If offline, just mark for deletion.
      await closeLocalPendingTicket(ticket.local_id);
      console.log(`[SyncService] 标记 Ticket ${ticket.local_id} para eliminación.`);
      return { success: true, synced: false };
    }
  }

  async saveCashMovement(movementData, isOnline) {
    const timestamp = Date.now();
    let localSession = null;
    try {
      localSession = await db.active_cash_session.toCollection().first();
    } catch (e) {
      console.warn('[SyncService] No se pudo leer la sesión de caja local.', e);
      throw new Error('No hay una sesión de caja activa localmente para registrar el movimiento.');
    }

    if (!localSession || !localSession.id) {
      throw new Error('No hay una sesión de caja activa para registrar el movimiento.');
    }

    const movementToQueue = {
      ...movementData,
      timestamp,
      cash_session_id: localSession.id,
      user_id: localSession.user_id, // Or get from movementData if available
      synced: 0,
      server_id: null,
      retryCount: 0,
      lastError: null,
    };

    const localId = await db.pending_cash_movements.add(movementToQueue);
    console.log(`[SyncService] 💸 Movimiento de caja guardado localmente con ID: ${localId}.`);
    
    this.triggerSyncStatusUpdate(localSession.user_id);
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
  async syncPendingSales(userId) { // Add userId parameter
    if (this.isSyncing) {
      console.log('⏳ Ya hay una sincronización en curso.');
      return { synced: 0, failed: 0, alreadySyncing: true };
    }

    // Solo obtener ventas pendientes que no hayan excedido el límite de reintentos
    const pendingSales = await db.pending_sales
      .where('synced').equals(0)
      .and(sale => sale.user_id === userId) // Filter by user_id
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
  async syncPendingSalesWithSession(realCashSessionId, userId, onProgress) { // Add userId parameter
    console.log(`[SyncService] 🚀 Iniciando sincronización de ventas pendientes con sesión de caja real: ${realCashSessionId}`);
    
    // Solo obtener ventas pendientes que no hayan excedido el límite de reintentos
    const pendingSales = await db.pending_sales
      .where('synced').equals(0)
      .and(sale => sale.user_id === userId) // Filter by user_id
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

    this.triggerSyncStatusUpdate(); // Notificar a los listeners para que la UI se actualice
    await this.clearPendingSales(); // Limpiar ventas ya sincronizadas

    return { synced: syncedCount, failed: failedCount, permanentlyFailed: permanentlyFailedCount };
  }

  async syncPendingCashMovements(userId, onProgress) {
    if (this.isSyncing) {
      console.warn('[SyncService] Sync already in progress, skipping cash movements sync.');
      return { synced: 0, failed: 0, alreadySyncing: true };
    }
    
    try {
      this.isSyncing = true;
      const pendingMovements = await db.pending_cash_movements
        .where('synced').equals(0)
        .and(mov => mov.user_id === userId)
        .filter(mov => (mov.retryCount || 0) < this.MAX_RETRIES)
        .toArray();

      const total = pendingMovements.length;
      if (total === 0) {
        return { synced: 0, failed: 0 };
      }

      console.log(`[SyncService] 📤 Sincronizando ${total} movimiento(s) de caja pendientes...`);
      let syncedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < total; i++) {
        const movement = pendingMovements[i];
        if(onProgress) onProgress({ current: i + 1, total });

        try {
          const { local_id, synced, server_id, retryCount, lastError, ...movementData } = movement;
          
          const response = await Api.post('/cash-sessions/movement', movementData);
          
          await db.pending_cash_movements.update(local_id, {
            synced: 1,
            server_id: response.data.id,
            lastError: null,
          });
          
          syncedCount++;
          console.log(`[SyncService] ✅ Movimiento de caja local ${local_id} sincronizado (ID Servidor: ${response.data.id})`);
        } catch (error) {
          failedCount++;
          const newRetryCount = (movement.retryCount || 0) + 1;
          const errorMessage = error.response?.data?.error || error.message;

          if (newRetryCount >= this.MAX_RETRIES) {
            await db.pending_cash_movements.update(movement.local_id, {
              synced: -1,
              lastError: `Fallo permanente: ${errorMessage}`,
              retryCount: newRetryCount,
            });
            console.error(`❌ Movimiento de caja local ${movement.local_id} marcado como fallido permanentemente.`);
          } else {
            await db.pending_cash_movements.update(movement.local_id, {
              retryCount: newRetryCount,
              lastError: errorMessage,
            });
            console.error(`❌ Error sincronizando movimiento de caja local ${movement.local_id}. Intento ${newRetryCount}/${this.MAX_RETRIES}.`);
          }
        }
      }
      
      this.triggerSyncStatusUpdate(userId);
      await this.clearPendingCashMovements(userId);

      return { synced: syncedCount, failed: failedCount };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncPendingTickets(userId, onProgress) {
    if (this.isSyncing) {
      console.warn('[SyncService] Sync already in progress, skipping pending tickets sync.');
      return { synced: 0, failed: 0, alreadySyncing: true };
    }

    try {
      this.isSyncing = true;
      const ticketsToSync = await db.pending_tickets
        .where('sync_status').notEqual('synced')
        .toArray();

      const total = ticketsToSync.length;
      if (total === 0) {
        return { synced: 0, failed: 0 };
      }

      console.log(`[SyncService] 📤 Sincronizando ${total} ticket(s) pendiente(s) con cambios locales...`);
      let syncedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < total; i++) {
        const ticket = ticketsToSync[i];
        if (onProgress) onProgress({ current: i + 1, total });

        try {
          let response;
          switch (ticket.sync_status) {
            case 'created':
              console.log(`[SyncService]   - POSTing ticket local_id: ${ticket.local_id}`);
              response = await Api.post('/pending-tickets', ticket.data);
              await db.pending_tickets.update(ticket.local_id, {
                server_id: response.data.ticket.id,
                sync_status: 'synced'
              });
              break;

            case 'updated': // Future use
              console.log(`[SyncService]   - PUTing ticket server_id: ${ticket.server_id}`);
              await Api.put(`/pending-tickets/${ticket.server_id}`, ticket.data);
              await db.pending_tickets.update(ticket.local_id, { sync_status: 'synced' });
              break;

            case 'deleted':
              console.log(`[SyncService]   - DELETing ticket server_id: ${ticket.server_id}`);
              await Api.delete(`/pending-tickets/${ticket.server_id}`);
              // On successful deletion from server, remove from local DB.
              await db.pending_tickets.delete(ticket.local_id);
              break;
          }
          syncedCount++;
        } catch (error) {
          failedCount++;
          console.error(`❌ Error sincronizando ticket local ${ticket.local_id}.`, error);
          // Optional: Implement retry logic here if needed
        }
      }

      this.triggerSyncStatusUpdate(userId);
      console.log(`[SyncService] ✅ Sincronización de tickets completada. ${syncedCount} exitosos, ${failedCount} fallidos.`);
      return { synced: syncedCount, failed: failedCount };

    } finally {
      this.isSyncing = false;
    }
  }


  async clearPendingCashMovements(userId) {
    try {
      const count = await db.pending_cash_movements.where('synced').anyOf(1, -1).delete();
      console.log(`🗑️ ${count} movimientos de caja sincronizados o fallidos eliminados de la cola local.`);
      this.triggerSyncStatusUpdate(userId);
      return { success: true, count };
    } catch (error) {
      console.error('❌ Error al limpiar movimientos de caja pendientes:', error);
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas de la cola de sincronización.
   */
  async getSyncStats(userId) {
    const pendingSalesCount = await db.pending_sales
      .where('synced').equals(0)
      .and(sale => sale.user_id === userId) // Filter by user_id
      .filter(sale => (sale.retryCount || 0) < this.MAX_RETRIES)
      .count();
    
    const permanentlyFailedSalesCount = await db.pending_sales
      .where('synced').equals(-1)
      .and(sale => sale.user_id === userId) // Filter by user_id
      .count();

    // Add pending tickets count
    const pendingTicketsCount = await db.pending_tickets
      .where('sync_status').notEqual('synced')
      .and(ticket => ticket.data.user_id === userId)
      .count();

    const pendingCashMovementsCount = await db.pending_cash_movements
      .where('synced').equals(0)
      .and(movement => movement.user_id === userId)
      .count();

    console.log(`[SyncService] 📊 Ventas pendientes detectadas para el usuario ${userId}: ${pendingSalesCount}, Tickets pendientes: ${pendingTicketsCount}, Movimientos de caja pendientes: ${pendingCashMovementsCount}, Fallidas permanentemente: ${permanentlyFailedSalesCount}`);
    return {
      pendingSales: pendingSalesCount,
      pendingTickets: pendingTicketsCount,
      pendingCashMovements: pendingCashMovementsCount, // Add pendingCashMovements
      permanentlyFailedSales: permanentlyFailedSalesCount
    };
  }

  /**
   * Obtiene las estadísticas de sincronización y notifica a los listeners.
   * Útil para forzar una actualización de la UI desde fuera del servicio.
   */
  async triggerSyncStatusUpdate(userId) {
    console.log(`[SyncService] 🔄 Forzando actualización del estado de sincronización para el usuario ${userId}...`);
    const stats = await this.getSyncStats(userId);
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
