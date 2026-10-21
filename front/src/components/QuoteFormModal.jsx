import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Autocomplete,
    Box,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker';
import { UseFetchQuery } from '../hooks/useQuery';
import { usePermissions } from '../hooks/usePermissions';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Api } from '../api/api';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const roundQuantity = (value) => Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

const createEmptyLine = () => ({
    key: `manual-${Date.now()}-${Math.random()}`,
    stock_id: null,
    presentation_id: null,
    product_name: '',
    presentation_name: null,
    unit_name: '',
    quantity: 1,
    unit_price: 0,
    cost: null,
    is_manual_entry: true,
});

const mapQuoteLine = (line) => ({
    key: `quote-${line.id || `${Date.now()}-${Math.random()}`}`,
    stock_id: line.stock_id || null,
    presentation_id: line.presentation_id || null,
    product_name: line.product_name || '',
    presentation_name: line.presentation_name || null,
    unit_name: line.unit_name || '',
    quantity: Number(line.quantity) || 0,
    unit_price: Number(line.unit_price) || 0,
    cost: line.cost !== null && line.cost !== undefined ? Number(line.cost) : null,
    is_manual_entry: !line.stock_id,
});

const QuoteFormModal = ({ open, onClose, quote = null, onSaved }) => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const { isOnline } = useOnlineStatus();
    const isEditing = Boolean(quote?.id);
    const canCreateCustomer = tienePermiso('accion_crear_cliente');

    const [form, setForm] = useState({
        quote_date: moment(),
        valid_until: moment().add(15, 'days'),
        status: 'borrador',
        discount: 0,
        notes: '',
        terms: '',
    });
    const [selectedCustomer, setSelectedCustomer] = useState({ id: 1, name: 'Consumidor Final' });
    const [lines, setLines] = useState([]);
    const [productChoice, setProductChoice] = useState(null);
    const [saving, setSaving] = useState(false);
    const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
    const [creatingCustomer, setCreatingCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        dni: '',
        phone: '',
        address: '',
        email: '',
    });

    const { data: customersData, refetch: refetchCustomers } = UseFetchQuery(
        'customers',
        '/customers',
        open
    );
    const { data: stockData, isLoading: loadingProducts } = UseFetchQuery(
        'quoteProducts',
        '/stock?unpaginated=true',
        open
    );

    const customerOptions = useMemo(() => {
        const customers = Array.isArray(customersData) ? customersData : [];
        if (customers.some((customer) => Number(customer.id) === 1)) return customers;
        return [{ id: 1, name: 'Consumidor Final' }, ...customers];
    }, [customersData]);

    const productOptions = useMemo(() => {
        const products = stockData?.products || [];
        return products.flatMap((product) => {
            const baseOption = {
                key: `product-${product.id}`,
                label: product.name,
                stock_id: product.id,
                presentation_id: null,
                presentation_name: null,
                product_name: product.name,
                unit_name: product.unitAbbreviation || product.unitName || '',
                unit_price: Number(product.price) || 0,
                cost: product.cost !== null && product.cost !== undefined ? Number(product.cost) : null,
                type: 'product',
            };

            const presentationOptions = (product.presentations || [])
                .filter((presentation) => Number(presentation.price) >= 0)
                .map((presentation) => ({
                    key: `presentation-${presentation.id}`,
                    label: `${product.name} — ${presentation.name}`,
                    stock_id: product.id,
                    presentation_id: presentation.id,
                    presentation_name: presentation.name,
                    product_name: product.name,
                    unit_name: presentation.unitAbbreviation || presentation.unitName || product.unitAbbreviation || product.unitName || presentation.name,
                    unit_price: Number(presentation.price) || 0,
                    cost: product.cost !== null && product.cost !== undefined ? Number(product.cost) : null,
                    type: 'presentation',
                }));

            return [baseOption, ...presentationOptions];
        });
    }, [stockData]);

    useEffect(() => {
        if (!open) return;

        const quoteDate = quote?.quote_date ? moment(quote.quote_date) : moment();
        const validUntil = quote?.valid_until ? moment(quote.valid_until) : quoteDate.clone().add(15, 'days');

        setForm({
            quote_date: quoteDate,
            valid_until: validUntil,
            status: quote?.status === 'emitido' ? 'emitido' : 'borrador',
            discount: Number(quote?.discount) || 0,
            notes: quote?.notes || '',
            terms: quote?.terms || '',
        });
        setSelectedCustomer({
            id: quote?.customer_id || 1,
            name: quote?.customer_name || 'Consumidor Final',
        });
        setLines(Array.isArray(quote?.details) ? quote.details.map(mapQuoteLine) : []);
        setProductChoice(null);
        setQuickCustomerOpen(false);
        setNewCustomer({ name: '', dni: '', phone: '', address: '', email: '' });
    }, [open, quote]);

    const subtotal = useMemo(
        () => roundMoney(lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unit_price) || 0), 0)),
        [lines]
    );
    const discount = Math.min(Number(form.discount) || 0, subtotal);
    const total = roundMoney(subtotal - discount);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updateLine = (key, field, value) => {
        setLines((current) => current.map((line) => (
            line.key === key ? { ...line, [field]: value } : line
        )));
    };

    const removeLine = (key) => {
        setLines((current) => current.filter((line) => line.key !== key));
    };

    const addProductOption = (option) => {
        if (!option) return;
        const key = `product-${Date.now()}-${Math.random()}`;
        setLines((current) => [
            ...current,
            {
                key,
                stock_id: option.stock_id,
                presentation_id: option.presentation_id,
                product_name: option.product_name,
                presentation_name: option.presentation_name,
                unit_name: option.unit_name,
                quantity: 1,
                unit_price: option.unit_price,
                cost: option.cost,
                is_manual_entry: false,
            },
        ]);
        setProductChoice(null);
    };

    const addManualLine = () => {
        setLines((current) => [...current, createEmptyLine()]);
    };

    const handleCreateCustomer = async () => {
        if (String(newCustomer.name || '').trim().length < 2) {
            mostrarError('El nombre del cliente debe tener al menos 2 caracteres.', theme);
            return;
        }

        try {
            setCreatingCustomer(true);
            const payload = {
                name: newCustomer.name.trim(),
                credit_limit: 0,
                discount_percentage: 0,
            };
            if (newCustomer.dni.trim()) payload.dni = newCustomer.dni.trim();
            if (newCustomer.phone.trim()) payload.phone = newCustomer.phone.trim();
            if (newCustomer.address.trim()) payload.address = newCustomer.address.trim();
            if (newCustomer.email.trim()) payload.email = newCustomer.email.trim();

            const response = await Api.post('/customers', payload);
            const created = response.data?.data;
            await refetchCustomers();
            if (created) {
                setSelectedCustomer({ id: created.id, name: created.name });
            }
            setQuickCustomerOpen(false);
            setNewCustomer({ name: '', dni: '', phone: '', address: '', email: '' });
            mostrarExito('Cliente creado correctamente.', theme);
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo crear el cliente.', theme);
        } finally {
            setCreatingCustomer(false);
        }
    };

    const handleSave = async () => {
        if (!isOnline) {
            mostrarError('Los presupuestos requieren conexión a internet para guardarse.', theme);
            return;
        }
        if (!selectedCustomer?.id) {
            mostrarError('Seleccione un cliente.', theme);
            return;
        }
        if (lines.length === 0) {
            mostrarError('Agregue al menos un ítem al presupuesto.', theme);
            return;
        }
        const invalidLine = lines.find((line) => (
            !String(line.product_name || '').trim()
            || Number(line.quantity) <= 0
            || (line.presentation_id && !Number.isInteger(Number(line.quantity)))
            || Number(line.unit_price) < 0
        ));
        if (invalidLine) {
            mostrarError('Complete la descripción, una cantidad válida (entera para presentaciones) y un precio válido en todos los ítems.', theme);
            return;
        }
        if (!form.quote_date || !form.valid_until) {
            mostrarError('Complete las fechas del presupuesto.', theme);
            return;
        }
        if (form.valid_until.isBefore(form.quote_date, 'day')) {
            mostrarError('La fecha de validez no puede ser anterior a la fecha del presupuesto.', theme);
            return;
        }

        const payload = {
            customer_id: selectedCustomer.id,
            quote_date: form.quote_date.format('YYYY-MM-DD'),
            valid_until: form.valid_until.format('YYYY-MM-DD'),
            status: form.status,
            discount: Number(form.discount) || 0,
            notes: form.notes || null,
            terms: form.terms || null,
            details: lines.map((line) => ({
                stock_id: line.stock_id || null,
                presentation_id: line.presentation_id || null,
                product_name: String(line.product_name || '').trim(),
                presentation_name: line.presentation_name || null,
                unit_name: String(line.unit_name || '').trim() || null,
                quantity: roundQuantity(line.quantity),
                unit_price: roundMoney(line.unit_price),
                cost: line.cost ?? null,
            })),
        };

        try {
            setSaving(true);
            const response = isEditing
                ? await Api.put(`/quotes/${quote.id}`, payload)
                : await Api.post('/quotes', payload);
            mostrarExito(isEditing ? 'Presupuesto actualizado correctamente.' : 'Presupuesto creado correctamente.', theme);
            if (onSaved) onSaved(response.data?.quote);
            onClose();
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo guardar el presupuesto.', theme);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="lg">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isEditing ? `Editar ${quote.quote_number || 'presupuesto'}` : 'Nuevo presupuesto'}
                    <IconButton onClick={onClose} aria-label="Cerrar">
                        <CloseIcon color="error" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {!isOnline && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Sin conexión: no se pueden guardar presupuestos.
                        </Alert>
                    )}
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                                gap: 2,
                                mt: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={customerOptions}
                                    value={selectedCustomer}
                                    getOptionLabel={(option) => option?.name || ''}
                                    isOptionEqualToValue={(option, value) => Number(option.id) === Number(value?.id)}
                                    onChange={(_, value) => setSelectedCustomer(value || { id: 1, name: 'Consumidor Final' })}
                                    renderInput={(params) => (
                                        <StyledTextField {...params} label="Cliente" size="small" />
                                    )}
                                />
                                {canCreateCustomer && (
                                    <IconButton
                                        color="primary"
                                        onClick={() => setQuickCustomerOpen(true)}
                                        title="Crear cliente"
                                    >
                                        <PersonAddIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <StyledDatePicker
                                label="Fecha"
                                value={form.quote_date}
                                onChange={(value) => updateForm('quote_date', value)}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: 'small' } }}
                            />
                            <StyledDatePicker
                                label="Válido hasta"
                                value={form.valid_until}
                                onChange={(value) => updateForm('valid_until', value)}
                                format="DD/MM/YYYY"
                                slotProps={{ textField: { size: 'small' } }}
                            />
                        </Box>
                    </LocalizationProvider>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <Autocomplete
                            fullWidth
                            size="small"
                            options={productOptions}
                            loading={loadingProducts}
                            value={productChoice}
                            onChange={(_, value) => addProductOption(value)}
                            getOptionLabel={(option) => option?.label || ''}
                            isOptionEqualToValue={(option, value) => option.key === value?.key}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Agregar producto o presentación"
                                    size="small"
                                    placeholder="Buscar por nombre..."
                                />
                            )}
                        />
                        <StyledButton
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addManualLine}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Línea manual
                        </StyledButton>
                    </Box>

                    <Box sx={{ overflowX: 'auto' }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(220px, 2.2fr) 110px 100px 130px 120px 40px',
                                gap: 1,
                                alignItems: 'center',
                                px: 1,
                                py: 0.75,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">Descripción</Typography>
                            <Typography variant="caption" color="text.secondary">Unidad</Typography>
                            <Typography variant="caption" color="text.secondary">Cantidad</Typography>
                            <Typography variant="caption" color="text.secondary">Precio unit.</Typography>
                            <Typography variant="caption" color="text.secondary" align="right">Subtotal</Typography>
                            <span />
                        </Box>
                        {lines.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="body2">Agregue productos o una línea manual.</Typography>
                            </Box>
                        ) : lines.map((line) => (
                            <Box
                                key={line.key}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(220px, 2.2fr) 110px 100px 130px 120px 40px',
                                    gap: 1,
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.75,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Box>
                                    {line.is_manual_entry ? (
                                        <StyledTextField
                                            size="small"
                                            value={line.product_name}
                                            onChange={(event) => updateLine(line.key, 'product_name', event.target.value)}
                                            placeholder="Descripción del ítem"
                                        />
                                    ) : (
                                        <>
                                            <Typography variant="body2" fontWeight={600}>{line.product_name}</Typography>
                                            {line.presentation_name && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {line.presentation_name}
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                </Box>
                                {line.is_manual_entry ? (
                                    <StyledTextField
                                        size="small"
                                        value={line.unit_name}
                                        onChange={(event) => updateLine(line.key, 'unit_name', event.target.value)}
                                        placeholder="Unidad"
                                    />
                                ) : (
                                    <Typography variant="body2">{line.unit_name || '-'}</Typography>
                                )}
                                <StyledTextField
                                    size="small"
                                    type="number"
                                    value={line.quantity}
                                    onChange={(event) => updateLine(line.key, 'quantity', event.target.value)}
                                    inputProps={{ min: 0, step: line.presentation_id ? '1' : '0.001' }}
                                />
                                <StyledTextField
                                    size="small"
                                    type="number"
                                    value={line.unit_price}
                                    onChange={(event) => updateLine(line.key, 'unit_price', event.target.value)}
                                    inputProps={{ min: 0, step: '0.01' }}
                                />
                                <Typography variant="body2" fontWeight={600} align="right">
                                    {roundMoney((Number(line.quantity) || 0) * (Number(line.unit_price) || 0)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => removeLine(line.key)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
                            gap: 2,
                            mt: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <StyledTextField
                                label="Notas"
                                value={form.notes}
                                onChange={(event) => updateForm('notes', event.target.value)}
                                multiline
                                minRows={2}
                            />
                            <StyledTextField
                                label="Condiciones"
                                value={form.terms}
                                onChange={(event) => updateForm('terms', event.target.value)}
                                multiline
                                minRows={2}
                                placeholder="Ej: validez, forma de pago, plazo de entrega..."
                            />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <StyledTextField
                                select
                                label="Estado"
                                value={form.status}
                                onChange={(event) => updateForm('status', event.target.value)}
                            >
                                <MenuItem value="borrador">Borrador</MenuItem>
                                <MenuItem value="emitido">Emitido</MenuItem>
                            </StyledTextField>
                            <StyledTextField
                                label="Descuento general"
                                type="number"
                                value={form.discount}
                                onChange={(event) => updateForm('discount', event.target.value)}
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Subtotal</Typography>
                                    <Typography variant="body2">
                                        {subtotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Descuento</Typography>
                                    <Typography variant="body2">
                                        - {roundMoney(discount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton variant="outlined" onClick={onClose} disabled={saving}>
                        Cancelar
                    </StyledButton>
                    <StyledButton variant="contained" onClick={handleSave} disabled={saving || !isOnline}>
                        {saving ? 'Guardando...' : 'Guardar presupuesto'}
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            <StyledDialog
                open={quickCustomerOpen}
                onClose={() => setQuickCustomerOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Nuevo cliente</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1 }}>
                        <StyledTextField
                            label="Nombre"
                            required
                            value={newCustomer.name}
                            onChange={(event) => setNewCustomer((current) => ({ ...current, name: event.target.value }))}
                            sx={{ gridColumn: { sm: '1 / -1' } }}
                        />
                        <StyledTextField
                            label="DNI / CUIT"
                            value={newCustomer.dni}
                            onChange={(event) => setNewCustomer((current) => ({ ...current, dni: event.target.value }))}
                        />
                        <StyledTextField
                            label="Teléfono"
                            value={newCustomer.phone}
                            onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))}
                        />
                        <StyledTextField
                            label="Dirección"
                            value={newCustomer.address}
                            onChange={(event) => setNewCustomer((current) => ({ ...current, address: event.target.value }))}
                            sx={{ gridColumn: { sm: '1 / -1' } }}
                        />
                        <StyledTextField
                            label="Email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(event) => setNewCustomer((current) => ({ ...current, email: event.target.value }))}
                            sx={{ gridColumn: { sm: '1 / -1' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton variant="outlined" onClick={() => setQuickCustomerOpen(false)} disabled={creatingCustomer}>
                        Cancelar
                    </StyledButton>
                    <StyledButton variant="contained" onClick={handleCreateCustomer} disabled={creatingCustomer}>
                        {creatingCustomer ? 'Creando...' : 'Crear cliente'}
                    </StyledButton>
                </DialogActions>
            </StyledDialog>
        </>
    );
};

export default QuoteFormModal;

QuoteFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    quote: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        quote_number: PropTypes.string,
        quote_date: PropTypes.string,
        valid_until: PropTypes.string,
        status: PropTypes.string,
        discount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        notes: PropTypes.string,
        terms: PropTypes.string,
        customer_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        customer_name: PropTypes.string,
        details: PropTypes.arrayOf(PropTypes.object),
    }),
};
