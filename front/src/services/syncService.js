import { db, setLastSyncTime, addLocalPendingTicket, closeLocalPendingTicket, syncServerTicketsToLocal, updateLocalPendingTicket } from '../db/offlineDB';
import { Api } from '../api/api';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.MAX_RETRIES = 3; // Máximo número de reintentos para una venta fallida
    this.queryClient = null; // Para invalidar queries de React Query
  }

  // Método para inyectar el queryClient desde la app
  setQueryClient(client) {
    this.queryClient = client;
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

    console.log('📥 Cargando datos de referencia...');

    try {
      // 1. Obtener todos los datos en paralelo, pero en lotes más pequeños
      const [stockRes, categoriesRes, customersRes, promotionsRes, combosRes] = await Promise.all([
        Api.get('/stock?limit=10000'),
        Api.get('/category'),
        Api.get('/customers'),
        Api.get('/promotions'),
        Api.get('/combos'),
      ]);

      const [paymentMethodsRes, activeCashSessionRes, elementsRes, themeSettingsRes, unitsRes] = await Promise.all([
        Api.get('/payment'),
        Api.get(`/cash-sessions/active/${userId}`),
        Api.get('/elements'),
        Api.get('/theme'),
        Api.get('/units')
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

      return true;

    } catch (error) {
      console.error('❌ Error cargando datos de referencia:', error);

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

        return { success: true, id: response.data.id, localId, synced: true };
      } catch (error) {
        console.error(`[SyncService] ⚠️ Error en la sincronización inmediata de la venta ${localId}. Queda pendiente.`, error);

        return { success: true, localId, synced: false, error: 'Error en la sincronización inmediata' };
      }
    }

    // Si estamos offline, la operación ya es un éxito a nivel local
    console.log(`[SyncService] 💾 Venta ${localId} guardada localmente, pendiente de sincronización.`);

    return { success: true, localId, synced: false };
  }

  async savePendingTicket(ticketData, isOnline, localId = null) { // Added localId parameter
    const { name, ticket_data, user_id } = ticketData; // Destructure for easier access

    if (localId) { // This is an update operation
      // Fetch the ticket from local DB to get its server_id
      const localTicket = await db.pending_tickets.get(localId);
      if (!localTicket || !localTicket.server_id) {
        // If server_id is missing for an online update, it means the ticket was never synced.
        // Treat it as a creation for the server, but update local ticket with server_id.
        console.warn(`[SyncService] ⚠️ Ticket ${localId} no tiene server_id para actualizar online. Intentando crear uno nuevo en el servidor.`);
        // Fallback to create logic for server, but update local ticket
        const createResponse = await Api.post('/pending-tickets', { name, ticket_data, cash_session_id: ticketData.cash_session_id, user_id });
        const newServerTicket = createResponse.data.ticket;
        await db.pending_tickets.update(localId, {
          server_id: newServerTicket.id,
          data: newServerTicket,
          sync_status: 'synced'
        });
        return { success: true, synced: true, id: newServerTicket.id, localId };
      }
      const serverId = localTicket.server_id;

      if (isOnline) {
        try {
          const response = await Api.put(`/pending-tickets/${serverId}`, { name, ticket_data }); // Use serverId for update
          const serverTicket = response.data.ticket;
          console.log(`[SyncService] 🎫 Ticket pendiente ${localId} actualizado en el servidor (ID: ${serverTicket.id})`);

          // Update local DB as synced
          await db.pending_tickets.update(localId, {
            server_id: serverTicket.id,
            data: serverTicket,
            sync_status: 'synced'
          });
          console.log(`[SyncService] 💾 Ticket pendiente ${localId} actualizado localmente como sincronizado.`);

          return { success: true, synced: true, id: serverTicket.id, localId };

        } catch (error) {
          console.error(`[SyncService] ⚠️ Error actualizando el ticket pendiente ${localId} en el servidor. Marcando para actualización local.`, error);
          // Fallback: update locally as 'updated'
          await updateLocalPendingTicket(localId, name, ticket_data); // Use new update function
          return { success: true, synced: false, localId, error: 'Error en la sincronización' };
        }
      } else {
        // Offline update
        await updateLocalPendingTicket(localId, name, ticket_data); // Use new update function
        console.log(`[SyncService] 💾 Ticket pendiente ${localId} actualizado localmente.`);
        return { success: true, synced: false, localId };
      }
    } else { // This is a create operation (existing logic)
      if (isOnline) {
        try {
          const response = await Api.post('/pending-tickets', ticketData);
          const serverTicket = response.data.ticket;
          console.log(`[SyncService] 🎫 Ticket pendiente enviado al servidor (ID: ${serverTicket.id})`);

          // Also save it to the local DB as synced
          const newSyncedTicket = {
            server_id: serverTicket.id,
            data: serverTicket,
            sync_status: 'synced'
          };
          await db.pending_tickets.add(newSyncedTicket);
          console.log(`[SyncService] 💾 Ticket pendiente ${serverTicket.id} guardado localmente como sincronizado.`);

          return { success: true, synced: true, id: serverTicket.id };

        } catch (error) {
          console.error('[SyncService] ⚠️ Error enviando el ticket pendiente al servidor. Guardando localmente como fallback.', error);
          // Fallback: save locally as 'created'
          const newLocalId = await addLocalPendingTicket(ticketData);
          return { success: true, synced: false, localId: newLocalId, error: 'Error en la sincronización' };
        }
      } else {
        // When offline, save it locally with 'created' status.
        const newLocalId = await addLocalPendingTicket(ticketData);
        console.log(`[SyncService] 💾 Ticket pendiente guardado localmente con ID: ${newLocalId}.`);
        return { success: true, synced: false, localId: newLocalId };
      }
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

    await this.clearPendingSales(userId); // Limpiar ventas ya sincronizadas

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
        if (onProgress) onProgress({ current: i + 1, total });

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

            case 'updated':
              console.log(`[SyncService]   - PUTing ticket server_id: ${ticket.server_id}`);
              response = await Api.put(`/pending-tickets/${ticket.server_id}`, ticket.data);
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

      console.log(`[SyncService] ✅ Sincronización de tickets completada. ${syncedCount} exitosos, ${failedCount} fallidos.`);
      return { synced: syncedCount, failed: failedCount };

    } finally {
      this.isSyncing = false;
    }
  }

  async syncAllPendingTickets() {
    if (this.isSyncing) {
      console.warn('[SyncService] Sync already in progress, skipping full ticket sync-down.');
      return;
    }
    this.isSyncing = true;
    console.log('[SyncService] 🔄 Executing full sync of pending tickets from server...');
    try {
      const res = await Api.get('/pending-tickets');
      const serverData = res.data || [];
      await syncServerTicketsToLocal(serverData);
    } catch (error) {
      console.error('[SyncService] ❌ Error during full sync of pending tickets:', error);
    } finally {
      this.isSyncing = false;
    }
  }


  async clearPendingCashMovements(userId) {
    try {
      const count = await db.pending_cash_movements.where('synced').anyOf(1, -1).delete();
      console.log(`🗑️ ${count} movimientos de caja sincronizados o fallidos eliminados de la cola local.`);
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

    const pendingSessionsCount = await db.local_cash_sessions
      .where({ status: 'pending_sync', user_id: userId })
      .count();

    console.log(`[SyncService] 📊 Ventas pendientes detectadas para el usuario ${userId}: ${pendingSalesCount}, Tickets pendientes: ${pendingTicketsCount}, Movimientos de caja pendientes: ${pendingCashMovementsCount}, Sesiones pendientes: ${pendingSessionsCount}, Fallidas permanentemente: ${permanentlyFailedSalesCount}`);
    return {
      pendingSales: pendingSalesCount,
      pendingTickets: pendingTicketsCount,
      pendingCashMovements: pendingCashMovementsCount,
      pendingSessions: pendingSessionsCount, // <-- AÑADIDO
      permanentlyFailedSales: permanentlyFailedSalesCount
    };
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

      return { success: true, count };
    } catch (error) {
      console.error('❌ Error al limpiar ventas pendientes:', error);

      return { success: false, error };
    }
  }

  async createLocalCashSession(openingAmount, userId) {
    if (!userId) {
      throw new Error('Se requiere un ID de usuario para crear una sesión de caja local.');
    }

    const tempId = crypto.randomUUID();
    const newLocalSession = {
      id: tempId,
      isLocal: true,
      user_id: userId,
      opening_amount: parseFloat(openingAmount),
      opened_at: new Date().toISOString(),
      status: 'pending_sync',
      // Otros campos que puedan ser necesarios para la UI, como `current_cash`
      current_cash: parseFloat(openingAmount)
    };

    try {
      await db.transaction('rw', db.local_cash_sessions, db.active_cash_session, async () => {
        // Guardar en la tabla de sesiones locales pendientes
        await db.local_cash_sessions.add(newLocalSession);
        // Limpiar la sesión activa anterior y establecer la nueva
        await db.active_cash_session.clear();
        await db.active_cash_session.put(newLocalSession);
      });

      console.log(`[SyncService] 📦 Creada sesión de caja local con ID temporal: ${tempId}`);
      return { success: true, session: newLocalSession };
    } catch (error) {
      console.error('❌ Error al crear la sesión de caja local:', error);
      throw new Error('No se pudo crear la sesión de caja en el dispositivo.');
    }
  }

  async syncPendingCashSession(userId) {
    if (!userId) throw new Error('User ID is required to sync a pending session.');

    const localSession = await db.local_cash_sessions.where({ user_id: userId, status: 'pending_sync' }).first();

    if (!localSession) {
      console.log('[SyncService] No hay sesiones de caja locales pendientes para sincronizar.');
      return { success: true, message: 'No pending session found.' };
    }

    console.log(`[SyncService] 🚀 Encontrada sesión local pendiente: ${localSession.id}. Sincronizando...`);

    try {
      const response = await Api.post('/cash-sessions/open', {
        user_id: localSession.user_id,
        opening_amount: localSession.opening_amount,
        opened_at: localSession.opened_at // Enviar la fecha de apertura original
      });

      const realSession = response.data.session;
      console.log(`[SyncService] ✅ Sesión real creada en el servidor con ID: ${realSession.id}`);

      // Actualizar todas las tablas locales en una transacción
      await db.transaction('rw', db.local_cash_sessions, db.active_cash_session, db.pending_sales, db.pending_cash_movements, db.pending_tickets, async () => {
        // 1. Actualizar ventas pendientes
        const salesToUpdate = await db.pending_sales.where({ cash_session_id: localSession.id }).toArray();
        if (salesToUpdate.length > 0) {
          const saleUpdates = salesToUpdate.map(sale => db.pending_sales.update(sale.local_id, { cash_session_id: realSession.id }));
          await Promise.all(saleUpdates);
          console.log(`[SyncService] 🔄 Actualizadas ${salesToUpdate.length} ventas pendientes con el nuevo ID de sesión.`);
        }

        // 2. Actualizar movimientos pendientes
        const movementsToUpdate = await db.pending_cash_movements.where({ cash_session_id: localSession.id }).toArray();
        if (movementsToUpdate.length > 0) {
          const movementUpdates = movementsToUpdate.map(move => db.pending_cash_movements.update(move.local_id, { cash_session_id: realSession.id }));
          await Promise.all(movementUpdates);
          console.log(`[SyncService] 🔄 Actualizados ${movementsToUpdate.length} movimientos pendientes con el nuevo ID de sesión.`);
        }

        // 3. Actualizar tickets pendientes
        const ticketsToUpdate = await db.pending_tickets.filter(ticket => ticket.data.cash_session_id === localSession.id).toArray();
        if (ticketsToUpdate.length > 0) {
          const ticketUpdates = ticketsToUpdate.map(ticket =>
            db.pending_tickets.update(ticket.local_id, { 'data.cash_session_id': realSession.id })
          );
          await Promise.all(ticketUpdates);
          console.log(`[SyncService] 🔄 Actualizados ${ticketsToUpdate.length} tickets pendientes con el nuevo ID de sesión.`);
        }

        // 4. Reemplazar la sesión activa
        await db.active_cash_session.clear();
        await db.active_cash_session.put(realSession);
        console.log('[SyncService] 🔄 Sesión activa actualizada con la sesión del servidor.');

        // 5. Eliminar la sesión local pendiente
        await db.local_cash_sessions.delete(localSession.id);
        console.log(`[SyncService] 🗑️ Eliminada sesión local pendiente: ${localSession.id}`);
      });

      if (this.queryClient) {
        console.log(`[SyncService] Refrescando caché para la sesión activa del usuario ${userId}`);
        await this.queryClient.refetchQueries(['activeCashSession', userId]);
        await this.queryClient.invalidateQueries(['cash-sessions', userId]); // Invalidate general cash sessions query too
      }

      return { success: true, session: realSession };

    } catch (error) {
      console.error('❌ Error al sincronizar la sesión de caja pendiente:', error);
      throw new Error('No se pudo sincronizar la sesión de caja con el servidor.');
    }
  }
}
export const syncService = new SyncService();
