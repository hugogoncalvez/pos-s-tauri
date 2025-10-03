import { useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Typography, useMediaQuery, Tooltip, Button } from '@mui/material'; // Removed Badge, added Button
import SyncIcon from '@mui/icons-material/Sync'; // Added SyncIcon
import { useTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { AuthContext } from '../context/AuthContext';
import { ColorModeContext } from '../context/ThemeContextProvider';
import { usePermissions } from '../hooks/usePermissions';
import { useCashRegister } from '../hooks/useCashRegister';
import { exit } from '@tauri-apps/api/app';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CashMovementModal from '../styledComponents/CashMovementModal';

export default function DenseAppBar({ isOnline, pendingSalesCount, onSyncClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('desktop'));
  const { logout, usuario } = useContext(AuthContext);
  const { SetColorMode, mode } = useContext(ColorModeContext);
  const { tienePermiso } = usePermissions();
  const { activeSession, isLoadingActiveSession, createCashMovement, isSavingMovement, userName } = useCashRegister();
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);

  const handleOpenCashMovementModal = () => setIsCashMovementModalOpen(true);
  const handleCloseCashMovementModal = () => setIsCashMovementModalOpen(false);

  const handleExitApp = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed during app exit:", error);
    }
    await exit();
  };

  const handleLogout = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    logout();
  };

  const goHome = () => {
    navigate('/');
  };

  const goToCashManagement = () => {
    if (tienePermiso('ver_cajas_admin')) {
      navigate('/admin-cajas');
    }
    else {
      navigate('/mi-caja');
    }
  };

  return (
    <>
      <CssBaseline />

      <AppBar position="fixed" enableColorOnDark sx={{
        paddingY: 0,
        minHeight: isDesktopUp ? 80 : 56,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Toolbar variant="dense" sx={{
          justifyContent: 'space-between',
          paddingY: 0,
          marginY: 0,
          minHeight: isDesktopUp ? 80 : 56,
        }}>

          <Box component={'div'}>
            {location.pathname !== '/' && (
              <IconButton size='small' onClick={() => navigate(-1)} edge="start" color="inherit" aria-label="regresar">
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>

          <Box component={'div'} sx={{ display: 'flex', alignItems: 'center' }}>
            {usuario && (
               <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Tooltip title={isOnline ? 'Online' : 'Offline'}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: isOnline ? theme.palette.success.main : theme.palette.error.main,
                      border: `1px solid ${theme.palette.background.paper}`,
                      mr: 1
                    }}
                  />
                </Tooltip>
                <Typography variant="subtitle1" sx={{ display: 'inline-block' }}>
                  {usuario.nombre}
                </Typography>
              </Box>
            )}

            {pendingSalesCount > 0 && (
                            <Button
                              color="warning"
                              variant="contained"
                              size="small"
                              startIcon={<SyncIcon />}
                              onClick={onSyncClick}
                              disabled={!isOnline} // Deshabilitar si no hay conexión
                              sx={{
                                mr: 2,
                                color: 'white',
                                '&:hover': { color: 'warning.main' },
                                // Estilo para el estado deshabilitado
                                '&.Mui-disabled': {
                                  backgroundColor: theme.palette.grey[500],
                                  color: theme.palette.action.disabled,
                                },
                              }}
                            >
                              {isOnline ? `Sincronizar (${pendingSalesCount})` : `${pendingSalesCount} Ventas Pendientes`}
                            </Button>            )}

            <Tooltip title="Inicio">
              <IconButton
                size='small'
                onClick={goHome}
                edge="start"
                color="inherit"
                aria-label="inicio"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>

            {(tienePermiso('ver_vista_caja_admin') || tienePermiso('ver_mi_caja')) && (
              <Tooltip title={tienePermiso('ver_vista_caja_admin') ? "Administración de Cajas" : "Mi Caja"}>
                <IconButton
                  size='small'
                  onClick={goToCashManagement}
                  edge="start"
                  color="inherit"
                  aria-label="gestión de caja"
                >
                  <AccountBalanceWalletIcon />
                </IconButton>
              </Tooltip>
            )}
            {tienePermiso('accion_registrar_movimiento_caja') && activeSession && (
              <Tooltip title="Registrar Movimiento de Caja">
                <IconButton
                  size='small'
                  onClick={handleOpenCashMovementModal}
                  edge="start"
                  color="inherit"
                  aria-label="registrar movimiento de caja"
                >
                  <CurrencyExchangeIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}>
              <IconButton sx={{ ml: 1 }} onClick={SetColorMode.toggleColorMode} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {window.__TAURI__ && (
              <Tooltip title="Cerrar Aplicación">
                <IconButton onClick={handleExitApp} color="inherit">
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Cerrar Sesión">
              <IconButton size='small' onClick={handleLogout} edge="start" color="inherit" aria-label="cerrar sesión">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <CashMovementModal
        open={isCashMovementModalOpen}
        onClose={handleCloseCashMovementModal}
        onSave={createCashMovement}
        activeSessionId={activeSession?.id}
        userName={userName}
        isSaving={isSavingMovement}
        theme={theme} // Pass the theme prop
      />
    </>
  );
}
