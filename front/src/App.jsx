import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { usePreventClose } from './hooks/usePreventClose';
import { useCashRegister } from './hooks/useCashRegister';
import Swal from 'sweetalert2';
import { mostrarConfirmacion } from './functions/mostrarConfirmacion';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';
import { info } from '@tauri-apps/plugin-log';

import { initializeOfflineUser } from './db/offlineDB';

function App() {
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { user, isAuthenticated, logout, isOnline } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    pendingSync,
    showSyncModal,
    handleSyncClick,
    handleSyncComplete,
  } = useSyncManager();

  const pendingSalesCount = pendingSync.pendingSales;

  const { activeSession, isLoadingActiveSession } = useCashRegister();
  console.log(`[App.jsx] After useCashRegister: activeSession (${activeSession ? 'present' : 'undefined'}), isLoadingActiveSession (${isLoadingActiveSession})`);

  const checkSessionBeforeClose = useCallback(() => {
    return new Promise((resolve) => {
      // NUEVO: Manejar el estado de carga para evitar race conditions
      if (isLoadingActiveSession) {
        info("[App.jsx DEBUG] Se intentó cerrar mientras la sesión de caja estaba cargando. Cancelando temporalmente.");
        Swal.fire({
          title: 'Verificando sesión de caja...',
          text: 'Por favor, espera un momento e intenta cerrar de nuevo.',
          icon: 'info',
          timer: 2000, // Mostrar por 2 segundos
          showConfirmButton: false
        });
        resolve(false); // Prevenir el cierre
        return;
      }

      info(`[App.jsx DEBUG] Intento de cierre. Valor de activeSession: ${JSON.stringify(activeSession)}`);
      if (activeSession) {
        info("[App.jsx DEBUG] 'activeSession' existe. Mostrando confirmación.");
        mostrarConfirmacion(
          {
            title: '¡Sesión de Caja Activa!',
            text: 'Hay una sesión de caja abierta. ¿Estás seguro de que quieres cerrar la aplicación? Se cerrará tu sesión actual.',
            icon: 'warning',
            confirmButtonText: 'Sí, cerrar y salir',
            cancelButtonText: 'No, cancelar',
          },
          theme,
          () => { // onConfirm
            info("[App.jsx DEBUG] Usuario confirmó el cierre. Ejecutando logout.");
            logout(); // Ejecutar logout antes de cerrar
            resolve(true);
          },
          () => {
            info("[App.jsx DEBUG] Usuario canceló el cierre.");
            resolve(false); // onCancel
          }
        );
      } else {
        info("[App.jsx DEBUG] 'activeSession' es null/undefined. Omitiendo confirmación y ejecutando logout.");
        logout(); // Ejecutar logout incluso si no hay sesión activa de caja
        resolve(true); // Permitir cierre
      }
    });
  }, [activeSession, isLoadingActiveSession, theme, logout]); // Añadir isLoadingActiveSession

  usePreventClose(checkSessionBeforeClose);


  useEffect(() => {
    const initUser = async () => {
      if (isAuthenticated && user) {
        await initializeOfflineUser(user.id.toString());
        await syncService.loadReferenceData(user.id);
      }
    };
    initUser();
  }, [isAuthenticated, user]);

  const appBarHeight = isDesktopUp ? 80 : 56;

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <DenseAppBar isOnline={isOnline} pendingSalesCount={pendingSalesCount} onSyncClick={handleSyncClick} />
        <Box sx={{ height: appBarHeight }} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode='wait'>
            <Suspense >
              <Outlet />
            </Suspense>
          </AnimatePresence>
        </Box>
      </Box>

      {showSyncModal && (
        <>
          {console.log(`[App.jsx] Passing to SyncModal: activeSession (${activeSession ? 'present' : 'undefined'}), isLoadingActiveSession (${isLoadingActiveSession})`)}
          <SyncModal
            open={showSyncModal}
            pendingSync={pendingSync || { pendingSales: 0 }}
            onSyncComplete={handleSyncComplete}
            activeSessionData={activeSession}
            isCheckingSession={isLoadingActiveSession}
          />
        </>
      )}
    </div>
  );
}

export default App;
