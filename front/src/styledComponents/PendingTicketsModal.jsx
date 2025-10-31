import moment from 'moment';
import {
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Tooltip,
  useTheme,
  Box
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileUploadIcon from '@mui/icons-material/FileUpload'; // Icono para la acción de cargar
import { StyledTableCell, StyledTableRow } from '../styles/styles';
import { StyledDialog } from './ui/StyledDialog';

const PendingTicketsModal = ({
  showPendingTickets,
  setShowPendingTickets,
  pendingTickets,
  handleLoadPendingTicket,
  handleDeletePendingTicket,
  allowLoading = true,
}) => {
  const theme = useTheme();

  const columns = [
    { id: 'name', label: 'Nombre', align: 'left' },
    { id: 'customer', label: 'Cliente', align: 'center' },
    { id: 'totalFinal', label: 'Total', align: 'center' },
    { id: 'user', label: 'Creado por', align: 'center' },
    { id: 'date', label: 'Fecha', align: 'center' },
    { id: 'actions', label: 'Acciones', align: 'center' },
  ];

  return (
    <StyledDialog
      open={showPendingTickets}
      onClose={() => setShowPendingTickets(false)}
      aria-labelledby="pending-tickets-dialog-title"
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle 
        id="pending-tickets-dialog-title" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'background.dialog', // Fondo oscuro
          color: 'text.primary',
          position: 'relative' // Contenedor para el botón
        }}
      >
        <ReceiptIcon sx={{ mr: 1, color: 'info.main' }} />
        Tickets Pendientes ({pendingTickets.length})
        <IconButton
          aria-label="close"
          onClick={() => setShowPendingTickets(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <ClearIcon color="error" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: 'background.paper' }}>
        {pendingTickets.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            px: 4,
            textAlign: 'center'
          }}>
            <Box sx={{
              width: 'clamp(60px, 15vw, 80px)',
              height: 'clamp(60px, 15vw, 80px)',
              borderRadius: '50%',
              bgcolor: 'info.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <ReceiptIcon sx={{ fontSize: 'clamp(30px, 8vw, 40px)', color: 'info.main' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No hay tickets pendientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Guarda una venta como pendiente para verla aquí.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="pending tickets table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <StyledTableCell key={column.id} align={column.align}>
                      {column.label}
                    </StyledTableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingTickets.map((row) => (
                  <Tooltip key={row.local_id} title={allowLoading ? "Hacer clic para cargar este ticket" : ""} placement="top" arrow>
                    <StyledTableRow
                      hover
                      onClick={() => allowLoading && handleLoadPendingTicket(row)}
                      sx={{ cursor: allowLoading ? 'pointer' : 'default' }}
                    >
                      <StyledTableCell component="th" scope="row">{row.data.name}</StyledTableCell>
                      <StyledTableCell align="center">
                        {row.data?.ticket_data?.customer?.name || row.data?.customer?.name || 'Consumidor Final'}
                      </StyledTableCell>
                                            <StyledTableCell align="center">
                                              ${(row.data?.ticket_data?.totalFinal || row.data?.total_neto)?.toFixed(2)}
                                            </StyledTableCell>
                      <StyledTableCell align="center">{row.data?.ticket_data?.usuario?.nombre || row.data?.user?.name || 'N/A'}</StyledTableCell>
                                            <StyledTableCell align="center">
                                              {moment(row.data.createdAt || row.data.ticket_data.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                          {allowLoading && (
                            <FileUploadIcon color="action" />
                          )}
                          <Tooltip title="Eliminar Ticket">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation(); // Previene que el clic se propague a la fila
                                handleDeletePendingTicket(row.local_id);
                              }}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  </Tooltip>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default PendingTicketsModal;