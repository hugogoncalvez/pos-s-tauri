import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tabs, Tab, Box, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, useTheme
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { StyledButton } from './ui/StyledButton';
import { UseFetchQuery } from '../hooks/useQuery';
import { printReceipt } from '../functions/printUtils';
import SaleDetailsModalSkeleton from './skeletons/SaleDetailsModalSkeleton';
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
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const InfoItem = ({ label, value }) => {
    const theme = useTheme();
    return (
        <Grid xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight="500" sx={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                {value}
            </Typography>
        </Grid>
    );
}

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
const formatDate = (dateString) => moment(dateString).format('DD/MM/YYYY HH:mm:ss');

const SaleDetailsModal = ({ open, onClose, saleId }) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);

    const { data: saleDetails, isLoading, error } = UseFetchQuery(
        ['saleDetails', saleId],
        `/sales/${saleId}/details`,
        !!saleId && open // Only fetch when the modal is open and a saleId is provided
    );

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if (open) {
            setTabValue(0);
        }
    }, [open, saleId]);

    const renderContent = () => {
        if (isLoading) return <SaleDetailsModalSkeleton />;
        if (error) return <Typography color="error" sx={{ p: 3 }}>Error al cargar los detalles: {error.message}</Typography>;
        if (!saleDetails) return null;

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="sale details tabs"
                        variant="fullWidth"
                    >
                        <Tab label="General" />
                        <Tab label="Productos" />
                        <Tab label="Pagos" />
                    </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)' }}>
                        Información General
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <InfoItem label="Fecha y Hora" value={formatDate(saleDetails.createdAt)} />
                        <InfoItem label="Nº Venta" value={`#${saleDetails.id}`} />
                        <InfoItem label="Cliente" value={saleDetails.Customer?.name || 'Consumidor Final'} />
                        <InfoItem label="Cajero" value={saleDetails.usuario?.username || 'N/A'} />
                        <Grid xs={12}>
                             <Paper elevation={2} sx={{ p: 2, mt: 2, textAlign: 'center', background: theme.palette.background.default }}>
                                <Typography variant="h6" color="text.secondary" sx={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                                    Total de la Venta
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)' }}>
                                    {formatCurrency(saleDetails.total_neto)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)' }}>Productos Vendidos</Typography>
                    <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: '8px' }}>
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
                    <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)' }}>Detalle de Pagos</Typography>
                     <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: '8px' }}>
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
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                <Typography variant="h6" component="div" sx={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)' }}>
                    Detalles de la Venta #{saleId}
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                {renderContent()}
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog', borderTop: `1px solid ${theme.palette.divider}`, gap: 2 }}>
                <StyledButton onClick={() => printReceipt(saleDetails, 'sale', saleDetails.Customer?.name || 'Consumidor Final')} color="primary" variant="outlined" startIcon={<PrintIcon />} disabled={!saleDetails || isLoading}>
                    Imprimir
                </StyledButton>
                <StyledButton onClick={onClose} color="secondary" variant="contained">
                    Cerrar
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};

export default SaleDetailsModal;
