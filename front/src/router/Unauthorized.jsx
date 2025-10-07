import { Box, Typography, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import GppBadIcon from '@mui/icons-material/GppBad';

const Unauthorized = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 3
      }}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: '500px' }}>
        <GppBadIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No tienes los permisos necesarios para acceder a esta página.
        </Typography>
        <StyledButton
          variant="contained"
          component={Link}
          to="/"
        >
          Volver al Inicio
        </StyledButton>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
