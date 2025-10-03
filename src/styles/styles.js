import { styled, alpha } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    // Estilos comunes para head y body para máxima consistencia y responsividad
    // fontSize: 'clamp(0.75rem, 1.1vw, 0.85rem)', // Tamaño de fuente fluido y compacto
    padding: 'clamp(8px, 1.5vw, 14px)',      // Padding adaptable
    border: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',                       // Evita que el texto salte a la siguiente línea
    overflow: 'hidden',                         // Oculta el texto que se desborda
    textOverflow: 'ellipsis',                  // Muestra '...' en el texto desbordado
    maxWidth: '220px',                          // Límite de ancho para celdas (ajustable)
    // El ancho real se adaptará, pero no superará este valor

    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.background.tableHeader,
        color: theme.palette.text.primary,
        fontWeight: 'bold', // Distinguir el encabezado
        fontSize: 'clamp(0.8rem, 1.3vw, 1.2rem)', // Specific font size for header
    },
    [`&.${tableCellClasses.body}`]: {
        // color: theme.palette.text.primary, // Removed to allow color to be inherited from TableRow
        fontSize: 'clamp(0.7rem, 1.1vw, 1rem)', // Specific font size for body
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:nth-of-type(even)': {
        backgroundColor: theme.palette.background.paper,
    },
    // Sobrescribir el hover para que sea más notorio y consistente
    '&.MuiTableRow-hover:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
}));

const Agendastyle = (theme) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: theme.breakpoints.up('tablet') ? 400 : 300,
    bgcolor: theme.palette.background.paper,
    border: '1px solid ' + theme.palette.divider,
    boxShadow: 24,
    p: 4,
});

const ModalStyle = (theme) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'clamp(300px, 70vw, 800px)',
    bgcolor: theme.palette.background.paper,
    boxShadow: `1px 1px 5px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`,
    padding: theme.spacing(4),
});

export { StyledTableCell, StyledTableRow, Agendastyle, ModalStyle };