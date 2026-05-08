// import express from "express";
// import cors from 'cors';
// import path from "path";
// import { fileURLToPath } from "url";
// import session from 'express-session';
// import MySQLStore from 'express-mysql-session';
// import { randomUUID } from 'crypto';
// import dotenv from 'dotenv';
// import sessionHeaderMiddleware from './middleware/sessionHeaderMiddleware.js';
// import { sessionPool, closeSessionPool } from './database/sessionPool.js';
// import { closeConnection } from './database/db.js';

// // Cargar variables de entorno
// dotenv.config();

// // Manejadores de errores globales para evitar que la aplicación se caiga
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

//   // Si es un error de conexión de MySQL, los pools manejarán la reconexión
//   if (reason?.code === 'PROTOCOL_CONNECTION_LOST' ||
//     reason?.code === 'ECONNREFUSED' ||
//     reason?.code === 'ETIMEDOUT' ||
//     reason?.name?.includes('Sequelize')) {
//     console.warn('⚠️ Error de conexión detectado - los pools intentarán reconectar');
//   }
// });

// process.on('uncaughtException', (err, origin) => {
//   console.error(`❌ Caught exception: ${err}\n` + `Exception origin: ${origin}`);
// });

// // Importar la base de datos
// import db from './database/db.js';
// import './database/associations.js';

// // Importar las rutas
// import Routes from './routes/routes.js';

// // Importar tareas programadas
// import { initScheduledTasks } from './services/scheduledTasks.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // Middleware para loguear todas las peticiones entrantes
// app.use((req, res, next) => {
//   if (process.env.NODE_ENV !== 'production') {
//     //console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}, Origin: ${req.headers.origin}`);
//   }
//   next();
// });

// // Opciones de CORS para permitir la app de Tauri y el frontend de desarrollo
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (process.env.NODE_ENV !== 'production') {
//       //console.log('🔍 Origin recibido:', origin || 'SIN ORIGIN');
//     }

//     const allowedOrigins = [
//       'tauri://localhost',
//       'http://tauri.localhost',
//       'https://tauri.localhost',
//       /^http:\/\/localhost(:\d+)?$/,
//       /^http:\/\/127\.0\.0\.1(:\d+)?$/,
//     ];

//     // Solo en desarrollo, permitir red local (192.168.x.x)
//     if (process.env.NODE_ENV === 'development') {
//       allowedOrigins.push(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/);
//     }

//     // CRÍTICO: Si no hay origin (curl, Postman, requests internos), PERMITIR
//     if (!origin) {
//       if (process.env.NODE_ENV !== 'production') {
//         //console.log('✅ Petición sin Origin - Permitida');
//       }
//       return callback(null, true);
//     }

//     // Verificar contra la lista
//     const isAllowed = allowedOrigins.some(allowed => {
//       if (allowed instanceof RegExp) return allowed.test(origin);
//       return allowed === origin;
//     });

//     if (isAllowed) {
//       if (process.env.NODE_ENV !== 'production') {
//         //console.log('✅ Origin permitido:', origin);
//       }
//       callback(null, true);
//     } else {
//       if (process.env.NODE_ENV !== 'production') {
//         console.warn('🚫 Origin rechazado:', origin);
//       }
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
//   credentials: true,
//   exposedHeaders: ['X-Session-ID']
// };

// app.use(cors(corsOptions));


// // Middleware para inicializar req.cookies
// app.use((req, res, next) => {
//   req.cookies = req.cookies || {};
//   next();
// });

// // CRÍTICO: Middleware que procesa el header X-Session-ID
// app.use(sessionHeaderMiddleware);

// // Configuración de express-session con pool resiliente
// const MySQLStoreSession = MySQLStore(session);
// export const sessionStore = new MySQLStoreSession({
//   clearExpired: true,
//   checkExpirationInterval: 900000, // 15 minutos
//   expiration: 86400000, // 24 horas
//   createDatabaseTable: true,
//   schema: {
//     tableName: 'sessions',
//     columnNames: {
//       session_id: 'session_id',
//       expires: 'expires',
//       data: 'data'
//     }
//   }
// }, sessionPool);

// const sessionKey = process.env.SESSION_KEY || 'pos_session_key';

// app.use(session({
//   key: sessionKey,
//   secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_pos',
//   store: sessionStore,
//   resave: false,
//   saveUninitialized: false,

//   // CRÍTICO: Esta función determina el sessionID a usar
//   genid: function (req) {
//     // Si viene sessionID en la cookie (que pusimos en el middleware), usar ese
//     if (req.cookies && req.cookies[sessionKey]) {
//       if (process.env.NODE_ENV !== 'production') {
//         //console.log('[SESSION] 🔄 Usando sessionID existente:', req.cookies[sessionKey]);
//       }
//       return req.cookies[sessionKey];
//     }
//     // Si no, generar uno nuevo
//     const newId = randomUUID();
//     if (process.env.NODE_ENV !== 'production') {
//       //console.log('[SESSION] ✨ Generando nuevo sessionID:', newId);
//     }
//     return newId;
//   }
// }));

// app.use('/api', Routes);

// const PORT = process.env.PORT || 8000;

// // Función para iniciar el servidor
// function startServer() {
//   // Iniciar el servidor de Express inmediatamente
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}/`);
//     console.log(`🌐 Accesible desde la red en http://<TU_IP>:${PORT}/`);
//   });

//   // Intentar conectar a la base de datos en segundo plano, sin bloquear el inicio
//   const initializeDatabaseConnection = async () => {
//     try {
//       // db.js y sessionPool.js ya tienen su propia lógica de reintento,
//       // pero un intento inicial aquí nos permite inicializar las tareas
//       // programadas en el momento correcto.
//       await db.authenticate();
//       console.log('✅ Conexión a la base de datos establecida en el arranque.');

//       // Si la conexión es exitosa, inicializar tareas programadas
//       initScheduledTasks();
//       console.log('✅ Tareas programadas inicializadas.');
//     } catch (error) {
//       // Si la conexión inicial falla, el servidor ya está corriendo.
//       // Los módulos de la base de datos (db.js, sessionPool.js)
//       // se encargarán de reintentar la conexión en segundo plano.
//       console.error(`❌ Error en la conexión inicial a la DB: ${error.message}`);
//       console.warn('El servidor está en modo offline. Se reintentará la conexión automáticamente.');
//     }
//   };

//   // Ejecutar la inicialización de la DB sin esperar a que termine
//   initializeDatabaseConnection();
// }

// // Manejo de cierre limpio de AMBOS pools
// const gracefulShutdown = async (signal) => {
//   console.log(`\n🛑 Recibida señal ${signal}. Cerrando conexiones...`);

//   try {
//     // Cerrar pool de sesiones
//     await closeSessionPool();

//     // Cerrar pool de Sequelize
//     await closeConnection();

//     console.log('✅ Todos los pools cerrados correctamente');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error durante el cierre:', error.message);
//     process.exit(1);
//   }
// };

// process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// // Llamar a la función para iniciar el servidor
// startServer();

//Claude

import express from "express";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import sessionHeaderMiddleware from './middleware/sessionHeaderMiddleware.js';
import { sessionPool, closeSessionPool } from './database/sessionPool.js';
import { closeConnection } from './database/db.js';
import { getHealthStatus } from './database/healthMonitor.js';

dotenv.config();

// Manejadores globales de errores — solo acá, no duplicar en db.js ni sessionPool.js
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

    if (reason?.code === 'PROTOCOL_CONNECTION_LOST' ||
        reason?.code === 'ECONNREFUSED' ||
        reason?.code === 'ETIMEDOUT' ||
        reason?.name?.includes('Sequelize')) {
        console.warn('⚠️ Error de conexión detectado - los pools intentarán reconectar');
    }
});

process.on('uncaughtException', (err, origin) => {
    console.error(`❌ Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});

import db from './database/db.js';
import './database/associations.js';

import Routes from './routes/routes.js';
import { initScheduledTasks } from './services/scheduledTasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        //console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}, Origin: ${req.headers.origin}`);
    }
    next();
});

const corsOptions = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV !== 'production') {
            //console.log('🔍 Origin recibido:', origin || 'SIN ORIGIN');
        }

        const allowedOrigins = [
          'tauri://localhost',
          'http://tauri.localhost',
          'https://tauri.localhost',
          'http://pos-thay.duckdns.org:8000',
          'http://pos-thay.duckdns.org',
          /^http:\/\/localhost(:\d+)?$/,
          /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        ];
        if (process.env.NODE_ENV === 'development') {
            allowedOrigins.push(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/);
        }

        if (!origin) {
            return callback(null, true);
        }

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) return allowed.test(origin);
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('🚫 Origin rechazado:', origin);
            }
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
    credentials: true,
    exposedHeaders: ['X-Session-ID']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    req.cookies = req.cookies || {};
    next();
});

app.use(sessionHeaderMiddleware);

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────
// CRÍTICO: Este bloque está ANTES del middleware de sesión a propósito.
// La sesión lee de Aiven (sessionPool). Si Aiven tiene un micro-corte,
// el session middleware se cuelga y el frontend recibe timeout → falso "offline".
// Al registrar /api/health AQUÍ, saltamos el session store y siempre respondemos < 1ms.
app.get('/api/health', (req, res) => {
    const dbStatus = getHealthStatus();
    res.status(200).json({
        status: dbStatus.overall,
        backend: true,
        database: dbStatus,
        timestamp: new Date().toISOString()
    });
});
// ───────────────────────────────────────────────────────────────────────────

const MySQLStoreSession = MySQLStore(session);
export const sessionStore = new MySQLStoreSession({
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, sessionPool);

const sessionKey = process.env.SESSION_KEY || 'pos_session_key';

app.use(session({
    key: sessionKey,
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_pos',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    genid: function (req) {
        if (req.cookies && req.cookies[sessionKey]) {
            return req.cookies[sessionKey];
        }
        return randomUUID();
    }
}));

app.use('/api', Routes);

const PORT = process.env.PORT || 8000;

function startServer() {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}/`);
        console.log(`🌐 Accesible desde la red en http://<TU_IP>:${PORT}/`);
    });

    const initializeDatabaseConnection = async () => {
        try {
            await db.authenticate();
            console.log('✅ Conexión a la base de datos establecida en el arranque.');
            initScheduledTasks();
            console.log('✅ Tareas programadas inicializadas.');
        } catch (error) {
            console.error(`❌ Error en la conexión inicial a la DB: ${error.message}`);
            console.warn('El servidor está en modo offline. Se reintentará la conexión automáticamente.');
        }
    };

    initializeDatabaseConnection();

    // Monitoreo de salud en segundo plano (cada 2 minutos)
    // Actualiza el estado cacheado para la ruta /health
    setInterval(async () => {
        try {
            const { healthCheck } = await import('./database/db.js');
            const { sessionPoolHealthCheck } = await import('./database/sessionPool.js');
            await healthCheck();
            await sessionPoolHealthCheck();
        } catch (error) {
            console.error('Error en el monitoreo de salud en segundo plano:', error.message);
        }
    }, 120000); 
}

// Cierre limpio centralizado — solo acá, no duplicar en db.js ni sessionPool.js
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando conexiones...`);

    try {
        await closeSessionPool();
        await closeConnection();
        console.log('✅ Todos los pools cerrados correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el cierre:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();