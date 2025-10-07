import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    Autocomplete,
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Stack,
    InputAdornment,
    TablePagination,
    Pagination
} from '@mui/material';
import { StyledDialog } from './styledComponents/ui/StyledDialog';
import { StyledTextField } from './styledComponents/ui/StyledTextField';
import { StyledButton } from './styledComponents/ui/StyledButton';
import { StyledCard } from './styledComponents/ui/StyledCard';
import CustomerModalContent from './styledComponents/CustomerModalContent'; // Corrected import
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Payment as PaymentIcon,
    History as HistoryIcon,
    Download as DownloadIcon,
    Clear as ClearIcon,
    Person as PersonIcon,
    AccountBalance as AccountBalanceIcon,
    Print as PrintIcon,
    Close as CloseIcon,
    Receipt as ReceiptIcon,
    KeyboardArrowDown
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EnhancedTable } from './styledComponents/EnhancedTable';
import { MyFab } from './styledComponents/MyFab';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useForm } from './hooks/useForm';
import { AuthContext } from './context/AuthContext';
import { UseFetchQuery } from './hooks/useQuery';
import { useCustomerHistory } from './hooks/useCustomerHistory.jsx';
import { useCustomerList } from './hooks/useCustomerList';
import { usePermissions } from './hooks/usePermissions';

const Customers = () => {
    const { usuario } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { tienePermiso } = usePermissions();

    const {
        customers,
        isLoadingCustomers,
        isErrorCustomers,
        queryErrorCustomers,
        refetchCustomers,
        page,
        totalPages,
        totalItems,
        limit,
        search,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        debtStatus,
        openDialog,
        setOpenDialog,
        dialogMode,
        setDialogMode,
        selectedCustomer,
        setSelectedCustomer,
        singleCustomerData,
        isLoadingSingleCustomer,
        openPaymentDialog,
        setOpenPaymentDialog,
        openHistoryDialog,
        setOpenHistoryDialog,
        handleCreate,
        handleEdit,
        handleView,
        handleSave: handleSaveCustomerList, // Renamed to avoid conflict with local handleSave
        handleDelete,
        handleRegisterPayment,
        handleExportCSV,
        handleChangePage,
        handleChangeRowsPerPage,
        handleSearchChange,
        handleSortByChange,
        handleSortOrderChange,
        handleStartDateChange,
        handleEndDateChange,
        handleDebtStatusChange,
        handleClearFilters,
        error,
        success,
        setError,
        setSuccess,
        checkDuplicate,
        dniExistsError,
        emailExistsError,
    } = useCustomerList(tienePermiso);

    const { purchaseHistory, paymentHistory, loadingHistory, errorHistory, historyFilters, openPurchaseDetailDialog, setOpenPurchaseDetailDialog, openPaymentDetailDialog, setOpenPaymentDetailDialog, selectedPurchase, setSelectedPurchase, selectedPayment, setSelectedPayment, purchaseDetails, setPurchaseDetails, handleHistoryFilterChange, applyHistoryFilters, clearHistoryFilters, handleViewPurchaseDetail, handleViewPaymentDetail, handlePrintPurchase, handlePrintPayment, handlePrintDoublePaymentReceipt, setSaleIdForDetail } = useCustomerHistory(selectedCustomer?.id);

    const [visibleFab, setVisibleFab] = useState(false);
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const [openFilterSection, setOpenFilterSection] = useState(false);

    const sortByOptions = [
        { value: 'name', label: 'Nombre' },
        { value: 'createdAt', label: 'Fecha' },
        { value: 'debt', label: 'Deuda' },
    ];

    const sortOrderOptions = [
        { value: 'ASC', label: 'Ascendente' },
        { value: 'DESC', label: 'Descendente' },
    ];

    const debtStatusOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'with_debt', label: 'Con Deuda' },
        { value: 'no_debt', label: 'Sin Deuda' },
    ];

    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_method: 'efectivo',
        notes: ''
    });

    const handleSave = useCallback(async (formData, resetForm) => {
        await handleSaveCustomerList(formData, resetForm);
    }, [handleSaveCustomerList]);

    const columns = React.useMemo(() => [
        { id: 'id', label: 'ID', valueGetter: ({ row }) => row.id, align: 'center' },
        { id: 'name', label: 'Nombre', valueGetter: ({ row }) => row.name, align: 'left' },
        { id: 'email', label: 'Email', valueGetter: ({ row }) => row.email || '-', align: 'left' },
        { id: 'phone', label: 'Teléfono', valueGetter: ({ row }) => row.phone || '-', align: 'center' },
        { id: 'dni', label: 'DNI', valueGetter: ({ row }) => row.dni || '-', align: 'center' },
        {
            id: 'debt',
            label: 'Deuda',
            valueGetter: ({ row }) => {
                const debtValue = parseFloat(row?.debt || 0);
                return `${debtValue.toFixed(2)}`;
            },
            cellStyle: ({ row }) => {
                const debtValue = parseFloat(row?.debt || 0);
                return { color: debtValue > 0 ? 'error.main' : 'text.secondary' };
            },
            align: 'center'
        },
        {
            id: 'actions',
            label: 'Acciones',
            valueGetter: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalles">
                        <IconButton
                            size="small"
                            onClick={() => handleView(row)}
                            color="info"
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {tienePermiso('accion_editar_cliente') && (
                        <Tooltip title="Editar">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    handleEdit(row);
                                }}
                                color="primary"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso('accion_crear_venta') && (
                        <Tooltip title="Registrar pago">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setSelectedCustomer(row);
                                        setOpenPaymentDialog(true);
                                    }}
                                    color="success"
                                    disabled={parseFloat(row.debt || 0) <= 0}
                                >
                                    <PaymentIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                    <Tooltip title="Historial">
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedCustomer(row);
                                setOpenHistoryDialog(true);
                            }}
                            color="secondary"
                        >
                            <HistoryIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {tienePermiso('accion_eliminar_cliente') && !isMobile && (
                        <Tooltip title="Eliminar">
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(row)}
                                color="error"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
            align: 'center'
        }
    ], [handleView, handleEdit, setSelectedCustomer, setOpenPaymentDialog, setOpenHistoryDialog, handleDelete, isMobile, tienePermiso]);

    const memoizedTableData = React.useMemo(() => {
        return customers.map(customer => ({
            ...customer,
            email: customer.email || '-',
            phone: customer.phone || '-',
            dni: customer.dni || '-',
            debt: `${parseFloat(customer.debt || 0).toFixed(2)}`,
            actions: (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalles">
                        <IconButton
                            size="small"
                            onClick={() => handleView(customer)}
                            color="info"
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {tienePermiso('accion_editar_cliente') && (
                        <Tooltip title="Editar">
                            <IconButton
                                size="small"
                                onClick={() => {
                                    handleEdit(customer);
                                }}
                                color="primary"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso('accion_crear_venta') && (
                        <Tooltip title="Registrar pago">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setOpenPaymentDialog(true);
                                    }}
                                    color="success"
                                    disabled={parseFloat(customer.debt || 0) <= 0}
                                >
                                    <PaymentIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                    <Tooltip title="Historial">
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSelectedCustomer(customer);
                                setOpenHistoryDialog(true);
                            }}
                            color="secondary"
                        >
                            <HistoryIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {tienePermiso('accion_eliminar_cliente') && !isMobile && (
                        <Tooltip title="Eliminar">
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(customer)}
                                color="error"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }));
    }, [customers, handleView, handleEdit, setSelectedCustomer, setOpenPaymentDialog, setOpenHistoryDialog, handleDelete, isMobile, tienePermiso]);

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 3,
                        background: (theme) => theme.palette.background.componentHeaderBackground,
                        color: theme.palette.primary.contrastText
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                                Gestión de Clientes
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Administra tu base de clientes, registra pagos y consulta historiales
                            </Typography>
                        </Box>
                        {tienePermiso('accion_crear_cliente') && (
                            <StyledButton
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => handleCreate()} // Removed setFormData
                                size={isMobile ? "small" : "medium"}
                            >
                                Nuevo Cliente
                            </StyledButton>
                        )}
                    </Box>
                </Paper>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <StyledCard elevation={2} sx={{ p: 1, mb: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">Filtros de Clientes</Typography>
                        <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                            <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                        </IconButton>
                    </Grid>
                    <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                        <Grid container spacing={2} justifyContent="center" alignItems="flex-start" marginTop={1}>
                            <Grid item xs={12}>
                                <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                                    <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <StyledTextField
                                                    label="Fecha Desde"
                                                    type="date"
                                                    name="startDate"
                                                    value={startDate}
                                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                    autoComplete='off'
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton size='small' onClick={() => handleStartDateChange('')}>
                                                                    <ClearIcon fontSize='small' color='error' />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <StyledTextField
                                                    label="Fecha Hasta"
                                                    type="date"
                                                    name="endDate"
                                                    value={endDate}
                                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                                    fullWidth
                                                    size="small"
                                                    autoComplete='off'
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton size='small' onClick={() => handleEndDateChange('')}>
                                                                    <ClearIcon fontSize='small' color='error' />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <StyledTextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Buscar por nombre, email, etc."
                                                    value={search}
                                                    onChange={(e) => handleSearchChange(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        endAdornment: search && (
                                                            <IconButton size="small" onClick={() => handleSearchChange('')}>
                                                                <ClearIcon />
                                                            </IconButton>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={sortByOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={sortByOptions.find(option => option.value === sortBy) || null}
                                                    onChange={(event, newValue) => handleSortByChange(newValue ? newValue.value : '')}
                                                    renderInput={(params) => <StyledTextField {...params} label="Ordenar por" />}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={sortOrderOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={sortOrderOptions.find(option => option.value === sortOrder) || null}
                                                    onChange={(event, newValue) => handleSortOrderChange(newValue ? newValue.value : '')}
                                                    renderInput={(params) => <StyledTextField {...params} label="Orden" />}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={debtStatusOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={debtStatusOptions.find(option => option.value === debtStatus) || null}
                                                    onChange={(event, newValue) => handleDebtStatusChange(newValue ? newValue.value : '')}
                                                    renderInput={(params) => <StyledTextField {...params} label="Estado de Deuda" />}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Grid container spacing={2} justifyContent="center" alignItems="center">
                                    <Grid item>
                                        <StyledButton
                                            variant="outlined"
                                            color="secondary"
                                            onClick={handleClearFilters}
                                        >
                                            Limpiar Filtros
                                        </StyledButton>
                                    </Grid>
                                    <Grid item>
                                        <StyledButton
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => handleExportCSV()}
                                            size={isMobile ? "small" : "medium"}
                                        >
                                            Exportar CSV
                                        </StyledButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </StyledCard>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {isLoadingCustomers ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Typography>Cargando clientes...</Typography>
                    </Box>
                ) : customers.length > 0 ? (
                    <StyledCard elevation={2} sx={{ p: 2, mb: 3, maxWidth: '100%', overflow: 'auto', }}>
                        <EnhancedTable
                            columns={columns}
                            data={customers}
                            loading={isLoadingCustomers}
                            count={totalItems}
                            page={page}
                            rowsPerPage={limit}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </StyledCard>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Typography color="text.secondary">
                            {error ? 'Error al cargar datos. Verifique la conexión del servidor.' : 'No hay clientes registrados'}
                        </Typography>
                    </Box>
                )}
            </motion.div>

            <MyFab visibleFab={visibleFab} screenSize={screenSize} />

            <StyledDialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false);
                    setSelectedCustomer(null);
                    resetForm(); // Resetear el formulario al cerrar
                }}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    <Box>
                        {dialogMode === 'create' && 'Nuevo Cliente'}
                        {dialogMode === 'edit' && 'Editar Cliente'}
                        {dialogMode === 'view' && 'Detalles del Cliente'}
                    </Box>
                    <IconButton onClick={() => { setOpenDialog(false); setSelectedCustomer(null); resetForm(); }}>
                        <CloseIcon color="error" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
                    {isLoadingSingleCustomer ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <Typography>Cargando detalles del cliente...</Typography>
                        </Box>
                    ) : (dialogMode === 'create' || dialogMode === 'edit') ? (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Nombre *"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange({ target: { name: 'name', value: e.target.value } })}
                                        margin="normal"
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => reset('name')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="DNI"
                                        value={formData.dni || ''}
                                        onChange={(e) => {
                                            handleInputChange({ target: { name: 'dni', value: e.target.value } });
                                            checkDuplicate('dni', e.target.value, selectedCustomer?.id);
                                        }}
                                        margin="normal"
                                        error={!!dniExistsError}
                                        helperText={dniExistsError}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('dni')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Teléfono"
                                        value={formData.phone || ''}
                                        onChange={(e) => handleInputChange({ target: { name: 'phone', value: e.target.value } })}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('phone')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => handleInputChange({ target: { name: 'email', value: e.target.value } })}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('email')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        fullWidth
                                        label="Dirección"
                                        value={formData.address || ''}
                                        onChange={(e) => handleInputChange({ target: { name: 'address', value: e.target.value } })}
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('address')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Porcentaje de Descuento"
                                        type="text"
                                        value={String(formData.discount_percentage || '')}
                                        onChange={(e) => handleInputChange({ target: { name: 'discount_percentage', value: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                                        margin="normal"
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('discount_percentage')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Límite de Crédito"
                                        type="text"
                                        value={String(formData.credit_limit || '')}
                                        onChange={(e) => handleInputChange({ target: { name: 'credit_limit', value: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                                        margin="normal"
                                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetForm('credit_limit')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                {dialogMode === 'create' && (
                                    <Grid item xs={12} sm={6}>
                                        <StyledTextField
                                            fullWidth
                                            label="Deuda Inicial"
                                            type="text"
                                            value={String(formData.debt || '')}
                                            onChange={(e) => handleInputChange({ target: { name: 'debt', value: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                                            margin="normal"
                                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconButton size='small' onClick={() => resetForm('debt')}>
                                                            <ClearIcon fontSize='small' color='error' />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>
                                )}
                                {dialogMode === 'edit' && (
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="Deuda Actual"
                                            value={formData.debt || ''}
                                            margin="normal"
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ) : singleCustomerData?.success ? (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" gutterBottom>
                                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información Personal
                                    </Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Nombre:</Typography> {singleCustomerData.data?.name}</Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">DNI:</Typography> {singleCustomerData.data?.dni || 'No especificado'}</Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Teléfono:</Typography> {singleCustomerData.data?.phone || 'No especificado'}</Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Email:</Typography> {singleCustomerData.data?.email || 'No especificado'}</Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Dirección:</Typography> {singleCustomerData.data?.address || 'No especificada'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="h6" gutterBottom>
                                        <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Información Financiera
                                    </Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Descuento:</Typography> {singleCustomerData.data?.discount_percentage}%</Typography>
                                    <Typography variant="body2"><Typography component="span" fontWeight="bold">Límite de Crédito:</Typography> ${singleCustomerData.data?.credit_limit}</Typography>
                                    <Box>
                                        <Typography component="span" variant="body2" fontWeight="bold">Crédito Disponible:</Typography>
                                        <Chip
                                            label={`$ ${(parseFloat(singleCustomerData.data?.credit_limit || 0) - parseFloat(singleCustomerData.data?.debt || 0)).toFixed(2)}`}
                                            color={(parseFloat(singleCustomerData.data?.credit_limit || 0) - parseFloat(singleCustomerData.data?.debt || 0)) >= 0 ? 'success' : 'error'}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography component="span" variant="body2" fontWeight="bold">Deuda Actual:</Typography>
                                        <Chip
                                            label={`$ ${singleCustomerData.data?.debt}`}
                                            color={parseFloat(singleCustomerData.data?.debt || 0) > 0 ? 'error' : 'success'}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                </Grid>
                                {singleCustomerData.data?.payments && singleCustomerData.data.payments.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                            Últimos Pagos
                                        </Typography>
                                        <List dense>
                                            {singleCustomerData.data.payments.slice(0, 5).map((payment, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText
                                                        primary={`${payment.amount} - ${payment.payment_method}`}
                                                        secondary={new Date(payment.payment_date).toLocaleDateString()}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <Typography color="error">Error al cargar los detalles del cliente.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                    <StyledButton variant='outlined' color="secondary" sx={{ padding: '2px 12px' }} onClick={() => {
                        setOpenDialog(false);
                    }}>
                        Cerrar
                    </StyledButton>
                    {dialogMode !== 'view' && (
                        <StyledButton
                            onClick={() => handleSave(formData, resetForm)}
                            variant="contained"
                            disabled={isLoadingSingleCustomer || !String(formData.name || '').trim()}
                        >
                            {dialogMode === 'create' ? 'Crear' : 'Actualizar'}
                        </StyledButton>
                    )}
                </DialogActions>
            </StyledDialog>

            {/* Modal de Pago */}
            <StyledDialog
                open={openPaymentDialog}
                onClose={() => {
                    setOpenPaymentDialog(false);
                    setPaymentData({
                        amount: '',
                        payment_method: 'efectivo',
                        notes: ''
                    });
                }}
                maxWidth="lg"
                fullWidth
                disableRestoreFocus
                aria-labelledby="payment-dialog-title"
                aria-describedby="payment-dialog-description"
                slotProps={{
                    backdrop: {
                        invisible: false,
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                    }
                }}
                TransitionProps={{
                    onEntering: () => { },
                    onExited: () => { }
                }}
            >
                <DialogTitle id="payment-dialog-title">
                    Registrar Pago - {selectedCustomer?.name}
                </DialogTitle>
                <DialogContent id="payment-dialog-description">
                    <Box sx={{ pt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Deuda actual: ${selectedCustomer?.debt}
                        </Alert>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <StyledTextField
                                    fullWidth
                                    label="Monto a Pagar *"
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                    inputProps={{
                                        min: 0.01,
                                        max: selectedCustomer?.debt || 0,
                                        step: 0.01
                                    }}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton size='small' onClick={() => setPaymentData(prev => ({ ...prev, amount: '' }))}>
                                                    <ClearIcon fontSize='small' color='error' />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Método de Pago</InputLabel>
                                    <Select
                                        value={paymentData.payment_method}
                                        onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                                        label="Método de Pago"
                                    >
                                        <MenuItem value="efectivo">Efectivo</MenuItem>
                                        <MenuItem value="tarjeta_debito">Tarjeta de Débito</MenuItem>
                                        <MenuItem value="tarjeta_credito">Tarjeta de Crédito</MenuItem>
                                        <MenuItem value="transferencia">Transferencia</MenuItem>
                                        <MenuItem value="cheque">Cheque</MenuItem>
                                        <MenuItem value="otro">Otro</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    fullWidth
                                    label="Notas (opcional)"
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                    multiline
                                    rows={3}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton size='small' onClick={() => setPaymentData(prev => ({ ...prev, notes: '' }))}>
                                                    <ClearIcon fontSize='small' color='error' />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton sx={{ padding: '2px 12px' }} onClick={() => {
                        setOpenPaymentDialog(false);
                    }}>
                        Cancelar
                    </StyledButton>
                    <StyledButton
                        onClick={() => handleRegisterPayment(paymentData, selectedCustomer, setPaymentData)}
                        variant="contained"
                        disabled={isLoadingSingleCustomer || !paymentData.amount || paymentData.amount <= 0}
                    >
                        Registrar Pago
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            {/* Modal de Historial */}
            <StyledDialog
                open={openHistoryDialog}
                onClose={() => {
                    setOpenHistoryDialog(false);
                }}
                maxWidth="xl"
                fullWidth
                fullScreen={isMobile}
                disableRestoreFocus
                aria-labelledby="history-dialog-title"
                aria-describedby="history-dialog-description"
                slotProps={{
                    backdrop: {
                        invisible: false,
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                    }
                }}
                TransitionProps={{
                    onEntering: () => { },
                    onExited: () => { }
                }}
            >
                <DialogTitle id="history-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    Historial - {selectedCustomer?.name}
                    <IconButton onClick={() => { setOpenHistoryDialog(false); }}>
                        <CloseIcon color="error" />
                    </IconButton>
                </DialogTitle>
                <DialogContent id="history-dialog-description">
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            {/* Historial de Compras */}
                            <Grid item xs={12} lg={6}>
                                <StyledCard variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color={theme.palette.text.titlePrimary}>
                                            Historial de Compras (Solo Crédito)
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                            Total Compras a Crédito: ${singleCustomerData?.data?.totalCreditSales?.toFixed(2) || '0.00'}
                                        </Typography>

                                        {/* Filtros de Compras */}
                                        <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={5}>
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        label="Fecha Desde"
                                                        type="date"
                                                        value={historyFilters.purchases.start_date}
                                                        onChange={(e) => handleHistoryFilterChange('purchases', 'start_date', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <IconButton size='small' onClick={() => handleHistoryFilterChange('purchases', 'start_date', '')}>
                                                                        <ClearIcon fontSize='small' color='error' />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        label="Fecha Hasta"
                                                        type="date"
                                                        value={historyFilters.purchases.end_date}
                                                        onChange={(e) => handleHistoryFilterChange('purchases', 'end_date', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <IconButton size='small' onClick={() => handleHistoryFilterChange('purchases', 'end_date', '')}>
                                                                        <ClearIcon fontSize='small' color='error' />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <Stack direction="row" spacing={1}>

                                                        <StyledButton
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => clearHistoryFilters('purchases')}
                                                        >
                                                            Limpiar
                                                        </StyledButton>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Lista de Compras */}
                                        {purchaseHistory.length > 0 ? (
                                            <>
                                                <List dense>
                                                    {purchaseHistory.map((purchase, index) => (
                                                        <ListItem
                                                            key={index}
                                                            secondaryAction={
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <Tooltip title="Ver detalle">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleViewPurchaseDetail(purchase)}
                                                                            color="info"
                                                                        >
                                                                            <VisibilityIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Imprimir">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handlePrintPurchase(purchase)}
                                                                            color="primary"
                                                                        >
                                                                            <PrintIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            }
                                                        >
                                                            <ListItemText
                                                                primary={`Venta #${purchase.id} - ${purchase.total_neto}`}
                                                                secondary={new Date(purchase.createdAt).toLocaleDateString()}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>

                                                {/* Paginación de Compras */}
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                    <Pagination
                                                        count={historyFilters.purchases.totalPages}
                                                        page={historyFilters.purchases.page}
                                                        onChange={(e, page) => {
                                                            handleHistoryFilterChange('purchases', 'page', page);
                                                            applyHistoryFilters('purchases');
                                                        }}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>

                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                    Total: {historyFilters.purchases.totalItems} compras
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography color="text.secondary">
                                                No hay compras a crédito registradas
                                            </Typography>
                                        )}
                                    </CardContent>
                                </StyledCard>
                            </Grid>

                            {/* Historial de Pagos */}
                            <Grid item xs={12} lg={6}>
                                <StyledCard variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color={theme.palette.text.titleSecondary}>
                                            Historial de Pagos
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                            Total Pagos Recibidos: ${singleCustomerData?.data?.totalPaymentsReceived?.toFixed(2) || '0.00'}
                                        </Typography>

                                        {/* Filtros de Pagos */}
                                        <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={5}>
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        label="Fecha Desde"
                                                        type="date"
                                                        value={historyFilters.payments.start_date}
                                                        onChange={(e) => handleHistoryFilterChange('payments', 'start_date', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <IconButton size='small' onClick={() => handleHistoryFilterChange('payments', 'start_date', '')}>
                                                                        <ClearIcon fontSize='small' color='error' />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        label="Fecha Hasta"
                                                        type="date"
                                                        value={historyFilters.payments.end_date}
                                                        onChange={(e) => handleHistoryFilterChange('payments', 'end_date', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <IconButton size='small' onClick={() => handleHistoryFilterChange('payments', 'end_date', '')}>
                                                                        <ClearIcon fontSize='small' color='error' />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <Stack direction="row" spacing={1}>

                                                        <StyledButton
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => clearHistoryFilters('payments')}
                                                        >
                                                            Limpiar
                                                        </StyledButton>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {/* Lista de Pagos */}
                                        {paymentHistory.length > 0 ? (
                                            <>
                                                <List dense>
                                                    {paymentHistory.map((payment, index) => (
                                                        <ListItem
                                                            key={index}
                                                            secondaryAction={
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    <Tooltip title="Ver detalle">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleViewPaymentDetail(payment)}
                                                                            color="info"
                                                                        >
                                                                            <ReceiptIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Imprimir comprobante">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handlePrintPayment(payment)}
                                                                            color="primary"
                                                                        >
                                                                            <PrintIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            }
                                                        >
                                                            <ListItemText
                                                                primary={`${payment.amount} - ${payment.payment_method}`}
                                                                secondary={`${new Date(payment.payment_date).toLocaleDateString()} ${payment.notes ? `- ${payment.notes}` : ''}`}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>

                                                {/* Paginación de Pagos */}
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                    <Pagination
                                                        count={historyFilters.payments.totalPages}
                                                        page={historyFilters.payments.page}
                                                        onChange={(e, page) => {
                                                            handleHistoryFilterChange('payments', 'page', page);
                                                            applyHistoryFilters('payments');
                                                        }}
                                                        size="small"
                                                        color="secondary"
                                                    />
                                                </Box>

                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                    Total: {historyFilters.payments.totalItems} pagos
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography color="text.secondary">
                                                No hay pagos registrados
                                            </Typography>
                                        )}
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton onClick={() => {
                        setOpenHistoryDialog(false);
                    }}>
                        Cerrar
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            {/* Modal de Detalle de Compra */}
            <StyledDialog
                open={openPurchaseDetailDialog}
                onClose={() => {
                    setOpenPurchaseDetailDialog(false);
                    setSelectedPurchase(null); // Limpiar compra seleccionada al cerrar
                    setSaleIdForDetail(null); // Limpiar el ID de la venta para forzar la recarga
                }}
                maxWidth="xl"
                fullWidth
                fullScreen={isMobile}
                disableRestoreFocus
                aria-labelledby="purchase-detail-dialog-title"
                aria-describedby="purchase-detail-dialog-description"
                slotProps={{
                    backdrop: {
                        invisible: false,
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                    }
                }}
                TransitionProps={{
                    onEntering: () => { },
                    onExited: () => { }
                }}
            >
                <DialogTitle id="purchase-detail-dialog-title">
                    Detalle de Compra #{selectedPurchase?.id}
                </DialogTitle>
                <DialogContent id="purchase-detail-dialog-description">
                    <Box sx={{ pt: 2 }}>
                        {selectedPurchase && (
                            <>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography><strong>Cliente:</strong> {selectedCustomer?.name}</Typography>
                                        <Typography><strong>Fecha:</strong> {new Date(selectedPurchase.createdAt).toLocaleDateString()}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography><strong>Método de Pago:</strong> {selectedPurchase.sale_payments && selectedPurchase.sale_payments.length > 0 ? selectedPurchase.sale_payments.map(p => `${p.payment?.method}: ${p.amount}`).join(' / ') : 'No especificado'}</Typography>
                                        <Typography><strong>Total:</strong> ${selectedPurchase.total_neto}</Typography>
                                    </Grid>
                                </Grid>

                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="h6" gutterBottom>
                                    Productos
                                </Typography>

                                {purchaseDetails.length > 0 ? (
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: theme.palette.primary.main }}>
                                                    <th style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'left', color: theme.palette.primary.contrastText }}>Producto</th>
                                                    <th style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'center', color: theme.palette.primary.contrastText }}>Cantidad</th>
                                                    <th style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'right', color: theme.palette.primary.contrastText }}>Precio Unit.</th>
                                                    <th style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'right', color: theme.palette.primary.contrastText }}>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchaseDetails.map((detail, index) => (
                                                    <tr key={index}>
                                                        <td style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px' }}>
                                                            {detail.stock?.name || 'Producto no encontrado'}
                                                        </td>
                                                        <td style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'center' }}>
                                                            {detail.quantity}
                                                        </td>
                                                        <td style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'right' }}>
                                                            ${detail.price}
                                                        </td>
                                                        <td style={{ border: `1px solid ${theme.palette.divider}`, padding: '8px', textAlign: 'right' }}>
                                                            ${(detail.quantity * detail.price).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">
                                        No se encontraron detalles de productos
                                    </Typography>
                                )}

                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Typography variant="h6">
                                        <strong>Total: ${selectedPurchase.total_neto}</strong>
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton onClick={() => {
                        setOpenPurchaseDetailDialog(false);
                    }}>
                        Cerrar
                    </StyledButton>
                    <StyledButton
                        onClick={() => handlePrintPurchase(selectedPurchase, selectedCustomer?.name)}
                        variant="contained"
                        startIcon={<PrintIcon />}
                    >
                        Imprimir
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            {/* Modal de Detalle de Pago */}
            <StyledDialog
                open={openPaymentDetailDialog}
                onClose={() => {
                    setOpenPaymentDetailDialog(false);
                    setSelectedPayment(null); // Limpiar pago seleccionado al cerrar
                }}
                maxWidth="lg"
                fullWidth
                disableRestoreFocus
                aria-labelledby="payment-detail-dialog-title"
                aria-describedby="payment-detail-dialog-description"
                slotProps={{
                    backdrop: {
                        invisible: false,
                        sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                    }
                }}
                TransitionProps={{
                    onEntering: () => { },
                    onExited: () => { }
                }}
            >
                <DialogTitle id="payment-detail-dialog-title">
                    Detalle de Pago
                </DialogTitle>
                <DialogContent id="payment-detail-dialog-description">
                    <Box sx={{ pt: 2 }}>
                        {selectedPayment && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <StyledCard variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color={theme.palette.text.titlePrimary}>
                                                Información del Pago
                                            </Typography>
                                            <Typography><strong>Cliente:</strong> {selectedCustomer?.name}</Typography>
                                            <Typography><strong>Monto:</strong> ${selectedPayment.amount}</Typography>
                                            <Typography><strong>Método de Pago:</strong> {selectedPayment.payment_method}</Typography>
                                            <Typography><strong>Fecha:</strong> {new Date(selectedPayment.payment_date).toLocaleDateString()}</Typography>
                                            <Typography><strong>Creado por:</strong> {selectedPayment.created_by || 'Sistema'}</Typography>
                                            {selectedPayment.notes && (
                                                <Typography><strong>Notas:</strong> {selectedPayment.notes}</Typography>
                                            )}
                                        </CardContent>
                                    </StyledCard>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <StyledButton onClick={() => {
                        setOpenPaymentDetailDialog(false);
                    }}>
                        Cerrar
                    </StyledButton>
                    <StyledButton
                        onClick={() => handlePrintPayment(selectedPayment, selectedCustomer?.name)}
                        variant="contained"
                        startIcon={<PrintIcon />}
                    >
                        Imprimir Comprobante
                    </StyledButton>
                </DialogActions>
            </StyledDialog>

            {/* Snackbars para mensajes */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={useCallback(() => setError(''), [setError])}
            >
                <Alert severity="error">
                    {error || errorHistory}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!success}
                autoHideDuration={4000}
                onClose={useCallback(() => setSuccess(''), [setSuccess])}
            >
                <Alert severity="success">
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Customers;