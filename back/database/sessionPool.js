// import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// // Crear pool con configuración resiliente
// export const sessionPool = mysql2.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   // Configuración del pool (similar a Sequelize)
//   waitForConnections: true,
//   connectionLimit: 10,        // Igual que max en Sequelize
//   queueLimit: 0,              // Sin límite de cola
//   idleTimeout: 30000,         // 30s igual que Sequelize

//   // Keep-alive para mantener conexiones vivas
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 10000, // 10s

//   // Timeouts
//   connectTimeout: 60000,      // 60s igual que Sequelize

//   // SSL para Aiven (descomenta si es necesario)
//   // ssl: {
//   //   rejectUnauthorized: false
//   // }
// });

// // Variable para controlar el loop de reconexión
// let reconnectInterval = null;

// // Función para verificar la conexión
// const checkSessionPoolConnection = async () => {
//   try {
//     const connection = await sessionPool.getConnection();
//     await connection.query('SELECT 1+1 AS result');
//     connection.release();
//     console.log('✅ [SessionPool] Conexión verificada correctamente');
//     return true;
//   } catch (error) {
//     console.error('❌ [SessionPool] Error al verificar conexión:', error.message);
//     return false;
//   }
// };

// // Loop de reconexión automática
// const startSessionPoolReconnect = () => {
//   if (reconnectInterval) return; // Ya hay un loop corriendo

//   console.log('🔄 [SessionPool] Iniciando loop de reconexión automática...');

//   reconnectInterval = setInterval(async () => {
//     console.log('🔍 [SessionPool] Intentando reconectar...');
//     const isConnected = await checkSessionPoolConnection();

//     if (isConnected && reconnectInterval) {
//       console.log('✅ [SessionPool] Reconexión exitosa. Deteniendo loop.');
//       clearInterval(reconnectInterval);
//       reconnectInterval = null;
//     }
//   }, 30000); // Cada 30 segundos, igual que db.js
// };

// // Event listeners del pool
// sessionPool.on('connection', (connection) => {
//   console.log('🔌 [SessionPool] Nueva conexión establecida');

//   // Si había un loop de reconexión, detenerlo
//   if (reconnectInterval) {
//     clearInterval(reconnectInterval);
//     reconnectInterval = null;
//   }
// });

// sessionPool.on('acquire', (connection) => {
//   if (process.env.NODE_ENV !== 'production') {
//     //console.log('📥 [SessionPool] Conexión adquirida del pool');
//   }
// });

// sessionPool.on('release', (connection) => {
//   if (process.env.NODE_ENV !== 'production') {
//     //console.log('📤 [SessionPool] Conexión liberada al pool');
//   }
// });

// sessionPool.on('enqueue', () => {
//   console.warn('⏳ [SessionPool] Esperando conexión disponible (cola)');
// });

// // Manejo de errores del pool
// sessionPool.on('error', (err) => {
//   console.error('❌ [SessionPool] Error en el pool:', err.message);
//   startSessionPoolReconnect();
// });

// // Verificación inicial
// (async () => {
//   try {
//     console.log('🔌 [SessionPool] Verificando conexión inicial...');
//     const isConnected = await checkSessionPoolConnection();

//     if (!isConnected) {
//       console.warn('⚠️ [SessionPool] Conexión inicial fallida, iniciando reconexión');
//       startSessionPoolReconnect();
//     }
//   } catch (error) {
//     console.error('❌ [SessionPool] Error en verificación inicial:', error.message);
//     startSessionPoolReconnect();
//   }
// })();

// // Health check para el session pool
// export const sessionPoolHealthCheck = async () => {
//   try {
//     const connection = await sessionPool.getConnection();
//     const [rows] = await connection.query('SELECT 1+1 AS result');
//     connection.release();

//     return {
//       status: 'healthy',
//       sessionPool: 'connected',
//       test: rows[0].result === 2
//     };
//   } catch (error) {
//     console.error('❌ [SessionPool] Health check falló:', error.message);
//     startSessionPoolReconnect();

//     return {
//       status: 'unhealthy',
//       sessionPool: 'disconnected',
//       error: error.message
//     };
//   }
// };

// // Función para cerrar el pool limpiamente
// export const closeSessionPool = async () => {
//   try {
//     if (reconnectInterval) {
//       clearInterval(reconnectInterval);
//       reconnectInterval = null;
//       console.log('🛑 [SessionPool] Loop de reconexión detenido');
//     }

//     await sessionPool.end();
//     console.log('🔌 [SessionPool] Pool cerrado correctamente');
//   } catch (error) {
//     console.error('❌ [SessionPool] Error al cerrar pool:', error.message);
//   }
// };

// // NOTA: Los manejadores de SIGINT/SIGTERM están en app.js para centralizar el cierre
// // Este módulo solo exporta closeSessionPool() para ser llamado desde allí

// export default sessionPool;

//Claude

import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Helper para aplicar timeout a cualquier promesa
const withTimeout = (promise, ms, label = 'operación') =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout en ${label} (${ms}ms)`)), ms)
        )
    ]);

// Función de creación del pool separada para poder recrearlo al fallar
const createPool = () => mysql2.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 10,          // Limitar la cola para no acumular requests colgados

    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,

    connectTimeout: 10000,   // 10s — antes 60s
    // idleTimeout no es una opción válida en mysql2, se eliminó
});

export let sessionPool = createPool();

// Verificación inicial
(async () => {
    try {
        console.log('🔌 [SessionPool] Verificando conexión inicial...');
        const connection = await withTimeout(sessionPool.getConnection(), 5000, 'getConnection');
        await connection.query('SELECT 1+1 AS result');
        connection.release();
        console.log('✅ [SessionPool] Conexión inicial verificada correctamente');
    } catch (error) {
        console.error('❌ [SessionPool] Conexión inicial fallida:', error.message);
    }
})();

// Event listeners del pool
sessionPool.on('connection', () => {
    console.log('🔌 [SessionPool] Nueva conexión establecida');
});

sessionPool.on('enqueue', () => {
    console.warn('⏳ [SessionPool] Esperando conexión disponible (cola llena)');
});

sessionPool.on('error', (err) => {
    console.error('❌ [SessionPool] Error en el pool:', err.message);
});

// Health check con timeout explícito y recreación del pool si falla
// Sin esto, getConnection() se colgaba indefinidamente si el pool estaba lleno de zombies
export const sessionPoolHealthCheck = async () => {
    try {
        const connection = await withTimeout(sessionPool.getConnection(), 5000, 'getConnection');
        const [rows] = await withTimeout(connection.query('SELECT 1+1 AS result'), 5000, 'query');
        connection.release();

        return {
            status: 'healthy',
            sessionPool: 'connected',
            test: rows[0].result === 2
        };
    } catch (error) {
        console.error('❌ [SessionPool] Health check falló:', error.message);

        // Recrear el pool completamente — un pool de mysql2 no puede "reconectarse",
        // las conexiones zombie quedan atrapadas hasta que se destruye el pool
        console.log('🔄 [SessionPool] Recreando pool...');
        try {
            await withTimeout(sessionPool.end(), 3000, 'pool.end');
        } catch (_) {
            // Ignorar error al cerrar, puede que ya esté roto
        }
        sessionPool = createPool();
        console.log('✅ [SessionPool] Pool recreado');

        return {
            status: 'unhealthy',
            sessionPool: 'disconnected',
            error: error.message
        };
    }
};

// Función para cerrar el pool limpiamente
// SIGINT/SIGTERM se manejan solo en app.js para evitar doble cierre
export const closeSessionPool = async () => {
    try {
        await sessionPool.end();
        console.log('🔌 [SessionPool] Pool cerrado correctamente');
    } catch (error) {
        console.error('❌ [SessionPool] Error al cerrar pool:', error.message);
    }
};

export default sessionPool;