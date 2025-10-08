import express from 'express';
import authController from '../controllers/authController.js';
import { verificarSesion } from '../middleware/auth.js'; // Importar verificarSesion

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/estado', verificarSesion, authController.verificarEstado);
router.get('/permisos', verificarSesion, authController.getPermisos); // Nueva ruta protegida

export default router;