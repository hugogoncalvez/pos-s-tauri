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
import { initializeOfflineUser } from './db/offlineDB';
  const appBarHeight = isDesktopUp ? 80 : 56;

  return (
    <div className="App">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {console.log("[App.jsx] pendingSalesCount para AppBar:", pendingSalesCount)}
        <DenseAppBar isOnline={isOnline} pendingSalesCount={pendingSalesCount} onSyncClick={handleSyncClick} />
        <Box sx={{ height: appBarHeight }} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode='wait'>
            <Suspense >
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
            activeSessionData={activeSession}
            isCheckingSession={isLoadingActiveSession}
          />
        </>
      )}
    </div>
  );
}

export default App;