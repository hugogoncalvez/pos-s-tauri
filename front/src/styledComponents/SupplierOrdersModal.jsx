import { useEffect, useMemo, useState } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    MenuItem,
    Tooltip,
    Autocomplete,
    TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { printSupplierOrder } from '../functions/printSupplierOrder';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
    if (!value) return '-';
    const raw = String(value);
    const date = raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('es-AR');
};

const orderNumber = (order) => String(order?.numero ?? order?.id ?? 0).padStart(5, '0');

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

const emptyLine = () => ({
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    stock_id: null,
    units_id: null,
    cantidad: '',
    unidad: '',
    detalle: '',
    precio_unitario: '',
    importe: 0
});

const calculateImporte = (line) => {
    const cantidad = Number(line.cantidad) || 0;
    const precio = Number(line.precio_unitario) || 0;
    return Math.round(cantidad * precio * 100) / 100;
};

export const SupplierOrdersModal = ({ open, onClose, supplier, onChanged }) => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const [view, setView] = useState('list');
    const [editing, setEditing] = useState(null);
    const [header, setHeader] = useState({ fecha: '', rubro: '', tipo: 'MATERIALES', notas: '' });
    const [lines, setLines] = useState([emptyLine()]);
    const [error, setError] = useState('');

    const { mutateAsync, isPending } = useSubmit('supplierOrder');

    const { data: ordersData, isLoading, refetch } = UseFetchQuery(
        ['supplierOrders', supplier?.id],
        `/supplier-orders?supplier_id=${supplier?.id || ''}&limit=100`,
        Boolean(open && supplier?.id),
        0
    );

    const { data: products } = UseFetchQuery(
        ['supplierOrderProducts', supplier?.id],
        `/supplier-orders/products?supplier_id=${supplier?.id || ''}`,
        Boolean(open && supplier?.id),
        0
    );

    const { data: units } = UseFetchQuery(
        ['supplierOrderUnits'],
        '/supplier-orders/units',
        Boolean(open),
        0
    );

    const { data: businessConfig } = UseFetchQuery('businessConfig', '/business-config', true);

    const orders = ordersData?.rows || [];
    const productList = useMemo(() => products || [], [products]);
    const unitList = useMemo(() => units || [], [units]);

    const rubroOptions = useMemo(() => {
        const names = new Set();
        productList.forEach((product) => {
            if (product?.stockCategory?.name) names.add(product.stockCategory.name);
        });
        return Array.from(names);
    }, [productList]);

    useEffect(() => {
        if (!open) return;
        setView('list');
        setEditing(null);
        setError('');
        setHeader({ fecha: new Date().toISOString().slice(0, 10), rubro: '', tipo: 'MATERIALES', notas: '' });
        setLines([emptyLine()]);
    }, [open, supplier?.id]);

    const total = useMemo(
        () => Math.round(lines.reduce((sum, line) => sum + calculateImporte(line), 0) * 100) / 100,
        [lines]
    );

    const updateLine = (key, patch) => {
        setLines((prev) => prev.map((line) => {
            if (line.key !== key) return line;
            const next = { ...line, ...patch };
            next.importe = calculateImporte(next);
            return next;
        }));
    };

    const removeLine = (key) => {
        setLines((prev) => (prev.length === 1 ? [emptyLine()] : prev.filter((line) => line.key !== key)));
    };

    const addLine = () => setLines((prev) => [...prev, emptyLine()]);

    const handleSelectProduct = (key, product) => {
        if (!product) {
            updateLine(key, { stock_id: null, units_id: null });
            return;
        }
        updateLine(key, {
            stock_id: product.id,
            units_id: product.units_id || null,
            detalle: product.name,
            precio_unitario: product.cost ? Number(product.cost) : '',
            unidad: unitLabel(product)
        });
    };

    const startNewOrder = () => {
        setEditing(null);
        setError('');
        setHeader({ fecha: new Date().toISOString().slice(0, 10), rubro: '', tipo: 'MATERIALES', notas: '' });
        setLines([emptyLine()]);
        setView('form');
    };

    const fetchOrder = async (orderId) => {
        const res = await Api.get(`/supplier-orders/${orderId}`);
        return res.data;
    };

    const startEditOrder = async (order) => {
        setError('');
        let fullOrder = order;
        try {
            fullOrder = await fetchOrder(order.id);
        } catch {
            mostrarError('No se pudo cargar el pedido.', theme);
            return;
        }
        setEditing(fullOrder);
        setHeader({
            fecha: fullOrder.fecha ? String(fullOrder.fecha).slice(0, 10) : new Date().toISOString().slice(0, 10),
            rubro: fullOrder.rubro || '',
            tipo: fullOrder.tipo || 'MATERIALES',
            notas: fullOrder.notas || ''
        });
        setLines((fullOrder.details || []).map((detail) => ({
            key: `${fullOrder.id}-${detail.id}`,
            stock_id: detail.stock_id || null,
            units_id: detail.units_id || null,
            cantidad: Number(detail.cantidad),
            unidad: detail.unidad || '',
            detalle: detail.detalle || '',
            precio_unitario: Number(detail.precio_unitario),
            importe: Number(detail.importe)
        })));
        setView('form');
    };

    const buildPayload = () => ({
        fecha: header.fecha,
        rubro: header.rubro,
        tipo: header.tipo,
        notas: header.notas,
        supplier_id: supplier.id,
        details: lines.map((line) => ({
            stock_id: line.stock_id,
            units_id: line.units_id,
            cantidad: Number(line.cantidad) || 0,
            unidad: line.unidad,
            detalle: line.detalle,
            precio_unitario: Number(line.precio_unitario) || 0
        }))
    });

    const handleSave = async (printAfter = false) => {
        if (!header.fecha) {
            setError('Ingresá la fecha del pedido.');
            return;
        }
        const validLines = lines.filter((line) => String(line.detalle || '').trim() !== '');
        if (validLines.length === 0) {
            setError('Agregá al menos un ítem al pedido.');
            return;
        }
        const invalid = validLines.find((line) => !(Number(line.cantidad) > 0) || !(Number(line.precio_unitario) >= 0));
        if (invalid) {
            setError('Revisá cantidad y precio unitario de los ítems.');
            return;
        }

        try {
            const saved = await mutateAsync({
                url: editing ? `/supplier-orders/${editing.id}` : '/supplier-orders',
                method: editing ? 'put' : 'post',
                values: buildPayload(),
                showSuccessAlert: false
            });
            mostrarExito(editing ? 'Pedido actualizado correctamente.' : 'Pedido creado correctamente.', theme);
            await refetch();
            onChanged?.();
            if (printAfter) {
                printSupplierOrder({ ...saved, supplier }, businessConfig);
            }
            setView('list');
            setEditing(null);
        } catch {
            return;
        }
    };

    const handleVoid = (order) => {
        confirmAction(async () => {
            try {
                await mutateAsync({
                    url: `/supplier-orders/${order.id}`,
                    method: 'delete',
                    values: {},
                    showSuccessAlert: false
                });
                mostrarExito('Pedido anulado correctamente.', theme);
                await refetch();
                onChanged?.();
            } catch {
                return;
            }
        }, () => {}, `¿Anular el pedido Nº ${orderNumber(order)}?`, theme);
    };

    const handlePrint = async (order) => {
        try {
            const fullOrder = await fetchOrder(order.id);
            printSupplierOrder(fullOrder, businessConfig);
        } catch {
            mostrarError('No se pudo cargar el pedido para imprimir.', theme);
        }
    };

    const renderList = () => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>Pedidos al proveedor</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Documentos para imprimir y enviar. No mueven stock ni generan saldo.
                    </Typography>
                </Box>
                {tienePermiso('accion_crear_pedido_proveedor') && (
                    <StyledButton variant="contained" startIcon={<AddIcon />} onClick={startNewOrder}>
                        Nuevo pedido
                    </StyledButton>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Nº</TableCell>
                            <TableCell align="center">Fecha</TableCell>
                            <TableCell align="left">Rubro</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Este proveedor todavía no tiene pedidos.</TableCell>
                            </TableRow>
                        ) : orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell align="center">{orderNumber(order)}</TableCell>
                                <TableCell align="center">{formatDate(order.fecha)}</TableCell>
                                <TableCell align="left">{order.rubro || '-'}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        size="small"
                                        label={order.estado === 'anulado' ? 'Anulado' : 'Emitido'}
                                        color={order.estado === 'anulado' ? 'error' : 'success'}
                                    />
                                </TableCell>
                                <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Imprimir / PDF">
                                        <IconButton size="small" color="primary" onClick={() => handlePrint(order)}>
                                            <PrintIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {order.estado !== 'anulado' && tienePermiso('accion_editar_pedido_proveedor') && (
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => startEditOrder(order)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {order.estado !== 'anulado' && tienePermiso('accion_anular_pedido_proveedor') && (
                                        <Tooltip title="Anular">
                                            <IconButton size="small" color="error" onClick={() => handleVoid(order)}>
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
    );

    const renderForm = () => (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {editing ? `Editar pedido Nº ${orderNumber(editing)}` : 'Nuevo pedido'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Proveedor: {supplier?.nombre}
                    </Typography>
                </Box>
                <StyledButton variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setView('list')}>
                    Volver
                </StyledButton>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                    <TextFieldWithClear
                        name="fecha"
                        label="Fecha *"
                        type="date"
                        fullWidth
                        size="small"
                        value={header.fecha}
                        onChange={(event) => setHeader((prev) => ({ ...prev, fecha: event.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextFieldWithClear
                        name="tipo"
                        label="Tipo de pedido"
                        fullWidth
                        size="small"
                        value={header.tipo}
                        onChange={(event) => setHeader((prev) => ({ ...prev, tipo: event.target.value }))}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Autocomplete
                        freeSolo
                        options={rubroOptions}
                        value={header.rubro}
                        onChange={(_event, value) => setHeader((prev) => ({ ...prev, rubro: value || '' }))}
                        renderInput={(params) => <TextField {...params} label="Rubro" size="small" />}
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mb: 1 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ width: 110 }}>Cantidad</TableCell>
                            <TableCell align="center" sx={{ width: 100 }}>UND.</TableCell>
                            <TableCell>Detalle</TableCell>
                            <TableCell align="right" sx={{ width: 140 }}>Precio unit.</TableCell>
                            <TableCell align="right" sx={{ width: 140 }}>Importe</TableCell>
                            <TableCell align="center" sx={{ width: 60 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lines.map((line) => (
                            <TableRow key={line.key}>
                                <TableCell>
                                    <TextFieldWithClear
                                        name={`cantidad_${line.key}`}
                                        type="number"
                                        size="small"
                                        value={line.cantidad}
                                        onChange={(event) => updateLine(line.key, { cantidad: event.target.value })}
                                        onClear={() => updateLine(line.key, { cantidad: '' })}
                                        inputProps={{ min: 0, step: '0.001' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {line.stock_id ? (
                                        <TextField
                                            size="small"
                                            value={line.unidad || ''}
                                            disabled
                                            InputProps={{ readOnly: true }}
                                        />
                                    ) : (
                                        <TextField
                                            select
                                            size="small"
                                            value={line.units_id || ''}
                                            onChange={(event) => {
                                                const unitId = event.target.value ? Number(event.target.value) : null;
                                                const unit = unitList.find((item) => Number(item.id) === unitId);
                                                updateLine(line.key, {
                                                    units_id: unitId,
                                                    unidad: unit ? unitOptionLabel(unit).split(' (')[0] : ''
                                                });
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>Unidad</em>
                                            </MenuItem>
                                            {unitList.map((unit) => (
                                                <MenuItem key={unit.id} value={unit.id}>{unitOptionLabel(unit)}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Autocomplete
                                        freeSolo
                                        options={productList}
                                        getOptionLabel={(option) => (typeof option === 'string' ? option : option?.name || '')}
                                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                        onChange={(_event, value) => {
                                            if (typeof value === 'string') {
                                                updateLine(line.key, { detalle: value, stock_id: null });
                                            } else {
                                                handleSelectProduct(line.key, value);
                                            }
                                        }}
                                        onInputChange={(_event, value, reason) => {
                                            if (reason === 'input') {
                                                updateLine(line.key, { detalle: value });
                                            }
                                        }}
                                        inputValue={line.detalle}
                                        renderInput={(params) => <TextField {...params} size="small" placeholder="Buscar producto o escribir el detalle" />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextFieldWithClear
                                        name={`precio_${line.key}`}
                                        type="number"
                                        size="small"
                                        value={line.precio_unitario}
                                        onChange={(event) => updateLine(line.key, { precio_unitario: event.target.value })}
                                        onClear={() => updateLine(line.key, { precio_unitario: '' })}
                                        inputProps={{ min: 0, step: '0.01' }}
                                    />
                                </TableCell>
                                <TableCell align="right">{formatCurrency(calculateImporte(line))}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Quitar ítem">
                                        <IconButton size="small" color="error" onClick={() => removeLine(line.key)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={addLine}>
                    Agregar ítem
                </StyledButton>
                <Typography variant="h6">
                    TOTAL: <strong>{formatCurrency(total)}</strong>
                </Typography>
            </Box>

            <TextFieldWithClear
                name="notas"
                label="Notas"
                fullWidth
                size="small"
                multiline
                minRows={2}
                value={header.notas}
                onChange={(event) => setHeader((prev) => ({ ...prev, notas: event.target.value }))}
            />

            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>
            )}
        </>
    );

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                <Box>
                    <Typography variant="h6">Pedidos</Typography>
                    <Typography variant="body2" color="text.secondary">{supplier?.nombre}</Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: 'background.paper', pt: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    view === 'list' ? renderList() : renderForm()
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                {view === 'list' ? (
                    <StyledButton variant="outlined" onClick={onClose}>Cerrar</StyledButton>
                ) : (
                    <>
                        <StyledButton variant="outlined" onClick={() => setView('list')}>Cancelar</StyledButton>
                        <StyledButton
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => handleSave(true)}
                            disabled={isPending}
                        >
                            Guardar e imprimir
                        </StyledButton>
                        <StyledButton
                            variant="contained"
                            startIcon={isPending ? <CircularProgress size={20} /> : <SaveAsIcon />}
                            onClick={() => handleSave(false)}
                            disabled={isPending}
                        >
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </StyledButton>
                    </>
                )}
            </DialogActions>
        </StyledDialog>
    );
};

SupplierOrdersModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    supplier: PropTypes.object,
    onChanged: PropTypes.func
};

export default SupplierOrdersModal;
