# Plan de Implementación: Aplicación de Escritorio con Tauri

Este documento resume la estrategia y los pasos a seguir para convertir la aplicación web actual en una aplicación de escritorio nativa para Windows, utilizando Tauri.

---

### **1. Objetivo Principal**

El objetivo es mejorar la experiencia de usuario y obtener un mayor control sobre el entorno de la aplicación, logrando que se comporte como un programa nativo y no como una página web. 

**Problemas a resolver:**
- Eliminar la necesidad de que el usuario use atajos de teclado como `Alt + F4` para cerrar la aplicación.
- Permitir un botón de "Cerrar Aplicación" dentro de la propia interfaz.
- Asegurar que la aplicación siempre se inicie en modo de pantalla completa o quiosco.
- Ofrecer una experiencia más profesional y simple, ocultando las barras y menús del navegador.

---

### **2. Tecnología Recomendada**

Se ha elegido **Tauri** sobre otras alternativas como Electron.

**Motivos:**
- **Rendimiento Superior:** Utiliza el motor web nativo del sistema operativo (WebView2 en Windows), lo que reduce drásticamente el consumo de RAM.
- **Aplicaciones Ligeras:** Genera instaladores y ejecutables extremadamente pequeños (usualmente < 10MB), en comparación con los +100MB de Electron.
- **Seguridad:** Tiene un enfoque de seguridad por defecto, exponiendo solo las APIs del sistema que se habilitan explícitamente.

---

### **3. Arquitectura Propuesta (Cliente-Servidor)**

La implementación de Tauri modificará la arquitectura de despliegue de la siguiente manera:

- **Backend (Node.js):**
  - **Rol:** Servidor de **API puro**.
  - Su única responsabilidad será manejar la lógica de negocio, la autenticación y la comunicación con la base de datos MySQL.
  - **Importante:** Ya no necesitará servir los archivos estáticos del frontend (la carpeta `dist`).

- **Frontend (Tauri + React):**
  - **Rol:** Cliente de escritorio nativo.
  - Tauri se encargará de empaquetar la carpeta `dist` (generada por `pnpm run build`) dentro de un ejecutable (`.exe`) y un instalador (`.msi`).
  - La aplicación de React se renderizará dentro de una ventana nativa de Tauri, y será responsable de toda la interfaz de usuario.
  - Todas las peticiones de datos se harán a la API de Node.js, que deberá estar corriendo de forma independiente.

---

### **4. Pasos de Implementación (A alto nivel)**

Cuando sea el momento de realizar la migración, estos serán los pasos a seguir:

1.  **Preparar el Frontend:** ✅ **Completado**
    - Asegurarse de que todas las llamadas a la API en React utilicen una URL absoluta y configurable que apunte al backend (ej. `http://localhost:8000`).
    - **Detalles:** Se configuró `front/src/config.js` y `front/src/api/api.js`. Se corrigieron múltiples llamadas a la API en el frontend (`ThemeContextProvider.jsx`, `syncService.js`) para evitar el prefijo `/api` redundante.

2.  **Integrar Tauri:** ✅ **Completado**
    - Seguir la guía oficial de Tauri para añadirlo al proyecto de React existente.
    - **Detalles:** Se instaló la CLI de Tauri (`@tauri-apps/cli`) y el paquete `@tauri-apps/api`. Se inicializó el proyecto Tauri (`pnpm tauri init`). Se instaló el plugin `@tauri-apps/plugin-process` (JS y Rust). Se corrigió la versión del plugin `tauri-plugin-log` en `Cargo.toml`.

3.  **Configurar Tauri (`tauri.conf.json`):** ✅ **Completado**
    - Definir que la ventana principal se abra en pantalla completa (`"fullscreen": true`).
    - Configurar el identificador de la aplicación, los íconos, el nombre, etc.
    - **Detalles:** Se configuró `fullscreen: true` (actualmente `false` para depuración). Se configuraron los metadatos básicos.

4.  **Implementar Cierre Nativo:** 🚧 **En Progreso (Funcionalidad implementada, visibilidad en fullscreen pendiente)**
    - Crear un botón "Cerrar Aplicación" en un lugar apropiado de la interfaz de React (ej. en el `AppBar`).
    - Utilizar la API de Tauri para que, al hacer clic en ese botón, se ejecute el comando para cerrar la aplicación de forma segura.
    - **Detalles:** Se añadieron botones de "Cerrar Aplicación" en `AppBar.jsx` y `Auth.jsx`. Estos botones usan la API de Tauri (`exit(0)`) y realizan un `logout` previo si el usuario está autenticado. Se creó el hook `useIsTauri` para detectar el entorno (actualmente no usado, los botones se renderizan incondicionalmente para depuración). **Los botones son visibles en modo ventana convencional, pero no en pantalla completa.**

5.  **Crear el Proceso de Build y Despliegue:** 🚧 **Pendiente**
    - El despliegue en la máquina de un cliente implicará:
        a. Instalar y ejecutar el backend de Node.js como un servicio en segundo plano.
        b. Generar el instalador `.msi` de Tauri (`pnpm tauri build`) e instalar la aplicación de escritorio en el sistema.

---

### **5. Configuración para Red Local (Múltiples Clientes)**

Para un escenario donde el **backend de Node.js corre en una PC Servidor** y múltiples **clientes Tauri corren en otras PCs** dentro de la misma red local, se deben realizar las siguientes configuraciones:

#### **A. Backend (Node.js)**

1.  **Permitir Conexiones de Red:** ✅ **Completado**
    - En `back/app.js`, modificar `app.listen` para que acepte conexiones de cualquier IP de la red, no solo de `localhost`.
    ```javascript
    // Reemplazar:
    // app.listen(port, () => { ... });

    // Por:
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${port} y accesible en la red local`);
    });
    ```

2.  **Configurar CORS (Cross-Origin Resource Sharing):** ✅ **Completado**
    - Es necesario para que el servidor acepte peticiones que no vienen de sí mismo.
    - Instalar el paquete: `pnpm install cors` (dentro de la carpeta `back`).
    - Añadir la configuración en `back/app.js`:
    ```javascript
    const cors = require('cors');

    // Opciones de CORS para permitir la app de Tauri y la red local
    const corsOptions = {
      origin: [
        'tauri://localhost', // Origen para la app de Tauri
        // Expresión regular para permitir cualquier IP en la subred 192.168.1.x
        // Ajustar si la subred es diferente (ej. 192.168.0.x)
        /^http:\/\/192\.168\.1\.\d+$/ 
      ],
      credentials: true // Si usas cookies o sesiones
    };

    app.use(cors(corsOptions));
    ```
    - **Detalles Adicionales:** Se añadió `express.json()` y se montaron las rutas en `/api` en `back/app.js`. Se configuró el middleware de sesión (`express-session`) usando un `MemoryStore` temporalmente. Se corrigieron las rutas `/theme` en `back/routes/routes.js`.

#### **B. Frontend (Tauri/React)**

1.  **Centralizar la URL de la API:** ✅ **Completado**
    - Crear un nuevo archivo: `front/src/config.js`.
    - Añadir el siguiente contenido, **reemplazando la IP de ejemplo por la IP real del servidor**:
    ```javascript
    // front/src/config.js
    export const API_BASE_URL = 'http://192.168.1.100:8000/api'; // <-- ¡MODIFICAR ESTA IP!
    ```

2.  **Usar la Configuración en la API:** ✅ **Completado**
    - Modificar `front/src/api/api.js` para que use la URL base del archivo de configuración.
    ```javascript
    // front/src/api/api.js
    import axios from 'axios';
    import { API_BASE_URL } from '../config'; // <-- Importar la URL

    export const Api = axios.create({
      baseURL: API_BASE_URL, // <-- Usar la URL base
      withCredentials: true
    });
    ```

---

### **Estado Actual:**

La aplicación de escritorio de Tauri se ejecuta sin errores en modo ventana convencional. Los botones de "Cerrar Aplicación" son visibles en la pantalla de login y en el `AppBar`. La comunicación con el backend funciona correctamente (usando sesiones en memoria).

**Próximos Pasos:**

1.  **Depurar visibilidad de botones en pantalla completa:** Investigar por qué los botones no son visibles cuando la aplicación se ejecuta en modo `fullscreen` (posiblemente un problema de `z-index` o de renderizado).
2.  **Rehabilitar sesiones persistentes:** Volver a configurar `express-mysql-session` para usar la base de datos MySQL para las sesiones, o considerar una alternativa.
