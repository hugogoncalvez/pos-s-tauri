import { useMemo } from 'react';
import {
    Alert,
    Box,
    Chip,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Block as BlockIcon,
    Close as CloseIcon,
    Print as PrintIcon,
    SwapHoriz as ConvertIcon,
    WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { usePermissions } from '../hooks/usePermissions';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { UseFetchQuery } from '../hooks/useQuery';
import { findStockShortages, getQuoteLineStockStatus } from '../functions/salesLogic';

const formatMoney = (value) => Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatQuantity = (value) => Number(value || 0).toLocaleString('es-AR', {
    maximumFractionDigits: 3,
});

const formatStockValue = (value, unit) => {
    const formatted = formatQuantity(value);
    return unit ? `${formatted} ${unit}` : formatted;
};

const stockStatusColor = (status) => ({
    ok: 'success.main',
    insufficient: 'error.main',
    unknown: 'warning.main',
    unavailable: 'warning.main',
}[status] || 'text.secondary');

const formatDate = (value) => {
    if (!value) return '';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : String(value);
};

const statusLabel = (status) => ({
    borrador: 'Borrador',
    emitido: 'Emitido',
    vencido: 'Vencido',
    convertido: 'Convertido',
    anulado: 'Anulado',
}[status] || status);

const statusColor = (status) => ({
    borrador: 'warning',
    emitido: 'success',
    vencido: 'error',
    convertido: 'info',
    anulado: 'default',
}[status] || 'default');

const QuoteDetailsModal = ({ open, quote, onClose, onPrint, onConvert, onAnular }) => {
    const { tienePermiso } = usePermissions();
    const { isOnline } = useOnlineStatus();
    const status = quote?.effective_status || quote?.status;
    const showStock = status !== 'convertido' && status !== 'anulado';
    const details = useMemo(() => quote?.details || [], [quote]);
    const hasStockLines = details.some((item) => Boolean(item.stock_id));

    const { data: stockData, isLoading: loadingStock } = UseFetchQuery(
        'quoteProducts',
        '/stock?unpaginated=true',
        Boolean(open && quote && hasStockLines && showStock)
    );

    const stockProducts = useMemo(
        () => (Array.isArray(stockData?.products) ? stockData.products : []),
        [stockData]
    );

    const stockStatusByIndex = useMemo(
        () => new Map(details.map((item, index) => [index, getQuoteLineStockStatus(item, stockProducts)])),
        [details, stockProducts]
    );

    const aggregateShortages = useMemo(() => {
        const items = details.map((item, index) => {
            const stockStatus = stockStatusByIndex.get(index);
            return {
                ...item,
                name: [item.product_name, item.presentation_name].filter(Boolean).join(' — '),
                quantity_for_stock_deduction: stockStatus?.requested ?? 0,
            };
        });
        return findStockShortages(items, stockProducts);
    }, [details, stockStatusByIndex, stockProducts]);

    const shortageByStockId = useMemo(
        () => new Map(aggregateShortages.map((shortage) => [Number(shortage.stockId), shortage])),
        [aggregateShortages]
    );

    if (!quote) return null;

    const canPrint = tienePermiso('accion_imprimir_presupuesto');
    const canConvert = tienePermiso('accion_convertir_presupuesto');
    const canAnular = tienePermiso('accion_anular_presupuesto');
    const convertible = status === 'emitido' || status === 'vencido';
    const anulable = status === 'borrador' || status === 'emitido' || status === 'vencido';

    const renderStockCell = (item, index) => {
        const stock = stockStatusByIndex.get(index);

        if (!stock || stock.status === 'not_applicable') {
            return <Typography variant="body2" color="text.secondary">—</Typography>;
        }

        if (loadingStock) {
            return <Typography variant="body2" color="text.secondary">…</Typography>;
        }

        if (stock.status === 'unavailable' || stock.status === 'unknown' || stock.available === null) {
            const title = stock.status === 'unavailable'
                ? 'Producto o presentación no encontrado en stock'
                : 'No se pudo verificar el stock';
            return (
                <Tooltip title={title}>
                    <Typography
                        variant="body2"
                        color={stockStatusColor(stock.status)}
                        fontWeight={600}
                    >
                        —
                    </Typography>
                </Tooltip>
            );
        }

        const aggregateShortage = shortageByStockId.get(Number(item.stock_id));
        const isShort = stock.status === 'insufficient' || Boolean(aggregateShortage);
        const available = formatStockValue(stock.available, stock.baseUnit);
        const requestedValue = aggregateShortage ? aggregateShortage.requested : stock.requested;
        const requested = formatStockValue(requestedValue, stock.baseUnit);
        const missing = aggregateShortage
            ? Math.max(0, aggregateShortage.requested - aggregateShortage.available)
            : stock.missing;

        return (
            <Tooltip title={`Disponible: ${available}. Solicitado: ${requested}.`}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {isShort && <WarningAmberIcon fontSize="small" color="error" />}
                        <Typography
                            variant="body2"
                            color={isShort ? 'error.main' : 'success.main'}
                            fontWeight={isShort ? 700 : 600}
                        >
                            {available}
                        </Typography>
                    </Box>
                    {stock.presentationAvailable !== null && stock.presentationAvailable !== undefined && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            ≈ {formatQuantity(stock.presentationAvailable)} {stock.presentationAvailable === 1 ? 'presentación' : 'presentaciones'}
                        </Typography>
                    )}
                    {isShort && (
                        <Typography variant="caption" color="error.main" display="block">
                            Faltan {formatStockValue(missing, stock.baseUnit)}{aggregateShortage ? ' en total' : ''}
                        </Typography>
                    )}
                </Box>
            </Tooltip>
        );
    };

    return (
        <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" component="span">
                        {quote.quote_number || 'Presupuesto'}
                    </Typography>
                    <Chip
                        size="small"
                        label={statusLabel(status)}
                        color={statusColor(status)}
                        sx={{ ml: 1 }}
                    />
                </Box>
                <IconButton onClick={onClose} aria-label="Cerrar">
                    <CloseIcon color="error" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1.4fr 1fr' },
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary">Cliente</Typography>
                        <Typography variant="subtitle1" fontWeight={700}>{quote.customer_name}</Typography>
                        {quote.customer_document && (
                            <Typography variant="body2" color="text.secondary">Documento: {quote.customer_document}</Typography>
                        )}
                        {quote.customer_phone && (
                            <Typography variant="body2" color="text.secondary">Tel: {quote.customer_phone}</Typography>
                        )}
                        {quote.customer_address && (
                            <Typography variant="body2" color="text.secondary">{quote.customer_address}</Typography>
                        )}
                        {quote.customer_email && (
                            <Typography variant="body2" color="text.secondary">{quote.customer_email}</Typography>
                        )}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">Fecha</Typography>
                            <Typography variant="body2">{formatDate(quote.quote_date)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">Válido hasta</Typography>
                            <Typography variant="body2">{formatDate(quote.valid_until)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">Vendedor</Typography>
                            <Typography variant="body2">{quote.user?.nombre || quote.user?.username || '-'}</Typography>
                        </Box>
                        {quote.converted_sale_id && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary">Venta</Typography>
                                <Typography variant="body2">#{quote.converted_sale_id}</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="center">Unidad</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                {showStock && <TableCell align="center">Stock actual</TableCell>}
                                <TableCell align="right">Precio unit.</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {details.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{item.product_name}</Typography>
                                        {item.presentation_name && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {item.presentation_name}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">{item.unit_name || '-'}</TableCell>
                                    <TableCell align="right">{formatQuantity(item.quantity)}</TableCell>
                                    {showStock && <TableCell align="center">{renderStockCell(item, index)}</TableCell>}
                                    <TableCell align="right">{formatMoney(item.unit_price)}</TableCell>
                                    <TableCell align="right">{formatMoney(item.line_total)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {showStock && aggregateShortages.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Stock insuficiente para {aggregateShortages.length === 1 ? '1 producto' : `${aggregateShortages.length} productos`}. Al convertir el presupuesto se volverá a validar.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        {quote.notes && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">Notas</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{quote.notes}</Typography>
                            </Box>
                        )}
                        {quote.terms && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Condiciones</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{quote.terms}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ width: 260, flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2">Subtotal</Typography>
                            <Typography variant="body2">{formatMoney(quote.subtotal)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2">Descuento</Typography>
                            <Typography variant="body2">- {formatMoney(quote.discount)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{formatMoney(quote.total)}</Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
                {canAnular && anulable && (
                    <StyledButton
                        variant="outlined"
                        color="error"
                        startIcon={<BlockIcon />}
                        onClick={() => onAnular(quote)}
                    >
                        Anular
                    </StyledButton>
                )}
                {canPrint && (
                    <StyledButton
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => onPrint(quote)}
                    >
                        Imprimir
                    </StyledButton>
                )}
                <StyledButton variant="outlined" onClick={onClose}>
                    Cerrar
                </StyledButton>
                {canConvert && convertible && (
                    <StyledButton
                        variant="contained"
                        startIcon={<ConvertIcon />}
                        onClick={() => onConvert(quote)}
                        disabled={!isOnline}
                        title={!isOnline ? 'Requiere conexión' : 'Convertir en venta'}
                    >
                        Convertir en venta
                    </StyledButton>
                )}
            </DialogActions>
        </StyledDialog>
    );
};

export default QuoteDetailsModal;

const quoteShape = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    quote_number: PropTypes.string,
    quote_date: PropTypes.string,
    valid_until: PropTypes.string,
    status: PropTypes.string,
    effective_status: PropTypes.string,
    customer_name: PropTypes.string,
    customer_document: PropTypes.string,
    customer_phone: PropTypes.string,
    customer_address: PropTypes.string,
    customer_email: PropTypes.string,
    converted_sale_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    notes: PropTypes.string,
    terms: PropTypes.string,
    subtotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    details: PropTypes.arrayOf(PropTypes.object),
    user: PropTypes.shape({
        nombre: PropTypes.string,
        username: PropTypes.string,
    }),
});

QuoteDetailsModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPrint: PropTypes.func.isRequired,
    onConvert: PropTypes.func.isRequired,
    onAnular: PropTypes.func.isRequired,
    quote: quoteShape,
};
