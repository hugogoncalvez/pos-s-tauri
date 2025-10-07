# Plan de Acción Revisado: Sincronización Offline (Ventas)

**Fecha:** 1 de octubre de 2025

**Objetivo Principal:** Asegurar que las ventas realizadas offline (tanto por `cajero_offline` como por un usuario real que perdió la conexión) se sincronicen correctamente cuando la conexión se restablezca.

**Alcance Definido (Limitado):**
*   **Prioridad:** Continuidad de las ventas y su sincronización.
*   **Excluido por ahora:** Otros escenarios offline como tareas administrativas (compras, dashboard), navegación compleja entre módulos no relacionados con ventas mientras offline, o experiencias offline diferenciadas para roles administrativos. Estos se abordarán en fases futuras si es necesario.

---

## Escenarios de Sincronización a Cubrir:

### Escenario 1: Inicio Offline con `cajero_offline`
1.  Usuario inicia la aplicación sin conexión.
2.  **Usuario se loguea *manualmente* con `cajero_offline`.**
3.  Realiza ventas offline.
4.  Conexión se recupera.
5.  **El sistema detecta ventas pendientes y que el usuario actual es `cajero_offline`.**
6.  **El sistema *desloguea automáticamente* al `cajero_offline`.**
7.  Aparece el `SyncModal` pidiendo al usuario que se autentique con sus credenciales reales y abra una caja.
8.  Sincronización de ventas.

### Escenario 2: Inicio Online con usuario real, luego pierde conexión
1.  Usuario se loguea online con sus credenciales reales.
2.  Pierde la conexión (mientras está en Ventas o en otro módulo).
3.  Si está en Ventas, puede seguir vendiendo offline.
4.  Conexión se recupera.
5.  **El sistema detecta ventas pendientes y que el usuario actual es un usuario real (no `cajero_offline`).**
6.  **El sistema *NO desloguea* al usuario real.**
7.  Aparece el `SyncModal`.
8.  El `SyncModal` detecta que ya hay un usuario real logueado y **salta el paso de autenticación**.
9.  Si el usuario real no tiene una sesión de caja activa, el `SyncModal` le pedirá que abra una. Si ya tiene una sesión de caja activa, el `SyncModal` procederá directamente a la sincronización.

---

## Pasos de Implementación Detallados:

**1. Corrección en `front/src/hooks/useSyncManager.js`:**
   *   **Problema:** Uso incorrecto del hook `useOnlineStatus`.
   *   **Acción:** Corregir la desestructuración de `useOnlineStatus` para acceder correctamente a la propiedad `isOnline`.
   *   **Cambio:**
     ```javascript
     // Old:
     // const isOnline = useOnlineStatus();
     // New:
     const { isOnline } = useOnlineStatus();
     ```

**2. Modificaciones en `front/src/App.jsx`:**
   *   **Problema:** Falta la lógica central para orquestar la detección de reconexión, el `logout` condicional y la activación del `SyncModal`.
   *   **Acción A:** Añadir la importación de `syncService`.
   *   **Cambio A:**
     ```javascript
     // Insertar antes de 'import AppRouter from './router/AppRouter';'
     import { syncService } from './services/syncService';
     ```
   *   **Acción B:** Implementar un `useEffect` para manejar la lógica de sincronización al recuperar la conexión.
   *   **Cambio B:**
     ```javascript
     // Insertar dentro del componente App, después de la declaración de hooks:
     useEffect(() => {
       const handleSyncLogic = async () => {
         if (isOnline) { // Solo cuando la conexión se recupera
           const stats = await syncService.getSyncStats();
           if (stats.pendingSales > 0) {
             // Escenario 1: cajero_offline estaba logueado
             if (isAuthenticated && usuario && usuario.isOfflineUser) {
               console.log("[App.jsx] 🌐 Conexión recuperada y ventas pendientes. Deslogueando cajero_offline...");
               logout(); // Esto forzará la re-autenticación y el SyncModal
             }
             // Escenario 2: Usuario real estaba logueado
             else if (isAuthenticated && usuario && !usuario.isOfflineUser) {
               console.log("[App.jsx] 🌐 Conexión recuperada y ventas pendientes. Usuario real logueado. Mostrando SyncModal.");
               setShowSyncModal(true); // Mostrar el modal directamente para el usuario real
             }
           }
         }
       };

       // Un pequeño retraso para asegurar que todos los estados (isOnline, isAuthenticated, usuario)
       // se hayan actualizado correctamente antes de ejecutar la lógica de sincronización.
       const timer = setTimeout(handleSyncLogic, 1000);
       return () => clearTimeout(timer);

     }, [isOnline, isAuthenticated, usuario, logout, setShowSyncModal]); // Dependencias del useEffect
     ```

**3. Modificaciones en `front/src/components/SyncModal.jsx`:**
   *   **Problema:** El modal asume que siempre se necesita autenticación.
   *   **Acción:** Adaptar el flujo del modal para saltar el paso de autenticación si ya hay un usuario real logueado.
   *   **Cambio:**
     ```javascript
     // Dentro del componente SyncModal, en el useEffect inicial o similar:
     useEffect(() => {
       if (open && isAuthenticated && usuario && !usuario.isOfflineUser) {
         // Si el modal se abre y ya hay un usuario real autenticado, saltar el paso de autenticación
         setStep(2); // Ir directamente al paso de Abrir Caja
       } else if (open && (!isAuthenticated || (usuario && usuario.isOfflineUser))) {
         // Si no está autenticado o es el usuario offline, empezar desde el paso 0/1
         setStep(0);
       }
     }, [open, isAuthenticated, usuario]);
     ```
     *(Nota: Este cambio en `SyncModal.jsx` se realizará después de los cambios en `useSyncManager.js` y `App.jsx`.)*

---

**Orden de Ejecución:**
1.  Crear este archivo `PLAN_OFFLINE_SYNC_REVISED.md`.
2.  Aplicar el cambio en `front/src/hooks/useSyncManager.js`.
3.  Aplicar los cambios en `front/src/App.jsx` (importación y `useEffect`).
4.  Aplicar el cambio en `front/src/components/SyncModal.jsx`.

---