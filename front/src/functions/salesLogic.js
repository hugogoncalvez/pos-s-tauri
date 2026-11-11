export const applyPromotions = (items, promotions) => {
    // Reset promotions and restore original costs before reapplying.
    const newItems = items.map(item => ({
      ...item,
      cost: item.original_cost !== undefined ? item.original_cost : item.cost,
      original_cost: item.original_cost !== undefined ? item.original_cost : item.cost,
      promotion: null,
    }));

    if (!promotions || promotions.length === 0) return items.map(({ original_cost, ...rest }) => rest);

    promotions.forEach(promo => {
      const promoProductIdentifiers = new Set();
      if (promo.stocks) promo.stocks.forEach(s => promoProductIdentifiers.add(s.id));
      if (promo.presentations) promo.presentations.forEach(p => promoProductIdentifiers.add(p.id));

      let promoItemCounter = 0;
      const requiredQuantity = promo.required_quantity;

      if (!requiredQuantity || requiredQuantity <= 0) return;

      newItems.forEach(item => {
        const itemIdentifier = item.presentation_id || item.stock_id;
        if (!promoProductIdentifiers.has(itemIdentifier)) return;

        // Ensure original_cost is a number and quantity is a positive number
        const itemOriginalCost = parseFloat(item.original_cost);
        const itemQuantity = parseInt(item.quantity, 10);
        if (isNaN(itemOriginalCost) || isNaN(itemQuantity) || itemQuantity <= 0) return;

        const originalUnitCost = itemOriginalCost / itemQuantity;
        let newCalculatedCost = 0;

        for (let i = 0; i < item.quantity; i++) {
          promoItemCounter++;
          if (promoItemCounter % requiredQuantity === 0) {
            // This unit gets a discount
            if (promo.type === 'BOGO') {
              // Cost is 0, so we add nothing to newCalculatedCost
            } else if (promo.type === 'PERCENT_DISCOUNT_ON_NTH') {
              newCalculatedCost += originalUnitCost * (1 - parseFloat(promo.discount_value) / 100);
            } else if (promo.type === 'FIXED_PRICE_ON_NTH') {
              newCalculatedCost += parseFloat(promo.discount_value);
            } else {
              newCalculatedCost += originalUnitCost; // No discount type matched
            }
          } else {
            newCalculatedCost += originalUnitCost; // No discount
          }
        }

        // Apply the new cost only if it's a valid number and represents a discount
        if (!isNaN(newCalculatedCost) && newCalculatedCost < item.cost) {
          item.cost = newCalculatedCost;
          item.promotion = promo;
        }
      });
    });

    // Clean up the temporary original_cost field before returning
    return newItems.map(({ original_cost, ...rest }) => rest);
};

export const findStockShortages = (items, products) => {
    const stockMap = new Map((products || []).map((product) => [Number(product.id), product]));
    const requestedByStockId = new Map();

    (items || []).forEach((item) => {
        if (!item.stock_id || item.is_manual_entry) return;
        const stockId = Number(item.stock_id);
        const requested = Number(item.quantity_for_stock_deduction) || 0;
        const entry = requestedByStockId.get(stockId) || { requested: 0, names: new Set() };
        entry.requested += requested;
        entry.names.add(item.name || `Producto #${stockId}`);
        requestedByStockId.set(stockId, entry);
    });

    const shortages = [];
    requestedByStockId.forEach((entry, stockId) => {
        const stockItem = stockMap.get(stockId);
        if (!stockItem) return;
        const available = Number(stockItem.stock);
        if (Number.isFinite(available) && available < entry.requested) {
            shortages.push({
                stockId,
                name: [...entry.names].join(' / '),
                available,
                requested: entry.requested,
            });
        }
    });

    return shortages;
};

const emptyStockStatus = (status) => ({
    status,
    available: null,
    requested: null,
    factor: null,
    presentationAvailable: null,
    missing: 0,
    baseUnit: '',
});

export const getQuoteLineStockStatus = (line, products) => {
    if (!line || line.is_manual_entry || !line.stock_id) {
        return emptyStockStatus('not_applicable');
    }

    const product = (products || []).find((item) => Number(item.id) === Number(line.stock_id));
    if (!product) {
        return emptyStockStatus('unavailable');
    }

    const baseUnit = product.unitAbbreviation || product.unitName || '';
    const quantity = Number(line.quantity) || 0;
    let factor = 1;

    if (line.presentation_id) {
        const presentation = (product.presentations || []).find(
            (item) => Number(item.id) === Number(line.presentation_id)
        );
        if (!presentation) {
            return { ...emptyStockStatus('unavailable'), baseUnit };
        }

        factor = Number(presentation.quantity_in_base_units);
        if (!Number.isFinite(factor) || factor <= 0) {
            return { ...emptyStockStatus('unknown'), baseUnit };
        }
    }

    const rawStock = product.stock;
    const available = Number(rawStock);
    if (rawStock === null || rawStock === undefined || rawStock === '' || !Number.isFinite(available)) {
        return {
            ...emptyStockStatus('unknown'),
            requested: quantity * factor,
            factor,
            baseUnit,
        };
    }

    const requested = quantity * factor;
    const insufficient = requested > available;

    return {
        status: insufficient ? 'insufficient' : 'ok',
        available,
        requested,
        factor,
        presentationAvailable: factor > 1
            ? Math.max(0, Math.floor(available / factor))
            : null,
        missing: insufficient ? requested - available : 0,
        baseUnit,
    };
};
