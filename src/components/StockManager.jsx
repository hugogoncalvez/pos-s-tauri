import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';
import validator from 'validator';
import moment from 'moment';

import Grid from '@mui/material/Unstable_Grid2';
import {
    Autocomplete,
    Box,
    Typography,
    IconButton,
    InputAdornment,
    Tooltip,
    MenuItem,
    Menu,
    FormControlLabel,
    Checkbox,
    DialogTitle,
    DialogContent,
    Paper
} from '@mui/material';
import {
    Clear as ClearIcon,
    Edit as EditIcon,
    DeleteForever as DeleteForeverIcon,
    SaveAs as SaveAsIcon,
    KeyboardArrowDown,
    Close as CloseIcon
} from '@mui/icons-material';

import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { NewSupplierModal } from '../styledComponents/NewSupplierModal';
import { StyledTableRow, StyledTableCell } from '../styles/styles';

import { ProductModalContent } from '../styledComponents/ProductModalContent';

import { useForm } from '../hooks/useForm';
import { UseFetchQuery, UseQueryWithCache } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { Update } from '../hooks/useUpdate';
import { useDelete } from '../hooks/useDelete';
import { confirmAction } from '../functions/ConfirmDelete';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarCarga } from '../functions/mostrarCarga';
import StockManagerSkeleton from '../styledComponents/skeletons/StockManagerSkeleton';

moment.locale('es');

const StockManager = () => {
    const theme = useTheme();
    const barcodeInputRef = useRef(null);

    // --- Estados para el formulario principal de producto ---
    const [guardando, setGuardando] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [barcodeError, setBarcodeError] = useState(""); // New state for barcode validation error

    // --- Estados para la tabla de productos ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalRows, setTotalRows] = useState(0);
    const [filters, handleFilterChange, resetFilters] = useForm({
        name: '',
        barcode: '',
        category_id: '',
        supplier_id: '',
        tipo_venta: '',
        low_stock: false
    });

    const [nameInputValue, setNameInputValue] = useState(filters.name || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (nameInputValue !== filters.name) {
                handleFilterChange({ target: { name: 'name', value: nameInputValue } });
                setPage(0);
            }
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [nameInputValue]);

    useEffect(() => {
        // Sync input when filters are cleared externally
        if (filters.name === '' && nameInputValue !== '') {
            setNameInputValue('');
        }
    }, [filters.name]);

    const tipoVentaOptions = [
        { value: '', label: 'Todos' },
        { value: 'unitario', label: 'Unitario' },
        { value: 'pesable', label: 'Pesable' }
    ];

    // --- Estados para la visibilidad de secciones y modales ---
    const [openFilterSection, setOpenFilterSection] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    // --- Estados para la visibilidad de columnas ---
    const [columnVisibility, setColumnVisibility] = useState({
        barcode: true,
        categoryName: true,
        name: true,
        description: false,
        stock: true,
        min_stock: true,
        unitName: false,
        tipo_venta: true,
        supplierName: false,
        updatedAt: true,
        cost: false,
        price: true,
        actions: true,
    });
    const [anchorEl, setAnchorEl] = useState(null);

    const calculateEAN13CheckDigit = (ean13) => {
        if (!ean13 || ean13.length !== 12 || !/^\d+$/.test(ean13)) {
            return null; // Invalid input
        }

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(ean13[i], 10);
            sum += i % 2 === 0 ? digit : digit * 3;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit;
    };

    const calculateEAN8CheckDigit = (ean8) => {
        if (!ean8 || ean8.length !== 7 || !/^\d+$/.test(ean8)) {
            return null; // Invalid input
        }

        let sum = 0;
        for (let i = 0; i < 7; i++) {
            const digit = parseInt(ean8[i], 10);
            sum += i % 2 === 0 ? digit * 3 : digit;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit;
    };

    const handleCloseProductModal = useCallback(() => {
        setProductModalOpen(false);
        setUpdating(false);
        setSelectedProduct(null);
        setBarcodeError("");
    }, []);

    // --- Queries de datos ---
    const { data: categoriesData, isLoading: isLoadingCategories } = UseQueryWithCache('categories', '/category', true, 0, { keepPreviousData: true });
    const { data: units, isLoading: unitsLoading } = UseFetchQuery('units', '/units');
    const { data: suppliersData, isLoading: isLoadingSuppliers, refetch: refetchSuppliers } = UseQueryWithCache('suppliers', '/suppliers', true, 0, { keepPreviousData: true });

    const stockQueryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filters.name && { name: filters.name }),
        ...(filters.barcode && { barcode: filters.barcode }),
        ...(filters.category_id && { category_id: filters.category_id }),
        ...(filters.supplier_id && { supplier_id: filters.supplier_id }),
        ...(filters.tipo_venta && { tipo_venta: filters.tipo_venta }),
        ...(filters.low_stock && { low_stock: filters.low_stock }),
    }).toString();

    const { data: stockData, isLoading: isLoadingStock, refetch: refetchStock } = UseFetchQuery(
        ['stock', stockQueryParams],
        `/stock?${stockQueryParams}`,
        true
    );

    // --- Mutaciones ---
    const { mutateAsync: newProductStock, isLoading: isSubmittingNew } = useSubmit('newProductStock');
    const { mutateAsync: updateProductStock, isLoading: isSubmittingUpdate } = Update('updateProductStock');
    const { mutateAsync: deleteProductStock, isLoading: isDeleting } = useDelete('deleteProductStock');

    // --- Efectos ---
    useEffect(() => {
        if (stockData) {
            setTotalRows(stockData.pagination?.total || 0);
        }
    }, [stockData]);

    useEffect(() => {
        setGuardando(isSubmittingNew || isSubmittingUpdate || isDeleting);
    }, [isSubmittingNew, isSubmittingUpdate, isDeleting]);

    useEffect(() => {
        if (productModalOpen) {
            const timer = setTimeout(() => {
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [productModalOpen]);

    // --- Handlers de UI ---
    const handleOpenProductModal = (product = null) => {
        if (product) {
            setUpdating(true);
            setSelectedProduct(product);
        } else {
            setUpdating(false);
            setSelectedProduct(null);
        }
        setProductModalOpen(true);
    };

    const handleSaveProduct = async (finalValues) => {
        if (barcodeError) {
            mostrarError(barcodeError, theme);
            return;
        }

        mostrarCarga('Guardando Producto...', theme);

        try {
            let successMessage = '';
            if (updating) {
                await updateProductStock({ url: `/upstock/${finalValues.id}`, datos: finalValues, showSuccessAlert: false });
                successMessage = 'Producto actualizado con éxito!';
            } else {
                await newProductStock({ url: '/stock', values: finalValues, showSuccessAlert: false });
                successMessage = 'Producto guardado con éxito!';
            }

            refetchStock();

            Swal.close();
            mostrarExito(successMessage, theme);

            handleCloseProductModal();

        } catch (error) {
            Swal.close();
            mostrarError(error.response?.data?.message || 'Hubo un error al guardar el producto.', theme);
        }
    };

    const handleDeleteProduct = (product) => {
        confirmAction(async () => {
            try {
                await deleteProductStock({ url: `/stock/${product.id}` });
                mostrarExito('Producto eliminado con éxito!', theme);
                refetchStock();
            } catch (error) {
                mostrarError(error.response?.data?.message || 'Hubo un error al eliminar el producto.', theme);
            }
        });
    };

    // --- Columnas para EnhancedTable ---
    const allColumns = useMemo(() => [
        { id: 'barcode', label: 'Código', align: 'center' },
        { id: 'name', label: 'Producto', align: 'center' },
        { id: 'description', label: 'Descripción', align: 'center' },
        { id: 'categoryName', label: 'Categoría', align: 'center' },
        { id: 'stock', label: 'Stock', align: 'center', valueGetter: ({ row }) => formatQuantity(row.stock, row.tipo_venta) },
        { id: 'min_stock', label: 'Mínimo', align: 'center', valueGetter: ({ row }) => formatQuantity(row.min_stock, row.tipo_venta) },
        { id: 'unitName', label: 'Medida', align: 'center' },
        { id: 'tipo_venta', label: 'Tipo Venta', align: 'center' },
        { id: 'supplierName', label: 'Proveedor', align: 'center' },
        { id: 'price', label: 'Precio Venta', align: 'center', valueGetter: ({ row }) => formatCurrency(row.price) },
        { id: 'cost', label: 'Costo', align: 'center', valueGetter: ({ row }) => formatCurrency(row.cost) },
        { id: 'updatedAt', label: 'Actualizado', align: 'center', valueGetter: ({ row }) => moment(row.updatedAt).format('DD/MM/YYYY') },
        {
            id: 'actions', label: 'Acciones', align: 'center', valueGetter: ({ row }) => (
                <>
                    <Tooltip title='Editar Producto'>
                        <IconButton size='small' color='info' onClick={() => handleOpenProductModal(row)}>
                            <EditIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Eliminar Producto'>
                        <IconButton size='small' color='warning' onClick={() => handleDeleteProduct(row)}>
                            <DeleteForeverIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </>
            )
        },
    ], []);

    const visibleColumns = useMemo(() => allColumns.filter(col => columnVisibility[col.id]), [allColumns, columnVisibility]);

    // --- Funciones de Formato ---
    const formatQuantity = (value, tipo_venta) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        if (tipo_venta === 'pesable') return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return num.toLocaleString('es-AR', { maximumFractionDigits: 2 });
    };

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const renderCustomRow = (row, index) => {
        const stock = parseFloat(row.stock);
        const minStock = parseFloat(row.min_stock);
        const isLowStock = !isNaN(stock) && !isNaN(minStock) && minStock > 0 && stock <= minStock;

        return (
            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id || index} >
                {visibleColumns.map((column) => {
                    const value = column.valueGetter ? column.valueGetter({ row }) : row[column.id];
                    return (
                        <StyledTableCell
                            key={column.id}
                            align={column.align || 'center'}
                            sx={isLowStock ? { color: theme.palette.warning.dark } : {}}
                        >
                            {value}
                        </StyledTableCell>
                    );
                })}
            </StyledTableRow>
        );
    };

    const isLoading = isLoadingStock || isLoadingCategories || unitsLoading || isLoadingSuppliers;
    const isInitialLoading = !stockData && isLoadingStock;

    if (isInitialLoading) {
        return <StockManagerSkeleton />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2, background: (theme) => theme.palette.background.componentHeaderBackground, color: theme.palette.primary.contrastText }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography variant="h4" gutterBottom>Gestión de Productos</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Administra el inventario de tu negocio</Typography>
                    </Grid>
                    <Grid>
                        <StyledButton variant="outlined" onClick={() => handleOpenProductModal()} startIcon={<SaveAsIcon />}>
                            Nuevo Producto
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            {/* Sección de Filtros */}
            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">Filtros</Typography>
                    <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                        <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                    </IconButton>
                </Grid>
                <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                    <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                        {/* Columna para filtros de la tabla */}
                        <Grid xs={12}>
                            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2, height: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom>Filtrar Tabla</Typography>
                                <Grid container spacing={2}>
                                    <Grid xs={12} sm={6} md={4}>
                                        <StyledTextField
                                            label="Nombre"
                                            name="name"
                                            value={nameInputValue}
                                            onChange={(e) => setNameInputValue(e.target.value)}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => setNameInputValue('')}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6} md={4}>
                                        <StyledTextField
                                            label="Código de Barras"
                                            name="barcode"
                                            value={filters.barcode || ''}
                                            onChange={(e) => { handleFilterChange(e); setPage(0); }}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleFilterChange({ target: { name: 'barcode', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6} md={4}>
                                        <StyledAutocomplete
                                            options={Array.isArray(categoriesData) ? categoriesData : []}
                                            getOptionLabel={(option) => option.name || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            onChange={(event, value) => { handleFilterChange({ target: { name: 'category_id', value: value ? value.id : '' } }); setPage(0); }}
                                            value={(Array.isArray(categoriesData) && categoriesData.find(cat => cat.id === filters.category_id)) || null}
                                            renderInput={(params) => (
                                                <StyledTextField
                                                    {...params}
                                                    label="Categoría"
                                                    InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleFilterChange({ target: { name: 'category_id', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6} md={4}>
                                        <StyledAutocomplete
                                            options={Array.isArray(suppliersData) ? suppliersData : []}
                                            getOptionLabel={(option) => option.nombre || ''}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            onChange={(event, value) => { handleFilterChange({ target: { name: 'supplier_id', value: value ? value.id : '' } }); setPage(0); }}
                                            value={(Array.isArray(suppliersData) && suppliersData.find(sup => sup.id === filters.supplier_id)) || null}
                                            renderInput={(params) => (
                                                <StyledTextField
                                                    {...params}
                                                    label="Proveedor"
                                                    InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleFilterChange({ target: { name: 'supplier_id', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6} md={4}>
                                        <Autocomplete
                                            options={tipoVentaOptions}
                                            getOptionLabel={(option) => option.label}
                                            value={tipoVentaOptions.find(option => option.value === filters.tipo_venta) || null}
                                            onChange={(event, newValue) => { handleFilterChange({ target: { name: 'tipo_venta', value: newValue ? newValue.value : '' } }); setPage(0); }}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            renderInput={(params) => (
                                                <StyledTextField
                                                    {...params}
                                                    label="Tipo de Venta"
                                                    name="tipo_venta"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton onClick={() => handleFilterChange({ target: { name: 'tipo_venta', value: '' } })}>
                                                                    <ClearIcon color='error' />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid xs={12} sm={6} md={4}>
                                        <FormControlLabel
                                            control={<Checkbox checked={filters.low_stock || false} onChange={(e) => handleFilterChange({ target: { name: 'low_stock', value: e.target.checked } })} />}
                                            label="Mostrar solo con stock bajo"
                                        />
                                    </Grid>
                                    <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                        <StyledButton variant="outlined" color="secondary" onClick={() => { resetFilters(); setPage(0); }}>
                                            Limpiar Filtros
                                        </StyledButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </StyledCard>

            {/*Tabla de Productos */}
            <StyledCard sx={{ p: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Grid >
                        <Typography variant="h6" gutterBottom>Listado de Productos</Typography>
                    </Grid>
                    <Grid >
                        <StyledButton
                            aria-controls="columns-menu"
                            aria-haspopup="true"
                            onClick={(event) => setAnchorEl(event.currentTarget)}
                            variant="outlined"
                        >
                            Mostrar/Ocultar Columnas
                        </StyledButton>
                        <Menu
                            id="columns-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            {allColumns.map((column) => (
                                column.id !== 'actions' && (
                                    <MenuItem key={column.id}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!columnVisibility[column.id]}
                                                    onChange={(event) => {
                                                        setColumnVisibility({
                                                            ...columnVisibility,
                                                            [column.id]: event.target.checked,
                                                        });
                                                    }}
                                                />
                                            }
                                            label={column.label}
                                        />
                                    </MenuItem>
                                )
                            ))}
                        </Menu>
                    </Grid>
                </Grid>
                <EnhancedTable
                    columns={visibleColumns}
                    data={stockData?.products || []}
                    loading={isLoading}
                    count={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    renderRow={renderCustomRow}
                />
            </StyledCard>

            {/* Modal de Agregar/Editar Producto */}
            <StyledDialog
                open={productModalOpen}
                onClose={handleCloseProductModal}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    {updating ? 'Editar Producto' : 'Nuevo Producto'}
                    <IconButton onClick={handleCloseProductModal}><CloseIcon color="error" /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                    <Box sx={{ backgroundColor: 'background.dialog', p: 3 }}>
                        <ProductModalContent
                            product={selectedProduct}
                            onSaveProduct={handleSaveProduct}
                            onCancel={handleCloseProductModal}
                            barcodeInputRef={barcodeInputRef}
                            categoriesData={categoriesData}
                            unitsData={units}
                            suppliersData={suppliersData}
                            refetchSuppliers={refetchSuppliers}
                            setNewSupplierName={setNewSupplierName}
                            setSupplierDialogOpen={setSupplierDialogOpen}
                            formatCurrency={formatCurrency}
                            updating={updating}
                            guardando={guardando}
                        />
                    </Box>
                </DialogContent>
            </StyledDialog>

            <NewSupplierModal
                open={supplierDialogOpen}
                handleClose={() => setSupplierDialogOpen(false)}
                initialName={newSupplierName}
                onSupplierAdded={(newSupplier) => {
                    refetchSuppliers();
                    setSupplierDialogOpen(false);
                }}
            />
        </Box>
    );
};

export default StockManager;