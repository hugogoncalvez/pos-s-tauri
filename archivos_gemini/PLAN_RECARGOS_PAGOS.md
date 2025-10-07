## Plan para la Gestión de Recargos por Forma de Pago

El objetivo es implementar una funcionalidad que permita configurar recargos porcentuales para diferentes formas de pago, con la posibilidad de activarlos o desactivarlos.

### Enfoque General:
Se creará un componente completo para la gestión de recargos, accesible desde la barra lateral del Dashboard. Este componente listará todos los medios de pago y permitirá editar sus configuraciones de recargo a través de un modal.

### Pasos Detallados:

**1. Backend (API y Base de Datos):**
   a. **Modificar el modelo `PaymentModel`:**
      - Añadir una columna `surcharge_active` (BOOLEAN) para indicar si el recargo está activo para ese método de pago.
      - Añadir una columna `surcharge_percentage` (DECIMAL(5,2)) para almacenar el porcentaje de recargo.
      - Actualizar el esquema de la base de datos para reflejar estos cambios en la tabla `payments`.
   b. **Crear nuevos endpoints en `back/controllers/Controller.js` y `back/routes/routes.js`:**
      - `GET /payments/surcharges`: Para listar todos los métodos de pago con su información de recargo.
      - `PUT /payments/:id/surcharge`: Para actualizar el estado (`surcharge_active`) y el porcentaje (`surcharge_percentage`) de recargo de un método de pago específico.
   c. **Modificar la lógica de `createSale` en `back/controllers/Controller.js`:**
      - Antes de calcular el `total_neto` final de la venta, verificar si el `payment_method_id` seleccionado tiene un recargo activo.
      - Si tiene un recargo activo, aplicar el `surcharge_percentage` al `total_neto` de la venta.
      - Asegurarse de que este recargo se refleje correctamente en los registros de venta y auditoría.

**2. Frontend (Componentes React):**
   a. **Crear `PaymentMethodSurchargeManager.jsx` en `front/src/components/`:**
      - Este será el componente principal de la nueva página.
      - Utilizará `UseFetchQuery` para obtener la lista de métodos de pago y sus configuraciones de recargo desde el nuevo endpoint del backend.
      - Mostrará esta información en una tabla.
      - Incluirá botones para activar/desactivar recargos y para editar el porcentaje (que abrirán el modal de edición).
   b. **Crear `EditSurchargeModal.jsx` en `front/src/styledComponents/`:**
      - Este modal se abrirá al hacer clic en el botón de edición de un método de pago.
      - Contendrá campos para `surcharge_percentage` y un `Switch` para `surcharge_active`.
      - Utilizará `useSubmit` para enviar las actualizaciones al endpoint del backend.

**3. Rutas y Permisos (Frontend y Backend):**
   a. **Añadir una nueva ruta en `front/src/router/index.jsx`:**
      - `path: '/payment-surcharges'`, `element: <PaymentMethodSurchargeManager />`.
   b. **Definir nuevos permisos en `back/config/modulePermissions.js`:**
      - `ver_vista_recargos_pagos`: Para permitir el acceso a la página de gestión de recargos.
      - `accion_gestionar_recargos_pagos`: Para permitir la activación/desactivación y edición de los recargos.
   c. **Proteger los nuevos endpoints del backend** con `checkPermission` utilizando `accion_gestionar_recargos_pagos`.

**4. Navegación (Frontend):**
   a. **Agregar un enlace en la barra lateral del Dashboard (`front/src/components/Dashboard.jsx` - `DashboardSidebar`):**
      - Un nuevo `ListItem` que navegue a `/payment-surcharges`.
      - La visibilidad de este `ListItem` estará controlada por el permiso `ver_vista_recargos_pagos`.

### Consideraciones Adicionales:
- **Validación:** Implementar validaciones robustas en el frontend y backend para el porcentaje de recargo (ej. entre 0 y 100).
- **Interfaz de Usuario:** Asegurar que la interfaz sea intuitiva y clara para el usuario final.
- **Auditoría:** Registrar en los logs de auditoría los cambios realizados en la configuración de recargos.

Este plan proporciona una estructura clara para la implementación de la funcionalidad de recargos por forma de pago.