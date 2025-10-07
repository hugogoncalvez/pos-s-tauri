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
  origin: [
    'tauri://localhost',
    'http://localhost:5173', // Origen del dev server de Vite
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/ // Regex para IPs en la red local
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware para parsear JSON

// Usar las rutas de la API
// Configuración de express-session
// const MySQLStoreSession = MySQLStore(session);
// const sessionStore = new MySQLStoreSession({}, db);

app.use(session({
    key: process.env.SESSION_KEY || 'pos_session_key',
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_pos',
    // store: sessionStore, // Al comentar el store, se usa el MemoryStore por defecto
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
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
