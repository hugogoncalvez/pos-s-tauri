import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContextProvider'; // Importamos el ThemeProvider
import './styles/global.css'; // Importar estilos globales
import moment from 'moment';
import 'moment/locale/es';
import { attachConsole } from '@tauri-apps/plugin-log';

// Desactivar el manejador de conexión de React-Query para controlar nosotros el modo offline
onlineManager.setEventListener(setOnline => {
  return () => { };
});

moment.locale('es'); // Establecer el idioma español para moment.js

// Adjuntar la consola del webview al sistema de logs de Rust
attachConsole();

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider> {/* 1. AuthProvider envuelve todo */}
    <QueryClientProvider client={client}>
      <ThemeContextProvider> {/* 2. ThemeProvider adentro */}
        <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />
        <ReactQueryDevtools />
      </ThemeContextProvider>
    </QueryClientProvider>
  </AuthProvider>
);
