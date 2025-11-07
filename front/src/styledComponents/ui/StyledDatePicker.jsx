import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Para la v5, es más sencillo y directo usar styled() sobre el componente.
export const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  // Estilos para el contenedor del input, replicando StyledTextField
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    transition: 'border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',

    // Estilo del borde
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.grey[400],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused': {
      boxShadow: 'none',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },

  // Estilos para el label, replicando StyledTextField
  '& .MuiInputLabel-root': {
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    '&.Mui-focused': {
      fontWeight: 'bold',
    },
  },
}));