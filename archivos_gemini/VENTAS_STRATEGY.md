# Estrategia de Implementación para `Ventas.jsx` (Fase 2: Unidades de Venta Flexibles)

Este documento detalla la estrategia de implementación para el componente `Ventas.jsx`, enfocándose en la integración de unidades de venta flexibles y presentaciones, incluyendo productos pesables.

## Objetivo General

Permitir la venta de productos con presentaciones (unitarias o pesables) de manera eficiente, ya sea escaneando un código de barras de presentación o seleccionando una presentación desde un modal al buscar por nombre.

---

## Cambios Realizados (Verificado y Aplicado)

1.  **Creación de `ProductPresentationModal.jsx`:**
    *   Se creó el componente `front/src/styledComponents/ProductPresentationModal.jsx`.
    *   Este modal permite al usuario seleccionar una presentación específica de un producto base.

2.  **Modificación de `PesableProductModal.jsx`:**
    *   Se actualizó `front/src/styledComponents/PesableProductModal.jsx` para mostrar información de la presentación (nombre y unidades base) si el producto a pesar es una presentación.
    *   Se modificó la función `handleAddPesableProduct` (en `Ventas.jsx`) para manejar correctamente el cálculo de costos y la adición al carrito cuando el producto a pesar es una presentación o un producto base.

3.  **Modificación de `Ventas.jsx` - Estados:**
    *   Se añadieron los estados `isPresentationModalOpen` y `productWithPresentations` para controlar la visibilidad y los datos del `ProductPresentationModal`.

4.  **Modificación de `Ventas.jsx` - `MemoizedAutocomplete` `onChange`:**
    *   Cuando se selecciona un producto base por nombre desde el autocompletado:
        *   Si el producto tiene `presentations`, se abre el `ProductPresentationModal` para que el cajero elija la presentación.
        *   Si el producto es `pesable` (y no tiene presentaciones o se selecciona el producto base directamente), se abre `PesableProductModal`.
        *   De lo contrario, se añade el producto base directamente al carrito.

5.  **Modificación de `Ventas.jsx` - `handleSelectedPresentation`:**
    *   Se añadió esta función para manejar la selección de una presentación desde `ProductPresentationModal`.
    *   Si la presentación seleccionada es `pesable`, se abre `PesableProductModal` con los datos de la presentación.
    *   Si no es `pesable`, se construye el `itemToAdd` con los detalles de la presentación y se añade directamente a `tempTable`.

6.  **Modificación de `Ventas.jsx` - Renderizado:**
    *   Se incluyó el componente `ProductPresentationModal` en la sección de renderizado de `Ventas.jsx`.

7.  **Modificación de `Ventas.jsx` - Columna `quantityPerUnits` en `EnhancedTable`:**
    *   Se actualizó el `valueGetter` para la columna `quantityPerUnits` para mostrar la cantidad real de presentaciones o unidades base (`row.quantityPerUnits`), en lugar de un valor fijo de 1 para presentaciones.

8.  **Modificación de `Ventas.jsx` - Agregación de Presentaciones Idénticas:**
    *   Se modificaron las funciones `handleSelectedPresentation` y `handleBarcodeScanLogic` para que, al añadir una presentación que ya existe en el carrito, se incremente la cantidad de la fila existente en lugar de añadir una nueva fila.

9.  **Modificación de `Ventas.jsx` - Envío de `quantity_for_stock_deduction` al Backend:**
    *   Se corrigió la función `handleSaveSale` para que, al mapear los ítems de `tempTable` a `tempValues` para enviar al backend, se utilice `item.quantity_for_stock_deduction` en lugar de `item.quantityPerUnits` para el campo `quantity`. Esto asegura la correcta deducción de stock en el backend.

10. **Verificación de la Estructura de Datos `stock`:**
    *   Se confirmó que la estructura de datos del `stock` (productos base con `presentations` anidadas y sus `barcode` y `stock_id`) es correcta y accesible para la lógica del frontend.

---


