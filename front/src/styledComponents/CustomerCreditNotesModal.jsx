/**
 * CustomerCreditNotesModal
 * Modal para consultar el listado de Notas de Crédito emitidas a un cliente específico.
 * Permite visualizar el número de comprobante, fecha, venta origen, ítems devueltos,
 * monto total acreditado y reimprimir el comprobante térmico/A4.
 */

import React, { useState } from 'react';
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
    CircularProgress,
    Tooltip,
    Chip,
    Collapse
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { UseFetchQuery } from '../hooks/useQuery';
import { printCreditNote } from '../functions/printCreditNote';

const formatCurrency = (amount) =>
    `$ ${Number(amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CreditNoteRow = ({ cn, businessConfig }) => {
    const [openDetail, setOpenDetail] = useState(false);
    const details = cn.details || [];

    return (
        <>
            <TableRow hover>
                <TableCell sx={{ width: 40, p: 0.5 }}>
                    {details.length > 0 && (
                        <IconButton size="small" onClick={() => setOpenDetail(!openDetail)}>
                            {openDetail ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                    NC-{String(cn.numero ?? cn.id).padStart(5, '0')}
                </TableCell>
                <TableCell align="center">
                    {new Date(cn.fecha).toLocaleDateString('es-AR')}
                </TableCell>
                <TableCell align="center">
                    Ticket #{cn.sale_id}
                </TableCell>
                <TableCell align="center">
                    <Chip size="small" label={`${details.length} producto(s)`} variant="outlined" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'success.main' }}>
                    {formatCurrency(cn.total)}
                </TableCell>
                <TableCell align="center">
                    <Tooltip title="Reimprimir Nota de Crédito">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => printCreditNote(cn, businessConfig)}
                        >
                            <PrintIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={openDetail} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 1.5, my: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Detalle de productos devueltos:
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="center">Cantidad Devuelta</TableCell>
                                        <TableCell align="center">Reingresó Stock</TableCell>
                                        <TableCell align="right">Precio Unit.</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {details.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell>{d.product_name || d.stock?.name || 'Producto'}</TableCell>
                                            <TableCell align="center">{d.quantity} {d.unit_name || ''}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={d.reingresa_stock ? 'Sí' : 'No'}
                                                    color={d.reingresa_stock ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(d.price)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(d.line_total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {cn.notas && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    <strong>Observaciones:</strong> {cn.notas}
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export const CustomerCreditNotesModal = ({ open, onClose, customerId, customerName }) => {
    const { data: creditNotesData, isLoading } = UseFetchQuery(
        ['customerCreditNotes', customerId],
        `/credit-notes?customer_id=${customerId || ''}&limit=100`,
        Boolean(open && customerId),
        0
    );

    const { data: businessConfig } = UseFetchQuery('businessConfig', '/business-config', true);
    const creditNotes = creditNotesData?.rows || [];

    const totalAcreditado = creditNotes.reduce((sum, cn) => sum + Number(cn.total || 0), 0);

    return (
        <StyledDialog open={Boolean(open)} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="warning" />
                    <Typography variant="h6" fontWeight={700}>
                        Notas de Crédito - {customerName || 'Cliente'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon color="error" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Comprobantes emitidos por devoluciones o materiales no retirados.
                            </Typography>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">Total Histórico Acreditado:</Typography>
                                <Typography variant="subtitle1" fontWeight={800} color="success.main">
                                    {formatCurrency(totalAcreditado)}
                                </Typography>
                            </Box>
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ width: 40 }} />
                                        <TableCell>Número</TableCell>
                                        <TableCell align="center">Fecha</TableCell>
                                        <TableCell align="center">Venta Ref.</TableCell>
                                        <TableCell align="center">Productos</TableCell>
                                        <TableCell align="right">Total Acreditado</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {creditNotes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                                Este cliente no tiene notas de crédito registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        creditNotes.map((cn) => (
                                            <CreditNoteRow
                                                key={cn.id}
                                                cn={cn}
                                                businessConfig={businessConfig}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <StyledButton variant="outlined" onClick={onClose}>
                    Cerrar
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default CustomerCreditNotesModal;

