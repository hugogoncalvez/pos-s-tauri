# Bugs de caja y Mercado Pago

Documento de seguimiento para revisar el estado de estas correcciones en las demás ramas del proyecto.

## Alcance funcional

- Los "movimientos de Mercado Pago" son las ventas cobradas con el método de pago `Mercado Pago`.
- Cada venta usa un solo método de pago.
- Los ingresos manuales de caja son en efectivo.
- No se usan abonos de clientes para este circuito.
- No se integra ni concilia con la API de Mercado Pago.
- No se guarda número de operación de Mercado Pago.
- No se requiere migración de base de datos para estos cambios.

## Estado en esta rama

### 1. `expected_cash` ausente en el resumen de sesión

- **Problema:** `getCashSessionSummary` no devolvía `expected_cash`; al imprimir desde el detalle, el "Monto Esperado" salía en `$0`.
- **Corrección:** el resumen ahora calcula y devuelve `expected_cash`, `cash_sales` y `total_sales_at_close`.
- **Backend:** `back/controllers/Controller.js` (`getCashSessionSummary`).
- **Estado:** corregido.

### 2. Monto esperado incorrecto en sesiones abiertas

- **Problema:** para sesiones abiertas se usaba `opening_amount + total_sales`, sumando ventas de todos los métodos e ignorando ingresos/egresos.
- **Corrección:** se usa `opening_amount + ventas en efectivo + ingresos - egresos`.
- **Backend:** `printCashSessionReport` (front) y `calculateExpectedCash` (back).
- **Estado:** corregido.

### 3. Inconsistencia de `payment_methods` entre historial y resumen

- **Problema:** el historial sumaba solo `sale_payments`; el resumen agregaba la diferencia `total_neto - pagos` a un método no efectivo. El mismo dato podía dar totales distintos.
- **Corrección:** ambos usan `buildPaymentMethodsSummary`, que suma únicamente `sale_payments` por método.
- **Backend:** `getSummaryForClose`, `getCashSessionHistory`, `getCurrentSessionSummary`, `getCashSessionSummary`, `getCashSessionPrintReport`.
- **Estado:** corregido.

### 4. Filtro incorrecto en el resumen de caja actual

- **Problema:** `getCurrentSessionSummary` filtraba ventas por `user_id` y rango de fechas en lugar de `cash_session_id`.
- **Corrección:** ahora filtra por `cash_session_id: activeSession.id`.
- **Backend:** `back/controllers/Controller.js` (`getCurrentSessionSummary`).
- **Estado:** corregido.

### 5. Abonos de clientes sin `cash_session_id`

- **Problema:** `CustomerPaymentsModel` no declara `cash_session_id`; Sequelize descarta esa clave al crear el registro. Los abonos no quedan asociados a la sesión y el corte diario muestra pagos de clientes en `0`.
- **Acción pendiente:** verificar si la columna existe en la base antes de tocar el modelo:

```sql
SHOW COLUMNS FROM customer_payments LIKE 'cash_session_id';
```

- Si no existe, evaluar migración y luego agregar el atributo al modelo y la asociación.
- **Backend:** `back/Models/CustomerPaymentsModel.js`, `back/controllers/Controller.js` (`registerCustomerPayment`, `getDailyCutReport`).
- **Estado:** pendiente de verificación en base de datos. No se modifica en esta rama para no romper otras ramas.

### 6. `total_sales_at_close` sobrescrito en el historial

- **Problema:** `getCashSessionHistory` reemplazaba `total_sales_at_close` con la suma actual de ventas incluso en sesiones cerradas.
- **Corrección:** en sesiones no abiertas se usa el valor almacenado; si es `0` o inválido, se usa la suma actual como fallback legacy.
- **Backend:** `back/controllers/Controller.js` (`getCashSessionHistory`).
- **Estado:** corregido.

### 7. Falta de control de permisos para cajeros

- **Problema:** un cajero podía consultar el resumen o imprimir la sesión de otro usuario conociendo el ID.
- **Corrección:** `getCashSessionSummary` y `getCashSessionPrintReport` validan que un usuario con rol `Cajero` solo acceda a su propia sesión.
- **Backend:** `back/controllers/Controller.js`.
- **Estado:** corregido.

### 8. Etiqueta "Pagos de Contado" en el corte diario

- **Problema:** `Corte.jsx` muestra como "Pagos de Contado" solo ventas con método `Efectivo` en la etiqueta, pero el cálculo/título puede inducir a error al incluir otros métodos; además `totalOtherSales` se calcula y no se muestra.
- **Acción:** revisar en una etapa posterior del corte diario. En esta rama no se modifica `Corte.jsx`.
- **Frontend:** `front/src/components/Corte.jsx`.
- **Estado:** documentado, sin cambios.

### 9. "Efectivo actual" en caja activa usaba todas las ventas

- **Problema:** `getActiveCashSession` y la vista de administración calculaban el efectivo actual con la suma de ventas de todos los métodos.
- **Corrección:** ambos usan el efectivo esperado (apertura + ventas en efectivo + ingresos - egresos).
- **Backend:** `back/controllers/Controller.js` (`getActiveCashSession`).
- **Frontend:** `front/src/components/CashAdmin.jsx`.
- **Estado:** corregido.

### 10. Búsqueda de efectivo sensible a mayúsculas en diálogos de cierre

- **Problema:** `CloseCashSessionDialog` y `FinalizeClosureDialog` leían `sales_by_method['Efectivo']` / `payment_methods?.Efectivo`; una variante como `efectivo` o `EFECTIVO` daba `0`.
- **Corrección:** ambos usan `cash_sales` del backend y, como fallback, comparan el método sin distinguir mayúsculas.
- **Backend:** `getSummaryForClose` ahora devuelve `cash_sales`.
- **Frontend:** `front/src/styledComponents/CloseCashSessionDialog.jsx`, `front/src/styledComponents/FinalizeClosureDialog.jsx`.
- **Estado:** corregido.

## Funcionalidad agregada

- **Opciones de impresión:** botón que reemplaza el checkbox "Imprimir en 80 mm" en el detalle de la sesión.
  - Formato: 80 mm o A4.
  - Métodos a detallar: por defecto `Mercado Pago`.
  - Incluir nombre del cliente: opcional, desactivado por defecto.
  - Persistencia por usuario en `localStorage` (`pos.printOptions.<userId>`).
- **Detalle de movimientos:** el reporte imprime una línea por venta del método seleccionado.
- **Endpoint:** `GET /cash-sessions/:session_id/print-report`.
- **Archivos:**
  - `front/src/functions/printOptions.js`
  - `front/src/styledComponents/PrintOptionsDialog.jsx`
  - `front/src/functions/printCashSessionReport.js`
  - `front/src/components/CashAdmin.jsx`
  - `front/src/components/CajeroView.jsx`
  - `back/controllers/Controller.js`
  - `back/routes/routes.js`

## Checklist para otras ramas

- [ ] Verificar que `getCashSessionSummary` devuelva `expected_cash`, `cash_sales` y `total_sales_at_close`.
- [ ] Verificar que el monto esperado use efectivo + ingresos - egresos, no todas las ventas.
- [ ] Verificar que `payment_methods` se calcule solo desde `sale_payments` en historial y resumen.
- [ ] Verificar el filtro por `cash_session_id` en `getCurrentSessionSummary`.
- [ ] Ejecutar `SHOW COLUMNS FROM customer_payments LIKE 'cash_session_id';` y definir si hace falta migración.
- [ ] Verificar que `total_sales_at_close` no se sobrescriba en sesiones cerradas.
- [ ] Verificar el control de permisos de cajero en resumen e impresión.
- [ ] Revisar la etiqueta "Pagos de Contado" del corte diario.
- [ ] Verificar el cálculo de efectivo actual en caja activa.
- [ ] Verificar que los diálogos de cierre usen `cash_sales` y toleren mayúsculas en el método.
- [ ] Confirmar que exista la ruta `GET /cash-sessions/:session_id/print-report`.
- [ ] Probar impresión en 80 mm y A4 con y sin detalle de Mercado Pago.
- [ ] Probar persistencia de opciones por usuario y reinicio de sesión.
