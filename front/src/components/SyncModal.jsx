import { useState, useContext, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Sync as SyncIcon, Close as CloseIcon } from '@mui/icons-material';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { AuthContext } from '../context/AuthContext';
import { syncService } from '../services/syncService';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { useQueryClient } from '@tanstack/react-query'; // NEW

export const SyncModal = ({ open, onSyncComplete, activeSessionData, isCheckingSession, pendingSync }) => {
  const theme = useTheme();
  const { login, isAuthenticated, usuario } = useContext(AuthContext);

  //console.log('[SyncModal] activeSessionData prop:', activeSessionData);
  //console.log('[SyncModal] isCheckingSession prop:', isCheckingSession);
  //console.log('[SyncModal] pendingSync prop:', pendingSync);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncType, setSyncType] = useState(null); // 'sales' or 'movements'
  const [activeCashSessionId, setActiveCashSessionId] = useState(null);
  const pendingSalesCount = pendingSync?.pendingSales || 0;
  const pendingCashMovementsCount = pendingSync?.pendingCashMovements || 0;
  const pendingTicketsCount = pendingSync?.pendingTickets || 0; // NEW
  const pendingSessionsCount = pendingSync?.pendingSessions || 0; // <-- NUEVO
  const queryClient = useQueryClient(); // NEW

  // Derive activeCashSessionId from props
  useEffect(() => {
    //console.log('[SyncModal] useEffect - activeSessionData:', activeSessionData);
    if (activeSessionData && activeSessionData.id) {
      setActiveCashSessionId(activeSessionData.id);
      //console.log('[SyncModal] activeCashSessionId set to:', activeSessionData.id);
    } else {
      setActiveCashSessionId(null);
      //console.log('[SyncModal] activeCashSessionId set to null.');
    }
  }, [activeSessionData]);

  //console.log('[SyncModal] Render - activeCashSessionId state:', activeCashSessionId);

  const handleLogin = async () => {
    setError('');
    try {
      const { success, error: loginError } = await login(credentials.username, credentials.password);
      if (!success) {
        setError(loginError || 'Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } catch (err) {
      setError('Error de conexión al intentar iniciar sesión.');
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setError('');

    try {
      let sessionId = activeCashSessionId;

      // 1. Sincronizar la sesión si está pendiente
      if (pendingSessionsCount > 0) {
        setSyncType('session');
        const syncResult = await syncService.syncPendingCashSession(usuario.id);
        sessionId = syncResult.session.id;
        // No need to refetch query here, as we get the ID directly.
        // The main query will be refetched at the end.
      }

      if (!sessionId) {
        throw new Error('No se pudo obtener un ID de sesión de caja activa para la sincronización.');
      }

      // Cargar datos de referencia frescos antes de sincronizar el resto
      await syncService.loadReferenceData(usuario.id);

      // 2. Sincronizar Ventas
      if (pendingSalesCount > 0) {
        setSyncType('sales');
        setSyncProgress({ current: 0, total: pendingSalesCount });
        await syncService.syncPendingSalesWithSession(sessionId, usuario.id, (p) => setSyncProgress(p));
      }

      // 3. Sincronizar Movimientos de Caja
      if (pendingCashMovementsCount > 0) {
        setSyncType('movements');
        setSyncProgress({ current: 0, total: pendingCashMovementsCount });
        await syncService.syncPendingCashMovements(usuario.id, (p) => setSyncProgress(p));
      }

      // 4. Sincronizar Tickets Pendientes
      if (pendingTicketsCount > 0) {
        setSyncType('tickets');
        setSyncProgress({ current: 0, total: pendingTicketsCount });
        await syncService.syncPendingTickets(usuario.id, (p) => setSyncProgress(p));
      }

      mostrarExito('¡Sincronización completa!', theme);
      onSyncComplete(); // This will trigger the final refetches and close the modal

    } catch (err) {
      setError('Ocurrió un error crítico durante la sincronización: ' + err.message);
      setIsSyncing(false); // Stop syncing on error
      setSyncType(null);
    }
  };

  const renderContent = () => {
    if (isCheckingSession) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Verificando sesión de caja...</Typography>
        </Box>
      );
    }

    if (isSyncing) {
      const syncItem = syncType === 'session' ? 'sesión de caja' : syncType === 'sales' ? 'venta(s)' : syncType === 'movements' ? 'movimiento(s)' : 'ticket(s) pendiente(s)';
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Sincronizando {syncItem}...</Typography>
          {syncType !== 'session' && (
            <Typography variant="body2" color="text.secondary">
              {syncProgress.current} de {syncProgress.total} {syncItem} procesados
            </Typography>
          )}
        </Box>
      );
    }

    const totalPending = pendingSalesCount + pendingCashMovementsCount + pendingTicketsCount + pendingSessionsCount;

    if (!isAuthenticated || (usuario && usuario.isOfflineUser)) {
      return (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Para sincronizar las <strong>{totalPending}</strong> operaciones pendientes, por favor inicie sesión.
          </Alert>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
              <StyledTextField
                label="Usuario"
                fullWidth
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                label="Contraseña"
                type="password"
                fullWidth
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </Grid>
          </Grid>
        </Box>
      );
    }

    if (totalPending === 0) {
      return <Typography sx={{ textAlign: 'center', py: 4 }}>No hay operaciones pendientes para sincronizar.</Typography>;
    }

    return (
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ mb: 2 }}>Se encontraron los siguientes elementos pendientes:</Typography>
        {pendingSessionsCount > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${theme.palette.warning.main}` }}>
            <Typography><strong>{pendingSessionsCount}</strong> apertura de caja local.</Typography>
          </Paper>
        )}
        {pendingSalesCount > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography><strong>{pendingSalesCount}</strong> venta(s).</Typography>
          </Paper>
        )}
        {pendingCashMovementsCount > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography><strong>{pendingCashMovementsCount}</strong> movimiento(s) de caja.</Typography>
          </Paper>
        )}
        {pendingTicketsCount > 0 && (
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography><strong>{pendingTicketsCount}</strong> ticket(s) pendiente(s).</Typography>
          </Paper>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <StyledButton onClick={handleSyncAll} disabled={isSyncing} variant="contained" size="large">
            Sincronizar Todo
          </StyledButton>
        </Box>
      </Box>
    );
  };

  const renderActions = () => {
    if (!isAuthenticated || (usuario && usuario.isOfflineUser)) {
      return (
        <StyledButton variant="contained" onClick={handleLogin} disabled={!credentials.username || !credentials.password}>
          Iniciar Sesión
        </StyledButton>
      );
    }
    return null; // Primary actions are now in the content
  };

  return (
    <StyledDialog open={open} maxWidth="xs" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SyncIcon sx={{ color: 'primary.main' }} />
          Sincronización de Datos
        </Box>
        <IconButton onClick={onSyncComplete} sx={{ color: 'error.main' }} disabled={isSyncing}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.dialog', p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog', borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        {renderActions()}
      </DialogActions>
    </StyledDialog>
  );
};
