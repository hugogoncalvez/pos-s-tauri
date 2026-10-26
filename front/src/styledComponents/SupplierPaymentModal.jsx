import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
    Grid,
    Typography,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentsIcon from '@mui/icons-material/Payments';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { useCashRegister } from '../hooks/useCashRegister';
import { useTheme } from '@mui/material/styles';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { manualPaymentMethods } from '../functions/manualPaymentMethods';

export const SupplierPaymentModal = ({ open, onClose, supplier, purchase, onSaved }) => {
    const theme = useTheme();
    const { activeSession } = useCashRegister();
    const isPurchasePayment = Boolean(purchase?.id);
    const targetBalance = Number(
        (isPurchasePayment ? purchase?.balance : supplier?.balance) || 0
    );
    const [formData, handleInputChange, , , setFormData] = useForm({
        amount: '',
        payment_method: 'efectivo',
        notes: '',
        affect_cash: true
    });
    const { mutateAsync, isPending } = useSubmit('registerSupplierPayment');

    useEffect(() => {
        if (!activeSession) {
            setFormData(prev => prev.affect_cash ? { ...prev, affect_cash: false } : prev);
        }
    }, [activeSession, setFormData]);

    useEffect(() => {
        if (!open) return;
        const suggested = Number(
            (purchase?.id ? purchase?.balance : supplier?.balance) || 0
        );
        setFormData({
            amount: suggested > 0 ? suggested.toFixed(2) : '',
            payment_method: 'efectivo',
            notes: '',
            affect_cash: true
        });
    }, [open, supplier?.id, supplier?.balance, purchase?.id, purchase?.balance, setFormData]);

    const handleSubmit = async () => {
        const amount = Number(formData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            mostrarError('El importe debe ser mayor a cero.', theme);
            return;
        }

        if (amount - targetBalance > 0.01) {
            mostrarError(
                isPurchasePayment
                    ? 'El importe no puede superar el saldo de la factura.'
                    : 'El importe no puede superar el saldo del proveedor.',
                theme
            );
            return;
        }

        try {
            const saved = await mutateAsync({
                url: `/suppliers/${supplier.id}/payments`,
                values: {
                    amount,
                    payment_method: formData.payment_method,
                    notes: formData.notes,
                    purchase_id: isPurchasePayment ? purchase.id : null,
                    cash_session_id: formData.payment_method === 'efectivo' && formData.affect_cash
                        ? activeSession?.id || null
                        : null
                },
                showSuccessAlert: false
            });
            mostrarExito('Pago registrado correctamente.', theme);
            onSaved?.(saved);
            onClose?.();
        } catch {
            return;
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                {isPurchasePayment ? 'Pagar factura' : 'Registrar pago'}
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: 'background.paper', pt: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>{supplier?.nombre}</Typography>
                    {isPurchasePayment ? (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Factura: {purchase.factura || `#${purchase.id}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Saldo factura: ${targetBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Saldo actual: ${targetBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    )}
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextFieldWithClear
                            autoFocus
                            name="amount"
                            label="Importe *"
                            type="number"
                            fullWidth
                            value={String(formData.amount ?? '')}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'amount', value: '' } })}
                            inputProps={{ min: 0, step: '0.01' }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextFieldWithClear
                            select
                            name="payment_method"
                            label="Medio de pago"
                            fullWidth
                            value={formData.payment_method}
                            onChange={handleInputChange}
                        >
                            {manualPaymentMethods.map((method) => (
                                <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>
                            ))}
                        </TextFieldWithClear>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldWithClear
                            name="notes"
                            label="Notas"
                            fullWidth
                            multiline
                            minRows={2}
                            value={formData.notes}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'notes', value: '' } })}
                        />
                    </Grid>
                    {formData.payment_method === 'efectivo' && (
                        <Grid item xs={12}>
                            {activeSession ? (
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            checked={Boolean(formData.affect_cash)}
                                            onChange={(event) => handleInputChange({ target: { name: 'affect_cash', value: event.target.checked } })}
                                        />
                                    )}
                                    label={`Registrar egreso en la caja abierta (${activeSession.name || `Sesión #${activeSession.id}`})`}
                                />
                            ) : (
                                <Alert severity="info">
                                    No hay una caja abierta. El pago se registrará sin movimiento de caja.
                                </Alert>
                            )}
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={onClose} variant="outlined" sx={{ padding: '2px 12px' }}>
                    Cancelar
                </StyledButton>
                <StyledButton
                    onClick={handleSubmit}
                    disabled={isPending || !formData.amount || Number(formData.amount) <= 0 || targetBalance <= 0.01}
                    variant="contained"
                    startIcon={isPending ? <CircularProgress size={20} /> : <PaymentsIcon />}
                >
                    {isPending ? 'Registrando...' : (isPurchasePayment ? 'Pagar factura' : 'Registrar pago')}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

SupplierPaymentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    supplier: PropTypes.object,
    purchase: PropTypes.object,
    onSaved: PropTypes.func
};
