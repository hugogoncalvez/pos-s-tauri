import express from "express";
import multer from 'multer';
import { verificarSesion } from "../middleware/auth.js";
import checkPermission from '../middleware/checkPermission.js';

import {
    // ... (all existing controllers)
    getPurchases, getPurchaseDetails, getPurchase, deletePurchase, updatePurchase, createFullPurchase,
    getRoles, getRoleById, createRole, updateRole, deleteRole,
    getUsers, getUserById, createUser, updateUser, deleteUser,
    createStocks, getStocks, getStock, deleteStock, updateStock, getAllElements, updateElement, getCategories, getUnits, importarStock,
    createSale, getSales, getSaleDetails, deleteSale, getSalesDetails,
    openCashSession, getActiveCashSession, getCashSessionHistory, getCurrentSessionSummary, getSummaryForClose, initiateClosure, finalizeClosure, directCloseSessionByAdmin, createCashMovement,
    getAuditLogs, getAuditStats, getUserActivity, getLowStockAlerts,
    getCustomers, getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, getPaymentMethodById, getPaymentSurcharges, updatePaymentSurcharge,
    getAllSuppliers, createSupplier,
    getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getTotalCustomersDebt,
    registerCustomerPayment, getCustomerPurchaseHistory, getCustomerPaymentHistory,
    exportCustomersCSV, getCustomersStats,
    getSalesToday, getTotalCustomers, getTotalSuppliers, getTopSellingProducts, getSalesWeek, getSalesMonth,
    getPurchasesToday, // <-- Añadir esta línea
    getReportSummary, getFullReport, // <-- Añadir esta línea
    getProfitMarginReport,
    getAllPermissions,
    getUserPermissions,
    addUserPermission,
    removeUserPermission,
    updateThemePreference,
    checkCustomerDuplicate,
    getThemeSettings, updateThemeSettings,
    getPendingTickets, createPendingTicket, updatePendingTicket, deletePendingTicket, getPendingTicketById,
    checkBarcodeExists,
    getProductByBarcode,
    getPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionsSummary,
    getPresentationsSummary,
    getCombosSummary,
    assignPromotion,
    getPresentations,
    getCombos,
    getComboById,
    getComboByBarcode,
    createCombo,
    updateCombo,
    deleteCombo,
    generateInternalBarcode,
    checkBarcodeGlobalUniqueness,
    getUserModules,
    updateUserModules,
    getCashSessionSummary
} from "../controllers/Controller.js";
import authRoutes from './auth.js';
import db from '../database/db.js'; // Import the database instance

const router = express.Router();
const authenticatedRouter = express.Router(); // NEW: Router for authenticated routes
const upload = multer({ storage: multer.memoryStorage() });

// Public health check route
router.get('/health', async (req, res) => {
    try {
        // Intentar una query simple a la BD para una verificación más robusta
        await db.authenticate();
        await db.query('SELECT 1', { type: db.QueryTypes.SELECT });

        res.status(200).json({
            status: "ok",
            db: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Database connection failed during health check:", error.message);
        res.status(503).json({
            status: "error",
            db: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Public routes (authentication related)
router.use('/auth', authRoutes);

// Apply verificarSesion to all routes that require authentication
authenticatedRouter.use(verificarSesion); // NEW: Apply middleware here

// Move all previously protected routes under authenticatedRouter
// --- RUTAS DEL DASHBOARD ---
authenticatedRouter.get('/dashboard/ventas/hoy', checkPermission('listar_ventas_historial'), getSalesToday);
authenticatedRouter.get('/customers/total', checkPermission('listar_clientes'), getTotalCustomers);
authenticatedRouter.get('/suppliers/total', checkPermission('listar_proveedores'), getTotalSuppliers);
authenticatedRouter.get('/dashboard/top-productos', checkPermission('listar_productos'), getTopSellingProducts);
authenticatedRouter.get('/dashboard/ventas/semana', checkPermission('listar_ventas_historial'), getSalesWeek);
authenticatedRouter.get('/dashboard/ventas/mes', checkPermission('listar_ventas_historial'), getSalesMonth);
authenticatedRouter.get('/dashboard/compras/hoy', checkPermission('ver_vista_compras'), getPurchasesToday);

// --- RUTAS DE REPORTES ---
authenticatedRouter.get('/reports/summary', checkPermission('listar_ventas_historial'), getReportSummary);
authenticatedRouter.get('/reports/full-data', checkPermission('listar_ventas_historial'), getFullReport);
authenticatedRouter.get('/reports/profit-margin', checkPermission('listar_ventas_historial'), getProfitMarginReport);

// --- RUTAS DE ROLES Y PERMISOS ---
authenticatedRouter.get('/roles', checkPermission('accion_gestionar_roles'), getRoles);
authenticatedRouter.get('/roles/:id', checkPermission('accion_gestionar_roles'), getRoleById);
authenticatedRouter.post('/roles', checkPermission('accion_gestionar_roles'), createRole);
authenticatedRouter.put('/roles/:id', checkPermission('accion_gestionar_roles'), updateRole);
authenticatedRouter.delete('/roles/:id', checkPermission('accion_gestionar_roles'), deleteRole);
authenticatedRouter.get('/permissions', checkPermission('accion_gestionar_roles'), getAllPermissions);
authenticatedRouter.get('/users/:id/permissions', checkPermission('accion_gestionar_roles'), getUserPermissions);
authenticatedRouter.post('/users/:id/permissions', checkPermission('accion_gestionar_roles'), addUserPermission);
authenticatedRouter.delete('/users/:id/permissions/:permission_id', checkPermission('accion_gestionar_roles'), removeUserPermission);
authenticatedRouter.get('/users/:user_id/modules', checkPermission('accion_gestionar_roles'), getUserModules);
authenticatedRouter.post('/users/:user_id/modules', checkPermission('accion_gestionar_roles'), updateUserModules);

// --- RUTAS DE USUARIOS ---
authenticatedRouter.get('/users', checkPermission('ver_vista_usuarios'), getUsers);
authenticatedRouter.post('/users', checkPermission('accion_crear_usuario'), createUser);
authenticatedRouter.put('/users/theme', updateThemePreference); // No necesita permiso especial, es del usuario
authenticatedRouter.get('/users/:id', checkPermission('ver_vista_usuarios'), getUserById);
authenticatedRouter.put('/users/:id', checkPermission('accion_editar_usuario'), updateUser);
authenticatedRouter.delete('/users/:id', checkPermission('accion_eliminar_usuario'), deleteUser);

// --- RUTAS DE COMPRAS ---
authenticatedRouter.post('/purchases/full', checkPermission('accion_crear_compra'), createFullPurchase);
authenticatedRouter.get('/purchasesdetails', checkPermission('ver_vista_compras'), getPurchaseDetails);
authenticatedRouter.get('/purchases', checkPermission('ver_vista_compras'), getPurchases);
authenticatedRouter.get('/purchase/:id', checkPermission('ver_vista_compras'), getPurchase);
authenticatedRouter.delete('/delPurchase/:id', checkPermission('accion_crear_compra'), deletePurchase); // Asumo que quien crea puede borrar
authenticatedRouter.put('/purchases/:id', checkPermission('accion_crear_compra'), updatePurchase); // Asumo que quien crea puede editar

// --- RUTAS DE STOCK, PRODUCTOS, CATEGORÍAS ---
authenticatedRouter.post('/stock', checkPermission('accion_crear_producto'), createStocks);
router.get('/stock/product-by-barcode/:barcode', verificarSesion, checkPermission('listar_productos'), getProductByBarcode);
authenticatedRouter.get('/stock', checkPermission(['listar_stock', 'listar_productos']), getStocks);
authenticatedRouter.get('/stock/barcode/:barcode', checkPermission('accion_crear_venta'), getProductByBarcode);
authenticatedRouter.get('/barcodes/generate/:type', checkPermission('accion_crear_producto'), generateInternalBarcode);
authenticatedRouter.get('/barcodes/validate/:barcode', checkPermission('accion_crear_producto'), checkBarcodeGlobalUniqueness);
authenticatedRouter.get('/stock/:id', checkPermission('listar_productos'), getStock);
authenticatedRouter.delete('/delstock/:id', checkPermission('accion_eliminar_producto'), deleteStock);
authenticatedRouter.put('/upstock/:id', checkPermission('accion_editar_producto'), updateStock);
authenticatedRouter.post('/stock/importar', checkPermission('accion_importar_stock'), upload.single('file'), importarStock);
authenticatedRouter.get('/category', checkPermission('listar_productos'), getCategories);
authenticatedRouter.get('/units', checkPermission('listar_productos'), getUnits);

// --- RUTAS DE VENTAS ---
authenticatedRouter.post('/sales', checkPermission('accion_crear_venta'), createSale);
authenticatedRouter.get('/sales', checkPermission('listar_ventas_historial'), getSales);
authenticatedRouter.get('/salesdetails', checkPermission('listar_ventas_historial'), getSalesDetails);
authenticatedRouter.get('/sales/:id/details', checkPermission('listar_ventas_historial'), getSaleDetails);
authenticatedRouter.delete('/sales/:id', checkPermission('accion_cancelar_venta'), deleteSale);

// --- RUTAS DE CAJA ---
authenticatedRouter.post('/cash-sessions/open', checkPermission('accion_abrir_caja'), openCashSession);
authenticatedRouter.get('/cash-sessions/:session_id/summary-for-close', checkPermission('accion_cerrar_caja_propia'), getSummaryForClose);
authenticatedRouter.post('/cash-sessions/:session_id/initiate-close', checkPermission('accion_cerrar_caja_propia'), initiateClosure);
authenticatedRouter.post('/cash-sessions/:session_id/finalize-close', checkPermission('accion_cerrar_caja_ajena'), finalizeClosure);
authenticatedRouter.post('/cash-sessions/:session_id/direct-close-admin', checkPermission('accion_cerrar_caja_ajena'), directCloseSessionByAdmin);
authenticatedRouter.post('/cash-sessions/movement', checkPermission('accion_registrar_movimiento_caja'), createCashMovement);
authenticatedRouter.get('/cash-sessions/active/:user_id', checkPermission('accion_abrir_caja'), getActiveCashSession);
authenticatedRouter.get('/cash-sessions/history', checkPermission(['ver_mi_caja', 'ver_vista_caja_admin']), getCashSessionHistory);
authenticatedRouter.get('/cash-sessions/summary/:user_id', checkPermission('ver_mi_caja'), getCurrentSessionSummary);
authenticatedRouter.get('/cash-sessions/:session_id/summary', checkPermission(['ver_vista_caja_admin', 'ver_mi_caja']), getCashSessionSummary);

// --- RUTAS DE CLIENTES ---
authenticatedRouter.get('/customers', checkPermission(['listar_clientes', 'ver_vista_clientes']), getCustomers);
authenticatedRouter.get('/customers/all', checkPermission(['listar_clientes', 'ver_vista_clientes']), getAllCustomers);
authenticatedRouter.get('/customers/total-debt', checkPermission(['listar_clientes', 'ver_vista_clientes']), getTotalCustomersDebt);
authenticatedRouter.get('/customers/check-duplicate', checkPermission(['accion_crear_cliente', 'accion_editar_cliente']), checkCustomerDuplicate);
authenticatedRouter.get('/customers/:id', checkPermission('ver_vista_clientes'), getCustomerById);
authenticatedRouter.post('/customers', checkPermission('accion_crear_cliente'), createCustomer);
authenticatedRouter.put('/customers/:id', checkPermission('accion_editar_cliente'), updateCustomer);
authenticatedRouter.delete('/customers/:id', checkPermission('accion_editar_cliente'), deleteCustomer);
authenticatedRouter.post('/customers/:customer_id/payments', checkPermission('accion_registrar_pago_cliente'), registerCustomerPayment);
authenticatedRouter.get('/customers/:customer_id/purchases', checkPermission('ver_vista_clientes'), getCustomerPurchaseHistory);
authenticatedRouter.get('/customers/:customer_id/payments', checkPermission('ver_vista_clientes'), getCustomerPaymentHistory);
authenticatedRouter.get('/customers/export/csv', checkPermission('accion_exportar_reportes'), exportCustomersCSV);
authenticatedRouter.get('/customers/stats/summary', checkPermission('ver_vista_clientes'), getCustomersStats);

// --- RUTAS DE PROVEEDORES Y PAGOS ---
authenticatedRouter.get('/payment', checkPermission('listar_medios_pago'), getPaymentMethods);
authenticatedRouter.get('/payment/:id', checkPermission('listar_medios_pago'), getPaymentMethodById);
authenticatedRouter.post('/payment', checkPermission('accion_gestionar_roles'), createPaymentMethod);
authenticatedRouter.put('/payment/:id', checkPermission('accion_gestionar_roles'), updatePaymentMethod);
authenticatedRouter.delete('/payment/:id', checkPermission('accion_gestionar_roles'), deletePaymentMethod);

// --- RUTAS PARA GESTIÓN DE RECARGOS ---
authenticatedRouter.get('/payments/surcharges', checkPermission('ver_vista_recargos_pagos'), getPaymentSurcharges);
authenticatedRouter.put('/payments/:id/surcharge', checkPermission('accion_gestionar_recargos_pagos'), updatePaymentSurcharge);

// --- RUTAS DE PROVEEDORES ---
authenticatedRouter.get('/suppliers', checkPermission('listar_proveedores'), getAllSuppliers);
authenticatedRouter.post('/suppliers', checkPermission('accion_crear_proveedor'), createSupplier);

// --- RUTAS DE AUDITORÍA ---
authenticatedRouter.get('/audit/logs', checkPermission('ver_vista_auditoria'), getAuditLogs);
authenticatedRouter.get('/audit/stats', checkPermission('ver_vista_auditoria'), getAuditStats);
authenticatedRouter.get('/audit/user/:user_id', checkPermission('ver_vista_auditoria'), getUserActivity);
authenticatedRouter.get('/audit/low-stock-alerts', checkPermission('listar_stock'), getLowStockAlerts);

// --- RUTAS DE CONFIGURACIÓN ---
router.get('/theme', getThemeSettings); // Pública
authenticatedRouter.put('/theme', checkPermission('ver_vista_editor_tema'), updateThemeSettings);
authenticatedRouter.get('/elements', getAllElements); // Pública, los permisos se chequean en el front
authenticatedRouter.put('/element', checkPermission('accion_gestionar_roles'), updateElement);

// --- RUTAS DE ENTIDADES COMPLEJAS (PROMOCIONES, COMBOS, TICKETS) ---
authenticatedRouter.get('/pending-tickets', checkPermission('accion_crear_venta'), getPendingTickets);
authenticatedRouter.post('/pending-tickets', checkPermission('accion_crear_venta'), createPendingTicket);
authenticatedRouter.put('/pending-tickets/:id', checkPermission('accion_crear_venta'), updatePendingTicket);
authenticatedRouter.get('/pending-tickets/:id', checkPermission('accion_crear_venta'), getPendingTicketById);
authenticatedRouter.delete('/pending-tickets/:id', checkPermission('accion_crear_venta'), deletePendingTicket);

authenticatedRouter.get('/promotions', checkPermission(['ver_vista_promociones', 'accion_crear_venta']), getPromotions);
authenticatedRouter.get('/promotions/summary', checkPermission('ver_vista_promociones'), getPromotionsSummary);
authenticatedRouter.get('/promotions/:id', checkPermission('ver_vista_promociones'), getPromotionById);
authenticatedRouter.post('/promotions', checkPermission('ver_vista_promociones'), createPromotion);
authenticatedRouter.put('/promotions/:id', checkPermission('ver_vista_promociones'), updatePromotion);
authenticatedRouter.delete('/promotions/:id', checkPermission('ver_vista_promociones'), deletePromotion);
authenticatedRouter.post('/promotions/assign', checkPermission('ver_vista_promociones'), assignPromotion);

authenticatedRouter.get('/presentations', checkPermission(['ver_vista_promociones', 'listar_presentaciones']), getPresentations);
authenticatedRouter.get('/presentations/summary', checkPermission('listar_productos'), getPresentationsSummary);

authenticatedRouter.get('/combos', checkPermission(['ver_vista_combos', 'accion_crear_venta']), getCombos);
authenticatedRouter.get('/combos/summary', checkPermission('ver_vista_combos'), getCombosSummary);
authenticatedRouter.get('/combos/:id', checkPermission('ver_vista_combos'), getComboById);
authenticatedRouter.get('/combos/by-barcode/:barcode', checkPermission('accion_crear_venta'), getComboByBarcode);
authenticatedRouter.post('/combos', checkPermission('ver_vista_combos'), createCombo);
authenticatedRouter.put('/combos/:id', checkPermission('ver_vista_combos'), updateCombo);
authenticatedRouter.delete('/combos/:id', checkPermission('ver_vista_combos'), deleteCombo);

// Export the main router
router.use(authenticatedRouter); // NEW: Use the authenticated router 
export default router;
