## 15 de Agosto de 2025 - Refactorización y Mejoras en Clientes

### 1. Refactorización de `Customers.jsx`

-   **Ajustes de `maxWidth` en Diálogos:**
    -   "Modal de Cliente" (`openDialog`): de `md` a `xl`.
    -   "Modal de Pago" (`openPaymentDialog`): de `sm` a `lg`.
    -   "Modal de Detalle de Compra" (`openPurchaseDetailDialog`): de `md` a `xl`.
    -   "Modal de Detalle de Pago" (`openPaymentDialog`): de `sm` a `lg`.
-   **Tipografía en vista de "Detalles del Cliente":**
    -   Campos de datos cambiados a `variant="body2"`.
    -   Etiquetas en negrita (`<strong>`) reemplazadas por `Typography` anidada con `fontWeight="bold"`.
-   **Título de la sección de filtros:** Añadido "Filtros de Clientes".
-   **Diseño de la sección de filtros:** Refactorizado a 3 columnas con anchos `clamp()` y botones en la parte inferior.
-   **Reemplazo de tabla:** `MyTable` reemplazada por `EnhancedTable`.
-   **Definición de columnas para `EnhancedTable`:** Actualizada con `valueGetter` y `cellStyle`.
-   **Columna 'Deuda' más robusta:** `cellStyle` mejorado para manejar valores `undefined` o `null`.

### 2. Ajustes en Hooks y Componentes Reutilizables

-   **`useCustomerList.js`:**
    -   Valor predeterminado de `limit` (filas por página) cambiado de 10 a 5.
-   **`EnhancedTable.jsx`:**
    -   Valor predeterminado de `rowsPerPage` cambiado de 10 a 5.

## 23 de Agosto de 2025 - Mejoras en Gestión de Productos (StockManager.jsx)

### 1. Refactorización de `StockManager.jsx`

-   **Corrección de Error de Inicialización:** Se resolvió el error `Cannot access 'handleCloseProductModal' before initialization` moviendo la definición de `handleCloseProductModal` y sus funciones auxiliares (`calculateEAN13CheckDigit`, `getNextSequentialBarcodeNumber`) a la parte superior del componente, antes de cualquier `useEffect` u otra lógica que dependa de ellas.
-   **Campo de Código de Barras de Presentación de Solo Lectura:** Se implementó la sugerencia del usuario de hacer el campo de código de barras de la presentación de solo lectura, permitiendo su modificación únicamente a través del botón "Generar Código de Barras" para mejorar la integridad de los datos.