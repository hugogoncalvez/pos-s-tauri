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