import { useState, useCallback, useEffect } from 'react';
import { UseFetchQuery } from './useQuery';
import { Api } from '../api/api';
import { printReceipt } from '../functions/printUtils';

export const useCustomerHistory = (customerId, customerName = '') => {
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [saleIdForDetail, setSaleIdForDetail] = useState(null); // <-- NUEVO

    const [historyFilters, setHistoryFilters] = useState({
        purchases: {
            page: 1,
            limit: 5,
            start_date: '',
            end_date: '',
            totalPages: 1,
            totalItems: 0,
        },
        payments: {
            page: 1,
            limit: 5,
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

    // Query para la lista de compras del historial
    const purchaseQuery = UseFetchQuery(
        ['customerPurchases', customerId, historyFilters.purchases.page, historyFilters.purchases.limit, historyFilters.purchases.start_date, historyFilters.purchases.end_date],
        async () => {
            if (!customerId) return { success: true, data: { purchases: [], pagination: { totalPages: 0, totalItems: 0 } } };
            const response = await Api.get(`/customers/${customerId}/purchases?page=${historyFilters.purchases.page}&limit=${historyFilters.purchases.limit}&start_date=${historyFilters.purchases.start_date}&end_date=${historyFilters.purchases.end_date}`);
            return response.data;
        },
        !!customerId && !!historyFilters.purchases.page
    );

    // Query para la lista de pagos del historial
    const paymentQuery = UseFetchQuery(
        ['customerPayments', customerId, historyFilters.payments.page, historyFilters.payments.limit, historyFilters.payments.start_date, historyFilters.payments.end_date],
        async () => {
            if (!customerId) return { success: true, data: { payments: [], pagination: { totalPages: 0, totalItems: 0 } } };
            const response = await Api.get(`/customers/${customerId}/payments?page=${historyFilters.payments.page}&limit=${historyFilters.payments.limit}&start_date=${historyFilters.payments.start_date}&end_date=${historyFilters.payments.end_date}`);
            return response.data;
        },
        !!customerId && !!historyFilters.payments.page
    );

    // <-- NUEVO: Query para obtener el detalle de UNA SOLA venta
    const saleDetailQuery = UseFetchQuery(
        ['saleDetail', saleIdForDetail],
        async () => {
            if (!saleIdForDetail) return null;
            const response = await Api.get(`/sales/${saleIdForDetail}/details`);
            return response.data;
        },
        !!saleIdForDetail // Solo se ejecuta si saleIdForDetail tiene un valor
    );

    // Efecto para actualizar la lista de compras cuando los datos de la query cambian
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

    // Efecto para actualizar la lista de pagos
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

    // <-- NUEVO: Efecto para procesar los detalles de la venta cuando llegan
    useEffect(() => {
        if (saleDetailQuery.data) {
            setSelectedPurchase(saleDetailQuery.data);
            setPurchaseDetails(saleDetailQuery.data.sale_details || []);
        }
    }, [saleDetailQuery.data]);

    const handleHistoryFilterChange = useCallback((type, field, value) => {
        setHistoryFilters(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
                ...(field !== 'page' && { page: 1 })
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
        if (type === 'purchases') {
            purchaseQuery.refetch();
        } else if (type === 'payments') {
            paymentQuery.refetch();
        }
    }, [purchaseQuery, paymentQuery]);

    // <-- MODIFICADO: Ahora solo activa la query de detalle
    const handleViewPurchaseDetail = useCallback((purchase) => {
        setSaleIdForDetail(purchase.id);
        setOpenPurchaseDetailDialog(true);
    }, []);

    const handleViewPaymentDetail = useCallback((payment) => {
        setSelectedPayment(payment);
        setOpenPaymentDetailDialog(true);
    }, []);

    const handlePrintPurchase = useCallback((purchase, customName = customerName) => {
        printReceipt(purchase, 'sale', customName);
    }, [customerName]);

    const handlePrintPayment = useCallback((payment, customName = customerName) => {
        printReceipt(payment, 'payment', customName);
    }, [customerName]);

    const handlePrintDoublePaymentReceipt = useCallback((payment, customName = customerName) => {
        printReceipt(payment, 'payment', customName);
    }, [customerName]);

    return {
        purchaseHistory,
        paymentHistory,
        loadingHistory: purchaseQuery.isLoading || paymentQuery.isLoading || saleDetailQuery.isLoading, // <-- AÑADIR loading de detalle
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
        handlePrintDoublePaymentReceipt,
        setSaleIdForDetail // <-- NUEVO: Exponer para limpiar el estado
    };
};