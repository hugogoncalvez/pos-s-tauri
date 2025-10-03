import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import EntityName from './EntityName'; // Importar el nuevo componente


const keyTranslations = {
    // General
    product_name: 'Nombre del Producto',
    quantity: 'Cantidad',
    price: 'Precio',
    description: 'Descripción',
    name: 'Nombre',
    notes: 'Notas',
    status: 'Estado',
    amount: 'Monto',
    total_amount: 'Monto Total',
    total_neto: 'Total Neto',
    promotion_discount: 'Descuento por Promoción',
    customer_id: 'Cliente',
    user_id: 'Usuario',
    payment_method: 'Método de Pago',
    payment_method_id: 'Método de Pago',
    payments: 'Pagos',
    cash_session_id: 'Sesión de Caja',
    sale_id: 'Venta',

    // Stock
    current_stock: 'Stock Actual',
    min_stock: 'Stock Mínimo',
    stock_before: 'Stock Anterior',
    stock_after: 'Stock Posterior',
    quantity_sold: 'Cantidad Vendida',
    original_price: 'Precio Original',
    new_price: 'Precio Nuevo',

    // Sesión de Caja
    opening_amount: 'Monto de Apertura',
    cashier_declared_amount: 'Monto Declarado (Cajero)',
    admin_verified_amount: 'Monto Verificado (Admin)',
    preliminary_discrepancy: 'Diferencia Preliminar',
    final_discrepancy: 'Diferencia Final',
    declared: 'Declarado',
    verified_amount: 'Monto Verificado',
    discrepancy: 'Diferencia',

    // Importación
    importedCount: 'Importados',
    updatedCount: 'Actualizados',
    errorCount: 'Errores',
    errors: 'Detalle de Errores',
};

const FormattedLogDetails = ({ log, paymentMethodsMap }) => {

    const formatValue = (key, value) => {
        if (key.endsWith('_id')) {
            let entityType = key.replace('_id', '');
            if (key === 'payment_method_id') entityType = 'paymentMethod';
            if (key === 'cash_session_id') entityType = 'cashSession';
            return <EntityName entityType={entityType} entityId={value} />;
        }

        if (typeof value === 'boolean') {
            return <Chip label={value ? 'Sí' : 'No'} size="small" color={value ? 'success' : 'error'} />;
        }

        if (key === 'payments' && Array.isArray(value)) {
            return (
                <Box sx={{ pl: 2, mt: 1 }}>
                    {value.map((p, i) => {
                        const paymentMethodId = p.method_id || p.payment_method_id;
                        const paymentMethodName = paymentMethodsMap.has(paymentMethodId)
                            ? paymentMethodsMap.get(paymentMethodId)
                            : <EntityName entityType="paymentMethod" entityId={paymentMethodId} />;

                        return (
                            <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                                <Typography component="span" variant="body2" fontWeight="bold">-</Typography>
                                <Typography component="span" variant="body2" fontWeight="bold">{paymentMethodName}</Typography>
                                <Typography component="span" variant="body2" fontWeight="bold">:</Typography>
                                <Typography component="span" variant="body1" fontWeight="bold">{formatValue('amount', p.amount)}</Typography>
                            </Box>
                        );
                    })}
                </Box>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>{JSON.stringify(value, null, 2)}</pre>;
        }

        if (key.includes('amount') || key.includes('price') || key.includes('total') || key.includes('debt') || key.includes('credit') || key.includes('discrepancy') || key === 'promotion_discount') {
            return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        }

        if (key.includes('_at') && value) {
            return new Date(value).toLocaleString('es-AR');
        }

        return String(value);
    };

    const renderChanges = (title, values) => {
        if (!values || Object.keys(values).length === 0) {
            return null;
        }

        return (
            <Box>
                <Typography variant="subtitle2" gutterBottom>{title}</Typography>
                {Object.entries(values).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1, display: 'flex' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', minWidth: '180px' }}>{keyTranslations[key] || key.replace(/_/g, ' ')}:</Typography>
                        <Typography component="span" variant="body1" fontWeight="bold">{formatValue(key, value)}</Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Box>
            {renderChanges('Valores Anteriores', log.old_values)}
            {log.old_values && log.new_values && <Box sx={{ my: 2 }} />}
            {renderChanges('Valores Nuevos', log.new_values)}
        </Box>
    );
};

export default FormattedLogDetails;