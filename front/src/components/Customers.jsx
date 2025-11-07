import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
    Autocomplete,
    Box,
    Paper,
    Typography,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    Stack,
    InputAdornment,
    Pagination
} from '@mui/material';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledButton } from '../styledComponents/ui/StyledButton'; // Added
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker'; // <-- AÑADIDO
import CustomerModalContent from '../styledComponents/CustomerModalContent';
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
    Print as PrintIcon,
    Close as CloseIcon,
    Receipt as ReceiptIcon,
    KeyboardArrowDown
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EnhancedTable } from '../styledComponents/EnhancedTable'; // Added
import { MyFab } from '../styledComponents/MyFab';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { AuthContext } from '../context/AuthContext';
import { useCustomerHistory } from '../hooks/useCustomerHistory.jsx';
import { useCustomerList } from '../hooks/useCustomerList';
import { useCashRegister } from '../hooks/useCashRegister'; // <-- AÑADIR
import { usePermissions } from '../hooks/usePermissions'; // Importar usePermissions
import { mostrarError } from '../functions/MostrarError';
import { mostrarInfo } from '../functions/mostrarInfo'; // Added
import { CajaManager } from '../styledComponents/CajaManager'; // Added
import CustomersSkeleton from '../styledComponents/skeletons/CustomersSkeleton';
import Swal from 'sweetalert2'; // Added
import { UseFetchQuery } from '../hooks/useQuery.js';
import { CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // <-- AÑADIDO
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'; // <-- AÑADIDO
import moment from 'moment'; // <-- AÑADIDO


const Customers = () => {
    // Forzar re-render para asegurar que los cambios se apliquen

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { tienePermiso } = usePermissions(); // Usar el hook usePermissions

    const { usuario: user } = useContext(AuthContext); // Added to get user.id            const { 
    const {
        customers,
        isLoadingCustomers,
        page,
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
        handleSave,
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
        emailExistsError  // ✅ SIN COMA AL FINAL
    } = useCustomerList(tienePermiso);

    const { data: totalDebtData, isLoading: isLoadingTotalDebt } = UseFetchQuery(
        ['totalCustomerDebt', search, debtStatus], // La clave de la query incluye los filtros
        `/customers/total-debt?search=${search}&debt_status=${debtStatus}`,
        true, // enabled
        0, // staleTime
        { keepPreviousData: true } // Opcional
    );

    const { purchaseHistory, paymentHistory, errorHistory, loadingHistory, historyFilters, openPurchaseDetailDialog, setOpenPurchaseDetailDialog, openPaymentDetailDialog, setOpenPaymentDetailDialog, selectedPurchase, setSelectedPurchase, selectedPayment, setSelectedPayment, purchaseDetails, setPurchaseDetails, handleHistoryFilterChange, applyHistoryFilters, clearHistoryFilters, handleViewPurchaseDetail, handleViewPaymentDetail, handlePrintPurchase, handlePrintPayment, handlePrintDoublePaymentReceipt, setSaleIdForDetail } = useCustomerHistory(selectedCustomer?.id, selectedCustomer?.name);
    const handleCloseErrorSnackbar = useCallback(() => setError(''), [setError]);
    const handleCloseSuccessSnackbar = useCallback(() => setSuccess(''), [setSuccess]);

    // Estados para MyFab
    const [visibleFab, setVisibleFab] = useState(false);
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [openCajaManager, setOpenCajaManager] = useState(false); // Added
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearchChange(searchInput);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput, handleSearchChange]);

    useEffect(() => {
        if (search === '') {
            setSearchInput('');
        }
    }, [search]);
    //  const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearchChange(searchInput);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchInput, handleSearchChange]);

    useEffect(() => {
        if (search === '') {
            setSearchInput('');
        }
    }, [search]);

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



    const { activeSession, refreshActiveSession } = useCashRegister();

    // useEffect para manejar pagos pendientes después de abrir la caja
    React.useEffect(() => {
        const pendingCustomerId = sessionStorage.getItem('pendingPaymentCustomerId');
        if (pendingCustomerId && customers.length > 0 && activeSession) {
            const pendingCustomer = customers.find(c => c.id === parseInt(pendingCustomerId, 10));
            if (pendingCustomer) {
                setSelectedCustomer(pendingCustomer);
                setOpenPaymentDialog(true);
            }
            sessionStorage.removeItem('pendingPaymentCustomerId');
        }
    }, [activeSession, customers, setOpenPaymentDialog, setSelectedCustomer]);

    const handlePaymentSubmit = () => {
        if (paymentData.payment_method === 'efectivo' && !activeSession) {
            mostrarError('Para registrar un pago en efectivo, debe tener una sesión de caja abierta.', theme);
            return;
        }
        handleRegisterPayment(paymentData, selectedCustomer, setPaymentData);
    };

    // New function to handle payment attempt
    const handleAttemptRegisterPayment = (customer) => {
        if (!activeSession) {
            Swal.fire({
                title: 'No hay una sesión de caja abierta',
                text: 'Para registrar un pago, necesita abrir una sesión de caja. ¿Desea abrir una ahora?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, abrir caja',
                cancelButtonText: 'Cancelar',
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                confirmButtonColor: theme.palette.primary.main,
                cancelButtonColor: theme.palette.error.main,
                didOpen: () => {
                    const swalContainer = document.querySelector('.swal2-container');
                    if (swalContainer) {
                        swalContainer.style.zIndex = '1400';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    sessionStorage.setItem('pendingPaymentCustomerId', customer.id);
                    setOpenCajaManager(true);
                }
            });
        } else {
            setSelectedCustomer(customer);
            setOpenPaymentDialog(true);
        }
    };

    const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = UseFetchQuery(
        ['paymentMethods'],
        '/payment',
        true,
        0,
        {
            select: (data) => data.filter(method => method.active && method.method.toLowerCase() !== 'credito' && method.method.toLowerCase() !== 'mixto')
        }
    );

    const paymentMethodOptions = paymentMethodsData || [];

    // Estados de pago (mantener aquí si no se mueven al hook)
    const [paymentData, setPaymentData] = useState({
        amount: '',
        payment_method: '',
        notes: ''
    });

    React.useEffect(() => {
        if (paymentMethodOptions.length > 0 && !paymentData.payment_method) {
            const defaultMethod = paymentMethodOptions.find(method => method.method.toLowerCase() === 'efectivo');
            if (defaultMethod) {
                setPaymentData(prev => ({ ...prev, payment_method: defaultMethod.method.toLowerCase() }));
            }
        }
    }, [paymentMethodOptions, paymentData.payment_method]);

    // Configuración de columnas para la tabla
    const columns = React.useMemo(() => [
        { id: 'name', label: 'Nombre', valueGetter: ({ row }) => row.name, align: 'left' },
        { id: 'email', label: 'Email', valueGetter: ({ row }) => row.email || '-', align: 'left' },
        { id: 'phone', label: 'Teléfono', valueGetter: ({ row }) => row.phone || '-', align: 'center' },
        { id: 'address', label: 'Dirección', valueGetter: ({ row }) => row.address || '-', align: 'left' },
        { id: 'dni', label: 'DNI', valueGetter: ({ row }) => row.dni || '-', align: 'center' },
        {
            id: 'debt',
            label: 'Deuda',
            valueGetter: ({ row }) => {
                const debtValue = parseFloat(row?.debt || 0);
                return `$ ${debtValue.toFixed(2)}`;
            },
            cellStyle: (row) => {
                const debtValue = parseFloat(row?.debt || 0);
                return { color: debtValue > 0 ? 'error.main' : 'success.main' };
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
                    {tienePermiso('accion_editar_cliente') && ( // Changed permission
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
                                    onClick={() => handleAttemptRegisterPayment(row)} // Modified
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
                    {tienePermiso('accion_eliminar_cliente') && !isMobile && ( // Changed permission
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
    ], [handleView, handleEdit, handleAttemptRegisterPayment, setOpenHistoryDialog, handleDelete, isMobile, tienePermiso]); // Modified dependencies

    // Preparar datos para la tabla
    // Removed memoizedTableData as it's redundant.
    // The EnhancedTable component already uses the columns definition with valueGetters.

    if (customers.length === 0 && isLoadingCustomers) {
        return <CustomersSkeleton />;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                {/* Header */}
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
                                    onClick={handleCreate}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    Nuevo Cliente
                                </StyledButton>
                            )}
                        </Box>
                    </Paper>
                </motion.div>

                {/* Controles */}
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
                            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2, mt: 2, backgroundColor: theme.palette.background.paper }}>
                                <Grid container spacing={2} justifyContent="center" alignItems="flex-start" marginTop={1}>
                                    {/* Fila de filtros */}
                                    <Grid item xs={12}>
                                        <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                                            {/* Columna 1: Fechas */}
                                            <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                                <Grid container direction="column" spacing={2}>
                                                    <Grid item>
                                                        <StyledDatePicker
                                                            label="Fecha Desde"
                                                            value={startDate ? moment(startDate) : null}
                                                            onChange={(newValue) => {
                                                                handleStartDateChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                                                            }}
                                                            format="DD/MM/YYYY"
                                                            slotProps={{
                                                                textField: {
                                                                    InputProps: {
                                                                        startAdornment: (
                                                                            <InputAdornment position="start">
                                                                                <IconButton size='small' onClick={() => handleStartDateChange('', null)}>
                                                                                    <ClearIcon fontSize='small' color='error' />
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                        )
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item>
                                                        <StyledDatePicker
                                                            label="Fecha Hasta"
                                                            value={endDate ? moment(endDate) : null}
                                                            onChange={(newValue) => {
                                                                handleEndDateChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                                                            }}
                                                            format="DD/MM/YYYY"
                                                            slotProps={{
                                                                textField: {
                                                                    InputProps: {
                                                                        startAdornment: (
                                                                            <InputAdornment position="start">
                                                                                <IconButton size='small' onClick={() => handleEndDateChange('', null)}>
                                                                                    <ClearIcon fontSize='small' color='error' />
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                        )
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            {/* Columna 2: Búsqueda y Ordenar por */}
                                            <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                                <Grid container direction="column" spacing={2}>
                                                    <Grid item>
                                                        <StyledTextField
                                                            fullWidth
                                                            size="small"
                                                            placeholder="Buscar por nombre, email, etc."
                                                            value={searchInput}
                                                            onChange={(e) => setSearchInput(e.target.value)}
                                                            InputProps={{
                                                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                                endAdornment: search && (
                                                                    <IconButton size="small" onClick={() => setSearchInput('')}>
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

                                            {/* Columna 3: Orden y Estado de Deuda */}
                                            <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                                <Grid container direction="column" spacing={2}>
                                                    <Grid item>
                                                        <Autocomplete
                                                            fullWidth
                                                            size="small"
                                                            options={sortOrderOptions}
                                                            getOptionLabel={(option) => option.label}
                                                            value={sortOrderOptions.find(option => option.value === sortOrder) || null}
                                                            onChange={(event, newValue) => handleSortOrderChange(newValue ? newValue.value : 'ASC')}
                                                            renderInput={(params) => <StyledTextField {...params} label="Orden" />}
                                                            disableClearable
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

                                    {/* Fila de botones de acción */}
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
                                            {/* <Grid item>
                                            <StyledButton
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleExportCSV()}
                                                size={isMobile ? "small" : "medium"}
                                            >
                                                Exportar CSV
                                            </StyledButton>
                                        </Grid> */}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </StyledCard>
                </motion.div>

                {/* Tabla de clientes */}
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
                                columns={columns} // Use the updated columns definition
                                data={customers} // Pass raw customers data, EnhancedTable uses valueGetters
                                loading={isLoadingCustomers}
                                count={totalItems}
                                page={page - 1}
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

                    {/* Total Deuda Display */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pr: 2 }}>
                        <StyledCard sx={{ p: 2, backgroundColor: 'background.paper' }}>
                            <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                                Deuda Total (Filtro Actual): {' '}
                            </Typography>
                            <Typography variant="h6" component="span" color="error.main" sx={{ fontWeight: 'bold' }}>
                                ${
                                    isLoadingTotalDebt ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        (totalDebtData?.totalDebt || 0).toFixed(2)
                                    )
                                }
                            </Typography>
                        </StyledCard>
                    </Box>
                </motion.div>

                {/* FAB para móvil */}
                <MyFab visibleFab={visibleFab} screenSize={screenSize} />

                {/* Modal de Cliente */}
                <StyledDialog
                    open={openDialog}
                    onClose={() => {
                        setOpenDialog(false);
                        setSelectedCustomer(null); // Limpiar cliente seleccionado al cerrar
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
                        <IconButton onClick={() => { setOpenDialog(false); setSelectedCustomer(null); }}>
                            <CloseIcon color="error" />
                        </IconButton>
                    </DialogTitle>
                    <Divider />
                    <CustomerModalContent
                        customer={singleCustomerData?.data || selectedCustomer}
                        onSaveCustomer={handleSave}
                        onCancel={() => {
                            setOpenDialog(false);
                            setSelectedCustomer(null);
                        }}
                        dialogMode={dialogMode}
                        isLoadingSingleCustomer={isLoadingSingleCustomer}
                        dniExistsError={dniExistsError}
                        emailExistsError={emailExistsError}
                        checkDuplicate={checkDuplicate}
                    />
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
                    <DialogTitle id="payment-dialog-title" sx={{ backgroundColor: 'background.dialog' }}>
                        Registrar Pago - {selectedCustomer?.name}
                    </DialogTitle>
                    <DialogContent id="payment-dialog-description" sx={{ backgroundColor: 'background.dialog' }}>
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
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={paymentMethodOptions}
                                        getOptionLabel={(option) => option.method}
                                        isOptionEqualToValue={(option, value) => option.method === value.method}
                                        value={paymentMethodOptions.find(option => option.method === paymentData.payment_method) || null}
                                        onChange={(event, newValue) => setPaymentData(prev => ({ ...prev, payment_method: newValue ? newValue.method.toLowerCase() : '' }))}
                                        renderInput={(params) => <StyledTextField {...params} label="Método de Pago" />}
                                        disableClearable
                                        loading={isLoadingPaymentMethods}
                                        loadingText="Cargando métodos de pago..."
                                    />
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
                    <DialogActions sx={{ backgroundColor: 'background.dialog' }}>
                        <StyledButton sx={{ padding: '2px 12px' }} onClick={() => {
                            setOpenPaymentDialog(false);
                        }}>
                            Cancelar
                        </StyledButton>
                        <StyledButton
                            onClick={handlePaymentSubmit}
                            variant="contained"
                            disabled={isLoadingSingleCustomer || !paymentData.amount || paymentData.amount <= 0 || !activeSession}
                        >
                            Registrar Pago
                        </StyledButton>
                    </DialogActions>
                </StyledDialog>

                {/* Modal de Historial - CORREGIDO */}
                <StyledDialog
                    open={openHistoryDialog}
                    onClose={() => { setOpenHistoryDialog(false); }}
                    maxWidth="xl" // Cambiar de false a "xl" para dar más espacio
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
                        <Box sx={{ pt: 2, width: '100%', minWidth: 0 }}>
                            <Grid container spacing={3}>
                                {/* Historial de Compras */}
                                <Grid item xs={12} lg={6}>
                                    <StyledCard variant="outlined" sx={{ height: 'fit-content', minHeight: '500px' }}>
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
                                                            onChange={(e) => { handleHistoryFilterChange('purchases', 'start_date', e.target.value); e.target.blur(); }}
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
                                                            onChange={(e) => { handleHistoryFilterChange('purchases', 'end_date', e.target.value); e.target.blur(); }}
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

                                            {/* Lista de Compras - VERSION COMPRIMIDA */}
                                            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {purchaseHistory.length > 0 ? (
                                                    <>
                                                        <List
                                                            dense
                                                            disablePadding
                                                            sx={{
                                                                '& .MuiListItem-root': {
                                                                    py: 0.5, // Padding vertical reducido
                                                                    px: 1,   // Padding horizontal
                                                                    minHeight: '40px' // Altura mínima del item
                                                                }
                                                            }}
                                                        >
                                                            {purchaseHistory.map((purchase, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                    divider={index < purchaseHistory.length - 1} // Línea divisoria solo entre items
                                                                    secondaryAction={
                                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                            <Tooltip title="Ver detalle">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleViewPurchaseDetail(purchase)}
                                                                                    color="info"
                                                                                    sx={{ p: 0.5 }} // Botones más pequeños
                                                                                >
                                                                                    <VisibilityIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Imprimir">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handlePrintPurchase(purchase)}
                                                                                    color="primary"
                                                                                    sx={{ p: 0.5 }}
                                                                                >
                                                                                    <PrintIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    }
                                                                    sx={{ pr: 10 }} // Espacio para los botones
                                                                >
                                                                    <ListItemText
                                                                        primary={`Venta #${purchase.id} - ${purchase.total_neto}`}
                                                                        secondary={new Date(purchase.createdAt).toLocaleDateString()}
                                                                        primaryTypographyProps={{
                                                                            variant: 'body2',
                                                                            sx: { fontWeight: 500, lineHeight: 1.2 }
                                                                        }}
                                                                        secondaryTypographyProps={{
                                                                            variant: 'caption',
                                                                            sx: { lineHeight: 1.1, mt: 0.2 }
                                                                        }}
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
                                                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                                        No hay compras a crédito registradas
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </StyledCard>
                                </Grid>

                                {/* Historial de Pagos */}
                                <Grid item xs={12} lg={6}>
                                    <StyledCard variant="outlined" sx={{ height: 'fit-content', minHeight: '500px' }}>
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
                                                            onChange={(e) => { handleHistoryFilterChange('payments', 'start_date', e.target.value); e.target.blur(); }}
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
                                                            onChange={(e) => { handleHistoryFilterChange('payments', 'end_date', e.target.value); e.target.blur(); }}
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

                                            {/* Lista de Pagos - VERSIÓN COMPRIMIDA */}
                                            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {paymentHistory.length > 0 ? (
                                                    <>
                                                        <List
                                                            dense
                                                            disablePadding
                                                            sx={{
                                                                '& .MuiListItem-root': {
                                                                    py: 0.5, // Padding vertical reducido
                                                                    px: 1,   // Padding horizontal
                                                                    minHeight: '40px' // Altura mínima del item
                                                                }
                                                            }}
                                                        >
                                                            {paymentHistory.map((payment, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                    divider={index < paymentHistory.length - 1}
                                                                    secondaryAction={
                                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                            <Tooltip title="Ver detalle">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleViewPaymentDetail(payment)}
                                                                                    color="info"
                                                                                    sx={{ p: 0.5 }}
                                                                                >
                                                                                    <ReceiptIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Imprimir comprobante">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handlePrintPayment(payment)}
                                                                                    color="primary"
                                                                                    sx={{ p: 0.5 }}
                                                                                >
                                                                                    <PrintIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    }
                                                                    sx={{ pr: 10 }}
                                                                >
                                                                    <ListItemText
                                                                        primary={`${payment.amount} - ${payment.payment_method}`}
                                                                        secondary={`${new Date(payment.payment_date).toLocaleDateString()} ${payment.notes ? `- ${payment.notes}` : ''}`}
                                                                        primaryTypographyProps={{
                                                                            variant: 'body2',
                                                                            sx: { fontWeight: 500, lineHeight: 1.2 }
                                                                        }}
                                                                        secondaryTypographyProps={{
                                                                            variant: 'caption',
                                                                            sx: { lineHeight: 1.1, mt: 0.2 }
                                                                        }}
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
                                                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                                        No hay pagos registrados
                                                    </Typography>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </StyledCard>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <StyledButton variant='outlined' onClick={() => {
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
                    maxWidth="md"
                    fullWidth
                    fullScreen={isMobile}
                    disableRestoreFocus
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
                    <DialogTitle id="purchase-detail-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                        Detalle de Compra #{selectedPurchase?.id}
                        <IconButton onClick={() => { setOpenPurchaseDetailDialog(false); setSelectedPurchase(null); setSaleIdForDetail(null); }}>
                            <CloseIcon color="error" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent id="purchase-detail-dialog-description" sx={{ backgroundColor: 'background.dialog' }}>
                        <Box >
                            <Divider sx={{ my: 2 }} />
                            {selectedPurchase && (
                                <>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Cliente:</strong> {selectedCustomer?.name}</Typography>
                                            <Typography><strong>Fecha:</strong> {new Date(selectedPurchase.createdAt).toLocaleDateString()}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Método de Pago:</strong> {selectedPurchase.sale_payments && selectedPurchase.sale_payments.length > 0 ? selectedPurchase.sale_payments.map(p => `${p.payment?.method}: ${p.amount}`).join(' / ') : 'No especificado'}</Typography>
                                            {selectedPurchase.surcharge_amount > 0 && (
                                                <Typography><strong>Recargo:</strong> ${selectedPurchase.surcharge_amount}</Typography>
                                            )}
                                            <Typography><strong>Total:</strong> ${selectedPurchase.total_neto}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
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
                    <DialogActions >
                        <StyledButton variant='outlined' onClick={() => {
                            setOpenPurchaseDetailDialog(false);
                        }}>
                            Cerrar
                        </StyledButton>
                        <StyledButton
                            onClick={() => handlePrintPurchase(selectedPurchase, selectedCustomer?.name)}
                            variant="contained"
                            startIcon={<PrintIcon />}
                            disabled={loadingHistory} // <-- AÑADIDO
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
                    maxWidth="sm"
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
                    <DialogTitle id="payment-detail-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                        Detalle de Pago
                        <IconButton onClick={() => { setOpenPaymentDetailDialog(false); setSelectedPayment(null); }}>
                            <CloseIcon color="error" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent id="payment-detail-dialog-description" sx={{ backgroundColor: 'background.dialog' }}>
                        <Box sx={{ pt: 2 }}>
                            {selectedPayment && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <StyledCard variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom color={theme.palette.text.titlePrimary} sx={{ textAlign: 'center' }}>
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
                    <DialogActions sx={{ backgroundColor: 'background.dialog' }}>
                        <StyledButton variant='outlined' onClick={() => {
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
                    onClose={handleCloseErrorSnackbar}
                >
                    <Alert severity="error">
                        {error || errorHistory}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!success}
                    autoHideDuration={4000}
                    onClose={handleCloseSuccessSnackbar}
                >
                    <Alert severity="success">
                        {success}
                    </Alert>
                </Snackbar>

                {/* CajaManager Modal */}
                {user?.id && (
                    <CajaManager
                        open={openCajaManager}
                        onClose={(sessionOpened) => {
                            setOpenCajaManager(false);
                            const pendingCustomerId = sessionStorage.getItem('pendingPaymentCustomerId');
                            if (sessionOpened) {
                                refreshActiveSession(); // Solo refrescar, el useEffect se encargará de abrir el modal
                            } else if (pendingCustomerId) {
                                mostrarInfo('No se pudo registrar el pago. Por favor, abra una sesión de caja para continuar.', theme);
                                sessionStorage.removeItem('pendingPaymentCustomerId');
                            }
                        }}
                        userId={user.id}
                        activeSession={activeSession}
                    />
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default Customers;