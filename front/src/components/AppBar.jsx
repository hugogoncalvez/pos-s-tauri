import { useContext, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Typography, useMediaQuery, Tooltip, Button, Popper, Paper, MenuList, MenuItem, ClickAwayListener, Grow } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { AuthContext } from '../context/AuthContext';
import { ColorModeContext } from '../context/ThemeContextProvider';
import { usePermissions } from '../hooks/usePermissions';
import { useCashRegister } from '../hooks/useCashRegister';
import { useIsTauri } from '../hooks/useIsTauri';
import CashMovementModal from '../styledComponents/CashMovementModal';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';

export default function DenseAppBar({ isOnline, pendingSyncCount, onSyncClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktopUp = useMediaQuery(theme.breakpoints.up('desktop'));
  const { logout, logoutAndExit, usuario } = useContext(AuthContext);
  const { SetColorMode, mode } = useContext(ColorModeContext);
  const { tienePermiso } = usePermissions();
  const { isTauri } = useIsTauri();
  const { activeSession, createCashMovement, isSavingMovement, userName } = useCashRegister();

  const [openPopper, setOpenPopper] = useState(false);
  const anchorRef = useRef(null);
  const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);

  const handleToggle = () => {
    setOpenPopper((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpenPopper(false);
  };

  const handleLogout = async (event) => {
    handleClose(event);
    if (activeSession && tienePermiso('accion_cerrar_caja_propia')) {
      const result = await mostrarConfirmacion(
        {
          title: '¡Sesión de Caja Activa!',
          text: 'Hay una sesión de caja abierta. ¿Estás seguro de que quieres cerrar la sesión?',
          icon: 'warning',
          confirmButtonText: 'Sí, cerrar sesión',
          cancelButtonText: 'No, cancelar',
        },
        theme
      );
      if (result.isConfirmed) {
        logout();
      }
    } else {
      logout();
    }
  };

  const handleLogoutAndExit = async (event) => {
    handleClose(event);
    //console.log(`[AppBar] handleLogoutAndExit: Valor de activeSession: ${JSON.stringify(activeSession)}`);
    if (activeSession && tienePermiso('accion_cerrar_caja_propia')) {
      const result = await mostrarConfirmacion(
        {
          title: '¡Sesión de Caja Activa!',
          text: 'Hay una sesión de caja abierta. ¿Estás seguro de que quieres cerrar la aplicación? Se cerrará tu sesión actual.',
          icon: 'warning',
          confirmButtonText: 'Sí, cerrar y salir',
          cancelButtonText: 'No, cancelar',
        },
        theme
      );
      if (result.isConfirmed) {
        logoutAndExit();
      }
    } else {
      logoutAndExit();
    }
  };

  const handleOpenCashMovementModal = () => setIsCashMovementModalOpen(true);
  const handleCloseCashMovementModal = () => setIsCashMovementModalOpen(false);

  const goHome = () => {
    navigate('/');
  };

  const goToCashManagement = () => {
    if (tienePermiso('ver_cajas_admin')) {
      navigate('/admin-cajas');
    } else {
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

            {pendingSyncCount > 0 && (
              <Button
                color="warning"
                variant="contained"
                size="small"
                startIcon={<SyncIcon />}
                onClick={onSyncClick}
                disabled={!isOnline}
                sx={{
                  mr: 2,
                  color: 'white',
                  '&:hover': { color: 'warning.main' },
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.grey[500],
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {isOnline ? `Sincronizar (${pendingSyncCount})` : `${pendingSyncCount} Pendientes`}
              </Button>)}

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

            {isTauri && (
              <div>
                <Tooltip title="Opciones">
                  <IconButton
                    ref={anchorRef}
                    size="large"
                    aria-controls={openPopper ? 'menu-appbar' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
                    color="inherit"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
                <Popper
                  sx={{ zIndex: 1500 }}
                  open={openPopper}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  placement="bottom-end"
                  transition
                  disablePortal
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin: placement === 'bottom-end' ? 'center top' : 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            autoFocusItem={openPopper}
                            id="menu-appbar"
                          >
                            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                            <MenuItem onClick={handleLogoutAndExit}>Cerrar Sesión y Salir</MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </div>
            )}
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
        theme={theme}
      />
    </>
  );
}
