export const manualPaymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta_debito', label: 'Tarjeta de débito' },
    { value: 'tarjeta_credito', label: 'Tarjeta de crédito' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' }
];

export const formatPaymentMethodLabel = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    const method = manualPaymentMethods.find(
        (option) => option.value === normalized || option.label.toLowerCase() === normalized
    );
    return method?.label || value || '-';
};
