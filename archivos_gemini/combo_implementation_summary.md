# Resumen de la Implementación de Combos

Este documento resume la estrategia elegida para la implementación de combos, los pasos ya realizados y el estado actual, incluyendo el problema encontrado y los próximos pasos.

---

## Estrategia Elegida: Híbrida con Integración de Código de Barras (Combo como Entidad Separada con Barcode)

Esta estrategia combina la simplicidad de la aplicación por código con la robustez de la gestión de stock, tratando los combos como una entidad separada con su propio código de barras.

### Concepto

Los combos se gestionan como una entidad independiente (`combos` tabla) con su propio `código_de_barras` único y un `precio` fijo. Una tabla `combo_items` define los productos individuales que componen cada combo y sus cantidades. Cuando el cajero escanea el `código_de_barras` del combo, se añade un único "ítem combo" al carrito. La deducción de stock de los productos individuales que componen el combo ocurre automáticamente en el backend al confirmar la venta.

### Cómo Funciona

1.  **Definición del Combo:**
    *   Se crea una nueva tabla `combos` con campos como `id`, `nombre`, `código_de_barras` (VARCHAR, UNIQUE), `precio`, `estado` (activo/inactivo), `fecha_inicio`, `fecha_fin`.
    *   Se crea una tabla `combo_items` que vincula un combo (`combo_id`) con los `stock_id`s (o `presentation_id`s) de sus componentes y las `cantidades` que consume de cada uno.
    *   En un nuevo gestor de combos (similar al de promociones), se crea un combo, se le asigna un `código_de_barras` y se definen sus componentes (ej. Coca-Cola: 1 unidad, Fernet: 1 unidad).
2.  **Aplicación en Ventas.jsx:**
    *   El cajero escanea el `código_de_barras` del combo en el mismo campo de entrada de código de barras de productos.
    *   La lógica de escaneo (`handleBarcodeScanLogic`) en `Ventas.jsx` se modifica para primero intentar encontrar un combo por el código de barras.
    *   Si se encuentra un combo, se añade una nueva línea a la `tempTable` (el carrito) que representa el combo. Esta línea tendrá el `nombre` del combo y su `precio` fijo.
    *   Si no se encuentra un combo, la lógica procede a buscar un producto o presentación normal.
3.  **Deducción de Stock (Crítico):** Cuando la venta se finaliza (`createSale` en el backend):
    *   Si un ítem en la `tempTable` es un "ítem combo" (identificado por una nueva propiedad, ej. `is_combo_item: true`):
        *   El backend consulta la tabla `combo_items` para obtener todos los componentes de ese combo.
        *   Por cada componente, se deduce la `cantidad` especificada de su `stock_id` correspondiente en la tabla `stocks`.

### Pros

*   **Flujo de Trabajo Intuitivo para el Cajero:** El cajero usa el mismo proceso de escaneo para productos y combos.
*   **Deducción de Stock Automática y Precisa:** El sistema gestiona el inventario de los componentes del combo de forma transparente.
*   **Semántica Clara:** Un código de barras representa un paquete específico de productos con un precio fijo.
*   **Reportes Detallados:** Permite reportar ventas de combos y desglosarlas por componentes.
*   **Flexibilidad:** Los combos pueden tener fechas de vigencia y estados activo/inactivo.
*   **Menos Intrusivo en `product_presentations`:** No modifica la estructura central de las presentaciones de productos existentes.

### Contras

*   **Añade Nuevas Tablas y Modelos:** Introduce las tablas `combos` y `combo_items` y sus modelos asociados.
*   **Lógica de `createSale` más Compleja:** Requiere que la función de creación de ventas en el backend maneje la deducción de stock de combos de forma especial.

### Viabilidad

**La solución más equilibrada y recomendada.** Ofrece una excelente experiencia de usuario en el punto de venta y una gestión de inventario precisa, con una complejidad de implementación manejable.

---

## Estado Actual de la Implementación y Próximos Pasos

**Lo que se ha hecho:**

*   **Base de Datos:** Se han creado las tablas `combos` y `combo_items` mediante el script `create_combo_tables.sql`.
*   **Modelos de Backend:** Se han creado los modelos `ComboModel.js` y `ComboItemModel.js`.
*   **Asociaciones de Backend:** Se han añadido las asociaciones para `ComboModel` y `ComboItem` en `associations.js`.
*   **Rutas de Backend:** Se han añadido las rutas CRUD para combos en `routes.js`.
*   **Controladores de Backend:** Se han añadido las funciones CRUD para combos (`getCombos`, `getComboById`, `getComboByBarcode`, `createCombo`, `updateCombo`, `deleteCombo`) en `Controller.js`.
*   **Componente Frontend:** Se ha creado el componente `ComboManager.jsx`.
*   **Rutas de Frontend:** Se ha añadido la ruta para `ComboManager.jsx` en `index.jsx`.
*   **Enlace en la Barra Lateral:** Se ha añadido el enlace "Combos" en `Dashboard.jsx`.
*   **Permisos:** Se ha creado y asignado el permiso `gestionar_combos` al rol de Administrador mediante el script `add_combo_permission.sql`.

**Problema Actual:**

*   **Error 500 al cargar combos:** Al intentar acceder a la página de gestión de combos en el frontend, se produce un error 500. Esto indica un fallo en el backend al intentar obtener los combos.

**Próximos Pasos (para resolver el error y continuar):**

1.  **Diagnóstico del Error 500:** Es crucial obtener el mensaje de error completo de la consola del backend. Este mensaje proporcionará detalles específicos sobre la causa del fallo en la función `getCombos` (o sus dependencias).
2.  **Modificar `getProductByBarcode`:** Una vez resuelto el error de carga de combos, se debe modificar la función `getProductByBarcode` en `Controller.js` para que pueda buscar y devolver combos por su código de barras, además de productos y presentaciones.
3.  **Modificar `createSale`:** Se debe actualizar la función `createSale` en `Controller.js` para que, al procesar una venta que incluye un ítem de combo, deduzca correctamente el stock de cada uno de los componentes individuales del combo.
4.  **Implementar Lógica en `Ventas.jsx`:** Se debe adaptar la lógica en `Ventas.jsx` para que, al escanear un código de barras, primero intente identificar si es un combo. Si lo es, debe añadir el ítem de combo a la `tempTable` con su nombre y precio fijo.
