import { useState } from 'react'; // Added useState
import {
    Box,
    Grid,
    Typography,
    Divider,
    Alert,
    Chip,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    useTheme
} from '@mui/material';
import { StyledCard } from './ui/StyledCard';
import { StyledTextField } from './ui/StyledTextField';
import {
    Close as CloseIcon,
    Assessment as AssessmentIcon,
    KeyboardArrowDown // Added KeyboardArrowDown icon
} from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../styles/styles';
import moment from 'moment';
import PropTypes from 'prop-types';

const CashSessionDetails = ({
    activeSession,
    sessionSummary,
    formatCurrency,
    showClosingForm,
    closingAmount,
    setClosingAmount,
    notes,
    setNotes,
    error,
}) => {
    const theme = useTheme();
    const [openSalesSection, setOpenSalesSection] = useState(true); // New state for sales section visibility

    const handleToggleSalesSection = () => {
        setOpenSalesSection(!openSalesSection);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: theme.spacing(3) }}>
                <AssessmentIcon sx={{ mr: theme.spacing(1), color: 'success.main' }} />
                Sesión de Caja Activa
            </Typography>

            <Grid container spacing={theme.spacing(3)} justifyContent="center">
                {/* Información de la sesión */}
                <Grid item xs={12} sm={6} sx={{ width: 'clamp(280px, 45vw, 400px)' }}>
                    <StyledCard sx={{ bgcolor: 'background.paper' }}>
                        {/* CardContent is not imported, assuming it's a component or needs to be replaced with a Box */}
                        <Box sx={{ p: theme.spacing(2) }}> {/* Replaced CardContent with Box */}
                            <Typography variant="h6" color="primary.main" gutterBottom>
                                💰 Información de Caja
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(1) }}>
                                <Typography>Monto Inicial:</Typography>
                                <Typography fontWeight="bold">
                                    {formatCurrency(activeSession?.opening_amount)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(1) }}>
                                <Typography>Apertura:</Typography>
                                <Typography>
                                    {moment(activeSession?.opened_at).format('DD/MM/YYYY HH:mm')}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Estado:</Typography>
                                <Chip
                                    label="ABIERTA"
                                    color="success"
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Resumen de ventas */}
                <Grid item xs={12} sm={6} sx={{ width: 'clamp(280px, 45vw, 400px)' }}>
                    <StyledCard sx={{ bgcolor: 'background.paper' }}>
                        {/* CardContent is not imported, assuming it's a component or needs to be replaced with a Box */}
                        <Box sx={{ p: theme.spacing(2) }}> {/* Replaced CardContent with Box */}
                            <Typography variant="h6" color="primary.main" gutterBottom>
                                📊 Resumen de Ventas
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(1) }}>
                                <Typography>Ventas Realizadas:</Typography>
                                <Typography fontWeight="bold">
                                    {sessionSummary?.sales_count || 0}
                                </Typography>
                            </Box>
                            {sessionSummary?.payment_method_totals && Object.keys(sessionSummary.payment_method_totals).map(method => (
                                <Box key={method} sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(0.5), ml: theme.spacing(2) }}>
                                    <Typography variant="body2">{method}:</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatCurrency(sessionSummary.payment_method_totals[method])}
                                    </Typography>
                                </Box>
                            ))}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(1) }}>
                                <Typography>Total Vendido:</Typography>
                                <Typography fontWeight="bold" color="success.main">
                                    {formatCurrency(sessionSummary?.total_sales)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>Descuentos:</Typography>
                                <Typography fontWeight="bold" color="error.main">
                                    {formatCurrency(sessionSummary?.total_discounts)}
                                </Typography>
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Lista de ventas */}
                {sessionSummary?.sales && sessionSummary.sales.length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: theme.spacing(2) }}>
                            <Typography variant="h6" gutterBottom >
                                📋 Ventas de la Sesión
                            </Typography>
                            <IconButton disableRipple size="small" onClick={handleToggleSalesSection} sx={{ p: 0 }}>
                                <KeyboardArrowDown sx={{ transition: '0.5s', transform: openSalesSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                            </IconButton>
                        </Box>
                        <Box sx={{ height: openSalesSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                            <StyledCard variant="outlined" sx={{ p: 0 }}>
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>Hora</StyledTableCell>
                                                <StyledTableCell>Cliente</StyledTableCell>
                                                <StyledTableCell>Método de Pago</StyledTableCell>
                                                <StyledTableCell align="right">Total</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sessionSummary.sales.map((sale) => (
                                                <StyledTableRow key={sale.id}>
                                                    <StyledTableCell>
                                                        {moment(sale.createdAt).format('HH:mm')}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {sale.customer?.name || 'N/A'}
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        {sale.sale_payments && sale.sale_payments.length > 0
                                                            ? sale.sale_payments.map(sp =>
                                                                `${sp.payment?.method} (${formatCurrency(sp.amount)})`
                                                            ).filter(Boolean).join(', ')
                                                            : 'N/A'}
                                                    </StyledTableCell>
                                                    <StyledTableCell align="right">
                                                        {formatCurrency(sale.total_neto)}
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </StyledCard>
                        </Box>
                    </Grid>
                )}

                {/* Formulario de cierre */}
                {showClosingForm && (
                    <Grid item xs={12}>
                        <Divider sx={{ my: theme.spacing(2) }} />
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <CloseIcon sx={{ mr: theme.spacing(1), color: 'error.main' }} />
                            Cierre de Caja
                        </Typography>

                        <Grid container spacing={theme.spacing(2)}>
                            <Grid item xs={12} sm={6}>
                                <StyledTextField
                                    fullWidth
                                    label="Monto Final en Caja"
                                    type="number"
                                    value={closingAmount}
                                    onChange={(e) => setClosingAmount(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => setClosingAmount('')} size="small">
                                                    <ClearIcon color="error" />
                                                </IconButton>
                                                <Typography sx={{ mr: 1 }}>$</Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    fullWidth
                                    label="Observaciones (opcional)"
                                    multiline
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ingrese cualquier observación sobre el cierre de caja..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => setNotes('')} size="small">
                                                    <ClearIcon color="error" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mt: theme.spacing(2) }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

CashSessionDetails.propTypes = {
    activeSession: PropTypes.object,
    sessionSummary: PropTypes.object,
    formatCurrency: PropTypes.func.isRequired,
    showClosingForm: PropTypes.bool.isRequired,
    closingAmount: PropTypes.string.isRequired,
    setClosingAmount: PropTypes.func.isRequired,
    notes: PropTypes.string.isRequired,
    setNotes: PropTypes.func.isRequired,
    error: PropTypes.string.isRequired,
    handleCloseSession: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    setShowClosingForm: PropTypes.func.isRequired,
};

export default CashSessionDetails;
