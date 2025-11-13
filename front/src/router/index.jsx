// front/src/router/index.jsx (VERSIÓN FINAL)
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Auth from '../auth/Auth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Componentes de las vistas con carga perezosa (lazy loading)
const Landing = React.lazy(() => import('../components/Landing'));
const PurchasesManager = React.lazy(() => import('../components/PurchasesManager'));
const StockManager = React.lazy(() => import('../components/StockManager'));
const Ventas = React.lazy(() => import('../components/Ventas'));
const AuditLogs = React.lazy(() => import('../components/AuditLogs'));
const CashAdmin = React.lazy(() => import('../components/CashAdmin'));
const Corte = React.lazy(() => import('../components/Corte'));
const CajeroView = React.lazy(() => import('../components/CajeroView'));
const Customers = React.lazy(() => import('../components/Customers'));
const Informes = React.lazy(() => import('../components/Informes'));
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const Users = React.lazy(() => import('../components/Users'));
const ImportarStock = React.lazy(() => import('../components/ImportarStock'));
const ProfitReport = React.lazy(() => import('../components/ProfitReport'));
const ThemeEditor = React.lazy(() => import('../components/ThemeEditor'));
const PromotionsManager = React.lazy(() => import('../components/PromotionsManager'));
const ComboManager = React.lazy(() => import('../components/ComboManager'));
const BarcodePrinter = React.lazy(() => import('../components/BarcodePrinter'));
const PaymentMethodSurchargeManager = React.lazy(() => import('../components/PaymentMethodSurchargeManager'));
const FiscalAdmin = React.lazy(() => import('../components/FiscalAdmin'));
const Unauthorized = React.lazy(() => import('./Unauthorized')); // Importar componente de Acceso Denegado

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
      { path: 'informes', element: <ProtectedRoute permission="ver_vista_informes"><Informes /></ProtectedRoute> },
      { path: 'usuarios', element: <ProtectedRoute permission="ver_vista_usuarios"><Users /></ProtectedRoute> },
      { path: 'profit-report', element: <ProtectedRoute permission="ver_vista_informes"><ProfitReport /></ProtectedRoute> },
      { path: 'editor-tema', element: <ProtectedRoute permission="ver_vista_editor_tema"><ThemeEditor /></ProtectedRoute> },
      { path: 'promociones', element: <ProtectedRoute permission="ver_vista_promociones"><PromotionsManager /></ProtectedRoute> },
      { path: 'combos', element: <ProtectedRoute permission="ver_vista_combos"><ComboManager /></ProtectedRoute> },
      { path: 'barcode-printer', element: <ProtectedRoute permission="ver_vista_impresion_codigos"><BarcodePrinter /></ProtectedRoute> },
      { path: 'gestion-recargos', element: <ProtectedRoute permission="ver_vista_recargos_pagos"><PaymentMethodSurchargeManager /></ProtectedRoute> },
      { path: 'admin-fiscal', element: <ProtectedRoute permission="ver_configuracion_fiscal"><FiscalAdmin /></ProtectedRoute> },
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