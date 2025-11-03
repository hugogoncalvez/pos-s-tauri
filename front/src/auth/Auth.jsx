import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledButton as Button } from '../styledComponents/ui/StyledButton';
import { AuthContext } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Grid,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { mostrarError } from '../functions/MostrarError';
import { mostrarHTML } from '../functions/mostrarHTML';
import { useIsTauri } from '../hooks/useIsTauri';
import { ColorModeContext } from '../context/ThemeContextProvider';
import { exit } from '@tauri-apps/plugin-process'; // Importar exit
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const Auth = () => {
  const { isTauri } = useIsTauri();
  const { Theme: theme } = useContext(ColorModeContext);
  const { isOnline } = useOnlineStatus();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleExitApp = async () => {
    await exit(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      mostrarError('Por favor, ingrese su usuario y contraseña.', theme);
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password.trim());
    setIsLoading(false);

    if (result.success) {
      //console.log('[DEBUG] Login exitoso en Auth.jsx. Navegando a /.');
      setLoginSuccess(true);
      // navigate('/'); // Comentado temporalmente para depuración
    } else {
      mostrarError(result.error || 'Credenciales inválidas o error en el servidor.', theme);
    }
  };

  const Copyright = () => {
    const handleContactClick = () => {
      mostrarHTML({
        title: 'Contacto',
        html: `Teléfono: <a href="tel:+543764941490">3764-941490</a><br/>Correo: <a href="mailto:hugogoncalvez@gmail.com">hugogoncalvez@gmail.com</a>`
      }, theme);
    };

    return (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
        {'Copyright © '}
        <Link color="inherit" href="#" onClick={handleContactClick} sx={{ fontWeight: 500 }}>
          Hugo Goncalvez
        </Link>
        {' 2025'}
      </Typography>
    );
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };
  //console.log(theme.palette.mode);
  return (
    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        background: theme.palette.background.dialog,
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <motion.div
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.5 }}
      >
        <StyledCard
          sx={{
            position: 'relative',
            width: 'clamp(350px, 90vw, 480px)',
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            background: theme.palette.mode === 'dark'
              ? 'rgba(42, 48, 62, 0.6)' // Aumentamos transparencia
              : 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)', // Borde sutil
          }}
        >
          {isTauri && (
            <IconButton
              aria-label="Salir de la aplicación"
              onClick={handleExitApp}
              sx={{
                position: 'absolute',
                top: 'clamp(8px, 2vw, 16px)',
                right: 'clamp(8px, 2vw, 16px)',
                color: 'text.secondary',
                transition: 'transform 0.2s ease-in-out, color 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.2) rotate(15deg)',
                  color: 'error.main',
                }
              }}
            >
              <PowerSettingsNewIcon />
            </IconButton>
          )}
          <Box sx={{ mb: 3 }}>
            <img
              src='/logo.png'
              alt='POS System'
              style={{
                width: 'clamp(140px, 30vw, 200px)',
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' ? 'brightness(1.1)' : 'brightness(1)'
              }}
            />
          </Box>

          {!isOnline && (
            <Alert
              severity="info"
              sx={{
                width: '100%',
                mb: 3,
                borderRadius: 2
              }}
            >
              <strong>Modo Offline.</strong> Acceda con sus credenciales locales.
            </Alert>
          )}

          {loginSuccess ? (
            <Alert severity="success" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
              ¡Login Exitoso!
            </Alert>
          ) : (
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Usuario"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label='Contraseña'
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ position: 'relative', mt: 4 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6,
                    }
                  }}
                >
                  {isLoading ? 'Ingresando...' : 'Entrar'}
                </Button>
                {isLoading && (
                  <LinearProgress
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          <Copyright />
        </StyledCard>
      </motion.div>
    </Grid>
  );
}

export default Auth;
