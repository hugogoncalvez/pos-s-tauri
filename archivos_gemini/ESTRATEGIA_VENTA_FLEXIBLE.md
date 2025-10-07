### Estrategia Propuesta: Unidades de Venta y Motor de Promociones

La idea central es separar el concepto de "producto en stock" del de "producto en venta".

#### Parte 1: Unidades de Venta Flexibles (El problema de los huevos y el queso)

Actualmente, un producto en tu tabla `Stocks` tiene un único stock y un único precio. La solución es permitir que un producto base tenga múltiples "presentaciones" de venta.

**1. Cambios en la Base de Datos:**

Crearemos una nueva tabla llamada `ProductPresentations` (o `PresentacionesDeProducto`).

**Tabla: `ProductPresentations`**
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INT, PK | Identificador único de la presentación. |
| `stock_id` | INT, FK | La clave foránea que lo vincula al producto en la tabla `Stocks`. |
| `name` | VARCHAR | Nombre descriptivo de la presentación (ej: "Por Docena", "Media Horma", "Maple 30u."). |
| `quantity_in_base_units` | DECIMAL | **La clave de todo.** Cuántas unidades base consume esta presentación. (ej: para una docena de huevos, sería `12`). |
| `price` | DECIMAL | El precio de venta de *esta presentación específica*. |
| `barcode` | VARCHAR | (Opcional pero recomendado) Código de barras específico para esta presentación. |

**2. ¿Cómo funcionaría?**

*   **Producto Base (`Stocks`):** El producto "Huevo" en la tabla `Stocks` siempre tendrá su inventario en la unidad más pequeña posible (la unidad). Si compras 300 huevos, el `stock` de ese producto es 300. Su `price` en esta tabla sería el precio de un solo huevo.
*   **Presentaciones (`ProductPresentations`):**
    *   Tendrías una fila para "Media Docena": `stock_id` apunta a "Huevo", `name`="Media Docena", `quantity_in_base_units`=6, `price`= (el precio de la media docena).
    *   Otra fila para "Docena": `stock_id` apunta a "Huevo", `name`="Docena", `quantity_in_base_units`=12, `price`= (el precio de la docena).
    *   Y otra para "Maple": `stock_id` apunta a "Huevo", `name`="Maple", `quantity_in_base_units`=30, `price`= (el precio del maple).

**3. Impacto en la Aplicación:**

*   **`Stock.jsx` y `Compras.jsx`:** Al crear o editar un producto, además de sus datos básicos, deberías tener una pequeña sección para añadir/editar sus "Presentaciones de Venta".
*   **`Ventas.jsx` (El cambio más importante):**
    1.  Cuando el cajero busca "Huevo", en lugar de agregarlo directamente al carrito, el sistema debería mostrar un pequeño diálogo o menú: `¿Qué presentación deseas vender? [Unidad, Media Docena, Docena, Maple]`.
    2.  Al seleccionar "Docena", el sistema agrega al carrito el item "Huevo (Docena)" con el precio correspondiente a la docena.
    3.  Lo más importante: al concretar la venta, el sistema **resta 12 unidades** del `stock` del producto "Huevo" en la tabla `Stocks`.

Esto resuelve el problema del inventario de forma precisa y permite una flexibilidad total en los precios.

---

#### Parte 2: Módulo de Promociones

Las promociones no deben estar "quemadas" en el código. Deben ser entidades que puedas crear, activar y desactivar.

**1. Cambios en la Base de Datos:**

Necesitamos una tabla `Promotions` y una tabla de unión para asignarlas.

**Tabla: `Promotions`**
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | INT, PK | ID de la promoción. |
| `name` | VARCHAR | Nombre (ej: "Promo 2x1 Gaseosas", "50% OFF 2da Unidad"). |
| `type` | ENUM | Tipo de promo: 'BOGO' (Paga 1 Lleva 2), 'PERCENT_DISCOUNT_ON_NTH' (Descuento % en la N-ésima unidad), etc. |
| `discount_value` | DECIMAL | El valor del descuento (ej: 50 para el 50%). |
| `required_quantity` | INT | Unidades necesarias para que aplique (ej: 2 para un 2x1). |
| `start_date`, `end_date` | DATETIME | Fechas de vigencia. |
| `is_active` | BOOLEAN | Para activarla o desactivarla manually. |

**Tabla de Unión: `Product_Promotions`**
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `promotion_id` | INT, FK | ID de la promoción. |
| `stock_id` | INT, FK | ID del producto al que aplica. |
| `presentation_id` | INT, FK | (Opcional, pero muy potente) ID de la presentación a la que aplica. ¡Puedes hacer una promo solo para la venta por docena! |

**2. Impacto en la Aplicación:**

*   **Nueva Interfaz de Gestión:** Necesitarás una nueva vista en tu panel de administración para "Gestionar Promociones", donde puedas crearlas y asignarlas a productos o presentaciones específicas.
*   **`Ventas.jsx`:** El motor de la venta se vuelve más inteligente. Al agregar productos al carrito, debe verificar:
    1.  ¿Este producto (o esta presentación de producto) tiene alguna promoción activa?
    2.  ¿Se cumplen las condiciones (ej: ya hay 2 unidades en el carrito para el 2x1)?
    3.  Si se cumplen, aplica el descuento automáticamente y lo refleja en el subtotal del carrito, mostrando una etiqueta o nota que indique la promo aplicada.

### Plan de Implementación Sugerido

Esto es un cambio significativo. Propongo hacerlo en fases:

*   **Fase 1: Implementar las Unidades de Venta.**
    - [x]  Crear la tabla `ProductPresentations` y modificar los modelos del backend.
    - [x]  Adaptar las vistas `Stock.jsx` y `Compras.jsx` para poder gestionar estas presentaciones.
    - [x]  Este es el pilar fundamental.

*   **Fase 2: Integrar Unidades de Venta en el POS.**
    - [x] Modificar `Ventas.jsx` para que permita seleccionar la presentación, muestre la cantidad correcta en la tabla y descuente el stock adecuadamente (incluyendo la agregación de presentaciones idénticas en una sola línea y la correcta deducción de unidades base del stock).

*   **Fase 3: Construir el Módulo de Promociones.**
    - [ ] Crear las tablas `Promotions` y la tabla de unión.
    - [ ] Desarrollar la interfaz para gestionar las promociones.
    - [ ] Añadir la lógica de aplicación de descuentos en `Ventas.jsx`.