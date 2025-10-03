import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledButton as Button } from '../styledComponents/ui/StyledButton';
import { AuthContext } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OFFLINE_USER } from '../db/offlineDB';
import { motion } from 'framer-motion';
import {
  Alert,
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { mostrarError } from '../functions/MostrarError';
import { mostrarHTML } from '../functions/mostrarHTML';
import { useTheme } from '@mui/material/styles';
import { exit } from '@tauri-apps/api/app';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Tooltip } from '@mui/material';

const Auth = () => {
  const theme = useTheme();
  const { isOnline } = useOnlineStatus();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExitApp = async () => {
    await exit();
  };

  // const handleQuickOfflineLogin = () => {
  //   setUsername(OFFLINE_USER.username);
  //   setPassword(OFFLINE_USER.password);
  // };

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
      navigate('/');
    } else {
      mostrarError(result.error || 'Credenciales inválidas o error en el servidor.', theme);
    }
  };

  const Copyright = () => {
    const handleContactClick = () => {
      mostrarHTML({ title: 'Contacto', html: `Teléfono: <a href="tel:+543764941490">3764-941490</a><br/>Correo: <a href="mailto:hugogoncalvez@gmail.com">hugogoncalvez@gmail.com</a>` }, theme);
    };
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {'Copyright © '}<Link color="inherit" href="#" onClick={handleContactClick}>Hugo Goncalvez</Link>{' '}2025{'.'}
      </Typography>
    );
  };

  const variants = { hidden: { opacity: 0, y: 50 }, enter: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 } };

  return (
    <Grid container component="main" sx={{ height: '100vh', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      {window.__TAURI__ && (
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Tooltip title="Cerrar Aplicación">
            <IconButton onClick={handleExitApp} color="primary">
              <ExitToAppIcon sx={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <motion.div initial="hidden" animate="enter" exit="exit" variants={variants} transition={{ duration: 0.5 }}>
        <Paper elevation={6} sx={{ width: 'clamp(350px, 80vw, 450px)', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src='/logo.png' alt='Logo' style={{ width: 'clamp(120px, 25vw, 180px)', objectFit: 'contain', mb: 2 }} />

          {!isOnline && (
            <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
              <strong>Modo Offline Activado.</strong> Puede acceder con sus credenciales locales.
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal" required fullWidth id="username" label="Nombre de Usuario" name="username"
              autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal" required fullWidth name="password" label='Contraseña' type={showPassword ? 'text' : 'password'}
              id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" disabled={isLoading}>Entrar</Button>
              {isLoading && <LinearProgress sx={{ position: 'absolute', bottom: -4, width: '100%' }} />}
            </Box>


            <Copyright />
          </Box>
        </Paper>
      </motion.div>
    </Grid>
  );
}

export default Auth;
