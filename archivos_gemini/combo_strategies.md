# Estrategias para Implementar Combos de Productos

Aquí se detallan las estrategias principales para implementar la funcionalidad de combos de productos, analizando sus pros y contras para ayudarte a decidir cuál se adapta mejor a tus necesidades.

---

## Estrategia 1: Combo como Tipo de Promoción (con Aplicación Basada en Código)

Esta estrategia trata los combos como un tipo especial de promoción que se activa mediante un código (ej. código de barras) ingresado por el cajero. La lógica de aplicación se simplifica al no requerir un análisis complejo del carrito en tiempo real.

### Concepto

La promoción en sí misma se convierte en un "ítem" en el carrito cuando se ingresa su código. Este ítem representa el valor del combo (su precio fijo) y no se encarga de la deducción de stock de los productos individuales que lo componen. El cajero es responsable de añadir los productos individuales del combo al carrito.

### Cómo Funciona

1.  **Definición del Combo:** En el gestor de promociones, se crea una nueva promoción de tipo `COMBO`. A esta promoción se le asigna un `código` único (ej. un código de barras) y un `precio_fijo` para el combo. También se definen los productos individuales que componen el combo (ej. Coca-Cola + Fernet) y sus cantidades, pero esta información es principalmente para referencia del cajero y para la gestión interna, no para una validación automática en el carrito.
2.  **Aplicación en Ventas.jsx:**
    *   El cajero escanea o ingresa el `código` de la promoción del combo en un campo específico (o el mismo campo de código de barras de productos).
    *   El sistema busca la promoción por este `código`.
    *   Si la promoción es encontrada y es de tipo `COMBO`, se añade una nueva línea a la `tempTable` (el carrito) que representa el combo. Esta línea tendrá el `nombre` del combo (ej. "Combo Coca-Cola + Fernet") y su `precio_fijo`.
    *   El cajero debe añadir manualmente los productos individuales (Coca-Cola y Fernet) al carrito. El sistema no los validará automáticamente ni ajustará sus precios individuales.
3.  **Deducción de Stock:** La deducción de stock ocurre para los productos individuales (Coca-Cola, Fernet) cuando el cajero los añade al carrito, no cuando se añade el ítem de la promoción del combo.

### Pros

*   **Simplificación Extrema de la Lógica de Aplicación:** La función `applyPromotions` en `Ventas.jsx` no necesita lógica compleja para detectar combos o ajustar precios de ítems existentes. Simplemente añade un nuevo ítem al carrito.
*   **Flujo de Trabajo Claro para el Cajero:** El cajero tiene un control explícito sobre cuándo y cómo se aplica el combo, similar a escanear un producto.
*   **Reutilización de Infraestructura de Promociones:** Se integra dentro del módulo de promociones existente.
*   **Flexibilidad:** Permite definir combos con precios fijos sin la complejidad de ajustar los precios de los componentes individuales en el carrito.

### Contras

*   **Dependencia de la Acción del Cajero:** La promoción no se aplica automáticamente. Si el cajero olvida escanear el código del combo, el cliente pagará el precio completo de los productos individuales.
*   **Sin Validación Automática de Componentes:** El sistema no verifica si los productos individuales que componen el combo han sido añadidos al carrito. El cajero debe asegurarse de que los productos correctos estén presentes.
*   **Reportes Potencialmente Menos Detallados:** Los reportes de ventas podrían mostrar el "ítem combo" como una venta, pero no vincularlo directamente a los productos individuales que lo componen a menos que se implemente una lógica de reporte adicional.

### Viabilidad

**Altamente viable y la más sencilla de implementar** de las dos, ya que minimiza la complejidad en la lógica de `Ventas.jsx` y el motor de promociones.

---

## Estrategia 2: Combo como Presentación de Múltiples Productos

Esta estrategia trata un combo como una "presentación" especial de un producto que, en lugar de consumir una cantidad de un solo producto base, consume cantidades específicas de múltiples productos base. Esto permite que el combo tenga su propio código de barras y precio, y que la deducción de stock sea precisa para todos sus componentes.

### Concepto

Un combo se define como una `ProductPresentation` con un tipo especial (ej. `combo`). Esta presentación no está vinculada a un único `stock_id` y `quantity_in_base_units`, sino a una lista de `componentes` (productos/presentaciones individuales y sus cantidades) que consume. Cuando se vende una unidad de esta presentación de combo, el stock de todos sus componentes se deduce automáticamente.

### Cómo Funciona

1.  **Definición del Combo:**
    *   Se modifica la tabla `product_presentations` para incluir una columna `type` (ej. `ENUM('single_product', 'combo')`).
    *   Se crea una nueva tabla de unión, `product_presentation_components`, que vincula una presentación de combo (`presentation_id`) con los `stock_id`s (o `presentation_id`s) de sus componentes y las `cantidades` que consume de cada uno.
    *   En el gestor de presentaciones (o un nuevo gestor de combos), se crea una nueva presentación de tipo `combo`. Se le asigna un `código_de_barras` y un `precio`. Luego, se especifican sus componentes (ej. Coca-Cola: 1 unidad, Fernet: 1 unidad).
2.  **Aplicación en Ventas.jsx:**
    *   El cajero escanea el `código_de_barras` del combo o lo selecciona del autocompletado, como cualquier otra presentación.
    *   El ítem del combo se añade a la `tempTable` con su nombre y precio fijo.
    *   La lógica de `applyPromotions` (para descuentos automáticos) no se aplica a este ítem, ya que su precio ya es fijo.
3.  **Deducción de Stock (Crítico):** Cuando la venta se finaliza (`createSale` en el backend):
    *   Si un ítem en la `tempTable` es una presentación de tipo `combo`:
        *   El backend consulta la tabla `product_presentation_components` para obtener todos los componentes de ese combo.
        *   Por cada componente, se deduce la `cantidad` especificada de su `stock_id` correspondiente en la tabla `stocks`.

### Pros

*   **Integración Perfecta en el Flujo de Ventas:** El cajero maneja los combos exactamente igual que cualquier otro producto con código de barras o presentación.
*   **Deducción de Stock Automática y Precisa:** El sistema se encarga de deducir el stock de todos los componentes del combo, garantizando la precisión del inventario.
*   **Semántica Clara:** Un código de barras representa un paquete específico de productos.
*   **Reportes Detallados:** Los reportes pueden desglosar las ventas de combos en sus componentes individuales para un análisis más profundo.

### Contras

*   **Mayor Complejidad de Implementación Inicial:** Requiere cambios en el esquema de la base de datos (`product_presentations` y una nueva tabla `product_presentation_components`), modificaciones en los modelos, y una lógica más elaborada en el backend (`createSale`) para la deducción de stock de múltiples componentes.
*   **Gestión de Presentaciones Más Compleja:** El modal de gestión de presentaciones necesitará una interfaz de usuario más sofisticada para definir los componentes del combo.
*   **No es una "Promoción" en el sentido tradicional:** No tiene fechas de inicio/fin o estado activo/inactivo como una promoción. Si se necesita controlar la disponibilidad de combos por tiempo, esa lógica debería implementarse en el gestor de presentaciones.

### Viabilidad

**Más compleja de implementar, pero más robusta y precisa** para la gestión de inventario y la experiencia del cajero a largo plazo. Es la opción recomendada si la precisión del stock y la facilidad de uso en el punto de venta son prioritarias.

---

## Estrategia 3: Híbrida con Integración de Código de Barras (Combo como Entidad Separada con Barcode)

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
