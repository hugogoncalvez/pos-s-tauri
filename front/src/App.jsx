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
      if (activeSession) {
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
            logout(); // Ejecutar logout antes de cerrar
            resolve(true);
          },
          () => resolve(false) // onCancel
        );
      } else {
        logout(); // Ejecutar logout incluso si no hay sesión activa de caja
        resolve(true); // Permitir cierre
      }
    });
  }, [activeSession, theme, logout]); // Añadir 'logout' a las dependencias

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
