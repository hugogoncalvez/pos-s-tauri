import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

export const StyledButton = styled(Button)(({ theme }) => ({
  // Este componente ahora hereda todos sus estilos base y de color del override global en el tema.
  // Aquí solo añadimos los estilos que son verdaderamente únicos de esta versión "Styled".
  fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
}));