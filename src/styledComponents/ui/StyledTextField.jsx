import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export const StyledTextField = styled(({
  variant = 'outlined',
  fullWidth = true,
  ...other
}) => (
  <TextField
    variant={variant}
    fullWidth={fullWidth}
    {...other}
  />
))(({ theme }) => ({
  // Estilos para el contenedor del input
  '& .MuiInputBase-root': {
    borderRadius: '8px', // Bordes redondeados
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', // Fuente responsiva
    transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',

    // Estilo del borde
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.grey[400], // Color de borde sutil
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light, // Resaltar al pasar el mouse
    },
    // Quitar el box-shadow de foco por defecto de Chrome
    '&.Mui-focused': {
      boxShadow: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main, // Color primario para el foco
      borderWidth: '2px',
    },
  },

  // Estilos para el label
  '& .MuiInputLabel-root': {
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    '&.Mui-focused': {
      fontWeight: 'bold', // Hacer el label más notorio en foco
    },
  },
}));