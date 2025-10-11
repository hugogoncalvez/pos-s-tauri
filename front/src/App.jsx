import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import { syncService } from './services/syncService';
import { useSyncManager } from './hooks/useSyncManager';
import { useCashRegister } from './hooks/useCashRegister';
import Swal from 'sweetalert2';
import { SyncModal } from './components/SyncModal';
import DenseAppBar from './components/AppBar';
import { usePreventClose } from './hooks/usePreventClose';
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

  usePreventClose(isOnline, pendingSalesCount > 0);

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
            <Suspense fallback={<div>Loading...</div>}>
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
