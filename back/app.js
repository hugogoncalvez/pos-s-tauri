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
  console.log(`[Request Logger] Method: ${req.method}, URL: ${req.originalUrl}, Origin: ${req.headers.origin}`);
  next();
});

// Opciones de CORS para permitir la app de Tauri y el frontend de desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin Recibido:', origin);
    const allowedOrigins = [
      'tauri://localhost',
      'http://localhost:5173',
      'http://tauri.localhost',
      'null'
    ];
    // Permite requests sin origen (como desde la app compilada) y orígenes permitidos
    if (origin === null || allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  credentials: false,
  exposedHeaders: ['X-Session-ID'] // IMPORTANTE: Exponer el header para que el cliente lo pueda leer
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
      console.log('[SESSION] 🔄 Usando sessionID existente:', req.cookies[sessionKey]);
      return req.cookies[sessionKey];
    }
    // Si no, generar uno nuevo
    const newId = randomUUID();
    console.log('[SESSION] ✨ Generando nuevo sessionID:', newId);
    return newId;
  }
}));

app.use('/api', Routes);

const PORT = process.env.PORT || 8000;

// Función asíncrona para iniciar el servidor y la conexión a la DB
async function startServer() {
  try {
    await db.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    initScheduledTasks();
    console.log('✅ Tareas programadas inicializadas');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}/`);
      console.log(`🌐 Accesible desde la red en http://<TU_IP>:${PORT}/`);
    });

  } catch (error) {
    console.error('❌ Error al conectar a la base de datos o iniciar el servidor:', error);
    process.exit(1);
  }
}

// Llamar a la función para iniciar el servidor
startServer();