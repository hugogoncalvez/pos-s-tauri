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
import { db } from './db/offlineDB'; // Importar la instancia de Dexie
import { syncService } from './services/syncService'; // Importar el servicio de sincronización

const client = new QueryClient();

// Inyectar el cliente de React Query en el servicio de sincronización
syncService.setQueryClient(client);

db.open().catch(err => {
  console.error("Failed to open Dexie DB:", err);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={client}>
    <AuthProvider>
      <ThemeContextProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />
        <ReactQueryDevtools />
      </ThemeContextProvider>
    </AuthProvider>
  </QueryClientProvider>
);
