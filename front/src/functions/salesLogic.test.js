import test from 'node:test';
import assert from 'node:assert/strict';
import { findStockShortages, getQuoteLineStockStatus } from './salesLogic.js';

test('detecta stock insuficiente en la conversión de un presupuesto', () => {
    const items = [
        { stock_id: 10, is_manual_entry: false, name: 'Flete', quantity_for_stock_deduction: 1 },
    ];
    const products = [
        { id: 10, name: 'Flete', stock: 0 },
    ];

    assert.deepEqual(findStockShortages(items, products), [
        { stockId: 10, name: 'Flete', available: 0, requested: 1, missing: 1, unit: '' },
    ]);
});

test('agrupa cantidades del mismo producto y conserva los nombres de las líneas', () => {
    const items = [
        { stock_id: 20, is_manual_entry: false, name: 'Cemento', quantity_for_stock_deduction: 10 },
        { stock_id: 20, is_manual_entry: false, name: 'Cemento (bolsa)', quantity_for_stock_deduction: 5 },
    ];
    const products = [
        { id: 20, name: 'Cemento', stock: '12', unitAbbreviation: 'kg' },
    ];

    assert.deepEqual(findStockShortages(items, products), [
        { stockId: 20, name: 'Cemento / Cemento (bolsa)', available: 12, requested: 15, missing: 3, unit: 'kg' },
    ]);
});

test('ignora productos manuales y productos que no están en la lista de stock', () => {
    const items = [
        { stock_id: null, is_manual_entry: true, name: 'Mano de obra', quantity_for_stock_deduction: 1 },
        { stock_id: 30, is_manual_entry: false, name: 'Producto oculto', quantity_for_stock_deduction: 2 },
    ];
    const products = [
        { id: 10, name: 'Flete', stock: 0 },
    ];

    assert.deepEqual(findStockShortages(items, products), []);
});

test('no reporta faltantes cuando el stock alcanza', () => {
    const items = [
        { stock_id: 10, is_manual_entry: false, name: 'Flete', quantity_for_stock_deduction: 1 },
    ];
    const products = [
        { id: 10, name: 'Flete', stock: 1 },
    ];

    assert.deepEqual(findStockShortages(items, products), []);
});

test('muestra stock suficiente y faltante de una línea de producto', () => {
    const products = [
        { id: 10, name: 'Cemento', stock: '5', unitAbbreviation: 'kg' },
    ];

    const enough = getQuoteLineStockStatus(
        { stock_id: 10, quantity: 3, is_manual_entry: false },
        products
    );
    assert.equal(enough.status, 'ok');
    assert.equal(enough.available, 5);
    assert.equal(enough.requested, 3);
    assert.equal(enough.missing, 0);
    assert.equal(enough.baseUnit, 'kg');

    const short = getQuoteLineStockStatus(
        { stock_id: 10, quantity: 6, is_manual_entry: false },
        products
    );
    assert.equal(short.status, 'insufficient');
    assert.equal(short.available, 5);
    assert.equal(short.requested, 6);
    assert.equal(short.missing, 1);
});

test('compara presentaciones en unidades base y calcula equivalencias', () => {
    const products = [{
        id: 20,
        name: 'Cemento',
        stock: '25',
        unitAbbreviation: 'kg',
        presentations: [
            { id: 2, name: 'Bolsa 10 kg', quantity_in_base_units: '10' },
        ],
    }];

    const info = getQuoteLineStockStatus({
        stock_id: 20,
        presentation_id: 2,
        quantity: 3,
        is_manual_entry: false,
    }, products);

    assert.equal(info.status, 'insufficient');
    assert.equal(info.available, 25);
    assert.equal(info.requested, 30);
    assert.equal(info.missing, 5);
    assert.equal(info.factor, 10);
    assert.equal(info.presentationAvailable, 2);
});

test('no controla stock en líneas manuales y marca productos no disponibles', () => {
    const products = [
        { id: 10, name: 'Cemento', stock: 5, unitAbbreviation: 'kg' },
    ];

    assert.equal(
        getQuoteLineStockStatus({ stock_id: null, is_manual_entry: true, quantity: 1 }, products).status,
        'not_applicable'
    );
    assert.equal(
        getQuoteLineStockStatus({ stock_id: 99, is_manual_entry: false, quantity: 1 }, products).status,
        'unavailable'
    );
    assert.equal(
        getQuoteLineStockStatus(
            { stock_id: 10, presentation_id: 99, is_manual_entry: false, quantity: 1 },
            products
        ).status,
        'unavailable'
    );
    assert.equal(
        getQuoteLineStockStatus(
            { stock_id: 11, is_manual_entry: false, quantity: 1 },
            [{ id: 11, stock: null, unitAbbreviation: 'kg' }]
        ).status,
        'unknown'
    );
});
