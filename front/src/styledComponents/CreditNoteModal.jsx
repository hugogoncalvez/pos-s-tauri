/**
 * CreditNoteModal
 * Modal para emitir Notas de Crédito asociadas a una venta previa.
 * Permite seleccionar qué productos se devuelven, especificar cantidades,
 * indicar si reingresan al stock físico e imprimir el comprobante.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useTheme } from '@mui/material/styles';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { Api } from '../api/api';
import { useSubmit } from '../hooks/useSubmit';
import { UseFetchQuery } from '../hooks/useQuery';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import { printCreditNote } from '../functions/printCreditNote';

const formatCurrency = (amount) =>
    `$ ${Number(amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const CreditNoteModal = ({ open, onClose, saleId, onSuccess }) => {
    const theme = useTheme();
    const [loadingItems, setLoadingItems] = useState(false);
    const [saleData, setSaleData] = useState(null);
    const [items, setItems] = useState([]);
    const [returns, setReturns] = useState({});
    const [notas, setNotas] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { mutateAsync: submitCreditNote, isPending } = useSubmit('createCreditNote');
    const { data: businessConfig } = UseFetchQuery('businessConfig', '/business-config', true);

    // Cargar los ítems retornables de la venta al abrir el modal
    useEffect(() => {
        if (!open || !saleId) {
            setSaleData(null);
            setItems([]);
            setReturns({});
            setNotas('');
            setErrorMessage('');
            return;
        }

        const fetchSaleItems = async () => {
            setLoadingItems(true);
            setErrorMessage('');
            try {
                const response = await Api.get(`/sales/${saleId}/returnable-items`);
                const data = response.data;
                setSaleData(data.sale || null);
                setItems(data.items || []);

                // Inicializar objeto de devolución
                const initialReturns = {};
                (data.items || []).forEach(item => {
                    initialReturns[item.sale_detail_id] = {
                        quantity: '',
                        reingresa_stock: true
                    };
                });
                setReturns(initialReturns);
            } catch (err) {
                console.error('Error al cargar ítems de la venta:', err);
                setErrorMessage('No se pudieron cargar los ítems de la venta seleccionada.');
            } finally {
                setLoadingItems(false);
            }
        };

        fetchSaleItems();
    }, [open, saleId]);

    const handleQuantityChange = (saleDetailId, value, maxAvailable) => {
        const num = parseFloat(value);
        if (value !== '' && (isNaN(num) || num < 0)) return;
        if (num > maxAvailable) {
            setReturns(prev => ({
                ...prev,
                [saleDetailId]: {
                    ...prev[saleDetailId],
                    quantity: String(maxAvailable)
                }
            }));
            return;
        }
        setReturns(prev => ({
            ...prev,
            [saleDetailId]: {
                ...prev[saleDetailId],
                quantity: value
            }
        }));
    };

    const handleReingresaChange = (saleDetailId, checked) => {
        setReturns(prev => ({
            ...prev,
            [saleDetailId]: {
                ...prev[saleDetailId],
                reingresa_stock: checked
            }
        }));
    };

    // Calcular el total a devolver en tiempo real
    const totalToRefund = useMemo(() => {
        return items.reduce((sum, item) => {
            const row = returns[item.sale_detail_id];
            const qty = parseFloat(row?.quantity) || 0;
            return sum + qty * (item.unit_price || 0);
        }, 0);
    }, [items, returns]);

    const activeReturnsCount = useMemo(() => {
        return Object.values(returns).filter(r => parseFloat(r.quantity) > 0).length;
    }, [returns]);

    const handleSave = async (shouldPrint = false) => {
        setErrorMessage('');
        const payloadItems = [];

        for (const item of items) {
            const row = returns[item.sale_detail_id];
            const qty = parseFloat(row?.quantity) || 0;
            if (qty > 0) {
                if (qty > item.available_quantity) {
                    setErrorMessage(`La cantidad a devolver de "${item.product_name}" supera el disponible.`);
                    return;
                }
                payloadItems.push({
                    sale_detail_id: item.sale_detail_id,
                    quantity: qty,
                    reingresa_stock: row.reingresa_stock
                });
            }
        }

        if (payloadItems.length === 0) {
            setErrorMessage('Ingresá una cantidad mayor a cero en al menos un producto.');
            return;
        }

        try {
            const result = await submitCreditNote({
                url: '/credit-notes',
                method: 'post',
                values: {
                    sale_id: saleId,
                    items: payloadItems,
                    notas: notas.trim() || null
                },
                showSuccessAlert: false
            });

            mostrarExito(`Nota de Crédito NC-${String(result.numero).padStart(5, '0')} emitida con éxito.`, theme);

            if (shouldPrint) {
                printCreditNote(result, businessConfig);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error al emitir nota de crédito:', err);
            setErrorMessage(err.response?.data?.message || err.message || 'Error al emitir la nota de crédito.');
        }
    };

    return (
        <StyledDialog open={Boolean(open)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Emitir Nota de Crédito (Devolución)
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon color="error" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loadingItems ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : errorMessage && !items.length ? (
                    <Alert severity="error">{errorMessage}</Alert>
                ) : (
                    <>
                        {saleData && (
                            <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, backgroundColor: 'action.hover' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Venta Ref:</strong> Ticket #{saleData.id}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Fecha:</strong> {new Date(saleData.fecha).toLocaleDateString('es-AR')}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Cliente:</strong> {saleData.customer?.name || 'Consumidor Final'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: Number(saleData.customer?.debt) > 0 ? 'error.main' : 'text.primary' }}>
                                        <strong>Deuda actual:</strong> {formatCurrency(saleData.customer?.debt)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Ingresá las cantidades que el cliente devuelve o no retiró. El stock se reingresará automáticamente al inventario.
                        </Typography>

                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="center">Comprado</TableCell>
                                        <TableCell align="center">Disponible</TableCell>
                                        <TableCell align="right">Precio Unit.</TableCell>
                                        <TableCell align="center" sx={{ width: 140 }}>Cant. a Devolver</TableCell>
                                        <TableCell align="center" sx={{ width: 130 }}>Reingresa Stock</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                                Esta venta no tiene productos disponibles para devolver.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map(item => {
                                            const row = returns[item.sale_detail_id] || {};
                                            const qty = parseFloat(row.quantity) || 0;
                                            const lineTotal = qty * (item.unit_price || 0);
                                            const isAvailable = item.available_quantity > 0;

                                            return (
                                                <TableRow key={item.sale_detail_id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {item.product_name}
                                                        {item.presentation_name && (
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                ({item.presentation_name})
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {item.purchased_quantity} {item.unit_name}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            size="small"
                                                            color={isAvailable ? 'primary' : 'default'}
                                                            label={`${item.available_quantity} ${item.unit_name}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                                                    <TableCell align="center">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={row.quantity ?? ''}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    item.sale_detail_id,
                                                                    e.target.value,
                                                                    item.available_quantity
                                                                )
                                                            }
                                                            disabled={!isAvailable}
                                                            placeholder="0"
                                                            inputProps={{
                                                                min: 0,
                                                                max: item.available_quantity,
                                                                step: 'any',
                                                                style: { textAlign: 'center' }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Checkbox
                                                            size="small"
                                                            checked={row.reingresa_stock !== false}
                                                            onChange={(e) =>
                                                                handleReingresaChange(item.sale_detail_id, e.target.checked)
                                                            }
                                                            disabled={!isAvailable || !qty}
                                                            color="success"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                        {formatCurrency(lineTotal)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: 1, minWidth: 260 }}>
                                <TextFieldWithClear
                                    fullWidth
                                    size="small"
                                    name="notas"
                                    label="Motivo / Observaciones (opcional)"
                                    placeholder="Ej: Material sobrante de obra, bolsas no retiradas..."
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    onClear={() => setNotas('')}
                                />
                            </Box>
                            <Paper sx={{ p: 1.5, px: 2.5, backgroundColor: 'primary.light', color: 'primary.contrastText', borderRadius: 1.5, textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    TOTAL NOTA DE CRÉDITO
                                </Typography>
                                <Typography variant="h5" fontWeight={800}>
                                    {formatCurrency(totalToRefund)}
                                </Typography>
                            </Paper>
                        </Box>

                        {errorMessage && <Alert severity="error" sx={{ mt: 1 }}>{errorMessage}</Alert>}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <StyledButton variant="outlined" onClick={onClose} disabled={isPending}>
                    Cancelar
                </StyledButton>
                <StyledButton
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSave(false)}
                    disabled={isPending || activeReturnsCount === 0 || totalToRefund <= 0}
                >
                    Guardar
                </StyledButton>
                <StyledButton
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => handleSave(true)}
                    disabled={isPending || activeReturnsCount === 0 || totalToRefund <= 0}
                >
                    Guardar e Imprimir
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default CreditNoteModal;

