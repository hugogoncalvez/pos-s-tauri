import { Outlet } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { useCashRegister } from './hooks/useCashRegister';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';
import { initializeOfflineUser } from './db/offlineDB';

function App() {
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { user, isAuthenticated, isOnline } = useAuth();

  const {
    pendingSync,
    showSyncModal,
    handleSyncClick,
    handleSyncComplete,
  } = useSyncManager();

  const pendingSalesCount = pendingSync.pendingSales;

  const { activeSession, isLoadingActiveSession } = useCashRegister();

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
