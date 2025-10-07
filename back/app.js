import express from "express";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import dotenv from 'dotenv';

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

// Opciones de CORS para permitir la app de Tauri y el frontend de desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'tauri://localhost',
      'http://localhost:5173',
      'http://tauri.localhost' // Origen de la app Tauri en producción
    ];
    // Permite requests sin origen (como mobile apps o Postman) y los orígenes en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear JSON

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
const sessionStore = new MySQLStoreSession(sessionStoreOptions);

app.use(session({
    key: process.env.SESSION_KEY || 'pos_session_key',
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_pos',
    store: sessionStore, // Se activa el store de MySQL
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Debe ser false si no se usa HTTPS en la red local
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        sameSite: 'none' // Necesario para peticiones cross-origin
    }
}));
app.use('/api', Routes);



const PORT = process.env.PORT || 8000; // Define PORT before app.listen

// Función asíncrona para iniciar el servidor y la conexión a la DB
async function startServer() {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    initScheduledTasks();
    console.log('Tareas programadas inicializadas');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor en ejecución en http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error('Error al conectar a la base de datos o iniciar el servidor:', error);
    process.exit(1);
  }
}

// Llamar a la función para iniciar el servidor
startServer();
