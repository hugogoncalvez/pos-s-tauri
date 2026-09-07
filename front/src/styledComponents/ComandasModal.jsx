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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
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

const parseComandaRow = (row) => {
  if (!row) return {};
  const root = row.data ? row.data : row;
  const nested = root.data ? root.data : null;
  const effective = nested && typeof nested === 'object' && (nested.comanda_data || nested.name) ? nested : root;

  let comandaData = effective.comanda_data || {};
  if (typeof comandaData === 'string') {
    try { comandaData = JSON.parse(comandaData); } catch (e) { comandaData = {}; }
  }

  const name = effective.name || comandaData.name || comandaData.nombre || 'Comanda Sin Nombre';
  const status = effective.status || row.status || comandaData.status || 'pendiente';
  const items = comandaData.items || comandaData.productos || comandaData.tempTable || effective.items || [];
  const usuarioObj = effective.usuario || effective.usuarios || effective.Usuario || effective.Usuarios || effective.user || null;
  const userName = usuarioObj?.nombre || usuarioObj?.name || usuarioObj?.username || comandaData.user_name || comandaData.usuario?.nombre || 'N/A';
  const createdAt = effective.createdAt || comandaData.createdAt;

  const serverId = row.server_id ?? effective.id ?? row.id ?? null;

  return {
    id: serverId ?? row.local_id ?? null,
    name,
    status,
    items,
    userName,
    createdAt,
    raw: root,
    comandaData
  };
};

const ComandasModal = ({
  showComandas,
  setShowComandas,
  comandas = [],
  handleLoadComanda,
  handlePrintComanda,
  handleStatusChange,
  handleDeleteComanda,
  handleAddToComanda,
  hasCartItems = false,
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
                  const { name: comandaName, status: currentStatus, items: itemsList, userName, createdAt } = parseComandaRow(row);

                  return (
                    <StyledTableRow key={row.local_id ?? row.server_id ?? row.data?.id ?? row.id ?? Math.random()} hover>
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
                            {itemsList.length > 0
                              ? itemsList.map(item => `${item.quantity || item.cantidad || 1}x ${item.name || item.nombre || item.stock?.name || 'Producto'}`).join(', ')
                              : 'Sin ítems'}
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

                          {handleAddToComanda && (
                            <Tooltip title={hasCartItems ? "Agregar ítems del carrito a esta comanda (impresión opcional)" : "Agrega productos al carrito para sumarlos a esta comanda"}>
                              <span>
                                <IconButton
                                  color="warning"
                                  size="small"
                                  disabled={!hasCartItems}
                                  onClick={() => handleAddToComanda(row)}
                                >
                                  <PlaylistAddIcon />
                                </IconButton>
                              </span>
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
