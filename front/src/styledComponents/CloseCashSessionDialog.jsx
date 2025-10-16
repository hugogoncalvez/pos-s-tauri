import { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Divider, Grid, IconButton
} from '@mui/material';
import { StyledButton } from './ui/StyledButton';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { Api } from '../api/api'; // Ajusta la ruta según tu estructura
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion'; // Import mostrarConfirmacion

const CloseCashSessionDialog = ({
    open,
    onClose,
    selectedSession,
    handleInitiateClosure, // Nueva función para iniciar el cierre
    getUserName
}) => {
    const theme = useTheme();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cashierDeclaredAmount, setCashierDeclaredAmount] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open && selectedSession) {
            const fetchSummary = async () => {
                setLoading(true);
                setError('');
                setSummary(null);
                try {
                    const { data } = await Api.get(`/cash-sessions/${selectedSession.id}/summary-for-close`);
                    setSummary(data);
                } catch (err) {
                    setError(err.response?.data?.message || 'Error al cargar el resumen de la caja.');
                }
                setLoading(false);
            };
            fetchSummary();
        }
    }, [open, selectedSession]);

    const { expectedCash, cashSales, totalIncome, totalExpense } = useMemo(() => {
        if (!summary) return { expectedCash: 0, cashSales: 0, totalIncome: 0, totalExpense: 0 };
        const cashS = summary.sales_by_method['Efectivo'] || 0;
        const income = summary.totalIncome || 0;
        const expense = summary.totalExpense || 0;
        const expected = (summary.opening_amount || 0) + cashS + income - expense;
        return { expectedCash: expected, cashSales: cashS, totalIncome: income, totalExpense: expense };
    }, [summary]);

    const discrepancy = useMemo(() => {
        if (cashierDeclaredAmount === '' || isNaN(parseFloat(cashierDeclaredAmount))) return null;
        return parseFloat(cashierDeclaredAmount) - expectedCash;
    }, [cashierDeclaredAmount, expectedCash]);

    const handleConfirm = async () => {
        const result = await mostrarConfirmacion({
            title: '¿Estás seguro?',
            html: `Estás a punto de cerrar la sesión de caja de <strong>${getUserName(selectedSession)}</strong>.`,
            icon: 'warning',
            confirmButtonText: 'Sí, enviar para revisión',
            cancelButtonText: 'Cancelar',
        }, theme);

        if (result.isConfirmed) {
            // Pasamos todos los datos necesarios a la función del padre
            handleInitiateClosure(cashierDeclaredAmount, notes, () => {
                // Esta es la función de éxito, se ejecuta solo si la API responde OK
                setCashierDeclaredAmount('');
                setNotes('');
                setSummary(null);
            });
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const getDiscrepancyColor = (value) => {
        if (value === null || value === 0) return 'text.primary';
        return value > 0 ? 'success.main' : 'error.main';
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 'clamp(400px, 80vw, 600px)', margin: 'auto' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                <Box>
                    Arqueo y Cierre de Caja
                    {selectedSession && <Typography variant="caption" display="block">Usuario: {getUserName(selectedSession)}</Typography>}
                </Box>
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.default', p: { xs: 1, sm: 2 } }}>
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                {summary && (
                    <Box sx={{ mt: 2 }}>
                        {/* Sección 1: Resumen del Sistema */}
                        <Typography variant="h6" gutterBottom>Resumen del Sistema</Typography>
                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow><TableCell>Monto Inicial</TableCell><TableCell align="right">{formatCurrency(summary.opening_amount)}</TableCell></TableRow>
                                    <TableRow><TableCell>Ventas en Efectivo</TableCell><TableCell align="right">{formatCurrency(cashSales)}</TableCell></TableRow>
                                    <TableRow><TableCell>Total Ingresos</TableCell><TableCell align="right">{formatCurrency(totalIncome)}</TableCell></TableRow>
                                    <TableRow><TableCell>Total Egresos</TableCell><TableCell align="right">{formatCurrency(totalExpense)}</TableCell></TableRow>
                                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}><TableCell><b>Monto Esperado en Caja</b></TableCell><TableCell align="right"><b>{formatCurrency(expectedCash)}</b></TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Sección 2: Desglose de Pagos */}
                        <Typography variant="h6" gutterBottom>Desglose de Pagos Registrados</Typography>
                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableBody>
                                    {Object.entries(summary.sales_by_method).map(([method, amount]) => (
                                        <TableRow key={method}><TableCell>{method}</TableCell><TableCell align="right">{formatCurrency(amount)}</TableCell></TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}><TableCell><b>Total de Ventas</b></TableCell><TableCell align="right"><b>{formatCurrency(summary.total_sales)}</b></TableCell></TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider sx={{ my: 2 }} />

                        {/* Sección 3 y 4: Conteo y Resultado */}
                        <Grid container spacing={2} alignItems="center" justifyContent="center">
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Dinero Contado en Caja"
                                    type="number"
                                    value={cashierDeclaredAmount}
                                    onChange={(e) => setCashierDeclaredAmount(e.target.value)}
                                    required
                                    autoFocus
                                    InputProps={{ sx: { fontSize: '1.2rem' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body1">Diferencia (Sobrante/Faltante)</Typography>
                                    <Typography variant="h5" sx={{ color: getDiscrepancyColor(discrepancy), fontWeight: 'bold' }}>
                                        {discrepancy !== null ? formatCurrency(discrepancy) : '-'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Sección 5: Notas */}
                        <TextField
                            fullWidth
                            label="Notas (opcional)"
                            multiline
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observaciones sobre el cierre..."
                            sx={{ mt: 3 }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
                <StyledButton color='secondary' onClick={onClose} variant="outlined" sx={{ padding: '2px 12px' }}>Cancelar</StyledButton>
                <StyledButton
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={loading || !summary || cashierDeclaredAmount === ''}
                >
                    Enviar para Revisión
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};

export default CloseCashSessionDialog;