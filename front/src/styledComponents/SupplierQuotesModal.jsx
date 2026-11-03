import { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { UseFetchQuery } from '../hooks/useQuery';
import { Api } from '../api/api';
import { useSubmit } from '../hooks/useSubmit';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';
import { confirmAction } from '../functions/ConfirmDelete';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { printSupplierQuote } from '../functions/printSupplierQuote';

const formatDate = (value) => {
    if (!value) return '-';
    const raw = String(value);
    const date = raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('es-AR');
};

const formatMoney = (value) => `$ ${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const quoteNumber = (quote) => `COT-${String(quote?.numero ?? quote?.id ?? 0).padStart(5, '0')}`;

const unitLabel = (product) => {
    const raw = product?.unit?.abreviatura || product?.unit?.name || '';
    const value = String(raw).trim();
    if (!value) return '';
    if (value.toLowerCase() === 'un' || value.toLowerCase() === 'unidad') return 'Un.';
    return value;
};

const unitOptionLabel = (unit) => {
    if (!unit) return '';
    const abreviatura = String(unit.abreviatura || '').trim();
    const name = String(unit.name || '').trim();
    if (!abreviatura) return name;
    if (abreviatura.toLowerCase() === 'un' || abreviatura.toLowerCase() === 'unidad') return 'Un.';
    return name ? `${abreviatura} (${name})` : abreviatura;
};

const DECIMAL_UNIT_KEYS = new Set(['kg', 'kilogramo', 'm3', 'metro cubico', 'metro cúbico', 'ml', 'metro lineal']);

const unitAllowsDecimal = (unit) => {
    if (!unit) return false;
    const abreviatura = String(unit.abreviatura || '').trim().toLowerCase();
    const name = String(unit.name || '').trim().toLowerCase();
    if (abreviatura === 'un' || abreviatura === 'unidad' || name === 'un' || name === 'unidad') return false;
    return DECIMAL_UNIT_KEYS.has(abreviatura) || DECIMAL_UNIT_KEYS.has(name);
};

const todayLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const emptyLine = () => ({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    stock_id: null,
    units_id: null,
    cantidad: '',
    unidad: '',
    detalle: '',
    precio_unitario: ''
});

const statusLabel = (estado) => ({
    solicitada: 'Solicitada',
    recibida: 'Recibida',
    convertida: 'Convertida',
    anulada: 'Anulada'
}[estado] || estado);

const statusColor = (estado) => ({
    solicitada: 'warning',
    recibida: 'info',
    convertida: 'success',
    anulada: 'error'
}[estado] || 'default');

export const SupplierQuotesModal = ({ open, onClose, supplier, onChanged }) => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const [view, setView] = useState('list');
    const [editing, setEditing] = useState(null);
    const [header, setHeader] = useState({ fecha: '', rubro: '', tipo: 'MATERIALES', notas: '' });
    const [lines, setLines] = useState([emptyLine()]);
    const [error, setError] = useState('');
    const [conversionQuote, setConversionQuote] = useState(null);
    const [selectedDetails, setSelectedDetails] = useState([]);

    const { mutateAsync, isPending } = useSubmit('supplierQuote');

    const { data: quotesData, isLoading, refetch } = UseFetchQuery(
        ['supplierQuotes', supplier?.id],
        `/supplier-quotes?supplier_id=${supplier?.id || ''}&limit=100`,
        Boolean(open && supplier?.id),
        0
    );
    const { data: products } = UseFetchQuery(
        ['supplierQuoteProducts', supplier?.id],
        `/supplier-quotes/products?supplier_id=${supplier?.id || ''}`,
        Boolean(open && supplier?.id),
        0
    );
    const { data: units } = UseFetchQuery(
        ['supplierQuoteUnits'],
        '/supplier-quotes/units',
        Boolean(open),
        0
    );
    const { data: businessConfig } = UseFetchQuery('businessConfig', '/business-config', true);

    const quotes = quotesData?.rows || [];
    const productList = useMemo(() => products || [], [products]);
    const unitList = useMemo(() => units || [], [units]);

    const lineAllowsDecimal = (line) => {
        const unit = unitList.find(item => Number(item.id) === Number(line.units_id));
        return unitAllowsDecimal(unit);
    };

    const rubroOptions = useMemo(() => {
        const names = new Set();
        const preferred = productList.filter(product => Number(product.supplier_id) === Number(supplier?.id));
        const source = preferred.length > 0 ? preferred : productList;
        source.forEach(product => {
            if (product?.stockCategory?.name) names.add(product.stockCategory.name);
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b, 'es'));
    }, [productList, supplier?.id]);

    useEffect(() => {
        if (!open) return;
        setView('list');
        setEditing(null);
        setError('');
        setConversionQuote(null);
        setSelectedDetails([]);
        setHeader({ fecha: todayLocal(), rubro: '', tipo: 'MATERIALES', notas: '' });
        setLines([emptyLine()]);
    }, [open, supplier?.id]);

    const updateLine = (key, patch) => {
        setLines(prev => prev.map(line => line.key === key ? { ...line, ...patch } : line));
    };
    const addLine = () => setLines(prev => [...prev, emptyLine()]);
    const removeLine = (key) => setLines(prev => prev.length === 1 ? [emptyLine()] : prev.filter(line => line.key !== key));

    const handleSelectProduct = (key, product) => {
        if (!product) {
            updateLine(key, { stock_id: null, units_id: null });
            return;
        }
        updateLine(key, {
            stock_id: product.id,
            units_id: product.units_id || null,
            detalle: product.name,
            unidad: unitLabel(product)
        });
    };

    const startNewQuote = () => {
        setEditing(null);
        setError('');
        setHeader({ fecha: todayLocal(), rubro: '', tipo: 'MATERIALES', notas: '' });
        setLines([emptyLine()]);
        setView('form');
    };

    const fetchQuote = async (quoteId) => {
        const res = await Api.get(`/supplier-quotes/${quoteId}`);
        return res.data;
    };

    const startEditQuote = async (quote) => {
        setError('');
        try {
            const fullQuote = await fetchQuote(quote.id);
            setEditing(fullQuote);
            setHeader({
                fecha: fullQuote.fecha ? String(fullQuote.fecha).slice(0, 10) : todayLocal(),
                rubro: fullQuote.rubro || '',
                tipo: fullQuote.tipo || 'MATERIALES',
                notas: fullQuote.notas || ''
            });
            setLines((fullQuote.details || []).map(detail => ({
                key: `${fullQuote.id}-${detail.id}`,
                stock_id: detail.stock_id || null,
                units_id: detail.units_id || null,
                cantidad: Number(detail.cantidad),
                unidad: detail.unidad || '',
                detalle: detail.detalle || '',
                precio_unitario: detail.precio_unitario === null || detail.precio_unitario === undefined ? '' : Number(detail.precio_unitario)
            })));
            setView('form');
        } catch {
            mostrarError('No se pudo cargar la cotización.', theme);
        }
    };

    const buildPayload = () => ({
        fecha: header.fecha,
        rubro: header.rubro,
        tipo: header.tipo,
        notas: header.notas,
        supplier_id: supplier.id,
        details: lines.map(line => ({
            stock_id: line.stock_id,
            units_id: line.units_id,
            cantidad: Number(line.cantidad) || 0,
            unidad: line.unidad,
            detalle: line.detalle,
            precio_unitario: line.precio_unitario === '' ? null : Number(line.precio_unitario)
        }))
    });

    const handleSave = async (printAfter = false) => {
        if (!header.fecha) return setError('Ingresá la fecha de la cotización.');
        const validLines = lines.filter(line => String(line.detalle || '').trim() !== '');
        if (!validLines.length) return setError('Agregá al menos un ítem.');
        const invalid = validLines.find(line => !(Number(line.cantidad) > 0));
        if (invalid) return setError('Revisá la cantidad de los ítems.');
        const invalidDecimal = validLines.find(line => !lineAllowsDecimal(line) && !Number.isInteger(Number(line.cantidad)));
        if (invalidDecimal) return setError(`La cantidad de "${invalidDecimal.detalle}" debe ser entera para ${invalidDecimal.unidad || 'Un.'}.`);

        try {
            const saved = await mutateAsync({
                url: editing ? `/supplier-quotes/${editing.id}` : '/supplier-quotes',
                method: editing ? 'put' : 'post',
                values: buildPayload(),
                showSuccessAlert: false
            });
            mostrarExito(editing ? 'Cotización actualizada.' : 'Cotización creada.', theme);
            await refetch();
            onChanged?.();
            if (printAfter) printSupplierQuote({ ...saved, supplier }, businessConfig);
            setView('list');
            setEditing(null);
        } catch {
            return;
        }
    };

    const handleReceive = (quote) => {
        confirmAction(async () => {
            try {
                const received = await mutateAsync({
                    url: `/supplier-quotes/${quote.id}/receive`,
                    method: 'post',
                    values: {},
                    showSuccessAlert: false
                });
                mostrarExito('Cotización marcada como recibida.', theme);
                await refetch();
                onChanged?.();
                await startEditQuote(received);
            } catch {
                return;
            }
        }, () => {}, `¿Marcar ${quoteNumber(quote)} como recibida?`, theme);
    };

    const handleVoid = (quote) => {
        confirmAction(async () => {
            try {
                await mutateAsync({
                    url: `/supplier-quotes/${quote.id}`,
                    method: 'delete',
                    values: {},
                    showSuccessAlert: false
                });
                mostrarExito('Cotización anulada.', theme);
                await refetch();
                onChanged?.();
            } catch {
                return;
            }
        }, () => {}, `¿Anular ${quoteNumber(quote)}?`, theme);
    };

    const handlePrint = async (quote) => {
        try {
            const fullQuote = await fetchQuote(quote.id);
            printSupplierQuote(fullQuote, businessConfig);
        } catch {
            mostrarError('No se pudo cargar la cotización para imprimir.', theme);
        }
    };

    const openConvert = async (quote) => {
        try {
            const fullQuote = await fetchQuote(quote.id);
            setConversionQuote(fullQuote);
            setSelectedDetails((fullQuote.details || [])
                .filter(detail => detail.precio_unitario !== null && detail.precio_unitario !== undefined)
                .map(detail => String(detail.id)));
        } catch {
            mostrarError('No se pudo cargar la cotización.', theme);
        }
    };

    const toggleDetail = (detailId) => {
        const key = String(detailId);
        setSelectedDetails(prev => prev.includes(key) ? prev.filter(id => id !== key) : [...prev, key]);
    };

    const handleConvert = async () => {
        if (!conversionQuote) return;
        if (!selectedDetails.length) return mostrarError('Seleccioná al menos un ítem para el pedido.', theme);
        try {
            await mutateAsync({
                url: `/supplier-quotes/${conversionQuote.id}/convert-to-order`,
                method: 'post',
                values: { detail_ids: selectedDetails },
                showSuccessAlert: false
            });
            mostrarExito('Cotización convertida en pedido.', theme);
            setConversionQuote(null);
            setSelectedDetails([]);
            await refetch();
            onChanged?.();
        } catch {
            return;
        }
    };

    const renderList = () => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Cotizaciones de precios</Typography>
                    <Typography variant="body2" color="text.secondary">Documentos para solicitar y registrar precios. No mueven stock ni generan saldo.</Typography>
                </Box>
                {tienePermiso('accion_crear_cotizacion_proveedor') && (
                    <StyledButton variant="contained" startIcon={<AddIcon />} onClick={startNewQuote}>Nueva cotización</StyledButton>
                )}
            </Box>
            {isLoading ? <CircularProgress size={24} /> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Nº</TableCell>
                                <TableCell align="center">Fecha</TableCell>
                                <TableCell align="left">Rubro</TableCell>
                                <TableCell align="center">Estado</TableCell>
                                <TableCell align="right">Total cotizado</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quotes.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">Este proveedor todavía no tiene cotizaciones.</TableCell></TableRow>
                            ) : quotes.map(quote => (
                                <TableRow key={quote.id} hover>
                                    <TableCell align="center">{quoteNumber(quote)}</TableCell>
                                    <TableCell align="center">{formatDate(quote.fecha)}</TableCell>
                                    <TableCell align="left">{quote.rubro || '-'}</TableCell>
                                    <TableCell align="center"><Chip size="small" label={statusLabel(quote.estado)} color={statusColor(quote.estado)} /></TableCell>
                                    <TableCell align="right">{formatMoney(quote.total)}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Imprimir / PDF"><IconButton size="small" color="primary" onClick={() => handlePrint(quote)}><PrintIcon fontSize="small" /></IconButton></Tooltip>
                                        {(quote.estado === 'solicitada' || quote.estado === 'recibida') && tienePermiso('accion_editar_cotizacion_proveedor') && (
                                            <Tooltip title="Editar"><IconButton size="small" onClick={() => startEditQuote(quote)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                        {quote.estado === 'solicitada' && tienePermiso('accion_recibir_cotizacion_proveedor') && (
                                            <Tooltip title="Marcar recibida"><IconButton size="small" color="info" onClick={() => handleReceive(quote)}><SwapHorizIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                        {quote.estado === 'recibida' && tienePermiso('accion_convertir_cotizacion_proveedor') && (
                                            <Tooltip title="Convertir a pedido"><IconButton size="small" color="success" onClick={() => openConvert(quote)}><SwapHorizIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                        {(quote.estado === 'solicitada' || quote.estado === 'recibida') && tienePermiso('accion_anular_cotizacion_proveedor') && (
                                            <Tooltip title="Anular"><IconButton size="small" color="error" onClick={() => handleVoid(quote)}><BlockIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );

    const renderForm = () => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{editing ? `Editar ${quoteNumber(editing)}` : 'Nueva cotización'}</Typography>
                    <Typography variant="body2" color="text.secondary">Proveedor: {supplier?.nombre}</Typography>
                </Box>
                <StyledButton variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setView('list')}>Volver</StyledButton>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 2fr' }, gap: 2, mb: 2 }}>
                <TextFieldWithClear name="fecha" label="Fecha *" type="date" size="small" value={header.fecha} onChange={event => setHeader(prev => ({ ...prev, fecha: event.target.value }))} InputLabelProps={{ shrink: true }} />
                <Autocomplete freeSolo options={rubroOptions} value={header.rubro} onInputChange={(_, value) => setHeader(prev => ({ ...prev, rubro: value }))} renderInput={params => <TextField {...params} label="Rubro" size="small" />} />
                <TextFieldWithClear name="tipo" label="Tipo" size="small" value={header.tipo} onChange={event => setHeader(prev => ({ ...prev, tipo: event.target.value }))} />
                <TextFieldWithClear name="notas" label="Notas" size="small" value={header.notas} onChange={event => setHeader(prev => ({ ...prev, notas: event.target.value }))} />
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="center">Unidad</TableCell>
                            <TableCell>Detalle</TableCell>
                            <TableCell align="center">Precio unit.</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lines.map(line => (
                            <TableRow key={line.key}>
                                <TableCell sx={{ minWidth: 210 }}>
                                    <Autocomplete
                                        size="small"
                                        options={productList.filter(product => Number(product.supplier_id) === Number(supplier?.id)).concat(productList.filter(product => Number(product.supplier_id) !== Number(supplier?.id)))}
                                        getOptionLabel={option => option?.name || ''}
                                        value={productList.find(product => Number(product.id) === Number(line.stock_id)) || null}
                                        onChange={(_, value) => handleSelectProduct(line.key, value)}
                                        renderInput={params => <TextField {...params} placeholder="Buscar producto" />}
                                    />
                                </TableCell>
                                <TableCell align="center" sx={{ width: 110 }}>
                                    <TextField size="small" type="number" value={line.cantidad} onChange={event => updateLine(line.key, { cantidad: event.target.value })} inputProps={{ min: 0, step: lineAllowsDecimal(line) ? '0.001' : '1' }} />
                                </TableCell>
                                <TableCell align="center" sx={{ width: 140 }}>
                                    <Autocomplete size="small" options={unitList} getOptionLabel={unitOptionLabel} value={unitList.find(unit => Number(unit.id) === Number(line.units_id)) || null} onChange={(_, value) => updateLine(line.key, { units_id: value?.id || null, unidad: unitLabel({ unit: value }) })} renderInput={params => <TextField {...params} />} />
                                </TableCell>
                                <TableCell><TextField size="small" fullWidth value={line.detalle} onChange={event => updateLine(line.key, { detalle: event.target.value })} /></TableCell>
                                <TableCell align="center" sx={{ width: 130 }}><TextField size="small" type="number" value={line.precio_unitario} onChange={event => updateLine(line.key, { precio_unitario: event.target.value })} inputProps={{ min: 0, step: '0.01' }} placeholder="Opcional" /></TableCell>
                                <TableCell align="center"><IconButton size="small" color="error" onClick={() => removeLine(line.key)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={addLine}>Agregar ítem</StyledButton>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <StyledButton variant="outlined" onClick={() => handleSave(false)} disabled={isPending}>Guardar</StyledButton>
                    <StyledButton variant="contained" startIcon={<PrintIcon />} onClick={() => handleSave(true)} disabled={isPending}>Guardar e imprimir</StyledButton>
                </Box>
            </Box>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </>
    );

    return (
        <>
            <StyledDialog open={Boolean(open)} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog' }}>
                    Cotizaciones
                    <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
                    {view === 'list' ? renderList() : renderForm()}
                </DialogContent>
            </StyledDialog>

            <StyledDialog open={Boolean(conversionQuote)} onClose={() => setConversionQuote(null)} maxWidth="md" fullWidth>
                <DialogTitle>Convertir en pedido</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Por defecto se incluyen los ítems cotizados. Podés tildar líneas sin precio para agregarlas manualmente.
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead><TableRow><TableCell /><TableCell>Ítem</TableCell><TableCell align="center">Cantidad</TableCell><TableCell align="right">Precio</TableCell></TableRow></TableHead>
                            <TableBody>
                                {(conversionQuote?.details || []).map(detail => (
                                    <TableRow key={detail.id}>
                                        <TableCell padding="checkbox"><Checkbox checked={selectedDetails.includes(String(detail.id))} onChange={() => toggleDetail(detail.id)} /></TableCell>
                                        <TableCell>{detail.detalle}</TableCell>
                                        <TableCell align="center">{Number(detail.cantidad).toLocaleString('es-AR')}</TableCell>
                                        <TableCell align="right">{detail.precio_unitario === null || detail.precio_unitario === undefined ? 'Sin cotizar' : formatMoney(detail.precio_unitario)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <StyledButton variant="outlined" onClick={() => setConversionQuote(null)}>Cancelar</StyledButton>
                    <StyledButton variant="contained" onClick={handleConvert} disabled={isPending || !selectedDetails.length}>Generar pedido</StyledButton>
                </DialogActions>
            </StyledDialog>
        </>
    );
};

export default SupplierQuotesModal;
