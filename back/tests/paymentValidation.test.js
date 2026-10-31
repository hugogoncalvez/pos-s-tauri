import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateExpectedPaymentAmount,
    getPaymentAmountError
} from '../utils/paymentValidation.js';

test('venta con descuento y pago simple: el pago neto alcanza', () => {
    assert.equal(calculateExpectedPaymentAmount({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 0
    }), 75000);

    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 0,
        payments: [{ payment_method_id: 1, amount: 75000 }]
    }), null);
});

test('venta sin descuento: sigue funcionando', () => {
    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 0,
        surcharge_amount: 0,
        payments: [{ payment_method_id: 1, amount: 85000 }]
    }), null);
});

test('venta con descuento y recargo: el pago con recargo alcanza', () => {
    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 3750,
        payments: [{ payment_method_id: 1, amount: 78750 }]
    }), null);
});

test('pago realmente insuficiente: se rechaza', () => {
    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 0,
        payments: [{ payment_method_id: 1, amount: 70000 }]
    }), 'Monto insuficiente: 70000.00 < 75000.00');
});

test('pago mixto que cubre el neto: se acepta', () => {
    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 0,
        payments: [
            { payment_method_id: 2, amount: 50000 },
            { payment_method_id: 1, amount: 25000 }
        ]
    }), null);
});

test('tolerancia de centavos', () => {
    assert.equal(getPaymentAmountError({
        total_amount: 85000,
        promotion_discount: 10000,
        surcharge_amount: 0,
        payments: [{ payment_method_id: 1, amount: 74999.99 }]
    }), null);
});

test('acepta valores numéricos en string y campos opcionales', () => {
    assert.equal(getPaymentAmountError({
        total_amount: '85000',
        promotion_discount: '10000',
        payments: [{ amount: '75000' }]
    }), null);
});
