# Plan de Mejora: Combinación Óptima de Productos y Presentaciones

## Objetivo
Mejorar la funcionalidad de venta en `front/src/components/Ventas.jsx` para que, al ingresar una cantidad predefinida (ej. `Alt+C` + `8`) y escanear un producto con presentaciones (ej. "Huevo"), el sistema determine y agregue automáticamente la combinación más óptima de presentaciones y unidades individuales (ej. una "1/2 Docena" y 2 "Huevo" individuales).

## Problema Actual
Actualmente, si se predefine una cantidad y se escanea un producto base, el sistema solo agrega unidades individuales del producto base, sin considerar sus presentaciones disponibles.

## Solución Propuesta

### 1. Nueva Función: `calculateOptimalProductCombination`
Esta función será el cerebro de la lógica de combinación.

*   **Ubicación:** Podría ser un nuevo archivo en `front/src/functions/` o una función auxiliar dentro de `Ventas.jsx` si su uso es muy específico.
*   **Entradas:**
    *   `product`: El objeto del producto base (incluyendo su array `presentations`).
    *   `requestedQuantity`: La cantidad total solicitada por el usuario (ej. `8`).
*   **Lógica:**
    *   **Ordenar Presentaciones:** Las presentaciones del producto (`product.presentations`) deben ordenarse de mayor a menor `quantity_in_base_units` (ej. "Docena" antes que "1/2 Docena").
    *   **Algoritmo Greedy:** Iterar sobre las presentaciones ordenadas. Para cada presentación, calcular cuántas veces puede "caber" completamente en la `requestedQuantity` restante.
        *   Agregar la cantidad calculada de esa presentación a una lista temporal de ítems a añadir.
        *   Restar las unidades base correspondientes de la `requestedQuantity` restante.
    *   **Unidades Individuales Restantes:** Si después de procesar todas las presentaciones aún queda una `requestedQuantity` mayor que cero, esa cantidad se agregará como unidades individuales del producto base.
*   **Salida:** Un array de objetos, donde cada objeto representa un ítem a añadir al carrito, especificando si es una presentación o una unidad individual, la cantidad y una referencia a sus datos originales.
    ```javascript
    [
        { type: 'presentation', data: { /* datos de 1/2 Docena */ }, quantity: 1, baseProduct: { /* datos de Huevo */ } },
        { type: 'product', data: { /* datos de Huevo */ }, quantity: 2 }
    ]
    ```

### 2. Modificación de `handleBarcodeScanLogic` en `Ventas.jsx`

*   **Punto de Inserción:** Dentro del bloque `else if (item.type === 'product')` (cuando se escanea un producto base).
*   **Flujo:**
    1.  Obtener la `pendingQuantity` (la cantidad predefinida por el usuario).
    2.  Llamar a `calculateOptimalProductCombination(item, pendingQuantity)` para obtener la `optimalCombination`.
    3.  **Verificación de Stock Integral:** Antes de agregar cualquier cosa al `tempTable`, calcular la `totalStockNeeded` sumando `quantity_in_base_units` de todas las presentaciones y unidades individuales en `optimalCombination`.
    4.  Comparar `totalStockNeeded` con el `availableStock` del producto base.
    5.  Si `availableStock < totalStockNeeded`:
        *   Mostrar el `mostrarConfirmacion` de "Stock Insuficiente" (similar a la lógica actual).
        *   Si el usuario confirma forzar la venta, proceder al siguiente paso con `forceSale = true`.
        *   Si el usuario cancela, abortar la operación.
    6.  **Adición al `tempTable`:** Iterar sobre cada ítem en `optimalCombination`:
        *   Si `item.type === 'presentation'`: Llamar a `addPresentationToCart(item.data, item.baseProduct, item.quantity, forceSale)`.
        *   Si `item.type === 'product'`: Llamar a `addItem(item.data, item.quantity, forceSale)`.
*   **Limpieza:** Restablecer `pendingQuantity`, `customQuantityMode`, `customQuantity` y enfocar el campo de código de barras.

### Consideraciones Adicionales

*   **Precisión de Números:** Asegurarse de usar `parseFloat()` en todas las comparaciones y cálculos que involucren cantidades y precios para evitar errores de punto flotante.
*   **Manejo de Errores:** Asegurar que la lógica sea robusta ante casos donde `presentations` sea nulo o vacío.
*   **Impacto en `tempTable`:** La `tempTable` ahora podría contener una mezcla de ítems de `type: 'product'` y `type: 'presentation'`, lo cual ya está contemplado en la estructura actual.
*   **Pruebas:** Se requerirán pruebas exhaustivas para diferentes cantidades y configuraciones de presentaciones.
