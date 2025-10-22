import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';

export const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== 'titleFontSize',
})(({ theme, maxWidth, titleFontSize }) => ({
  // Estilos para el Paper del Dialog
  '& .MuiDialog-paper': {
    borderRadius: '12px', // Bordes más redondeados para el diálogo
    padding: 'clamp(16px, 3vw, 24px)', // Padding responsivo
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Sombra más pronunciada
    backgroundColor: theme.palette.background.dialog || theme.palette.background.paper, // Fondo del tema
    // Ancho máximo responsivo
    ...(!maxWidth && {
      maxWidth: 'clamp(300px, 80vw, 600px)', // Aplicar solo si no hay prop maxWidth
    }),
  },
  // Estilos para el título del Dialog
  '& .MuiDialogTitle-root': {
    fontSize: titleFontSize || 'clamp(1.2rem, 2.5vw, 1.5rem)', // Fuente responsiva para el título
    //fontWeight: 'bold',
    color: theme.palette.text.titlePrimary,
    paddingBottom: 'clamp(8px, 1.5vw, 12px)',
  },
  // Estilos para el contenido del Dialog
  '& .MuiDialogContent-root': {
    fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', // Fuente responsiva para el contenido
    color: theme.palette.text.primary,
    paddingTop: 'clamp(8px, 1.5vw, 12px)',
    paddingBottom: 'clamp(8px, 1.5vw, 12px)',
  },
  // Estilos para las acciones del Dialog
  '& .MuiDialogActions-root': {
    paddingTop: 'clamp(12px, 2vw, 16px)',
    paddingBottom: 'clamp(8px, 1.5vw, 12px)',
    paddingLeft: 'clamp(16px, 3vw, 24px)',
    paddingRight: 'clamp(16px, 3vw, 24px)',
    justifyContent: 'flex-end', // Alinea los botones a la derecha
  },
}));
