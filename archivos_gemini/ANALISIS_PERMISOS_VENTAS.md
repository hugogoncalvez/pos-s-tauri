# Análisis de Incongruencia de Permisos en Módulo de Ventas

## Diagnóstico del Problema

Se ha identificado un conflicto entre la lógica del frontend y la seguridad del backend que impide al rol "Cajero" utilizar correctamente el componente de Ventas.

1.  **El Problema de Origen: Acoplamiento en el Frontend**
    *   El componente `Ventas.jsx` siempre intenta obtener la lista de promociones y combos activos al iniciarse para poder aplicar sus reglas a la venta.
    *   Realiza peticiones `GET` a `/promotions` y `/combos` incondicionalmente.

2.  **La Causa del Error: Seguridad Robusta en el Backend**
    *   Las rutas del backend que devuelven la lista de promociones y combos están protegidas por el middleware `verificarPermiso`, que exige los permisos `gestionar_promociones` y `gestionar_combos`.

3.  **El Conflicto de Roles:**
    *   El rol "Cajero" tiene el permiso `crear_venta`, pero carece de los permisos para `gestionar_promociones` y `gestionar_combos`.
    *   Como resultado, el backend deniega correctamente la petición del frontend con un error `403 Forbidden`, lo que provoca errores en la consola e impide que la lógica de promociones funcione para el cajero.

La arquitectura actual fusiona el permiso para "ver" las reglas con el de "gestionarlas", creando un obstáculo para una funcionalidad básica del sistema.

---

## Propuestas de Solución

### Opción 1: La Solución Ideal (Refactorización del Backend)

**Concepto:** Mover la lógica de aplicación de promociones y combos del frontend al backend. El frontend ya no calcula nada, solo envía el "carrito" y el backend se encarga de todo.

*   **Pros:**
    *   **Máxima Seguridad:** Las reglas de negocio sensibles (márgenes, costos, promociones) nunca salen del servidor.
    *   **Consistencia Garantizada:** La lógica de cálculo es una sola y está centralizada.
    *   **Permisos Claros:** El rol "Cajero" solo necesita el permiso `crear_venta`. La aplicación de promociones se convierte en un efecto secundario de la venta.
*   **Contras:**
    *   Requiere una refactorización más significativa del controlador `createSale` en el backend.

### Opción 2: La Solución Intermedia (Ajuste de Permisos y Rutas)

**Concepto:** Crear nuevas rutas en el backend de "solo lectura" para que el frontend pueda consultar las promociones, pero protegidas por un permiso que el Cajero sí tenga.

*   **Implementación:**
    1.  Crear un nuevo permiso, por ejemplo, `ver_promociones_activas`.
    2.  Asignar este permiso al rol "Cajero".
    3.  Crear nuevas rutas en el backend (ej. `GET /sales/active-promotions`) protegidas por este nuevo permiso.
    4.  Actualizar el frontend para que apunte a estas nuevas rutas.
*   **Pros:**
    *   Rápida de implementar sin cambiar la lógica de cálculo del frontend.
    *   Mantiene un control de permisos muy detallado y granular.
*   **Contras:**
    *   Añade más permisos y rutas que mantener, aumentando la complejidad de la gestión.

### Opción 3: Simplificar la Seguridad en Rutas de Lectura (Propuesta del Usuario)

**Concepto:** Re-evaluar qué datos son verdaderamente sensibles y eliminar la protección por permisos *específicos* en las rutas `GET` que solo leen información pública dentro de la aplicación, como promociones y combos. La ruta seguiría requiriendo una sesión activa.

*   **Implementación:**
    *   Modificar `back/routes/routes.js` y remover el middleware `verificarPermiso(...)` de las rutas `GET /promotions` y `GET /combos`, manteniendo `verificarSesion`.
*   **Pros:**
    *   **Solución Inmediata:** Es la solución más rápida y simple.
    *   **Funcionalidad Garantizada:** Resuelve el problema del Cajero sin tocar el código del frontend.
    *   **Pragmática:** Se alinea con la filosofía de que las herramientas básicas para un rol deben estar disponibles sin trabas.
*   **Contras (Puntos a Considerar):**
    *   **Exposición de Datos:** Cualquier usuario logueado (independientemente de su rol) podría ver todas las promociones y combos.
    *   **Menor Flexibilidad Futura:** Dificulta la creación de promociones "secretas" o específicas para ciertos roles más adelante.
