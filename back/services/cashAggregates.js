export const buildSessionAggregateMap = (sessionIds, salesRows = [], paymentRows = [], movementRows = []) => {
    const ids = [...new Set(sessionIds)].filter(Boolean);
    const aggregates = new Map(ids.map(id => [String(id), {
        sales_count: 0,
        total_sales: 0,
        total_sales_with_surcharge: 0,
        total_discounts: 0,
        payment_methods: {},
        totalIncome: 0,
        totalExpense: 0
    }]));

    salesRows.forEach(row => {
        const aggregate = aggregates.get(String(row.cash_session_id));
        if (!aggregate) return;
        aggregate.sales_count = Number(row.sales_count || 0);
        aggregate.total_sales = Number(row.total_sales || 0);
        aggregate.total_sales_with_surcharge = Number(row.total_sales_with_surcharge || 0);
        aggregate.total_discounts = Number(row.total_discounts || 0);
    });

    paymentRows.forEach(row => {
        const aggregate = aggregates.get(String(row.cash_session_id));
        if (!aggregate) return;
        aggregate.payment_methods[row.method || 'Desconocido'] = Number(row.total || 0);
    });

    movementRows.forEach(row => {
        const aggregate = aggregates.get(String(row.cash_session_id));
        if (!aggregate) return;
        if (row.type === 'ingreso') aggregate.totalIncome = Number(row.total || 0);
        if (row.type === 'egreso') aggregate.totalExpense = Number(row.total || 0);
    });

    return aggregates;
};
