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
  IconButton
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

export const SyncModal = ({ open, onSyncComplete, activeSessionData, isCheckingSession }) => {
  const theme = useTheme();
  const { login, isAuthenticated, usuario } = useContext(AuthContext);

  console.log('[SyncModal] activeSessionData prop:', activeSessionData);
  console.log('[SyncModal] isCheckingSession prop:', isCheckingSession);

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeCashSessionId, setActiveCashSessionId] = useState(null);
  const [pendingSalesCount, setPendingSalesCount] = useState(0);

  // Set pendingSalesCount from syncService
  useEffect(() => {
    const getPendingSales = async () => {
      if (open) {
        setError('');
        setIsSyncing(false);
        const stats = await syncService.getSyncStats();
        setPendingSalesCount(stats.pendingSales);
      }
    };
    getPendingSales();
  }, [open]);

  // Derive activeCashSessionId from props
  useEffect(() => {
    console.log('[SyncModal] useEffect - activeSessionData:', activeSessionData);
    if (activeSessionData && activeSessionData.session && activeSessionData.session.id) {
      setActiveCashSessionId(activeSessionData.session.id);
      console.log('[SyncModal] activeCashSessionId set to:', activeSessionData.session.id);
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

  const performSync = async () => {
    setIsSyncing(true);
    setError('');
    try {
      setSyncProgress({ current: 0, total: pendingSalesCount });

      const result = await syncService.syncPendingSalesWithSession(
        activeCashSessionId,
        (progress) => setSyncProgress(progress)
      );

      if (result.failed > 0) {
        mostrarError(`${result.failed} venta(s) no pudieron ser sincronizadas. Revise la consola.`, theme);
      }
      mostrarExito(`¡Sincronización completada! ${result.synced} venta(s) procesada(s).`, theme);

      await syncService.triggerSyncStatusUpdate();
      onSyncComplete(result);

    } catch (err) {
      setError('Ocurrió un error crítico durante la sincronización: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderContent = () => {
    console.log('[SyncModal - renderContent] isAuthenticated:', isAuthenticated);
    console.log('[SyncModal - renderContent] usuario (isOfflineUser):', usuario?.isOfflineUser);
    console.log('[SyncModal - renderContent] activeCashSessionId:', activeCashSessionId);
    console.log('[SyncModal - renderContent] isCheckingSession:', isCheckingSession);
    console.log('[SyncModal - renderContent] isSyncing:', isSyncing);
    console.log('[SyncModal - renderContent] pendingSalesCount:', pendingSalesCount);

    if (isCheckingSession) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Verificando sesión de caja...</Typography>
        </Box>
      );
    }

    if (isSyncing) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>Sincronizando datos...</Typography>
          <Typography variant="body2" color="text.secondary">
            {syncProgress.current} de {syncProgress.total} ventas procesadas
          </Typography>
        </Box>
      );
    }

    if (!isAuthenticated || (usuario && usuario.isOfflineUser)) {
      return (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Para sincronizar las <strong>{pendingSalesCount}</strong> ventas pendientes, por favor inicie sesión.
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

    if (isAuthenticated && activeCashSessionId) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>Listo para sincronizar.</Typography>
          <Typography variant="body2" color="text.secondary">
            Se sincronizarán <strong>{pendingSalesCount}</strong> venta(s) a la sesión de caja actual.
          </Typography>
        </Box>
      );
    }

    // This case should not be reached if App.jsx logic is correct, but it's a good fallback.
    if (isAuthenticated && !activeCashSessionId) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="error">No se ha encontrado una sesión de caja activa. Por favor, cierre este diálogo y abra una sesión de caja primero.</Alert>
        </Box>
      );
    }

    return null;
  };

  const renderActions = () => {
    const mainAction = () => {
      if (!isAuthenticated || (usuario && usuario.isOfflineUser)) {
        return (
          <StyledButton variant="contained" onClick={handleLogin} disabled={!credentials.username || !credentials.password}>
            Iniciar Sesión
          </StyledButton>
        );
      }
      if (isAuthenticated && activeCashSessionId) {
        return (
          <StyledButton
            variant="contained"
            onClick={performSync}
            disabled={isSyncing || pendingSalesCount === 0}
          >
            {isSyncing ? 'Sincronizando...' : 'Iniciar Sincronización'}
          </StyledButton>
        );
      }
      return null;
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%' }}>
        <StyledButton variant='outlined' onClick={onSyncComplete} disabled={isSyncing}>
          Cancelar
        </StyledButton>
        {mainAction()}
      </Box>
    );
  }

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
