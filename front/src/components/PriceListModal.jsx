import { Fragment, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    Box,
    Checkbox,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {
    Clear as ClearIcon,
    Close as CloseIcon,
    Print as PrintIcon
} from '@mui/icons-material';

import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { UseFetchQuery } from '../hooks/useQuery';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { printPriceList } from '../functions/printPriceList';

const DEFAULT_FILTERS = {
    search: '',
    category: '',
    onlyWithStock: true,
    onlyWithPrice: true,
    includePresentations: true,
    includeCombos: false,
    showStock: false
};

const getProducts = (data) => {
    if (Array.isArray(data)) return data;
    return data?.products || [];
};

const getCombos = (data) => {
    if (Array.isArray(data)) return data;
    return [];
};

const allowsDecimalStock = (product) => {
    const flag = product?.permite_decimales;
    if (flag !== null && flag !== undefined) {
        return flag === true || Number(flag) === 1;
    }
    return product?.tipo_venta === 'pesable';
};

const formatStock = (value, decimal = false) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return number.toLocaleString('es-AR', {
        maximumFractionDigits: decimal ? 3 : 0
    });
};

const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '$ 0,00';
    return number.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const PriceListModal = ({ open, onClose }) => {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const { isOnline } = useOnlineStatus();

    const {
        data: stockData,
        isLoading: stockLoading,
        error: stockError,
        refetch: refetchStock
    } = UseFetchQuery('priceListStock', '/stock?unpaginated=true', open);

    const {
        data: combosData,
        isLoading: combosLoading,
        error: combosError
    } = UseFetchQuery(
        'priceListCombos',
        '/combos?is_active=true',
        open && filters.includeCombos
    );

    const { data: businessConfig } = UseFetchQuery(
        'businessConfig',
        '/business-config',
        open
    );

    const products = useMemo(() => getProducts(stockData), [stockData]);

    const categories = useMemo(() => {
        return [...new Set(
            products
                .map(product => product.categoryName?.trim())
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, 'es'));
    }, [products]);

    const filteredProducts = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        return products
            .filter((product) => {
                if (filters.onlyWithStock && Number(product.stock) <= 0) return false;
                if (filters.category && product.categoryName !== filters.category) return false;
                if (!search) return true;

                const name = String(product.name || '').toLowerCase();
                const barcode = String(product.barcode || '').toLowerCase();
                return name.includes(search) || barcode.includes(search);
            })
            .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'));
    }, [products, filters]);

    const groups = useMemo(() => {
        const grouped = new Map();

        filteredProducts.forEach((product) => {
            const rows = [];
            const basePrice = Number(product.price);
            const baseStock = Number(product.stock);
            const productName = product.name || 'Sin nombre';

            if (!filters.onlyWithPrice || basePrice > 0) {
                rows.push({
                    productName,
                    presentationName: '',
                    price: basePrice,
                    stockLabel: formatStock(product.stock, allowsDecimalStock(product)),
                    isCombo: false
                });
            }

            if (filters.includePresentations) {
                (product.presentations || []).forEach((presentation) => {
                    const presentationPrice = Number(presentation.price);
                    if (filters.onlyWithPrice && presentationPrice <= 0) return;

                    const factor = Number(presentation.quantity_in_base_units);
                    const available = factor > 0 && Number.isFinite(baseStock)
                        ? Math.floor(baseStock / factor)
                        : null;

                    if (filters.onlyWithStock && (!available || available <= 0)) return;

                    rows.push({
                        productName,
                        presentationName: presentation.name || 'Presentación',
                        price: presentationPrice,
                        stockLabel: available === null ? '—' : formatStock(available),
                        isCombo: false
                    });
                });
            }

            if (!rows.length) return;

            const categoryName = product.categoryName?.trim() || 'Sin categoría';
            if (!grouped.has(categoryName)) grouped.set(categoryName, []);
            grouped.get(categoryName).push(...rows);
        });

        const result = [...grouped.entries()]
            .map(([name, items]) => ({ name, items }))
            .sort((a, b) => a.name.localeCompare(b.name, 'es'));

        if (filters.includeCombos) {
            const search = filters.search.trim().toLowerCase();
            const comboRows = getCombos(combosData)
                .filter((combo) => {
                    const comboPrice = Number(combo.price);
                    if (filters.onlyWithPrice && comboPrice <= 0) return false;
                    if (!search) return true;
                    return String(combo.name || '').toLowerCase().includes(search);
                })
                .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'))
                .map((combo) => ({
                    productName: combo.name || 'Combo',
                    presentationName: '',
                    price: Number(combo.price),
                    stockLabel: '—',
                    isCombo: true
                }));

            if (comboRows.length) {
                result.push({ name: 'Combos', items: comboRows });
            }
        }

        return result;
    }, [filteredProducts, filters, combosData]);

    const totalItems = useMemo(
        () => groups.reduce((total, group) => total + group.items.length, 0),
        [groups]
    );

    const hasPresentations = useMemo(
        () => groups.some(group => group.items.some(item => item.presentationName)),
        [groups]
    );

    const previewGroups = useMemo(() => {
        let remaining = 200;
        const preview = [];

        for (const group of groups) {
            if (remaining <= 0) break;
            const items = [];

            for (const item of group.items) {
                if (remaining <= 0) break;
                items.push(item);
                remaining -= 1;
            }

            if (items.length) preview.push({ ...group, items });
        }

        return preview;
    }, [groups]);

    const previewCount = useMemo(
        () => previewGroups.reduce((total, group) => total + group.items.length, 0),
        [previewGroups]
    );

    const updateFilter = (name, value) => {
        setFilters(previous => ({ ...previous, [name]: value }));
    };

    const handlePrint = () => {
        if (!groups.length) return;

        printPriceList({
            groups,
            businessConfig,
            showStock: filters.showStock,
            includeCombos: filters.includeCombos,
            totalItems
        });
    };

    const printDisabled = stockLoading
        || Boolean(stockError)
        || totalItems === 0
        || (filters.includeCombos && combosLoading)
        || (filters.includeCombos && Boolean(combosError));

    const previewColumnCount = 1
        + (hasPresentations ? 1 : 0)
        + (filters.showStock ? 1 : 0)
        + 1;

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                Lista de precios
                <IconButton onClick={onClose} size="small">
                    <CloseIcon color="error" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: 'background.paper' }}>
                <Typography variant="body2" color="text.secondary">
                    Lista para uso interno. Se imprime en A4 y se puede guardar como PDF desde el diálogo de impresión.
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                        mt: 2
                    }}
                >
                    <StyledTextField
                        label="Buscar producto"
                        value={filters.search}
                        onChange={(event) => updateFilter('search', event.target.value)}
                        placeholder="Nombre o código de barras"
                        InputProps={{
                            endAdornment: filters.search ? (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => updateFilter('search', '')} size="small">
                                        <ClearIcon color="error" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }}
                    />
                    <StyledTextField
                        select
                        label="Categoría"
                        value={filters.category}
                        onChange={(event) => updateFilter('category', event.target.value)}
                    >
                        <MenuItem value="">Todas las categorías</MenuItem>
                        {categories.map(category => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                    </StyledTextField>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1.5 }, mt: 1 }}>
                    <FormControlLabel
                        control={<Checkbox size="small" checked={filters.onlyWithStock} onChange={(event) => updateFilter('onlyWithStock', event.target.checked)} />}
                        label="Solo con stock"
                    />
                    <FormControlLabel
                        control={<Checkbox size="small" checked={filters.onlyWithPrice} onChange={(event) => updateFilter('onlyWithPrice', event.target.checked)} />}
                        label="Solo con precio"
                    />
                    <FormControlLabel
                        control={<Checkbox size="small" checked={filters.includePresentations} onChange={(event) => updateFilter('includePresentations', event.target.checked)} />}
                        label="Incluir presentaciones"
                    />
                    <FormControlLabel
                        control={<Checkbox size="small" checked={filters.includeCombos} onChange={(event) => updateFilter('includeCombos', event.target.checked)} />}
                        label="Incluir combos"
                    />
                    <FormControlLabel
                        control={<Checkbox size="small" checked={filters.showStock} onChange={(event) => updateFilter('showStock', event.target.checked)} />}
                        label="Mostrar columna stock"
                    />
                </Box>

                {!isOnline && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                        Sin conexión: la lista se genera con los datos locales disponibles.
                    </Alert>
                )}

                {stockError && (
                    <Alert
                        severity="error"
                        sx={{ mt: 1 }}
                        action={(
                            <StyledButton color="inherit" size="small" onClick={() => refetchStock()}>
                                Reintentar
                            </StyledButton>
                        )}
                    >
                        No se pudieron cargar los productos.
                    </Alert>
                )}

                {filters.includeCombos && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                        Los combos se incluyen solo si están activos. El filtro de stock no valida sus componentes.
                    </Alert>
                )}

                {filters.includeCombos && combosError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        No se pudieron cargar los combos.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                    <Typography variant="subtitle1">Vista previa</Typography>
                    <Typography variant="body2" color="text.secondary">{totalItems} ítems</Typography>
                </Box>

                {stockLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : totalItems === 0 ? (
                    <Alert severity="info">No hay productos que coincidan con los filtros seleccionados.</Alert>
                ) : (
                    <>
                        <Box sx={{ maxHeight: 360, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Producto</TableCell>
                                        {hasPresentations && <TableCell>Presentación</TableCell>}
                                        {filters.showStock && <TableCell align="right">Stock</TableCell>}
                                        <TableCell align="right">Precio</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewGroups.map((group, groupIndex) => (
                                        <Fragment key={`group-${group.name}-${groupIndex}`}>
                                            <TableRow>
                                                <TableCell
                                                    colSpan={previewColumnCount}
                                                    sx={{ backgroundColor: 'action.hover', fontWeight: 700 }}
                                                >
                                                    {group.name}
                                                </TableCell>
                                            </TableRow>
                                            {group.items.map((item, index) => (
                                                <TableRow key={`${group.name}-${groupIndex}-${item.productName}-${item.presentationName}-${index}`}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    {hasPresentations && <TableCell>{item.presentationName || '—'}</TableCell>}
                                                    {filters.showStock && <TableCell align="right">{item.stockLabel}</TableCell>}
                                                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                        {totalItems > previewCount && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Vista previa de {previewCount} de {totalItems} ítems. La impresión incluye todos.
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <StyledButton variant="outlined" color="secondary" onClick={onClose}>
                    Cerrar
                </StyledButton>
                <StyledButton
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    disabled={printDisabled}
                >
                    Imprimir / Guardar PDF
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

PriceListModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default PriceListModal;
