import Dexie from 'dexie';

export const db = new Dexie('POSOfflineDB');

db.version(6).stores({
  // --- Datos Maestros (Caché del servidor) ---
  stock: '++id, name, barcode, price, stock, tipo_venta, category_id',
  presentations: '++id, stock_id, barcode, name, price',
  categories: '++id, name',
  units: '++id, name',
  customers: '++id, name, dni',
  promotions: '++id, name, is_active',
  combos: '++id, name, is_active',
  payment_methods: '++id, method, nombre, surcharge_active, surcharge_percentage',
  elements: 'id',
  theme_settings: 'id',

  // --- Datos de Sesión Activa ---
  active_cash_session: 'id',

  // --- Colas de Sincronización ---
  pending_sales: '++local_id, timestamp, synced, server_id, cash_session_id, user_id',
  pending_tickets: '++local_id, server_id, sync_status',
  pending_cash_movements: '++local_id, synced, user_id, cash_session_id',
  local_cash_sessions: 'id, [status+user_id]', // <--- AGREGAR ÍNDICE COMPUESTO

  // --- Configuración y Metadatos Offline ---
  sync_metadata: 'key, value, updated_at', // 'key' será 'last_sync'
  offline_config: 'key, value' // Para guardar configuraciones como el usuario offline
});

// --- Definición del Usuario Offline ---
export const OFFLINE_USER = {
  id: -1,
  nombre: 'Cajero Offline',
  username: 'pos',
  password: 'POS25',
  rol_nombre: 'Cajero',
  isOfflineUser: true,
  permisos: [
    'ver_vista_ventas',
    'accion_crear_venta',
    'ver_stock',
    'ver_clientes',
    'ver_promociones',
    'ver_combos'
  ]
};

// --- Funciones Auxiliares ---

/**
 * Inicializa el usuario offline en la base de datos local si no existe.
 */
export const initializeOfflineUser = async () => {
  try {
    const user = await db.offline_config.get('OFFLINE_USER');
    if (!user) {
      await db.offline_config.put({ key: 'OFFLINE_USER', value: OFFLINE_USER });
      //console.log('👤 Usuario offline inicializado en la base de datos local.');
    }
  } catch (error) {
    console.error('Error inicializando el usuario offline:', error);
  }
};

/**
 * Obtiene la marca de tiempo de la última sincronización exitosa.
 * @returns {Promise<number|null>}
 */
export const getLastSyncTime = async () => {
  const metadata = await db.sync_metadata.get('last_sync');
  return metadata?.value || null;
};

/**
 * Establece la marca de tiempo de la última sincronización.
 * @param {number} timestamp 
 */
export const setLastSyncTime = async (timestamp) => {
  await db.sync_metadata.put({
    key: 'last_sync',
    value: timestamp,
    updated_at: Date.now()
  });
};

// --- Pending Tickets Sync Functions ---

/**
 * Retrieves all pending tickets that should be visible to the user.
 * Filters out tickets marked as 'deleted'.
 * @returns {Promise<Array>}
 */
export const getVisiblePendingTickets = async () => {
  return await db.pending_tickets.where('sync_status').notEqual('deleted').toArray();
};

/**
 * Proactively syncs tickets from the server to the local Dexie DB.
 * This function preserves local changes (created, updated, deleted tickets).
 * @param {Array} serverTickets - The array of tickets from the server.
 */
export const syncServerTicketsToLocal = async (serverTickets) => {
  try {
    const localTickets = await db.pending_tickets.toArray();
    const localTicketsByServerId = new Map(localTickets.filter(t => t.server_id).map(t => [t.server_id, t]));
    const serverTicketIds = new Set(serverTickets.map(t => t.id));

    const ticketsToAdd = [];
    const ticketsToDelete = [];

    // 1. Find tickets that are on the server but not locally
    for (const serverTicket of serverTickets) {
      if (!localTicketsByServerId.has(serverTicket.id)) {
        ticketsToAdd.push({
          server_id: serverTicket.id,
          data: serverTicket,
          sync_status: 'synced'
        });
      }
    }

    // 2. Find local tickets that are no longer on the server (and shouldn't be kept)
    for (const localTicket of localTickets) {
      if (localTicket.server_id && localTicket.sync_status === 'synced' && !serverTicketIds.has(localTicket.server_id)) {
        ticketsToDelete.push(localTicket.local_id);
      }
    }

    // 3. Perform DB operations in a transaction
    if (ticketsToAdd.length > 0 || ticketsToDelete.length > 0) {
      await db.transaction('rw', db.pending_tickets, async () => {
        if (ticketsToAdd.length > 0) {
          await db.pending_tickets.bulkAdd(ticketsToAdd);
        }
        if (ticketsToDelete.length > 0) {
          await db.pending_tickets.bulkDelete(ticketsToDelete);
        }
      });
      //console.log(`🔄 Tickets pendientes sincronizados. Añadidos: ${ticketsToAdd.length}, Eliminados: ${ticketsToDelete.length}`);
    } else {
      //console.log('🔄 Tickets pendientes ya estaban sincronizados.');
    }

  } catch (error) {
    console.error('Error durante la sincronización proactiva de tickets:', error);
  }
};

/**
 * Adds a new pending ticket created while offline.
 * @param {Object} ticketData - The data for the new ticket.
 * @returns {Promise<number>} The local_id of the new ticket.
 */
export const addLocalPendingTicket = async (ticketData) => {
  const newTicket = {
    server_id: null,
    data: ticketData,
    sync_status: 'created'
  };
  return await db.pending_tickets.add(newTicket);
};

/**
 * Updates an existing pending ticket in the local Dexie DB.
 * @param {number} localId - The local_id of the ticket to update.
 * @param {string} name - The new name for the ticket.
 * @param {object} ticket_data - The new ticket_data object (containing tempTable, customer, etc.).
 * @returns {Promise<number>} The local_id of the updated ticket.
 */
export const updateLocalPendingTicket = async (localId, name, ticket_data) => {
  await db.pending_tickets.update(localId, {
    data: {
      ...ticket_data, // This already contains the updated tempTable, customer, etc.
      name: name // Ensure the top-level name within `data` is also updated
    },
    sync_status: 'updated' // Mark as updated for later sync
  });
  return localId;
};

/**
 * Handles closing a pending ticket while offline.
 * If the ticket was from the server, it's marked as 'deleted' for later sync.
 * If the ticket was created locally, it's deleted immediately.
 * @param {number} localId - The local_id of the ticket to close.
 */
export const closeLocalPendingTicket = async (localId) => {
  const ticket = await db.pending_tickets.get(localId);
  if (!ticket) return;

  if (ticket.sync_status === 'created') {
    // Created offline and closed offline, just delete it.
    await db.pending_tickets.delete(localId);
  } else {
    // Synced from server or updated locally, mark for deletion.
    await db.pending_tickets.update(localId, { sync_status: 'deleted' });
  }
};

// Auto-inicializar el usuario offline al cargar el módulo
initializeOfflineUser();