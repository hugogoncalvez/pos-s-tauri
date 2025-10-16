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

function App() {
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { user, isAuthenticated, logout, logoutOnClose, isOnline } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCheckFunction } = useContext(PreventCloseContext); // Usar el contexto

  const {
    pendingSync,
    showSyncModal,
    handleSyncClick,
    handleSyncComplete,
  } = useSyncManager();

  const pendingSalesCount = pendingSync.pendingSales;

  const { activeSession, isLoadingActiveSession } = useCashRegister();
  // Se elimina el log de la consola de aquí para evitar ruido.

  const checkSessionBeforeClose = useCallback(() => {
    return new Promise((resolve) => {
      if (isLoadingActiveSession) {
        info("[App.jsx DEBUG] Se intentó cerrar mientras la sesión de caja estaba cargando. Cancelando temporalmente.");
        Swal.fire({
          title: 'Verificando sesión de caja...',
          text: 'Por favor, espera un momento e intenta cerrar de nuevo.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        resolve(false);
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
          async () => { // onConfirm
            info("[App.jsx DEBUG] Usuario confirmó el cierre. Ejecutando logoutOnClose.");
            await logoutOnClose(); // Usar la función segura y esperar
            info("[App.jsx DEBUG] logoutOnClose completado. Permitiendo cierre.");
            resolve(true);
          },
          () => { // onCancel
            info("[App.jsx DEBUG] Usuario canceló el cierre.");
            resolve(false);
          }
        );
      } else {
        info("[App.jsx DEBUG] 'activeSession' es null/undefined. Omitiendo confirmación y ejecutando logoutOnClose.");
        (async () => {
          await logoutOnClose();
          resolve(true);
        })();
      }
    });
  }, [activeSession, isLoadingActiveSession, theme, logoutOnClose]);

  // Registrar la función de chequeo en el contexto
  useEffect(() => {
    info('[App.jsx DEBUG] Registrando función checkSessionBeforeClose en el contexto.');
    setCheckFunction(checkSessionBeforeClose);

    // Limpiar la función cuando App.jsx se desmonte
    return () => {
      info('[App.jsx DEBUG] Desmontando App.jsx. Eliminando función de chequeo del contexto.');
      setCheckFunction(null);
    };
  }, [checkSessionBeforeClose, setCheckFunction]);


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
