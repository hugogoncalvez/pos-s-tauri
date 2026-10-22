import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    Divider,
    Grid,
    MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCardIcon from '@mui/icons-material/AddCard';
import EditNoteIcon from '@mui/icons-material/EditNote';
import BlockIcon from '@mui/icons-material/Block';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { SupplierPaymentModal } from './SupplierPaymentModal';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';
import { confirmAction } from '../functions/ConfirmDelete';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
    if (!value) return '-';
    const date = String(value).length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-AR');
};

const conditionColor = (condition) => {
    if (condition === 'contado') return 'success';
    if (condition === 'cheque') return 'warning';
    return 'info';
};

export const SupplierAccountModal = ({ open, onClose, supplier, onChanged }) => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const [openPayment, setOpenPayment] = useState(false);
    const [conditionPurchase, setConditionPurchase] = useState(null);
    const [conditionForm, setConditionForm] = useState({ condition: 'cuenta corriente', reason: '' });
    const { mutateAsync, isPending } = useSubmit('supplierAccountAction');

    const { data, isLoading, refetch } = UseFetchQuery(
        ['supplierAccount', supplier?.id],
        `/suppliers/${supplier?.id}/account`,
        Boolean(open && supplier?.id),
        0
    );

    const currentSupplier = data?.supplier || supplier;
    const summary = data?.summary || {};
    const purchases = data?.purchases || [];
    const payments = data?.payments || [];

    const refresh = async () => {
        await refetch();
        onChanged?.();
    };

    const handleClose = () => {
        setOpenPayment(false);
        setConditionPurchase(null);
        onClose();
    };

    const handleOpenCondition = (purchase) => {
        setConditionPurchase(purchase);
        setConditionForm({
            condition: purchase.payment_condition || 'cuenta corriente',
            reason: ''
        });
    };

    const handleSaveCondition = async () => {
        if (!conditionForm.reason.trim()) {
            mostrarError('El motivo de la corrección es obligatorio.', theme);
            return;
        }
        try {
            await mutateAsync({
                url: `/purchases/${conditionPurchase.id}/condition`,
                method: 'put',
                values: conditionForm,
                showSuccessAlert: false
            });
            mostrarExito('Condición de compra actualizada.', theme);
            setConditionPurchase(null);
            await refresh();
        } catch {
            return;
        }
    };

    const handleVoidPayment = (payment) => {
        confirmAction(async () => {
            try {
                await mutateAsync({
                    url: `/suppliers/${currentSupplier.id}/payments/${payment.id}`,
                    method: 'delete',
                    values: { reason: 'Anulación manual desde cuenta corriente' },
                    showSuccessAlert: false
                });
                mostrarExito('Pago anulado correctamente.', theme);
                await refresh();
            } catch {
                return;
            }
        }, () => {}, '¿Anular este pago?', theme);
    };

    return (
        <>
            <StyledDialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    <Box>
                        <Typography variant="h6">Cuenta corriente</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {currentSupplier?.nombre || 'Proveedor'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose}><CloseIcon color="error" /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'background.paper', pt: 3 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Deuda inicial</Typography>
                                    <Typography variant="h6">{formatCurrency(summary.initial_debt)}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Total compras</Typography>
                                    <Typography variant="h6">{formatCurrency(summary.purchases_total)}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Total pagos</Typography>
                                    <Typography variant="h6">{formatCurrency(summary.payments_total)}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Saldo</Typography>
                                    <Typography variant="h6" color={Number(summary.balance) > 0 ? 'error.main' : 'success.main'}>
                                        {formatCurrency(summary.balance)}
                                    </Typography>
                                </Paper>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Compras</Typography>
                                {tienePermiso('accion_registrar_pago_proveedor') && (
                                    <StyledButton
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddCardIcon />}
                                        onClick={() => setOpenPayment(true)}
                                        disabled={Number(summary.balance) <= 0}
                                    >
                                        Registrar pago
                                    </StyledButton>
                                )}
                            </Box>
                            <TableContainer component={Paper} sx={{ mb: 3 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Fecha</TableCell>
                                            <TableCell align="center">Factura</TableCell>
                                            <TableCell align="center">Condición</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            <TableCell align="right">Pagado</TableCell>
                                            <TableCell align="right">Saldo</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {purchases.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">Sin compras registradas.</TableCell>
                                            </TableRow>
                                        ) : purchases.map((purchase) => (
                                            <TableRow key={purchase.id} hover>
                                                <TableCell align="center">{formatDate(purchase.createdAt)}</TableCell>
                                                <TableCell align="center">{purchase.factura || '-'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip size="small" label={purchase.payment_condition || 'cuenta corriente'} color={conditionColor(purchase.payment_condition)} />
                                                </TableCell>
                                                <TableCell align="right">{formatCurrency(purchase.cost)}</TableCell>
                                                <TableCell align="right">{formatCurrency(purchase.paid)}</TableCell>
                                                <TableCell align="right" sx={{ color: Number(purchase.balance) > 0 ? 'error.main' : 'success.main' }}>
                                                    {formatCurrency(purchase.balance)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tienePermiso('accion_corregir_condicion_compra') && (
                                                        <Tooltip title="Corregir condición">
                                                            <IconButton size="small" onClick={() => handleOpenCondition(purchase)}>
                                                                <EditNoteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>Pagos</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Fecha</TableCell>
                                            <TableCell align="center">Medio</TableCell>
                                            <TableCell align="center">Compra</TableCell>
                                            <TableCell align="right">Importe</TableCell>
                                            <TableCell align="center">Estado</TableCell>
                                            <TableCell align="center">Notas</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">Sin pagos registrados.</TableCell>
                                            </TableRow>
                                        ) : payments.map((payment) => (
                                            <TableRow key={payment.id} hover>
                                                <TableCell align="center">{formatDate(payment.payment_date || payment.createdAt)}</TableCell>
                                                <TableCell align="center">{payment.payment_method}</TableCell>
                                                <TableCell align="center">{payment.purchase?.factura || '-'}</TableCell>
                                                <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                                                <TableCell align="center">
                                                    {payment.voided_at ? (
                                                        <Chip size="small" label="Anulado" color="error" />
                                                    ) : (
                                                        <Chip size="small" label="Activo" color="success" />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">{payment.notes || payment.void_reason || '-'}</TableCell>
                                                <TableCell align="center">
                                                    {!payment.voided_at && tienePermiso('accion_anular_pago_proveedor') && (
                                                        <Tooltip title="Anular pago">
                                                            <IconButton size="small" color="error" onClick={() => handleVoidPayment(payment)}>
                                                                <BlockIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                    <StyledButton onClick={handleClose} variant="outlined" sx={{ padding: '2px 12px' }}>
                        Cerrar
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            <SupplierPaymentModal
                open={openPayment}
                onClose={() => setOpenPayment(false)}
                supplier={currentSupplier}
                onSaved={refresh}
            />

            <StyledDialog open={Boolean(conditionPurchase)} onClose={() => setConditionPurchase(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Corregir condición</DialogTitle>
                <DialogContent sx={{ backgroundColor: 'background.paper' }}>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextFieldWithClear
                                select
                                name="condition"
                                label="Condición"
                                fullWidth
                                value={conditionForm.condition}
                                onChange={(event) => setConditionForm((prev) => ({ ...prev, condition: event.target.value }))}
                            >
                                <MenuItem value="contado">Contado</MenuItem>
                                <MenuItem value="cheque">Cheque</MenuItem>
                                <MenuItem value="cuenta corriente">Cuenta corriente</MenuItem>
                            </TextFieldWithClear>
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldWithClear
                                name="reason"
                                label="Motivo *"
                                fullWidth
                                multiline
                                minRows={2}
                                value={conditionForm.reason}
                                onChange={(event) => setConditionForm((prev) => ({ ...prev, reason: event.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                    <StyledButton variant="outlined" onClick={() => setConditionPurchase(null)} sx={{ padding: '2px 12px' }}>
                        Cancelar
                    </StyledButton>
                    <StyledButton variant="contained" onClick={handleSaveCondition} disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </StyledButton>
                </DialogActions>
            </StyledDialog>
        </>
    );
};

SupplierAccountModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    supplier: PropTypes.object,
    onChanged: PropTypes.func
};
