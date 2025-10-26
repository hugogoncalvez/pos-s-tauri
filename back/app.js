import express from "express";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import sessionHeaderMiddleware from './middleware/sessionHeaderMiddleware.js';

// Cargar variables de entorno
dotenv.config();

// Manejadores de errores globales para evitar que la aplicación se caiga
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Aquí podrías añadir un sistema de logging más robusto
});

process.on('uncaughtException', (err, origin) => {
  console.error(`❌ Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  // Aquí podrías añadir un sistema de logging más robusto
});


// Importar la base de datos
import db from './database/db.js';
import './database/associations.js';

// Importar las rutas
import Routes from './routes/routes.js';

// Importar tareas programadas
import { initScheduledTasks } from './services/scheduledTasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para loguear todas las peticiones entrantes
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}, Origin: ${req.headers.origin}`);
  }
  next();
});

// Opciones de CORS para permitir la app de Tauri y el frontend de desarrollo
const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Origin recibido:', origin || 'SIN ORIGIN');
    }

    const allowedOrigins = [
      'tauri://localhost',
      'http://tauri.localhost',
      'https://tauri.localhost',
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    ];

    // Solo en desarrollo, permitir red local (192.168.x.x)
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/);
    }

    // CRÍTICO: Si no hay origin (curl, Postman, requests internos), PERMITIR
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Petición sin Origin - Permitida');
      }
      return callback(null, true);
    }

    // Verificar contra la lista
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Origin permitido:', origin);
      }
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
app.use(express.json());

// Middleware para inicializar req.cookies
app.use((req, res, next) => {
  req.cookies = req.cookies || {};
  next();
});

// CRÍTICO: Middleware que procesa el header X-Session-ID
app.use(sessionHeaderMiddleware);

// Configuración de express-session
const MySQLStoreSession = MySQLStore(session);
const sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Añadir configuración de pool para robustez
  pool: true, // Habilita el uso de un pool de conexiones
  max: 5, // Máximo de 5 conexiones como en Sequelize
  min: 0,
  acquire: 60000, // 60 segundos para adquirir una conexión
  idle: 60000,    // 60 segundos de inactividad antes de liberar

  createDatabaseTable: true,
  charset: 'utf8mb4_bin',
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};
export const sessionStore = new MySQLStoreSession(sessionStoreOptions);

const sessionKey = process.env.SESSION_KEY || 'pos_session_key';

app.use(session({
  key: sessionKey,
  secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_pos',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,

  // CRÍTICO: Esta función determina el sessionID a usar
  genid: function (req) {
    // Si viene sessionID en la cookie (que pusimos en el middleware), usar ese
    if (req.cookies && req.cookies[sessionKey]) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[SESSION] 🔄 Usando sessionID existente:', req.cookies[sessionKey]);
      }
      return req.cookies[sessionKey];
    }
    // Si no, generar uno nuevo
    const newId = randomUUID();
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SESSION] ✨ Generando nuevo sessionID:', newId);
    }
    return newId;
  }
}));

app.use('/api', Routes);

const PORT = process.env.PORT || 8000;

// Función asíncrona para iniciar el servidor y la conexión a la DB
async function startServer() {
  const MAX_RETRIES = 5;
  let currentRetry = 0;

  const connectWithRetry = async () => {
    while (currentRetry < MAX_RETRIES) {
      try {
        await db.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
        return; // Salir del bucle si la conexión es exitosa
      } catch (error) {
        currentRetry++;
        const delay = Math.min(5000 * Math.pow(2, currentRetry - 1), 30000); // Backoff exponencial
        console.error(`❌ Error al conectar a la DB. Intento ${currentRetry}/${MAX_RETRIES}. Reintentando en ${delay / 1000}s...`);

        if (currentRetry >= MAX_RETRIES) {
          console.error('❌ Se alcanzó el máximo de reintentos. El servidor no pudo iniciarse.');
          process.exit(1);
        }

        await new Promise(res => setTimeout(res, delay));
      }
    }
  };

  await connectWithRetry();

  // Si llegamos aquí, la conexión a la DB fue exitosa.
  initScheduledTasks();
  console.log('✅ Tareas programadas inicializadas');

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}/`);
    console.log(`🌐 Accesible desde la red en http://<TU_IP>:${PORT}/`);
  });
}

// Llamar a la función para iniciar el servidor
startServer();