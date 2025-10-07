
# Guía de Implementación: Sistema de Recargo Inverso para Pagos Mixtos

## 1. Objetivo de la Implementación

Implementar un sistema de cálculo de recargos para pagos mixtos que sea robusto, financieramente preciso y fácil de usar para el cajero. La lógica se basará en el **cálculo inverso**: el cajero ingresa el monto final que el cliente desea pagar con un método, y el sistema calcula hacia atrás qué porción corresponde al subtotal y qué porción es recargo.

Esto elimina bucles de recálculo, permite el uso de múltiples métodos de pago con recargo en una misma transacción y mejora la experiencia de usuario.

## 2. Resumen de Cambios

1.  **Lógica de Cálculo (`Ventas.jsx`):** Se reemplazará la función de cálculo de totales por una nueva que utiliza la lógica de cálculo inverso.
2.  **Validación (`Ventas.jsx`):** Se actualizará la función que valida los pagos mixtos para que informe sobre saldos pendientes o excedentes.
3.  **Paso de Props (`Ventas.jsx`):** Se enviará el desglose detallado de los recargos al modal de resumen.
4.  **UI del Modal (`SummarySaleModal.jsx`):** Se eliminará la restricción que impedía seleccionar dos métodos con recargo.
5.  **UI del Modal (`SummarySaleModal.jsx`):** Se añadirá un nuevo componente para mostrar un desglose claro de los recargos y el saldo pendiente.

---

## 3. Guía Detallada

A continuación se detalla el código que debes añadir o reemplazar en cada archivo.

### **Archivo 1: `front/src/components/Ventas.jsx`**

#### **Paso 1: Reemplazar la lógica de cálculo y validación**

Busca el inicio del componente `const Ventas = () => {` y, justo antes de esa línea, **añade** la siguiente función auxiliar:

```javascript
/**
 * Calcula los totales, recargos y saldos para una venta con pagos mixtos,
 * utilizando una lógica de cálculo inverso para los recargos.
 */
const calcularTotalConRecargoInverso = (subtotal, mixedPayments, paymentMethods) => {
  let totalPagadoAlSubtotal = 0;
  let totalRecargos = 0;
  const surchargeDetails = [];
  const paymentBreakdown = [];

  for (const payment of mixedPayments) {
    const method = paymentMethods.find(pm => pm.id === payment.payment_method_id);
    const amountEntered = parseFloat(payment.amount) || 0;

    if (!method || amountEntered <= 0) continue;

    let baseAmount = amountEntered;
    let surchargeAmount = 0;

    if (method.surcharge_active && method.surcharge_percentage > 0) {
      const surchargeRate = parseFloat(method.surcharge_percentage) / 100;
      baseAmount = amountEntered / (1 + surchargeRate);
      surchargeAmount = amountEntered - baseAmount;
    }

    totalPagadoAlSubtotal += baseAmount;
    totalRecargos += surchargeAmount;

    surchargeDetails.push({
      methodName: method.method || method.nombre,
      amountEntered: amountEntered,
      baseAmount: baseAmount,
      surchargeAmount: surchargeAmount,
      percentage: method.surcharge_percentage || 0,
    });

    paymentBreakdown.push({
      ...payment,
      methodName: method.method || method.nombre,
      baseAmount: baseAmount,
      surchargeAmount: surchargeAmount
    });
  }

  const saldoPendiente = subtotal - totalPagadoAlSubtotal;
  const totalFinal = subtotal + totalRecargos;

  return {
    subtotal,
    totalRecargos,
    surchargeDetails,
    totalPagadoAlSubtotal,
    saldoPendiente,
    totalFinal,
    paymentBreakdown,
    isPaid: Math.abs(saldoPendiente) < 0.01,
    isOverpaid: saldoPendiente < -0.01
  };
};
```

Luego, busca y **reemplaza completamente** el `useCallback` de `calcularTotal` con este nuevo código:

```javascript
  const calcularTotal = useCallback(() => {
    let subtotal = 0;
    processedTempTable.forEach(item => {
      subtotal += parseFloat(item.cost || 0);
    });

    const descuentoAplicado = descuento || 0;
    const subtotalConDescuento = subtotal - descuentoAplicado;

    let surchargeAmount = 0;
    let surchargeDetails = [];
    let saldoPendiente = 0;

    if (paymentOption === 'single' && selectedSinglePaymentType?.surcharge_active) {
      surchargeAmount = subtotalConDescuento * (parseFloat(selectedSinglePaymentType.surcharge_percentage) / 100);
    } else if (paymentOption === 'mixed' && paymentMethods) {
      const inverseResult = calcularTotalConRecargoInverso(subtotalConDescuento, mixedPayments, paymentMethods);
      surchargeAmount = inverseResult.totalRecargos;
      surchargeDetails = inverseResult.surchargeDetails;
      saldoPendiente = inverseResult.saldoPendiente;
    }

    const impuesto = ivaActivo ? (subtotalConDescuento + surchargeAmount) * 0.21 : 0;
    const totalFinal = subtotalConDescuento + surchargeAmount + impuesto;

    return {
      subtotal,
      impuesto,
      descuento: descuentoAplicado,
      surchargeAmount,
      surchargeDetails, // <-- Importante devolver esto
      saldoPendiente,   // <-- Importante devolver esto
      totalFinal
    };
  }, [processedTempTable, ivaActivo, descuento, selectedSinglePaymentType, paymentOption, mixedPayments, paymentMethods]);
```

Ahora, busca y **reemplaza completamente** el `useCallback` de `validateMixedPayments` con este:

```javascript
  const validateMixedPayments = useCallback(() => {
    const validPayments = mixedPayments.filter(p => p.payment_method_id && parseFloat(p.amount) > 0);
    if (validPayments.length === 0) {
        return 'Ingrese al menos un monto para el pago mixto.';
    }

    const subtotalConDescuento = (subtotal || 0) - (descuento || 0);
    const result = calcularTotalConRecargoInverso(subtotalConDescuento, mixedPayments, paymentMethods);

    if (result.isOverpaid) {
        return `Vuelto: $${Math.abs(result.saldoPendiente).toFixed(2)}. Confirme para continuar.`;
    }

    if (result.saldoPendiente > 0.01) {
        return `Faltan $${result.saldoPendiente.toFixed(2)} para completar el pago.`;
    }
    
    const methodIds = validPayments.map(p => p.payment_method_id);
    if (new Set(methodIds).size !== methodIds.length) {
        return 'Los métodos de pago no pueden ser iguales.';
    }

    const hasCredito = validPayments.some(p => {
        const method = paymentMethods?.find(pm => pm.id === p.payment_method_id);
        return method?.method?.toLowerCase().includes('credito') || method?.nombre?.toLowerCase().includes('credito');
    });

    if (hasCredito && selectedCustomer.id === 1) {
        return 'No se puede otorgar crédito al Consumidor Final.';
    }

    return true;
  }, [mixedPayments, subtotal, descuento, paymentMethods, selectedCustomer]);
```

Finalmente, busca la línea donde se extraen los valores de `calcularTotal` y **modíficala** para que también obtenga `surchargeDetails` y `saldoPendiente`:

```javascript
// ANTES:
const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, totalFinal } = useMemo(() => calcularTotal(), [calcularTotal]);

// DESPUÉS:
const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, surchargeDetails, saldoPendiente, totalFinal } = useMemo(() => calcularTotal(), [calcularTotal]);
```

### **Archivo 2: `front/src/styledComponents/SummarySaleModal.jsx`**

#### **Paso 1: Añadir el componente de desglose**

Justo antes de `const SummarySaleModal = ({...}) => {`, **añade** este nuevo componente:

```javascript
const SurchargeBreakdownDisplay = ({ surchargeDetails, totalRecargos }) => {
  if (!surchargeDetails || surchargeDetails.length === 0 || totalRecargos === 0) return null;

  return (
    <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255, 152, 0, 0.08)', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Desglose de Recargos:
      </Typography>
      {surchargeDetails.map((detail, index) => (
        detail.surchargeAmount > 0 && (
          <Grid container key={index} spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
            <Grid item xs={5}>
              <Typography variant="body2">{detail.methodName}:</Typography>
            </Grid>
            <Grid item xs={3} sx={{ textAlign: 'right' }}>
              <Typography variant="body2">${detail.amountEntered.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="warning.main">
                +${detail.surchargeAmount.toFixed(2)} ({detail.percentage}%)
              </Typography>
            </Grid>
          </Grid>
        )
      ))}
    </Box>
  );
};
```

#### **Paso 2: Actualizar las props y la lógica del modal**

Busca la definición del componente y **modíficala** para que acepte `surchargeDetails` y `saldoPendiente`.

```javascript
// ANTES:
const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, totalFinal } = calcularTotal();

// DESPUÉS:
const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, surchargeDetails, saldoPendiente, totalFinal } = calcularTotal();
```

#### **Paso 3: Eliminar la restricción de la UI**

Busca el `StyledAutocomplete` para los pagos mixtos y **reemplaza** su prop `options`:

```javascript
// ANTES:
options={Array.isArray(paymentMethods)
  ? paymentMethods.filter(pm =>
    (pm.method?.toLowerCase() !== 'mixto' && pm.nombre?.toLowerCase() !== 'mixto') &&
    pm.id !== mixedPayments[1 - index].payment_method_id
  )
  : []
}

// DESPUÉS (más simple):
options={Array.isArray(paymentMethods)
  ? paymentMethods.filter(pm => pm.method?.toLowerCase() !== 'mixto' && pm.nombre?.toLowerCase() !== 'mixto')
  : []
}
```

#### **Paso 4: Integrar el desglose y el saldo en la UI**

Primero, busca la sección del resumen de totales y **añade** el nuevo componente de desglose justo después del recargo:

```jsx
//...
{surchargeAmount > 0 && (
    <>
        <Grid item xs={6}><Typography color="warning.main">Recargo:</Typography></Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography color="warning.main">+${surchargeAmount.toFixed(2)}</Typography></Grid>
    </>
)}

{/* AÑADIR ESTO */}
<Grid item xs={12}>
    <SurchargeBreakdownDisplay surchargeDetails={surchargeDetails} totalRecargos={surchargeAmount} />
</Grid>

<Grid item xs={12}><Divider sx={{ my: 0, borderColor: 'rgba(255, 255, 255, 0.12)' }} /></Grid>
//...
```

Finalmente, busca la sección de validación de pagos mixtos y **reemplázala** para mostrar el saldo pendiente o el vuelto de forma interactiva:

```jsx
// REEMPLAZAR ESTO:
{validateMixedPayments() !== true && (
  <Alert severity="error" sx={{ mt: 2 }}>{validateMixedPayments()}</Alert>
)}

// CON ESTO:
{(() => {
  const validationMessage = validateMixedPayments();
  if (validationMessage === true) {
    return <Alert severity="success" sx={{ mt: 2 }}>Los montos cubren el total.</Alert>;
  }
  // Si el mensaje es de vuelto, mostrarlo en verde (success)
  if (validationMessage.startsWith('Vuelto')) {
    return <Alert severity="success" sx={{ mt: 2 }}>{validationMessage}</Alert>;
  }
  // Para cualquier otro mensaje (error), mostrarlo en rojo
  return <Alert severity="error" sx={{ mt: 2 }}>{validationMessage}</Alert>;
})()}
```

Con estos cambios, tu sistema de pagos mixtos será mucho más potente y fácil de usar.