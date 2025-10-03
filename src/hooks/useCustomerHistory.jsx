import { useState, useCallback, useEffect } from 'react';
import { UseFetchQuery } from './useQuery';
import { useSubmit } from './useSubmit';
import { Api } from '../api/api';
import { printReceipt } from '../functions/printUtils';

export const useCustomerHistory = (customerId, customerName = '') => { // Agregar customerName como parámetro
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);

    const [historyFilters, setHistoryFilters] = useState({
        purchases: {
            page: 1,
            limit: 5, // Default limit for history lists
            start_date: '',
            end_date: '',
            totalPages: 1,
            totalItems: 0,
        },
        payments: {
            page: 1,
            limit: 5, // Default limit for history lists
            start_date: '',
            end_date: '',
            totalPages: 1,
            totalItems: 0,
        },
    });

    const [openPurchaseDetailDialog, setOpenPurchaseDetailDialog] = useState(false);
    const [openPaymentDetailDialog, setOpenPaymentDetailDialog] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [purchaseDetails, setPurchaseDetails] = useState([]);

    const purchaseQuery = UseFetchQuery(
        ['customerPurchases', customerId, historyFilters.purchases.page, historyFilters.purchases.limit, historyFilters.purchases.start_date, historyFilters.purchases.end_date],
        async () => {
            if (!customerId) {
                return { success: true, data: { purchases: [], pagination: { totalPages: 0, totalItems: 0 } } };
            }
            const response = await Api.get(`/customers/${customerId}/purchases?page=${historyFilters.purchases.page}&limit=${historyFilters.purchases.limit}&start_date=${historyFilters.purchases.start_date}&end_date=${historyFilters.purchases.end_date}`);
            return response.data;
        },
        !!customerId && !!historyFilters.purchases.page,
        0
    );

    const paymentQuery = UseFetchQuery(
        ['customerPayments', customerId, historyFilters.payments.page, historyFilters.payments.limit, historyFilters.payments.start_date, historyFilters.payments.end_date],
        async () => {
            if (!customerId) {
                return { success: true, data: { payments: [], pagination: { totalPages: 0, totalItems: 0 } } };
            }
            const response = await Api.get(`/customers/${customerId}/payments?page=${historyFilters.payments.page}&limit=${historyFilters.payments.limit}&start_date=${historyFilters.payments.start_date}&end_date=${historyFilters.payments.end_date}`);
            return response.data;
        },
        !!customerId && !!historyFilters.payments.page,
        0
    );

    useEffect(() => {
        if (purchaseQuery.data?.success) {
            setPurchaseHistory(purchaseQuery.data.data?.purchases || []);
            setHistoryFilters(prev => ({
                ...prev,
                purchases: {
                    ...prev.purchases,
                    totalPages: purchaseQuery.data.data?.pagination?.totalPages || 1,
                    totalItems: purchaseQuery.data.data?.pagination?.totalItems || 0,
                }
            }));
        }
    }, [purchaseQuery.data]);

    useEffect(() => {
        if (paymentQuery.data?.success) {
            setPaymentHistory(paymentQuery.data.data?.payments || []);
            setHistoryFilters(prev => ({
                ...prev,
                payments: {
                    ...prev.payments,
                    totalPages: paymentQuery.data.data?.pagination?.totalPages || 1,
                    totalItems: paymentQuery.data.data?.pagination?.totalItems || 0,
                }
            }));
        }
    }, [paymentQuery.data]);

    const handleHistoryFilterChange = useCallback((type, field, value) => {
        setHistoryFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
                ...(field !== 'page' && { page: 1 }) // Resetear página cuando cambian otros filtros
            }
        }));
    }, []);

    const applyHistoryFilters = useCallback(() => {
        if (historyFilters.purchases.start_date && historyFilters.purchases.end_date) {
            purchaseQuery.refetch();
        }
        if (historyFilters.payments.start_date && historyFilters.payments.end_date) {
            paymentQuery.refetch();
        }
    }, [historyFilters, purchaseQuery, paymentQuery]);

    const clearHistoryFilters = useCallback((type) => {
        setHistoryFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                start_date: '',
                end_date: '',
                page: 1
            }
        }));
        // Disparar refetch después de limpiar los filtros
        if (type === 'purchases') {
            purchaseQuery.refetch();
        } else if (type === 'payments') {
            paymentQuery.refetch();
        }
    }, [purchaseQuery, paymentQuery]);

    const handleViewPurchaseDetail = useCallback((purchase) => {
        setSelectedPurchase(purchase); // Establecer la compra seleccionada directamente
        setPurchaseDetails(purchase.sale_details || []); // Directly use sale_details from the purchase object
        setOpenPurchaseDetailDialog(true); // Abrir el modal
    }, []);

    const handleViewPaymentDetail = useCallback((payment) => {
        setSelectedPayment(payment);
        setOpenPaymentDetailDialog(true);
    }, []);

    // Modificar para usar customerName del parámetro del hook
    const handlePrintPurchase = useCallback((purchase, customName = customerName) => {
        printReceipt(purchase, 'sale', customName);
    }, [customerName]);

    // Modificar para usar customerName del parámetro del hook
    const handlePrintPayment = useCallback((payment, customName = customerName) => {
        printReceipt(payment, 'payment', customName);
    }, [customerName]);

    const handlePrintDoublePaymentReceipt = useCallback((payment, customName = customerName) => {
        // Podrías llamar a printReceipt dos veces o modificar printReceipt para manejar un formato doble
        // Por simplicidad, aquí se llama una vez.
        printReceipt(payment, 'payment', customName);
    }, [customerName]);

    return {
        purchaseHistory,
        paymentHistory,
        loadingHistory: purchaseQuery.isLoading || paymentQuery.isLoading,
        errorHistory: purchaseQuery.isError || paymentQuery.isError ? (purchaseQuery.error?.message || paymentQuery.error?.message || 'Error al cargar historial') : null,
        historyFilters,
        openPurchaseDetailDialog,
        setOpenPurchaseDetailDialog,
        openPaymentDetailDialog,
        setOpenPaymentDetailDialog,
        selectedPurchase,
        setSelectedPurchase,
        selectedPayment,
        setSelectedPayment,
        purchaseDetails,
        setPurchaseDetails,
        handleHistoryFilterChange,
        applyHistoryFilters,
        clearHistoryFilters,
        handleViewPurchaseDetail,
        handleViewPaymentDetail,
        handlePrintPurchase,
        handlePrintPayment,
        handlePrintDoublePaymentReceipt
    };
};