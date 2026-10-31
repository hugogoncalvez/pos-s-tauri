const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateExpectedPaymentAmount = ({
    total_amount,
    promotion_discount,
    surcharge_amount
} = {}) => {
    const gross = Number(total_amount) || 0;
    const discount = Number(promotion_discount) || 0;
    const surcharge = Number(surcharge_amount) || 0;
    return roundMoney(gross - discount + surcharge);
};

export const getPaymentAmountError = ({
    total_amount,
    promotion_discount,
    surcharge_amount,
    payments
} = {}) => {
    const expectedAmount = calculateExpectedPaymentAmount({
        total_amount,
        promotion_discount,
        surcharge_amount
    });
    const paidAmount = (Array.isArray(payments) ? payments : []).reduce(
        (sum, payment) => sum + (Number(payment?.amount) || 0),
        0
    );

    if (paidAmount < expectedAmount - 0.01) {
        return `Monto insuficiente: ${roundMoney(paidAmount).toFixed(2)} < ${expectedAmount.toFixed(2)}`;
    }

    return null;
};
