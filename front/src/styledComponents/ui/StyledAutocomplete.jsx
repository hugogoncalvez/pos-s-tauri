import { styled } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField'; // Autocomplete necesita un TextField para renderizar el input

export const StyledAutocomplete = styled((props) => {
  const { renderInput, ...otherProps } = props; // Extraer renderInput si se pasa directamente
  return (
    <Autocomplete
      {...otherProps} // Pasar todas las demás props directamente al Autocomplete
      renderInput={(params) => {
        // Si se proporciona un renderInput personalizado, usarlo
        if (renderInput) {
          return renderInput(params);
        }
        // Si no, usar el TextField por defecto con los estilos y props base
        return (
          <TextField
            {...params}
            variant={props.variant || 'outlined'}
            fullWidth={props.fullWidth !== undefined ? props.fullWidth : true}
            // Aquí se pueden añadir más props por defecto al TextField interno si es necesario
          />
        );
      }}
    />
  );
})(({ theme }) => ({
  // Estilos para el contenedor del Autocomplete
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
