# Plan de Implementación: Capacidad Offline ("Offline-First") - v3 (Sincronización Robusta)

## 1. Resumen del Problema

La aplicación POS actual opera en un modelo "online-only". Si el cliente (navegador) pierde la conexión a internet, la comunicación con el backend se interrumpe, y el sistema deja de ser funcional.

## 2. Objetivo

Transformar la aplicación a un modelo **"Offline-First"** para garantizar la continuidad del negocio. La aplicación debe ser capaz de realizar operaciones críticas (ventas, gestión de caja) de forma local y sincronizar los datos con el servidor central cuando la conexión se restablezca, asegurando la integridad y auditoría de los datos.

## 3. Arquitectura y Componentes Tecnológicos

### a. Base de Datos Local en el Navegador
- **Tecnología:** `IndexedDB`.
- **Librería de Apoyo:** `Dexie.js`. Se usará como wrapper para simplificar la interacción con IndexedDB.

### b. Estrategia de Acceso a Datos (Lectura Offline)
- **Mecanismo:** Se modificarán los hooks de fetching de datos existentes (`front/src/hooks/useQuery.js`).
- **Lógica:** Los hooks se harán "conscientes del estado de conexión". Si la aplicación está offline, en lugar de lanzar una petición a la API, consultarán los datos directamente desde `IndexedDB`.

### c. Detección de Conexión Robusta
- **Mecanismo:** Se creará un hook `useOnlineStatus` que no solo se basa en los eventos del navegador, sino que también realiza un "ping" periódico a un endpoint de salud en el backend (ej. `/api/health`).

### d. Servicio Centralizado de Sincronización
- **Mecanismo:** Se creará un servicio (`front/src/services/syncService.js`) que encapsulará toda la lógica de sincronización.
- **Responsabilidades:**
    - **Sincronización Descendente:** Poblar las tablas locales de Dexie con los datos maestros del servidor.
    - **Sincronización Ascendente:** Enviar los datos generados offline (ej. ventas) al servidor cuando se restablezca la conexión, siguiendo un flujo de re-autenticación.

### e. Cacheo de la Aplicación (App Shell)
- **Tecnología:** `Service Workers`.
- **Función:** Su rol principal será cachear los assets estáticos de la aplicación (HTML, JS, CSS, imágenes). Esto asegura que la aplicación **pueda cargarse e iniciarse** incluso sin conexión a internet. (PENDIENTE)

## 4. Fases de Implementación (Enfoque en Ventas)

1.  **Fase 1: Infraestructura y Configuración. (COMPLETADA)**
    *   Instalar `dexie`.
    *   Crear `front/src/db/offlineDB.js` y definir el esquema: `stock`, `customers`, `promotions`, `pending_sales`, `sync_metadata`, etc.
    *   Añadir el endpoint `GET /api/health` en el backend.

2.  **Fase 2: Detección de Estado y Sincronización Descendente. (COMPLETADA)**
    *   Implementar el hook `front/src/hooks/useOnlineStatus.js`.
    *   Implementar `front/src/services/syncService.js` con el método `loadReferenceData()`.
    *   Integrar en `App.jsx` para que la sincronización se ejecute al inicio si hay conexión.

3.  **Fase 3: Adaptación de la Capa de Datos (Lectura Offline).**
    *   Refactorizar `front/src/hooks/useQuery.js` para que lea desde `Dexie` cuando `isOnline` sea `false`. (COMPLETADA)

4.  **Fase 4: Implementación de Ventas Offline (Escritura Offline). (COMPLETADA)**
    *   Adaptar `Ventas.jsx` para que, al cobrar, llame a `syncService.saveSale()`.
    *   Implementar `saveSale()` para que guarde la venta en la tabla `pending_sales` con un `cash_session_id` provisional (ej. `-1`).
    *   Implementar `updateLocalStock()` en el `syncService` para reflejar la reducción de stock en la UI de forma inmediata.

5.  **Fase 5: Sincronización Ascendente e Indicadores Visuales.**
    *   Implementar el método `syncPendingSalesWithSession()` en el `syncService`, que asocia las ventas a una sesión de caja real. (HECHO, como parte de la Fase 8)
    *   Añadir indicadores visuales en la UI para el estado de conexión (Online/Offline) y el estado de la sincronización. (COMPLETADA)

6.  **Fase 6: Gestión de Caja Offline (Simplificada).**
    *   **Objetivo:** Eliminar el requisito de tener una sesión de caja activa para realizar ventas en modo offline.
    *   **Implementación:**
        *   En `Ventas.jsx`, la validación `isSessionActive` solo se aplicará si `isOnline` es `true`.
        *   En modo offline, se permitirá vender sin una sesión de caja activa. Las ventas se guardarán localmente y se asociarán a una sesión de caja real durante el proceso de sincronización (Fase 8).
        *   Los movimientos de caja (ingresos/egresos) también se guardarán en una cola local (`pending_cash_movements`) para ser sincronizados posteriormente. (PENDIENTE)

7.  **Fase 7: Estrategia de Login Offline.**
    *   **Implementación:** Se mantiene la estrategia del usuario `cajero_offline` con permisos mínimos.
    *   **NUEVO:** Se modificará el hook `useOnlineStatus`. Al detectar que la conexión se ha restaurado (`isOnline` es `true`) y que hay datos pendientes de sincronización (`syncService.getSyncStats()`), se llamará a la función `logout()` del `AuthContext`. Esto cerrará la sesión del `cajero_offline` y preparará la aplicación para el flujo de re-autenticación. (COMPLETADA)

8.  **Fase 8: Sincronización y Re-autenticación al Reconectar (NUEVA FASE).**
    *   **Objetivo:** Garantizar que todos los datos generados offline se asocien a un usuario real y a una sesión de caja válida, manteniendo la integridad contable y de auditoría.
    *   **Componentes Clave:**
        *   **`useSyncManager` (Hook):** Detecta cuando la conexión vuelve y si existen datos pendientes en `Dexie`. Si es así, activa el modal de sincronización. (COMPLETADA)
        *   **`SyncModal.jsx` (Componente):** Un modal de diálogo no descartable que guía al usuario a través de un proceso de varios pasos. (COMPLETADA)
    *   **Flujo del Modal de Sincronización:**
        1.  **Paso 0: Información:** Muestra un resumen de los datos pendientes de sincronizar (ej. "15 ventas pendientes") e informa al usuario que debe autenticarse y abrir una caja para continuar.
        2.  **Paso 1: Autenticación:** Presenta un formulario de login para que el usuario ingrese sus credenciales **reales**.
        3.  **Paso 2: Abrir Sesión de Caja:** Una vez autenticado, solicita al usuario que ingrese el monto de apertura para una **nueva sesión de caja**.
        4.  **Paso 3: Sincronización:**
            *   El sistema abre la sesión de caja en el servidor y obtiene el `realCashSessionId`.
            *   El `syncService` itera sobre todas las `pending_sales`. Para cada una, reemplaza el `cash_session_id` provisional (`-1`) por el `realCashSessionId`.
            *   Envía la venta actualizada al endpoint `/sales` del backend.
            *   Muestra el progreso en tiempo real (ej. "Sincronizando venta 5 de 15...").
        5.  **Paso 4: Finalización:** Una vez completado, muestra un resumen del resultado, cierra el modal y recarga la aplicación para reflejar el estado actualizado.
    *   **`syncService.js`:** Se implementará la función `syncPendingSalesWithSession(realCashSessionId, onProgress)` que contiene la lógica para iterar, actualizar y enviar las ventas al servidor. (COMPLETADA)

## 9. Flujo de Usuario Completo

1.  **Inicio Offline:** El usuario abre la aplicación sin internet. Inicia sesión con el usuario `cajero_offline`.
2.  **Trabajo Offline:** Realiza ventas y movimientos de caja. El sistema guarda todo en `IndexedDB` y la UI responde al instante. No se requiere una "apertura de caja" formal.
3.  **Recuperación de Conexión:** El usuario vuelve a tener internet.
4.  **Detección y Logout:** El hook `useOnlineStatus` detecta la conexión. Al ver que hay ventas pendientes, cierra automáticamente la sesión del `cajero_offline`.
5.  **Modal de Sincronización:** Inmediatamente, aparece el `SyncModal`, bloqueando el resto de la aplicación.
6.  **Re-autenticación:** El usuario ingresa sus credenciales reales.
7.  **Apertura de Caja Real:** El usuario abre una nueva sesión de caja con un monto inicial.
8.  **Sincronización Automática:** El sistema asocia todas las ventas y movimientos offline a la nueva sesión de caja y los envía al servidor.
9.  **Continuidad:** Una vez sincronizado, el modal desaparece y el usuario puede seguir trabajando normalmente con su sesión real y la aplicación totalmente sincronizada.
