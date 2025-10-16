import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect, Suspense, useCallback, useContext } from 'react'; // Añadir useContext
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { PreventCloseContext } from './context/PreventCloseContext'; // Importar el nuevo contexto
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { useCashRegister } from './hooks/useCashRegister';
import Swal from 'sweetalert2';
import { mostrarConfirmacion } from './functions/mostrarConfirmacion';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';
import { info } from '@tauri-apps/plugin-log';

import { initializeOfflineUser } from './db/offlineDB';

import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { user, isAuthenticated, logout, logoutOnClose, isOnline } = useAuth();
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

  const handleCloseRequest = useCallback(async (event, unlistenPromise) => {
    event.preventDefault();

    if (isLoadingActiveSession) {
      Swal.fire({
        title: 'Verificando sesión...',
        text: 'Por favor, espera un momento e intenta cerrar de nuevo.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
      });
      return; // No se puede cerrar ahora
    }

    let canClose = false;
    if (activeSession) {
      const result = await mostrarConfirmacion(
        {
          title: '¡Sesión de Caja Activa!',
          text: 'Hay una sesión de caja abierta. ¿Estás seguro de que quieres cerrar la aplicación? Se cerrará tu sesión actual.',
          icon: 'warning',
          confirmButtonText: 'Sí, cerrar y salir',
          cancelButtonText: 'No, cancelar',
        },
        theme
      );
      canClose = result.isConfirmed;
    } else {
      canClose = true; // Si no hay sesión, se puede cerrar directamente
    }

    if (canClose) {
      await logoutOnClose();
      const unlisten = await unlistenPromise;
      unlisten();
      await getCurrentWindow().close();
    }
  }, [activeSession, isLoadingActiveSession, theme, logoutOnClose]);

  usePreventClose(handleCloseRequest);


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
