import { useState, useEffect, useCallback } from 'react';
import { UseFetchQuery } from './useQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useSubmit } from './useSubmit';
import { Update } from './useUpdate';
import { useDelete } from './useDelete';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Api } from '../api/api';
import { debounce } from '../functions/Debounce';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles'; // New import
import { mostrarExito } from '../functions/mostrarExito'; // New import
import { mostrarError } from '../functions/MostrarError'; // New import
import { mostrarCarga } from '../functions/mostrarCarga';

import { useCashRegister } from './useCashRegister';

export const useCustomerList = (tienePermiso) => { // Receive tienePermiso as an argument
    const { usuario } = useContext(AuthContext);
    const { activeSession } = useCashRegister(); // Obtener la sesión de caja activa
    const queryClient = useQueryClient();
    const theme = useTheme(); // New hook usage

    // Estados principales
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dniExistsError, setDniExistsError] = useState('');

    // Estados de paginación y filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [debtStatus, setDebtStatus] = useState('all');

    // Estados de modales
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

    const { data: customersData, isLoading: isLoadingCustomers, isError: isErrorCustomers, error: queryErrorCustomers, refetch: refetchCustomers } = UseFetchQuery(
        ['customers', page, limit, search, sortBy, sortOrder, startDate, endDate, debtStatus],
        `/customers/all?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&start_date=${startDate}&end_date=${endDate}&debt_status=${debtStatus}`,
        true,
        5000
    );

    const { data: singleCustomerData, isLoading: isLoadingSingleCustomer } = UseFetchQuery(
        ['singleCustomer', selectedCustomer?.id],
        async () => {
            if (!selectedCustomer?.id) return null;
            const res = await Api.get(`/customers/${selectedCustomer.id}`);
            return res.data;
        },
        !!selectedCustomer?.id,
        0
    );

    const createCustomerMutation = useSubmit('createCustomer');
    const updateCustomerMutation = Update('updateCustomer');
    const deleteCustomerMutation = useDelete('deleteCustomer');
    const paymentMutation = useSubmit('customerPayment');

    useEffect(() => {
        if (customersData?.success) {
            const filteredCustomers = (customersData.data || []).filter(
                customer => customer.name !== 'Consumidor Final' && customer.id !== 1
            );
            setCustomers(filteredCustomers);
            setTotalPages(customersData.pagination?.totalPages || 1);
            setTotalItems(customersData.pagination?.totalItems || 0);
            setError('');
        } else if (isErrorCustomers) {
            setError(queryErrorCustomers?.message || 'Error al cargar los clientes');
            setCustomers([]);
        }
    }, [customersData, isErrorCustomers, queryErrorCustomers]);

    const handleCreate = useCallback(() => {
        setDialogMode('create');
        setOpenDialog(true);
        setSelectedCustomer(null);
        setDniExistsError('');
    }, []);

    const checkDuplicate = useCallback(debounce(async (field, value, currentCustomerId = null) => {
        if (field !== 'dni' || !value) {
            setDniExistsError('');
            return;
        }

        try {
            const params = new URLSearchParams({ [field]: value });
            if (currentCustomerId) {
                params.append('customerId', currentCustomerId);
            }
            const url = `/customers/check-duplicate?${params.toString()}`;

            const response = await Api.get(url);

            if (response.data.exists) {
                setDniExistsError(`Ya existe un cliente con este DNI.`);
                mostrarError(`Ya existe un cliente con el DNI ${value}. Nombre: ${response.data.customer.name}`, theme);
            } else {
                setDniExistsError('');
            }
        } catch (err) {
            console.error(`Error checking duplicate ${field}:`, err);
            mostrarError('Error al verificar DNI.', theme);
            setDniExistsError('Error al verificar DNI.'); // Keep this for internal state
        }
    }, 500), []);

    const handleEdit = useCallback((customer) => {
        setSelectedCustomer(customer);
        setDialogMode('edit');
        setOpenDialog(true);
    }, []);

    const handleView = useCallback((customer) => {
        setSelectedCustomer(customer);
        setDialogMode('view');
        setOpenDialog(true);
    }, []);

    const handleSave = useCallback(async (formData, resetForm) => {
        setError('');
        if (dniExistsError) {
            mostrarError('El DNI ya está en uso. Por favor, corríjalo.', theme);
            return;
        }

        // Permission check
        if (dialogMode === 'create' && !tienePermiso('accion_crear_cliente')) {
            mostrarError('No tienes permiso para crear clientes.', theme);
            return;
        }
        if (dialogMode === 'edit' && !tienePermiso('accion_editar_cliente')) {
            mostrarError('No tienes permiso para editar clientes.', theme);
            return;
        }

        const mutation = dialogMode === 'create' ? createCustomerMutation : updateCustomerMutation;
        const successMessage = dialogMode === 'create' ? 'Cliente creado con éxito!' : 'Cliente actualizado con éxito!';

        mostrarCarga('Guardando...', theme);

        try {
            if (dialogMode === 'create') {
                await mutation.mutateAsync({ url: '/customers', values: formData, showSuccessAlert: false });
            } else {
                await mutation.mutateAsync({ url: `/customers/${selectedCustomer.id}`, datos: formData, showSuccessAlert: false });
            }

            Swal.close();
            mostrarExito(successMessage, theme);

            // Manual onSuccess logic
            setOpenDialog(false);
            resetForm();
            refetchCustomers();
            if (dialogMode === 'create') setSearch('');
            if (dialogMode === 'edit') queryClient.invalidateQueries(['singleCustomer', selectedCustomer.id]);
            setDniExistsError('');

        } catch (error) {
            Swal.close();
            console.error('Error:', error);
            mostrarError(error.response?.data?.message || 'Hubo un error al guardar el cliente.', theme);
        }
    }, [dialogMode, createCustomerMutation, updateCustomerMutation, selectedCustomer, refetchCustomers, dniExistsError, queryClient, tienePermiso]);

    const handleDelete = useCallback((customer) => {
        mostrarConfirmacion({
            title: '¿Está seguro?',
            text: `¿Está seguro de eliminar al cliente "${customer.name}"? Esta acción no se puede deshacer.`,
            icon: 'warning',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }, theme, () => { // onConfirm
            deleteCustomerMutation.mutateAsync({ url: '/customers', id: customer.id }, {
                onSuccess: () => {
                    refetchCustomers();
                    mostrarExito('¡Eliminado! El cliente ha sido eliminado.', theme);
                },
                onError: (error) => {
                    console.error('Error:', error);
                    mostrarError('Hubo un error al eliminar el cliente.', theme);
                }
            });
        });
    }, [deleteCustomerMutation, refetchCustomers, theme]);

    const handleRegisterPayment = useCallback(async (paymentData, customer, setPaymentData) => {
        if (!paymentData.amount || paymentData.amount <= 0) {
            mostrarError('El monto debe ser mayor a 0', theme);
            return;
        }

        // Lógica para requerir caja abierta en pagos con efectivo
        if (paymentData.payment_method === 'efectivo' && !activeSession) {
            mostrarError('Para registrar un pago en efectivo, debe tener una sesión de caja abierta.', theme);
            return;
        }

        mostrarCarga('Registrando Pago...', theme);

        // Preparar los datos para la mutación
        const valuesToSubmit = {
            ...paymentData,
            created_by: usuario?.nombre || 'Sistema'
        };

        // Añadir el ID de la sesión de caja si el pago es en efectivo
        if (paymentData.payment_method === 'efectivo') {
            valuesToSubmit.cash_session_id = activeSession.id;
        }

        try {
            await paymentMutation.mutateAsync({
                url: `/customers/${customer.id}/payments`,
                values: valuesToSubmit,
                showSuccessAlert: false
            });

            Swal.close();
            mostrarExito('Pago registrado exitosamente', theme);

            setOpenPaymentDialog(false);
            refetchCustomers();
            queryClient.invalidateQueries(['singleCustomer', customer.id]);
            setPaymentData({ amount: '', payment_method: 'efectivo', notes: '' });

        } catch (error) {
            Swal.close();
            console.error('Error:', error);
            mostrarError(error.response?.data?.message || 'Error al registrar el pago.', theme);
        }
    }, [paymentMutation, usuario, refetchCustomers, queryClient, setOpenPaymentDialog, theme, activeSession]);

    const handleExportCSV = useCallback(async () => {
        try {
            const response = await Api.get('/customers/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clientes.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            mostrarExito('Archivo CSV descargado exitosamente', theme);
        } catch (error) {
            mostrarError('Error al exportar CSV', theme);
            console.error('Error:', error);
        }
    }, []);

    const handleChangePage = useCallback((_, newPage) => setPage(newPage + 1), []);
    const handleChangeRowsPerPage = useCallback((event) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(1);
    }, []);
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        setPage(1);
    }, []);
    const handleSortByChange = useCallback((value) => {
        setSortBy(value);
        setPage(1);
    }, []);
    const handleSortOrderChange = useCallback((value) => {
        setSortOrder(value);
        setPage(1);
    }, []);
    const handleStartDateChange = useCallback((value, event) => {
        setStartDate(value);
        setPage(1);
        if (event && event.target) {
            event.target.blur();
        }
    }, [setStartDate, setPage]);
    const handleEndDateChange = useCallback((value, event) => {
        setEndDate(value);
        setPage(1);
        if (event && event.target) {
            event.target.blur();
        }
    }, [setEndDate, setPage]);
    const handleDebtStatusChange = useCallback((value) => {
        setDebtStatus(value);
        setPage(1);
    }, []);
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setSortBy('name');
        setSortOrder('ASC');
        setStartDate('');
        setEndDate('');
        setDebtStatus('all');
        setPage(1);
    }, []);

    return {
        customers, isLoadingCustomers, isErrorCustomers, queryErrorCustomers, refetchCustomers,
        page, totalPages, totalItems, limit, search, sortBy, sortOrder, startDate, endDate, debtStatus,
        openDialog, setOpenDialog, dialogMode, setDialogMode, selectedCustomer, setSelectedCustomer,
        singleCustomerData, isLoadingSingleCustomer, openPaymentDialog, setOpenPaymentDialog,
        openHistoryDialog, setOpenHistoryDialog, handleCreate, handleEdit, handleView, handleSave,
        handleDelete, handleRegisterPayment, handleExportCSV, handleChangePage, handleChangeRowsPerPage,
        handleSearchChange, handleSortByChange, handleSortOrderChange, handleStartDateChange,
        handleEndDateChange, handleDebtStatusChange, handleClearFilters, error, success, setError,
        setSuccess, checkDuplicate, dniExistsError
    };

};
