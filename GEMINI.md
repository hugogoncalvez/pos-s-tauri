Proyecto: Sistema POS (Punto de Venta)

Este proyecto es un sistema de Punto de Venta (POS) diseñado para gestionar las operaciones básicas de un comercio: ventas, control de caja, stock, productos, clientes y proveedores.

Está desarrollado en **React** para el frontend, utiliza **React Query** para la gestión eficiente de datos y se comunica con una **API REST** construida en Node.js, conectada a una base de datos **MySQL** utilizando **Sequelize** como ORM.

---

##  Estructura y convenciones

Siempre responde en español.

Ruta de componentes:
Los nuevos componentes se crean en:
front/src/components

Verifica las dependencias instaladas:
Revisa siempre el archivo package.json para confirmar qué librerías están instaladas y disponibles para usar.

Consistencia visual:
Mantén el estilo visual unificado en todo el proyecto. Usa los mismos colores, tipografías, márgenes y paddings según el diseño base
manten el estilo visial en todo el proyecto.
importar desde @mui/material los componentes
Uso de nombres coherentes:
Usa nombres de archivos, carpetas, funciones y componentes en camelCase o PascalCase, según corresponda. Por ejemplo:

Componentes: VentaProducto.jsx

Funciones: calcularTotal()

Documentación de componentes:
Cada componente debe tener un comentario al inicio que explique brevemente su propósito y cómo se usa.

Evitar código duplicado:
Extrae funciones reutilizables en archivos separados en front/src/functions.
Uso de hooks personalizados:
Si una lógica se repite en varios componentes, considera crear un custom hook dentro de front/src/hooks.

Componentes de presentación o reutilizables:
Crea subcomponentes que sean puramente de presentación (sin lógica de negocio compleja) o que se reutilicen en varias vistas dentro de la carpeta `front/src/styledComponents`.

Análisis exhaustivo:
Antes de proponer una solución a un problema o realizar una modificación, analiza y comprende todos los archivos y componentes relacionados que puedan estar involucrados en la funcionalidad afectada.

### Distribución de Layout con Flexbox

Para mantener la consistencia en el diseño, utiliza los siguientes patrones de Flexbox para la distribución de elementos en pantalla.

**1. Layout de Dos Columnas (Flexible + Ancho Fijo):**

Ideal para cuando tienes un contenido principal que debe ocupar el espacio sobrante y una barra lateral o de información con un ancho definido.

```jsx
<Box sx={{ display: 'flex', gap: 3 }}>
  {/* Columna principal (flexible) */}
  <Box sx={{ flex: 1 }}>
    {/* Contenido de la columna principal */}
  </Box>

  {/* Columna secundaria (ancho fijo) */}
  <Box sx={{ width: '300px' }}>
    {/* Contenido de la columna secundaria */}
  </Box>
</Box>
```

**2. Layout de Dos Columnas Equitativas:**

Perfecto para dashboards o secciones donde necesitas dos paneles de contenido con la misma importancia y ancho.

```jsx
<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
  {/* Columna Izquierda (50%) */}
  <Box sx={{ flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
    {/* Contenido de la columna izquierda */}
  </Box>

  {/* Columna Derecha (50%) */}
  <Box sx={{ flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 2 }}>
    {/* Contenido de la columna derecha */}
  </Box>
</Box>
```

### Diseño Fluido con clamp()

Para lograr un diseño verdaderamente responsivo y fluido, se debe utilizar la función `clamp()` de CSS para todos los valores dimensionales siempre que sea posible. Esto incluye `fontSize`, `padding`, `margin`, `width`, `height`, etc.

La función `clamp()` toma tres argumentos: un valor mínimo, un valor preferido y un valor máximo.

`clamp(MINIMO, PREFERIDO, MAXIMO);`

- **Mínimo**: El valor más pequeño permitido. Garantiza la legibilidad y usabilidad en las pantallas más pequeñas.
- **Preferido**: El valor ideal y flexible, normalmente basado en unidades de viewport (como `vw` o `vh`). Permite que el elemento se escale suavemente con el tamaño de la pantalla.
- **Máximo**: El valor más grande permitido. Evita que los elementos se vuelvan demasiado grandes en monitores anchos.

**Ejemplo de uso para fuentes:**

```jsx
<Typography sx={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
  Este texto es fluido y responsivo.
</Typography>
```

**Ejemplo de uso para padding:**

```jsx
<Box sx={{ padding: 'clamp(1rem, 5vw, 3rem)' }}>
  Este contenedor tiene un padding fluido.
</Box>
```

Adoptar `clamp()` como convención principal reduce la dependencia de media queries y crea interfaces más limpias, mantenibles y adaptables a cualquier dispositivo.
---

## Gemini Added Memories
- Al generar scripts de MySQL para el usuario Hugo, debo usar sintaxis conservadora y compatible con versiones anteriores, ya que sus herramientas cliente (Antares, Workbench) pueden no soportar todas las características de MySQL 8.0, incluso si el servidor sí lo hace.
- El rol 'Gerente' tiene permisos para gestionar operaciones y ver todas las cajas ('ver_cajas_admin'), pero no tiene permisos para ver o gestionar la lista de usuarios ('ver_usuarios').
- El usuario reporta un bug: si se cierra el navegador sin hacer logout, la aplicación salta el login y va directamente a Landing.jsx con las credenciales del último usuario logueado. Esto sugiere un problema con la persistencia de la sesión o la limpieza del token/datos del usuario.
- Cuando se presenten problemas de navegación de tarjetas en el frontend que se basan en datos de la base de datos (como la tabla `landing_elementos`), la primera acción debe ser verificar y corregir la consistencia de los datos en la base de datos antes de modificar la lógica del frontend.
- Para realizar peticiones al backend, debo utilizar siempre los hooks personalizados que se encuentran en la carpeta `front/src/hooks/`.
- El usuario Hugo valora que yo sea proactivo y le proponga ideas creativas para mejorar la aplicación, no solo que resuelva los problemas que él reporta.
- Al crear o refactorizar secciones de filtros, debo usar un Grid container con `justifyContent: 'center'` y para cada filtro un Grid item con `sx={{ width: 'clamp(MIN, PREFERRED, MAX)' }}` para lograr un diseño fluido, simétrico y que ocupe menos espacio.
- El componente `Informes.jsx` es la referencia principal para el estilo de formularios y grupos de elementos de entrada. Se debe aplicar el patrón de `Grid container` con `justifyContent: 'center'` y `Grid item`s con `width: clamp(MIN, PREFERRED, MAX)` para `Select`, `TextField`, `Autocomplete` y otros elementos de formulario, buscando un diseño fluido, simétrico y eficiente en el uso del espacio.
- Durante esta sesión, se resolvieron errores de autenticación y visualización de roles en los logs de auditoría. Se implementó la funcionalidad de filtrar logs por ID de sesión en el frontend y backend. Se corrigieron errores de sintaxis y se mejoró el diseño de la paginación y los filtros en `AuditLogs.jsx` utilizando `clamp()` y centrado, estableciendo `Informes.jsx` como referencia de estilo para elementos de formulario.
- **Manejo de rangos de fechas en el backend (Node.js/Sequelize):** Al filtrar por rangos de fechas, especialmente cuando se usa `new Date(fecha_string)` para la fecha final, la hora por defecto es 00:00:00. Esto puede causar que los registros del último día no se incluyan. Para asegurar que se incluya todo el día final, se debe ajustar la hora de la fecha final a 23:59:59.999. Esto se logra obteniendo los componentes de la fecha (`year`, `month`, `day`) y luego usando `setHours(23, 59, 59, 999)` en el objeto `Date` antes de usarlo en la cláusula `[Op.between]`. Ejemplo:
  ```javascript
  const [yearEnd, monthEnd, dayEnd] = endDate.split('-').map(Number);
  const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd); // Month is 0-indexed
  endDateObj.setHours(23, 59, 59, 999); // Set to the end of the day
  // Usar endDateObj en la consulta Sequelize: [Op.between]: [new Date(startDate), endDateObj]
  ```
- **Solución al problema de fechas en `getProfitMarginReport`:** Para asegurar que el rango de fechas incluya todo el día final en las consultas de Sequelize, se implementó la siguiente lógica para `endDate`:
  ```javascript
  (() => {
      const [yearEnd, monthEnd, dayEnd] = endDate.split('-').map(Number);
      const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
      endDateObj.setHours(23, 59, 59, 999);
      return endDateObj;
  })()
  ```
  Esta lógica se aplicó a las cláusulas `where` de `createdAt` en las consultas `results` y `overallTotals` dentro de la función `getProfitMarginReport` en `back/controllers/Controller.js`.
- TODO: Funcionalidades y Mejoras del Sistema POS

1. Estilo y Normalización de Componentes:
    * Creación de un estilo para todo el proyecto: Definir y documentar un sistema de diseño (colores, tipografías, espaciado, etc.) para asegurar una coherencia visual.
    * Normalización de todos los componentes: Refactorizar los componentes existentes para que se adhieran al nuevo estilo y se vean uniformes en toda la aplicación.

2. Control de Inventario y Productos:
    * Importación masiva de productos: Desarrollar una herramienta para importar grandes catálogos de productos (ej. desde CSV) para facilitar la carga inicial y actualizaciones.
    * Alertas de reabastecimiento: Implementar un sistema de notificaciones cuando el stock de un producto caiga por debajo de un umbral predefinido.

3. Créditos a Clientes:
    * Gestión de créditos a clientes: Crear un módulo completo para administrar el "fiado", registrar abonos y mantener un historial de crédito detallado por cliente.

4. Reportes y Analítica:
    * Reportes avanzados: Ampliar la sección de informes para incluir análisis de márgenes de ganancia, productos más vendidos por período, y rendimiento de ventas por cajero.

5. Integración con Hardware:
    * Lectores de códigos de barras: Integrar la funcionalidad para usar lectores de códigos de barras, agilizando las ventas y la gestión de inventario.

6. Gestión de Clientes:
    * Segmentación de clientes y promociones avanzadas: Implementar funcionalidades para segmentar clientes y aplicar promociones personalizadas basadas en su historial de compras o características.

7. Compras y Proveedores:
    * Órdenes de compra: Establecer un flujo formalizado para la creación, seguimiento y gestión de órdenes de compra a proveedores.
- Para las cabeceras de los componentes, se debe seguir el estándar de envolver el contenido en un componente `Paper` que aplique el `background.componentHeaderBackground` y el `color: theme.palette.primary.contrastText` para asegurar la homogeneidad en el estilo de la aplicación, similar a cómo se implementa en `AuditLogs.jsx`.
- Para la alineación de elementos en pantalla, el usuario prefiere el uso de `Grid container` con `justifyContent: 'center'` y `Grid item` con `xs={4}` (o el valor `xs` apropiado para la cantidad de elementos) para lograr una disposición en fila de tamaño reducido y alineada. Además, se debe usar `clamp()` para tamaños de fuente y dimensiones responsivas dentro de los elementos.
- Para la alineación y tamaño de las tarjetas de sesiones activas, el usuario prefiere el uso de `Grid container` con `justifyContent: 'center'` y `Grid item` con `xs={6}` (para dos por fila en pantallas pequeñas), `sm={6}`, `md={4}`, `lg={3}` (para más por fila en pantallas más grandes), junto con el ajuste de variantes de tipografía (`subtitle1` para títulos) para lograr un diseño compacto y responsivo.
- Para layouts de 2 o más columnas dentro de modales o tarjetas, usar Grid items con breakpoints detallados como `xs={6} sm={6} md={4} lg={3}` para lograr un diseño compacto, centrado y responsivo que evite el estiramiento excesivo en pantallas grandes.
- Se corrigió el error `Cannot access 'handleCloseProductModal' before initialization` en `StockManager.jsx` moviendo la definición de `handleCloseProductModal` y sus funciones auxiliares (`calculateEAN13CheckDigit`, `getNextSequentialBarcodeNumber`) a la parte superior del componente, antes de cualquier `useEffect` u otra lógica que dependa de ellas.
- Se implementó la sugerencia del usuario de hacer el campo de código de barras de la presentación en `StockManager.jsx` de solo lectura, permitiendo su modificación únicamente a través del botón "Generar Código de Barras" para mejorar la integridad de los datos.
- **Solución para Superposición de Modales (MUI Dialog y SweetAlert2):** Para resolver el problema de superposición (`z-index`) donde una alerta de `SweetAlert2` queda oculta detrás de un modal de `Material-UI`, la solución preferida y más robusta es **modificar el z-index de la alerta mediante JavaScript en el momento de su creación.** Esto se logra utilizando la opción `didOpen` en la configuración de `Swal.fire`.

  **Ejemplo de Implementación:**
  ``javascript
  import Swal from 'sweetalert2';

  // ... dentro de un componente

  Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      // ... otras opciones de configuración ...
      didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
              // El z-index por defecto de un modal de MUI es 1300.
              // Se asigna un valor superior para asegurar que la alerta esté por encima.
              swalContainer.style.zIndex = '1400';
          }
      }
  }).then((result) => {
      if (result.isConfirmed) {
          // Lógica de confirmación
      }
  });``
  

  Esta técnica es superior a usar clases CSS personalizadas o a cerrar y reabrir modales, ya que es más fiable y no introduce complejidad en el manejo del estado.
- Si al leer un archivo el contenido está truncado, debo realizar lecturas adicionales usando los parámetros `offset` y `limit` para obtener el contenido completo.
