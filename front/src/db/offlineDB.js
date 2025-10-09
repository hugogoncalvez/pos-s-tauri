import Dexie from 'dexie';

export const db = new Dexie('POSOfflineDB');

db.version(2).stores({
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
  pending_sales: '++local_id, timestamp, synced, server_id, cash_session_id',
  pending_tickets: '++local_id, id, name, ticket_data, synced, server_id',
  
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
      console.log('👤 Usuario offline inicializado en la base de datos local.');
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

// Auto-inicializar el usuario offline al cargar el módulo
initializeOfflineUser();