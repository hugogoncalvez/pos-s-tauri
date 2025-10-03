import { useState, useMemo, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Grid, Paper, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const FinalizeClosureDialog = ({ open, onClose, sessionData, handleFinalizeClosure }) => {
    const theme = useTheme();
    const [adminVerifiedAmount, setAdminVerifiedAmount] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        if (open) {
            setAdminVerifiedAmount('');
            setAdminNotes('');
        }
    }, [open]);

    const { expectedCash, cashSales, totalIncome, totalExpense } = useMemo(() => {
        if (!sessionData) return { expectedCash: 0, cashSales: 0, totalIncome: 0, totalExpense: 0 };
        const cashSalesAmount = sessionData.payment_methods?.Efectivo || 0;
        const openingAmount = parseFloat(sessionData.opening_amount || 0);
        const income = parseFloat(sessionData.totalIncome || 0);
        const expense = parseFloat(sessionData.totalExpense || 0);
        const expected = openingAmount + cashSalesAmount + income - expense;
        return { expectedCash: expected, cashSales: cashSalesAmount, totalIncome: income, totalExpense: expense };
    }, [sessionData]);

    const finalDiscrepancy = useMemo(() => {
        if (adminVerifiedAmount === '' || isNaN(parseFloat(adminVerifiedAmount))) return null;
        return parseFloat(adminVerifiedAmount) - expectedCash;
    }, [adminVerifiedAmount, expectedCash]);

    const handleConfirm = () => {
        handleFinalizeClosure(sessionData.id, adminVerifiedAmount, adminNotes);
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

    const getDiscrepancyColor = (value) => {
        if (value === null || value === 0) return 'text.primary';
        return value > 0 ? 'success.main' : 'error.main';
    };

    if (!sessionData) return null;

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { width: 'clamp(700px, 90vw, 1000px)', margin: 'auto' } }}>
            <DialogTitle sx={{ textAlign: 'center', bgcolor: 'secondary.dark', color: theme.palette.primary.contrastText }}>
                Revisar y Finalizar Cierre de Caja
                <Typography variant="caption" display="block">Usuario a revisar: {sessionData.usuario?.username}</Typography>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'background.default', p: { xs: 1, sm: 2 } }}>
                <Grid container spacing={3} sx={{ mt: 1, justifyContent: 'center' }}>
                    {/* Columna Izquierda: Declaración del Cajero */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom align="center">Declaración del Cajero</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <InfoRow label="Monto Inicial:" value={formatCurrency(sessionData.opening_amount)} />
                                <InfoRow label="Ventas en Efectivo (Sistema):" value={formatCurrency(cashSales)} />
                                <InfoRow label="Ingresos de Caja:" value={formatCurrency(totalIncome)} />
                                <InfoRow label="Egresos de Caja:" value={formatCurrency(totalExpense)} />
                                <Divider sx={{ my: 1 }} />
                                <InfoRow label="Monto Esperado (Sistema):" value={formatCurrency(expectedCash)} boldValue />
                                <InfoRow label="Monto Declarado por Cajero:" value={formatCurrency(sessionData.cashier_declared_amount)} boldValue />
                                <InfoRow label="Diferencia Preliminar:" value={formatCurrency(sessionData.preliminary_discrepancy)} color={getDiscrepancyColor(sessionData.preliminary_discrepancy)} boldValue />
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Notas del Cajero:</Typography>
                            <Typography variant="body2" sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 1, flexGrow: 1 }}>{sessionData.notes || 'Sin notas.'}</Typography>
                        </Paper>
                    </Grid>

                    {/* Columna Derecha: Verificación del Administrador */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom align="center">Verificación del Administrador</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Monto Verificado en Caja"
                                    type="number"
                                    value={adminVerifiedAmount}
                                    onChange={(e) => setAdminVerifiedAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2">Diferencia Final</Typography>
                                    <Typography variant="h6" sx={{ color: getDiscrepancyColor(finalDiscrepancy), fontWeight: 'bold' }}>
                                        {finalDiscrepancy !== null ? formatCurrency(finalDiscrepancy) : '-'}
                                    </Typography>
                                </Paper>
                                <TextField
                                    fullWidth
                                    label="Notas del Administrador (opcional)"
                                    multiline
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
                <Button onClick={onClose} sx={{ padding: '2px 12px' }} variant="outlined">Cancelar</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="secondary"
                    disabled={adminVerifiedAmount === ''}
                >
                    Confirmar y Cerrar Definitivamente
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const InfoRow = ({ label, value, color = 'text.primary', boldValue = false }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body1">{label}</Typography>
        <Typography variant="h6" sx={{ color, fontWeight: boldValue ? 'bold' : 'normal' }}>{value}</Typography>
    </Box>
);

export default FinalizeClosureDialog;