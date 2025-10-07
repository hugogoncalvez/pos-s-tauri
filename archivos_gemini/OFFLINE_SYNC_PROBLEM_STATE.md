# Estado Actual del Problema de Sincronización Offline

**Fecha:** miércoles, 1 de octubre de 2025

## Problema Principal
Las ventas realizadas en modo offline no se sincronizan automáticamente con el servidor cuando la conexión se restablece.

## Causa Raíz Identificada
La función `AuthContext.jsx` no está re-autenticando correctamente al usuario offline (`OFFLINE_USER`) al cargar o refrescar la página cuando la aplicación está sin conexión. Esto impide que la lógica de detección de reconexión y ventas pendientes se active, ya que el `AuthContext` no tiene un `usuario` válido (`OFFLINE_USER`) para evaluar.

## Acciones Realizadas
1.  **Eliminación del botón "Acceso Rápido Offline":** Se eliminó el botón de `front/src/auth/Auth.jsx` según la solicitud del usuario.
2.  **Corrección de permisos para "Ventas" offline:** Se actualizó el permiso de `OFFLINE_USER` de `ver_modulo_ventas` a `ver_vista_ventas` en `front/src/db/offlineDB.js` para que la tarjeta de "Ventas" se muestre correctamente en `Landing.jsx` en modo offline.
3.  **Adición de `console.log`:** Se agregaron `console.log` en `syncService.js`, `AuthContext.jsx`, `useSyncManager.js` y `SyncModal.jsx` para rastrear el flujo de sincronización.
4.  **Intento de corrección del trigger de sincronización:** Se intentó usar un `useRef` (`lastLoggedInUserWasOffline`) en `AuthContext.jsx` para rastrear el estado del usuario offline, pero esta implementación causó un bucle y fue revertida.

## Estado Actual
*   La aplicación aún no sincroniza las ventas offline al reconectarse.
*   El problema principal es que el `AuthContext` no logra mantener o reestablecer la sesión del `OFFLINE_USER` de forma automática al cargar la aplicación offline.
*   Se ha revertido el último intento de corrección que causó un bucle.

## Próximo Paso Propuesto
Implementar una solución más robusta para el inicio de sesión offline automático directamente dentro de la función `verificarSesion` en `AuthContext.jsx`. Esta solución integrará la lógica de login offline en el flujo de verificación de sesión, asegurando que el `OFFLINE_USER` se establezca correctamente cuando la aplicación se carga sin conexión, y que `isLoading` se gestione de forma adecuada para evitar bucles.

**Detalle del próximo paso:**
Modificar la función `verificarSesion` en `front/src/context/AuthContext.jsx` para que:
*   Al inicio, establezca `setIsLoading(true)`.
*   Si `!isOnline`, intente realizar un login con las credenciales de `OFFLINE_USER`.
*   Gestionar el estado `usuario`, `isAuthenticated` y `permisos` según el resultado del login offline.
*   Asegurarse de que `setIsLoading(false)` se llame al final de la rama offline y de la rama online.
*   Añadir `login` a las dependencias de `useCallback` para `verificarSesion`.
