import express from "express";
import checkPermission from '../middleware/checkPermission.js';
import {
    getFiscalConfig, createFiscalConfig, updateFiscalConfig,
    getPointsOfSale, getPointOfSaleById, createPointOfSale, updatePointOfSale, deletePointOfSale,
    generateFiscalInvoice
} from "../controllers/fiscalController.js";

const fiscalRouter = express.Router();

// Rutas para FiscalConfig
/**
 * @swagger
 * /fiscal-config:
 *   get:
 *     summary: Obtiene la configuración fiscal global.
 *     tags: [Fiscal]
 *     responses:
 *       200:
 *         description: Configuración fiscal.
 */
fiscalRouter.get('/fiscal-config', checkPermission('ver_configuracion_fiscal'), getFiscalConfig);

/**
 * @swagger
 * /fiscal-config:
 *   post:
 *     summary: Crea la configuración fiscal global (solo si no existe).
 *     tags: [Fiscal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FiscalConfig'
 *     responses:
 *       201:
 *         description: Configuración fiscal creada.
 */
fiscalRouter.post('/fiscal-config', checkPermission('gestionar_configuracion_fiscal'), createFiscalConfig);

/**
 * @swagger
 * /fiscal-config:
 *   put:
 *     summary: Actualiza o crea la configuración fiscal global (upsert).
 *     tags: [Fiscal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FiscalConfig'
 *     responses:
 *       200:
 *         description: Configuración fiscal actualizada.
 *       201:
 *         description: Configuración fiscal creada.
 */
fiscalRouter.put('/fiscal-config', checkPermission('gestionar_configuracion_fiscal'), updateFiscalConfig);

// Rutas para PointsOfSale
/**
 * @swagger
 * /points-of-sale:
 *   get:
 *     summary: Obtiene todos los puntos de venta.
 *     tags: [Fiscal]
 *     responses:
 *       200:
 *         description: Lista de puntos de venta.
 */
fiscalRouter.get('/points-of-sale', checkPermission('ver_puntos_de_venta'), getPointsOfSale);

/**
 * @swagger
 * /points-of-sale/{id}:
 *   get:
 *     summary: Obtiene un punto de venta por ID.
 *     tags: [Fiscal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Punto de venta.
 */
fiscalRouter.get('/points-of-sale/:id', checkPermission('ver_puntos_de_venta'), getPointOfSaleById);

/**
 * @swagger
 * /points-of-sale:
 *   post:
 *     summary: Crea un nuevo punto de venta.
 *     tags: [Fiscal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointOfSale'
 *     responses:
 *       201:
 *         description: Punto de venta creado.
 */
fiscalRouter.post('/points-of-sale', checkPermission('gestionar_puntos_de_venta'), createPointOfSale);

/**
 * @swagger
 * /points-of-sale/{id}:
 *   put:
 *     summary: Actualiza un punto de venta.
 *     tags: [Fiscal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointOfSale'
 *     responses:
 *       200:
 *         description: Punto de venta actualizado.
 */
fiscalRouter.put('/points-of-sale/:id', checkPermission('gestionar_puntos_de_venta'), updatePointOfSale);

/**
 * @swagger
 * /points-of-sale/{id}:
 *   delete:
 *     summary: Elimina un punto de venta.
 *     tags: [Fiscal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Punto de venta eliminado.
 */
fiscalRouter.delete('/points-of-sale/:id', checkPermission('gestionar_puntos_de_venta'), deletePointOfSale);

// Nueva ruta para generar comprobantes fiscales
/**
 * @swagger
 * /sales/{saleId}/generate-invoice:
 *   post:
 *     summary: Genera un comprobante fiscal para una venta.
 *     tags: [Fiscal]
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointOfSaleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comprobante fiscal creado.
 *       202:
 *         description: El trabajo de generación de comprobante ha sido encolado.
 */
fiscalRouter.post('/sales/:saleId/generate-invoice', checkPermission('generar_comprobante_fiscal'), generateFiscalInvoice);

export default fiscalRouter;
