### Plan de Acción: Creación de `StockManager.jsx`

Propongo el siguiente plan para crear el nuevo componente, que llamaremos `StockManager.jsx` para diferenciarlo del antiguo:

- [x] **Paso 1: Creación del Esqueleto del Componente.**
    - [x] Crear el nuevo archivo `front/src/components/StockManager.jsx`.
    - [x] Definir la estructura básica con un `Box` principal, el `Paper` de cabecera y una `StyledCard` para el contenido.
    - [x] Inicializar los estados necesarios: `filters` (con `useForm`), `pagination` (`page`, `rowsPerPage`, `totalRows`), y estados para los modales de edición/creación.

- [x] **Paso 2: Lógica de Datos (Server-Side).**
    - [x] Implementar la llamada principal con `UseQuery` para obtener los productos. La clave de la query y la URL serán dinámicas, basadas en los estados de filtros y paginación.
    - [x] Implementar las llamadas a `UseQuery` para obtener datos auxiliares como categorías y proveedores, que se usarán en los filtros.

- [x] **Paso 3: Implementación de la UI.**
    - [x] Construir la sección de filtros dentro de una `StyledCard`, usando `StyledTextField` y `StyledAutocomplete`.
    - [x] Configurar el `EnhancedTable` con las columnas del stock, pasándole los datos, el estado de carga y los manejadores de paginación.

- [x] **Paso 4: Formulario de Creación/Edición en un Modal.**
    - [x] Crear un `StyledDialog` que se abrirá para agregar un nuevo producto o editar uno existente.
    - [x] Dentro de este modal, construiremos el formulario para los datos del producto.
    - [x] **Aquí integraremos la nueva funcionalidad:** Dentro del mismo modal, añadiremos la sub-sección para **gestionar las Presentaciones de Venta** (la tabla para verlas, y el formulario para agregar/editar "docenas", "maples", etc.).

- [x] **Paso 5: Actualización del Backend.**
    - [x] Modificaremos el controlador del backend para la ruta `/stock` para que acepte, procese y responda a los parámetros de paginación y filtrado que le enviaremos desde el nuevo frontend.

Este plan nos permitirá construir un componente moderno, eficiente y totalmente alineado con la visión actual del proyecto.