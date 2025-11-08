import { Sequelize } from "sequelize";

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    timezone: 'America/Argentina/Buenos_Aires', // Añadido para que los timestamps se guarden en la zona horaria local
    
    pool: {
        max: 10,          // Aumentado para manejar más conexiones concurrentes
        min: 2,           // Mantener al menos 2 conexiones activas
        acquire: 60000,   // Tiempo máximo para obtener conexión (60s)
        idle: 30000,      // Tiempo antes de liberar conexión inactiva (30s)
        evict: 10000      // Verificar y eliminar conexiones muertas cada 10s
    },
    
    retry: {
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/,
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ENOTFOUND/
        ],
        max: 5  // Aumentado a 5 reintentos
    },
    
    dialectOptions: {
        connectTimeout: 60000,  // Timeout de conexión TCP (60s)
        // Si Aiven requiere SSL (normalmente sí), descomenta esto:
        // ssl: {
        //     rejectUnauthorized: false
        // }
    },
    
    logging: process.env.NODE_ENV !== 'production' ? console.log : false
});

// Función para verificar y reconectar
const checkConnection = async () => {
    try {
        await db.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        return false;
    }
};

// Intentar reconectar automáticamente cada 30 segundos si falla
let reconnectInterval = null;

const startReconnectLoop = () => {
    if (reconnectInterval) return; // Ya hay un loop corriendo
    
    reconnectInterval = setInterval(async () => {
        const isConnected = await checkConnection();
        if (isConnected && reconnectInterval) {
            console.log('🔄 Reconexión exitosa. Deteniendo loop de reconexión.');
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    }, 30000); // Cada 30 segundos
};

// Hooks para manejar errores de conexión
db.addHook('beforeConnect', (config) => {
    console.log('🔌 Intentando conectar a la base de datos...');
    console.log('📡 Conectando a:', config.host);
});

db.addHook('afterConnect', () => {
    console.log('✅ Conexión establecida con la base de datos.');
    // Si había un loop de reconexión, detenerlo
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
});

// Manejo global de errores de Sequelize
process.on('unhandledRejection', (reason, promise) => {
    if (reason?.name?.includes('Sequelize')) {
        console.error('⚠️ Error de Sequelize detectado:', reason.message);
        // Iniciar loop de reconexión
        startReconnectLoop();
    }
});

// Verificación inicial
checkConnection().catch(err => {
    console.error('❌ No se pudo establecer la conexión inicial:', err.message);
    console.log('🔄 Iniciando loop de reconexión automática...');
    startReconnectLoop();
});

// Health check endpoint helper
export const healthCheck = async () => {
    try {
        await db.authenticate();
        const [[result]] = await db.query('SELECT 1+1 AS result');
        return { 
            status: 'healthy', 
            database: 'connected',
            test: result.result === 2 
        };
    } catch (error) {
        console.error('Health check failed:', error.message);
        // Iniciar reconexión si falla el health check
        startReconnectLoop();
        return { 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message 
        };
    }
};

// Función para cerrar la conexión limpiamente
export const closeConnection = async () => {
    try {
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        await db.close();
        console.log('🔌 Conexión a la base de datos cerrada correctamente.');
    } catch (error) {
        console.error('❌ Error al cerrar la conexión:', error.message);
    }
};

// Manejar cierre limpio del proceso
process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal SIGINT. Cerrando conexiones...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal SIGTERM. Cerrando conexiones...');
    await closeConnection();
    process.exit(0);
});

export default db;