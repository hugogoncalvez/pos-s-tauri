import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tabs, Tab, Box, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { StyledButton } from './ui/StyledButton';
import { UseFetchQuery } from '../hooks/useQuery';
import { printSaleReceipt } from '../functions/printSaleReceipt';
import moment from 'moment';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`sale-details-tabpanel-${index}`}
            aria-labelledby={`sale-details-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
const formatDate = (dateString) => moment(dateString).format('DD/MM/YYYY HH:mm:ss');

const SaleDetailsModal = ({ open, onClose, saleId }) => {
    const [tabValue, setTabValue] = useState(0);

    const { data: saleDetails, isLoading, error } = UseFetchQuery(
        ['saleDetails', saleId],
        `/sales/${saleId}/details`,
        !!saleId && open // Only fetch when the modal is open and a saleId is provided
    );

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Reset tab value when modal is closed or saleId changes
    useEffect(() => {
        if (open) {
            setTabValue(0);
        }
    }, [open, saleId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Detalles de la Venta #{saleId}
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading && <Typography>Cargando detalles...</Typography>}
                {error && <Typography color="error">Error al cargar los detalles: {error.message}</Typography>}
                {saleDetails && (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="sale details tabs">
                                <Tab label="General" />
                                <Tab label="Productos" />
                                <Tab label="Pagos" />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0}>
                            <Typography variant="h6">Información General</Typography>
                            <Typography><strong>Fecha:</strong> {formatDate(saleDetails.createdAt)}</Typography>
                            <Typography><strong>Cliente:</strong> {saleDetails.Customer?.name || 'Consumidor Final'}</Typography>
                            <Typography><strong>Cajero:</strong> {saleDetails.usuario?.username || 'N/A'}</Typography>
                            <Typography><strong>Total Venta:</strong> {formatCurrency(saleDetails.total_neto)}</Typography>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h6">Productos Vendidos</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Producto</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Precio Unit.</TableCell>
                                            <TableCell align="right">Subtotal</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {saleDetails.sale_details?.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.stock?.name || item.combo?.name || 'Producto Manual'}</TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.quantity * item.price)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h6">Detalle de Pagos</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Método de Pago</TableCell>
                                            <TableCell align="right">Monto</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {saleDetails.sale_payments?.map((payment) => (
                                            <TableRow key={payment.payment.method}>
                                                <TableCell>{payment.payment.method}</TableCell>
                                                <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={() => printSaleReceipt(saleDetails)} color="primary" startIcon={<PrintIcon />} disabled={!saleDetails || isLoading}>
                    Imprimir
                </StyledButton>
                <StyledButton onClick={onClose} color="secondary">
                    Cerrar
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};

export default SaleDetailsModal;
