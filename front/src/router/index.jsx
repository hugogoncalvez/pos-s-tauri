// front/src/router/index.jsx (VERSIÓN FINAL)
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Auth from '../auth/Auth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Componentes de las vistas con carga estática (para evitar errores de "Importing a module script failed" en desarrollo)
import Landing from '../components/Landing';
import PurchasesManager from '../components/PurchasesManager';
import StockManager from '../components/StockManager';
import Ventas from '../components/Ventas';
import AuditLogs from '../components/AuditLogs';
import CashAdmin from '../components/CashAdmin';
import Corte from '../components/Corte';
import CajeroView from '../components/CajeroView';
import Customers from '../components/Customers';
import Informes from '../components/Informes';
import Dashboard from '../components/Dashboard';
import Users from '../components/Users';
import ImportarStock from '../components/ImportarStock';
import ProfitReport from '../components/ProfitReport';
import ThemeEditor from '../components/ThemeEditor';
import PromotionsManager from '../components/PromotionsManager';
import ComboManager from '../components/ComboManager';
import BarcodePrinter from '../components/BarcodePrinter';
import PaymentMethodSurchargeManager from '../components/PaymentMethodSurchargeManager';
import SalesHistory from '../components/SalesHistory';
import BusinessConfig from '../components/BusinessConfig';
import Unauthorized from './Unauthorized'; // Importar componente de Acceso Denegado

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Landing /> },
      { path: 'unauthorized', element: <Unauthorized /> }, // Ruta para acceso denegado
      { path: 'dashboard', element: <ProtectedRoute permission="ver_vista_dashboard"><Dashboard /></ProtectedRoute> },
      { path: 'dashboard/importar-stock', element: <ProtectedRoute permission="accion_importar_stock"><ImportarStock /></ProtectedRoute> },
      { path: 'compras', element: <ProtectedRoute permission="ver_vista_compras"><PurchasesManager /></ProtectedRoute> },
      { path: 'stock', element: <ProtectedRoute permission="ver_vista_stock"><StockManager /></ProtectedRoute> },
      { path: 'ventas', element: <ProtectedRoute permission="ver_vista_ventas"><Ventas /></ProtectedRoute> },
      { path: 'clientes', element: <ProtectedRoute permission="ver_vista_clientes"><Customers /></ProtectedRoute> },
      { path: 'auditoria', element: <ProtectedRoute permission="ver_vista_auditoria"><AuditLogs /></ProtectedRoute> },
      { path: 'admin-cajas', element: <ProtectedRoute permission="ver_vista_caja_admin"><CashAdmin /></ProtectedRoute> },
      { path: 'corte-de-caja', element: <ProtectedRoute permission="ver_vista_caja_admin"><Corte /></ProtectedRoute> },
      { path: 'mi-caja', element: <ProtectedRoute permission="ver_mi_caja"><CajeroView /></ProtectedRoute> },
      { path: 'historial-ventas', element: <ProtectedRoute permission="ver_historial_ventas"><SalesHistory scope="all" /></ProtectedRoute> }, // Añadido
      { path: 'informes', element: <ProtectedRoute permission="ver_vista_informes"><Informes /></ProtectedRoute> },
      { path: 'usuarios', element: <ProtectedRoute permission="ver_vista_usuarios"><Users /></ProtectedRoute> },
      { path: 'profit-report', element: <ProtectedRoute permission="ver_vista_informes"><ProfitReport /></ProtectedRoute> },
      { path: 'editor-tema', element: <ProtectedRoute permission="ver_vista_editor_tema"><ThemeEditor /></ProtectedRoute> },
      { path: 'config-negocio', element: <ProtectedRoute permission="ver_vista_editor_tema"><BusinessConfig /></ProtectedRoute> },
      { path: 'promociones', element: <ProtectedRoute permission="ver_vista_promociones"><PromotionsManager /></ProtectedRoute> },
      { path: 'combos', element: <ProtectedRoute permission="ver_vista_combos"><ComboManager /></ProtectedRoute> },
      { path: 'barcode-printer', element: <ProtectedRoute permission="ver_vista_impresion_codigos"><BarcodePrinter /></ProtectedRoute> },
      { path: 'gestion-recargos', element: <ProtectedRoute permission="ver_vista_recargos_pagos"><PaymentMethodSurchargeManager /></ProtectedRoute> },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Auth />
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);