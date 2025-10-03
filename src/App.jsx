import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useContext, useState, useEffect, Suspense } from 'react';
import { AuthContext, useAuth } from './context/AuthContext'; // Import useAuth
// import { useOnlineStatus } from './hooks/useOnlineStatus'; // Remove direct import
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';

const App = () => {
  const navigate = useNavigate(); // Initialize navigate
  const { usuario, isAuthenticated, logout, isOnline } = useAuth(); // Get isOnline from AuthContext
  const [pendingSalesCount, setPendingSalesCount] = useState(0);

  // Hook para gestionar el modal de sincronización
  const { pendingSync = { pendingSales: 0 }, showSyncModal, setShowSyncModal } = useSyncManager();

  // Efecto para sincronizar datos maestros y actualizar contadores
  useEffect(() => {
    const updatePendingCount = async () => {
      const stats = await syncService.getSyncStats();
      setPendingSalesCount(stats.pendingSales);
    };

    // Sincronizar datos maestros si estamos online y autenticados
    if (isOnline && isAuthenticated) {
      console.log('Conectado y autenticado. Sincronizando datos maestros...');
      syncService.loadReferenceData(usuario.id);
    }

    // Actualizar siempre el contador de pendientes
    updatePendingCount();

    // Suscribirse a cambios para actualizar la UI en tiempo real
    const unsubscribe = syncService.onSyncStatusChange(updatePendingCount);
    return () => unsubscribe();

  }, [isOnline, isAuthenticated, usuario]);

  // El useEffect para la lógica de sincronización automática ha sido eliminado para estabilizar la app.

  const handleSyncComplete = (result) => {
    setShowSyncModal(false);
    // Navegar a la ruta de ventas después de la sincronización
    navigate('/ventas'); // Navigate to the sales route
  };

  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('desktop'));
  const appBarHeight = isDesktopUp ? 80 : 56;

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {console.log("[App.jsx] pendingSalesCount para AppBar:", pendingSalesCount)}
        <DenseAppBar isOnline={isOnline} pendingSalesCount={pendingSalesCount} onSyncClick={() => setShowSyncModal(true)} />
        <Box sx={{ height: appBarHeight }} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode='wait'>
            <Suspense fallback={<div>Cargando...</div>}>
              <Outlet location={useLocation()} key={useLocation().pathname} />
            </Suspense>
          </AnimatePresence>
        </Box>
      </Box>

      {/* El modal de sincronización se renderiza aquí */}
      {showSyncModal && (
        <>
          {console.log("[App.jsx] Valor de pendingSync antes de pasar a SyncModal:", pendingSync)}
          <SyncModal
            open={showSyncModal}
            pendingSync={pendingSync || { pendingSales: 0 }}
            onSyncComplete={handleSyncComplete}
          />
        </>
      )}
    </div>
  );
}

export default App;

