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

  console.log('[SyncModal] activeSessionData prop:', activeSessionData);
  console.log('[SyncModal] isCheckingSession prop:', isCheckingSession);
  console.log('[SyncModal] pendingSync prop:', pendingSync);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncType, setSyncType] = useState(null); // 'sales' or 'movements'
  const [activeCashSessionId, setActiveCashSessionId] = useState(null);
  const pendingSalesCount = pendingSync?.pendingSales || 0;
  const pendingCashMovementsCount = pendingSync?.pendingCashMovements || 0;
  const pendingTicketsCount = pendingSync?.pendingTickets || 0; // NEW
  const queryClient = useQueryClient(); // NEW

  // Derive activeCashSessionId from props
  useEffect(() => {
    console.log('[SyncModal] useEffect - activeSessionData:', activeSessionData);
    if (activeSessionData && activeSessionData.id) {
      setActiveCashSessionId(activeSessionData.id);
      console.log('[SyncModal] activeCashSessionId set to:', activeSessionData.id);
    } else {
      setActiveCashSessionId(null);
      console.log('[SyncModal] activeCashSessionId set to null.');
    }
  }, [activeSessionData]);

  console.log('[SyncModal] Render - activeCashSessionId state:', activeCashSessionId);

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

  const performSalesSync = async () => {
    setIsSyncing(true);
    setSyncType('sales');
    setError('');
    try {
      // Cargar datos de referencia frescos antes de sincronizar
      await syncService.loadReferenceData(usuario.id);

      setSyncProgress({ current: 0, total: pendingSalesCount });

      const result = await syncService.syncPendingSalesWithSession(
        activeCashSessionId,
        usuario.id,
        (progress) => setSyncProgress(progress)
      );

      if (result.failed > 0) {
        mostrarError(`${result.failed} venta(s) no pudieron ser sincronizadas. Revise la consola.`, theme);
      }
      mostrarExito(`¡Sincronización de ventas completada! ${result.synced} venta(s) procesada(s).`, theme);

    } catch (err) {
      setError('Ocurrió un error crítico durante la sincronización de ventas: ' + err.message);
    } finally {
      setIsSyncing(false);
      setSyncType(null);
      onSyncComplete(); // Close modal after sync
    }
  };

  const performMovementsSync = async () => {
    setIsSyncing(true);
    setSyncType('movements');
    setError('');
    try {
      setSyncProgress({ current: 0, total: pendingCashMovementsCount });

      const result = await syncService.syncPendingCashMovements(
        usuario.id,
        (progress) => setSyncProgress(progress)
      );

      if (result.failed > 0) {
        mostrarError(`${result.failed} movimiento(s) no pudieron ser sincronizados.`, theme);
      }
      mostrarExito(`¡Sincronización de movimientos completada! ${result.synced} movimiento(s) procesado(s).`, theme);

    } catch (err) {
      setError('Ocurrió un error crítico durante la sincronización de movimientos: ' + err.message);
    } finally {
      setIsSyncing(false);
      setSyncType(null);
      onSyncComplete(); // Close modal after sync
    }
  };

  const performTicketsSync = async () => {
    setIsSyncing(true);
    setSyncType('tickets');
    setError('');
    try {
      setSyncProgress({ current: 0, total: pendingTicketsCount });

      const result = await syncService.syncPendingTickets(
        usuario.id,
        (progress) => setSyncProgress(progress)
      );

      if (result.failed > 0) {
        mostrarError(`${result.failed} ticket(s) pendiente(s) no pudieron ser sincronizados.`, theme);
      }
      mostrarExito(`¡Sincronización de tickets pendientes completada! ${result.synced} ticket(s) procesado(s).`, theme);

    } catch (err) {
      setError('Ocurrió un error crítico durante la sincronización de tickets pendientes: ' + err.message);
    } finally {
      setIsSyncing(false);
      setSyncType(null);
      onSyncComplete(); // Close modal after sync
      queryClient.invalidateQueries({ queryKey: ['pendingTickets'], exact: false }); // NEW: Invalidate pendingTickets query
    }
  };

  const renderContent = () => {
    console.log('[SyncModal - renderContent] isAuthenticated:', isAuthenticated);
    console.log('[SyncModal - renderContent] usuario (isOfflineUser):', usuario?.isOfflineUser);
    console.log('[SyncModal - renderContent] activeCashSessionId:', activeCashSessionId);
    console.log('[SyncModal - renderContent] isCheckingSession:', isCheckingSession);
    console.log('[SyncModal - renderContent] isSyncing:', isSyncing);
    console.log('[SyncModal - renderContent] pendingSalesCount:', pendingSalesCount);
    console.log('[SyncModal - renderContent] pendingCashMovementsCount:', pendingCashMovementsCount);
    console.log('[SyncModal - renderContent] pendingTicketsCount:', pendingTicketsCount);


    if (isCheckingSession) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Verificando sesión de caja...</Typography>
        </Box>
      );
    }

    if (isSyncing) {
      const syncItem = syncType === 'sales' ? 'venta(s)' : syncType === 'movements' ? 'movimiento(s)' : 'ticket(s) pendiente(s)';
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Sincronizando {syncItem}...</Typography>
          <Typography variant="body2" color="text.secondary">
            {syncProgress.current} de {syncProgress.total} {syncItem} procesados
          </Typography>
        </Box>
      );
    }

    if (!isAuthenticated || (usuario && usuario.isOfflineUser)) {
      const totalPending = pendingSalesCount + pendingCashMovementsCount + pendingTicketsCount;
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

    if (isAuthenticated && !activeCashSessionId) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error">No se ha encontrado una sesión de caja activa. Por favor, cierre este diálogo y abra una sesión de caja primero.</Alert>
            </Box>
        );
    }

    if (isAuthenticated && activeCashSessionId) {
      return (
        <Box sx={{ width: '100%' }}>
          {pendingSalesCount > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography><strong>{pendingSalesCount}</strong> venta(s) pendiente(s).</Typography>
              <StyledButton onClick={performSalesSync} disabled={isSyncing}>Sincronizar Ventas</StyledButton>
            </Paper>
          )}
          {pendingCashMovementsCount > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography><strong>{pendingCashMovementsCount}</strong> movimiento(s) de caja pendiente(s).</Typography>
              <StyledButton onClick={performMovementsSync} disabled={isSyncing}>Sincronizar Movimientos</StyledButton>
            </Paper>
          )}
          {pendingTicketsCount > 0 && (
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography><strong>{pendingTicketsCount}</strong> ticket(s) pendiente(s).</Typography>
              <StyledButton onClick={performTicketsSync} disabled={isSyncing}>Sincronizar Tickets</StyledButton>
            </Paper>
          )}
          {(pendingSalesCount === 0 && pendingCashMovementsCount === 0 && pendingTicketsCount === 0) && (
            <Typography sx={{ textAlign: 'center', py: 4 }}>No hay operaciones pendientes para sincronizar.</Typography>
          )}
        </Box>
      );
    }

    return null;
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
