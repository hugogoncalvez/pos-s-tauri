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
    cookie: {
        secure: true, // Cambiado a true para compatibilidad con SameSite=None en navegadores modernos
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
