import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // <--- IMPORTAR
import { useAuth } from './context/AuthContext';
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { useCashRegister } from './hooks/useCashRegister';
import Swal from 'sweetalert2';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';
import { usePreventClose } from './hooks/usePreventClose';


const App = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // ✅ PRIMERO - Declarar theme aquí
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('desktop'));
  const queryClient = useQueryClient(); // <--- OBTENER EL CLIENTE

  // Inyectar el queryClient en el servicio de sincronización
  useEffect(() => {
    syncService.setQueryClient(queryClient);
  }, [queryClient]);

  const { usuario, isAuthenticated, logout, isOnline } = useAuth();
  const [pendingSalesCount, setPendingSalesCount] = useState(0);
  const { activeSession, isLoadingActiveSession, refreshActiveSession } = useCashRegister(); // ✅ Obtener refreshActiveSession

  // Función que verifica si se puede cerrar
  const checkBeforeClose = useCallback(async () => {
    console.log('🔵 checkBeforeClose ejecutado');

    const { data: refreshedData } = await refreshActiveSession();
    const currentSession = refreshedData?.session || null;

    console.log('🔵 currentSession después de refresh:', currentSession);

    if (currentSession) {
      console.log('⚠️ Mostrando Swal...');

      const result = await Swal.fire({
        title: '¿Cerrar aplicación?',
        html: `Tienes una <strong>sesión de caja abierta</strong>.<br/>¿Estás seguro de que deseas cerrar?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: theme.palette.error.main,
        cancelButtonColor: theme.palette.grey[500],
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '99999';
          }
        }
      });

      console.log('🔵 Resultado del Swal:', result); // Agregar este log

      if (!result.isConfirmed) {
        console.log('❌ Usuario canceló, retornando false');
        return false;
      }

      console.log('✅ Usuario confirmó, retornando true');
      return true;
    }

    console.log('✅ No hay sesión activa, retornando true');
    return true;
  }, [refreshActiveSession, theme.palette.error.main, theme.palette.grey, theme.palette.background.paper, theme.palette.text.primary]);

  const onCloseAttempt = useCallback(() => {
    console.log('Usuario intentó cerrar la ventana');
  }, []);

  usePreventClose(
    isAuthenticated ? checkBeforeClose : null,
    isAuthenticated ? onCloseAttempt : null
  );

  const { pendingSync = { pendingSales: 0 }, showSyncModal, setShowSyncModal } = useSyncManager();

  // Agregar este log
  useEffect(() => {
    console.log('📦 activeSession actual:', activeSession);
  }, [activeSession]);

  useEffect(() => {
    const updatePendingCount = async () => {
      const stats = await syncService.getSyncStats();
      setPendingSalesCount(stats.pendingSales);
    };

    if (isOnline && isAuthenticated) {
      console.log('Conectado y autenticado. Sincronizando datos maestros...');
      syncService.loadReferenceData(usuario.id);
      refreshActiveSession(); // <--- Add this line to refetch active session
    }

    updatePendingCount();

    const unsubscribe = syncService.onSyncStatusChange(updatePendingCount);
    return () => unsubscribe();
  }, [isOnline, isAuthenticated, usuario]);

  const handleSyncComplete = (result) => {
    setShowSyncModal(false);
  };

  const handleSyncClick = () => {
    if (activeSession) {
      setShowSyncModal(true);
    } else {
      Swal.fire({
        title: 'No hay sesión de caja activa',
        text: 'Para sincronizar las ventas pendientes, primero debe iniciar una sesión de caja.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir a Abrir Caja',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: theme.palette.primary.main,
        cancelButtonColor: theme.palette.grey[500],
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '99999';
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/cajero'); // Navega a la vista del cajero para abrir caja
        }
      });
    }
  };

  const appBarHeight = isDesktopUp ? 80 : 56;

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {console.log("[App.jsx] pendingSalesCount para AppBar:", pendingSalesCount)}
        <DenseAppBar isOnline={isOnline} pendingSalesCount={pendingSalesCount} onSyncClick={handleSyncClick} />
        <Box sx={{ height: appBarHeight }} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode='wait'>
            <Suspense fallback={<div>Cargando...</div>}>
              <Outlet location={useLocation()} key={useLocation().pathname} />
            </Suspense>
          </AnimatePresence>
        </Box>
      </Box>

      {showSyncModal && (
        <>
          {console.log("[App.jsx] Valor de pendingSync antes de pasar a SyncModal:", pendingSync)}
          <SyncModal
            open={showSyncModal}
            pendingSync={pendingSync || { pendingSales: 0 }}
            onSyncComplete={handleSyncComplete}
            activeSessionData={activeSession} // Pass the active session data
            isCheckingSession={isLoadingActiveSession} // Pass the loading state
          />
        </>
      )}
    </div>
  );
}

export default App;