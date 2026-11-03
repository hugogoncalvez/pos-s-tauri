import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionAggregateMap } from '../services/cashAggregates.js';

test('builds totals and payment methods per session', () => {
    const result = buildSessionAggregateMap(
        [1, 2],
        [{ cash_session_id: 1, sales_count: 2, total_sales: 150, total_sales_with_surcharge: 160, total_discounts: 10 }],
        [
            { cash_session_id: 1, method: 'Efectivo', total: 100 },
            { cash_session_id: 1, method: 'Tarjeta', total: 60 }
        ],
        [
            { cash_session_id: 1, type: 'ingreso', total: 5 },
            { cash_session_id: 1, type: 'egreso', total: 2 }
        ]
    );

    assert.deepEqual(result.get('1'), {
        sales_count: 2,
        total_sales: 150,
        total_sales_with_surcharge: 160,
        total_discounts: 10,
        payment_methods: { Efectivo: 100, Tarjeta: 60 },
        totalIncome: 5,
        totalExpense: 2
    });

    assert.deepEqual(result.get('2'), {
        sales_count: 0,
        total_sales: 0,
        total_sales_with_surcharge: 0,
        total_discounts: 0,
        payment_methods: {},
        totalIncome: 0,
        totalExpense: 0
    });
});

test('ignores rows for sessions that are not in the requested page', () => {
    const result = buildSessionAggregateMap(
        [1],
        [{ cash_session_id: 99, sales_count: 10, total_sales: 1000 }],
        [{ cash_session_id: 99, method: 'Efectivo', total: 1000 }],
        []
    );

    assert.equal(result.size, 1);
    assert.equal(result.get('1').sales_count, 0);
    assert.deepEqual(result.get('1').payment_methods, {});
});
