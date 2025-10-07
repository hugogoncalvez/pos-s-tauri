# Plan de Refactorización de Arquitectura de Permisos

Este documento describe la estrategia y los pasos para refactorizar el sistema de permisos de la aplicación, con el fin de solucionar vulnerabilidades de seguridad y crear un modelo más robusto, escalable y fácil de mantener.

---

### 1. Problema Detectado

La seguridad actual se basa en ocultar elementos de la UI (botones, tarjetas), pero no protege las rutas del frontend a nivel de enrutador. Esto permite que un usuario con permisos limitados pueda acceder a vistas no autorizadas si conoce la URL directa (ej. un cajero accediendo a `/stock`).

Además, se utiliza un mismo permiso para múltiples propósitos (ej. `ver_clientes` tanto para ver la página de gestión como para listar clientes en una venta), lo que dificulta la asignación de permisos granulares.

### 2. Arquitectura Propuesta: Permisos por Capacidad

Se implementará un sistema de permisos basado en **capacidades** o **funcionalidades**, separando los permisos de la interfaz (frontend) de los permisos de acciones (backend).

- **El Rol define las Capacidades:** A un rol (ej. "Cajero") no se le asignan 30 permisos individuales, sino una capacidad de alto nivel como `acceder_modulo_ventas`.
- **El Backend Expande los Permisos:** El backend utiliza un archivo de configuración (`back/config/modulePermissions.js`) como fuente de la verdad. Cuando un usuario inicia sesión, el backend traduce las capacidades de su rol en una lista completa y expandida de todos los permisos de acción granulares que eso implica (`crear_venta`, `buscar_clientes`, etc.) y la envía al frontend.
- **Seguridad en Dos Frentes:**
  - **Frontend:** Las rutas se protegen con permisos de vista (`acceder_modulo_*`).
  - **Backend:** Los endpoints de la API se protegen con permisos de acción (`crear_*`, `listar_*`, etc.).

### 3. Convención de Nomenclatura

Para mantener la claridad, se usará la siguiente convención:

- **Permisos de Vista (Frontend):** `ver_vista_[nombre_vista]`
  - Controlan el acceso a una página o ruta completa.
  - *Ejemplo:* `ver_vista_clientes`, `ver_vista_stock`.

- **Permisos de Acción (Backend):** `[accion]_[entidad]`
  - Controlan operaciones específicas en la API.
  - *Ejemplos:* `listar_clientes`, `crear_cliente`, `editar_cliente`, `eliminar_cliente`.

---

### 4. Plan de Implementación Detallado

**Paso 1: Base de Datos (SQL)**
1.  **Crear Nuevos Permisos:** Añadir todos los permisos de vista (`ver_vista_*`) y de acción (`listar_*`, etc.) que falten en la tabla `permisos`.
2.  **Renombrar Permisos Existentes:** Actualizar los permisos actuales para que sigan la nueva convención.
3.  **Reasignar Permisos a Roles:** Limpiar la tabla `roles_permisos` y volver a insertar las asignaciones correctas según la nueva arquitectura. Por ejemplo, el rol "Cajero" tendrá `ver_vista_ventas` y `listar_clientes`, pero no `ver_vista_clientes`.

**Paso 2: Backend (Node.js)**
1.  **Actualizar `modulePermissions.js`:** Reflejar la nueva estructura de permisos, asociando cada permiso de vista con su conjunto de permisos de acción requeridos.
2.  **Modificar Lógica de Sesión:** Actualizar los endpoints `/auth/login` y `/auth/estado` para que, al obtener los permisos de un usuario, expandan la lista completa de acciones y la envíen al frontend.
3.  **Crear Middleware de Permisos:** Implementar un middleware `checkPermission` en Express que pueda proteger cada ruta de la API, verificando si el usuario tiene el permiso de acción requerido.
4.  **Aplicar Middleware:** Añadir el middleware `checkPermission` a cada ruta de la API en `back/routes/routes.js`.

**Paso 3: Frontend (React)**
1.  **Mejorar `ProtectedRoute.jsx`:** Asegurarse de que el componente reciba una prop `permission` y la use para verificar si el usuario tiene el permiso de vista necesario.
2.  **Proteger Todas las Rutas:** En `front/src/router/index.jsx`, envolver cada ruta de la aplicación con el componente `<ProtectedRoute permission="ver_vista_...">`.
3.  **Actualizar Lógica de UI:** Revisar componentes como `AppBar.jsx` y `Landing.jsx` para que la visibilidad de los botones y tarjetas dependa de los nuevos permisos de vista (`ver_vista_*`).
