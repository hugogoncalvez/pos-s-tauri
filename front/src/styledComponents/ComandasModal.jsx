import React from 'react';
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
  Box,
  Chip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StyledTableCell, StyledTableRow } from '../styles/styles';
import { StyledDialog } from './ui/StyledDialog';

const getStatusChip = (status) => {
  switch (status) {
    case 'pendiente':
      return <Chip label="Pendiente" color="warning" size="small" variant="filled" />;
    case 'en_preparacion':
      return <Chip label="En Preparación" color="info" size="small" variant="filled" />;
    case 'entregado':
      return <Chip label="Entregado" color="success" size="small" variant="filled" />;
    default:
      return <Chip label={status || 'Pendiente'} color="default" size="small" />;
  }
};

const ComandasModal = ({
  showComandas,
  setShowComandas,
  comandas = [],
  handleLoadComanda,
  handlePrintComanda,
  handleStatusChange,
  handleDeleteComanda,
  allowLoading = true,
}) => {
  const theme = useTheme();

  const columns = [
    { id: 'name', label: 'Mesa / Pedido', align: 'left' },
    { id: 'status', label: 'Estado', align: 'center' },
    { id: 'items', label: 'Ítems', align: 'left' },
    { id: 'user', label: 'Mozo / Cajero', align: 'center' },
    { id: 'date', label: 'Hora', align: 'center' },
    { id: 'actions', label: 'Acciones', align: 'center' },
  ];

  return (
    <StyledDialog
      open={showComandas}
      onClose={() => setShowComandas(false)}
      aria-labelledby="comandas-dialog-title"
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        id="comandas-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'background.dialog',
          color: 'text.primary',
          position: 'relative'
        }}
      >
        <SoupKitchenIcon sx={{ mr: 1, color: 'warning.main' }} />
        Comandas Activas ({comandas.length})
        <IconButton
          aria-label="close"
          onClick={() => setShowComandas(false)}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <ClearIcon color="error" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: 'background.paper' }}>
        {comandas.length === 0 ? (
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
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <SoupKitchenIcon sx={{ fontSize: 'clamp(30px, 8vw, 40px)', color: 'warning.main' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" mb={1}>
              No hay comandas activas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Genera una comanda desde la pantalla de ventas para verla aquí.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="comandas table">
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
                {comandas.map((row) => {
                  const comandaData = row.data?.comanda_data || row.data || {};
                  const itemsList = comandaData.items || comandaData.productos || comandaData.tempTable || [];
                  const comandaName = row.data?.name || comandaData.name || 'Comanda Sin Nombre';
                  const currentStatus = row.status || row.data?.status || 'pendiente';
                  const userName = row.data?.usuario?.nombre || row.data?.user?.name || comandaData.user_name || 'N/A';
                  const createdAt = row.data?.createdAt || comandaData.createdAt;

                  return (
                    <StyledTableRow key={row.local_id || row.data?.id || Math.random()} hover>
                      <StyledTableCell component="th" scope="row">
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comandaName}
                        </Typography>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {getStatusChip(currentStatus)}
                      </StyledTableCell>

                      <StyledTableCell align="left">
                        <Box sx={{ maxWidth: '300px' }}>
                          <Typography variant="body2" color="text.primary">
                            {itemsList.map(item => `${item.quantity || item.cantidad}x ${item.name || item.nombre}`).join(', ')}
                          </Typography>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {userName}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {createdAt ? moment(createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                          {allowLoading && (
                            <Tooltip title="Cargar a Venta para Cobrar">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleLoadComanda(row)}
                              >
                                <FileUploadIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Imprimir Comanda (Hasar 80mm)">
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() => handlePrintComanda(row)}
                            >
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>

                          {currentStatus !== 'entregado' && (
                            <Tooltip title="Marcar como Entregado">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleStatusChange(row, 'entregado')}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Eliminar / Anular Comanda">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteComanda(row)}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default ComandasModal;
