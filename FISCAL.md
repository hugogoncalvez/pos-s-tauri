# Documentación del Módulo Fiscal

Este documento describe la arquitectura y el flujo de trabajo del módulo fiscal, enfocado en la facturación electrónica con AFIP en Argentina.

## Resumen General

El sistema está diseñado para gestionar la facturación fiscal a través de dos métodos principales:
1.  **Factura Electrónica**: Comunicación directa con los servidores de AFIP (Administración Federal de Ingresos Públicos).
2.  **Controlador Fiscal**: Integración con impresoras fiscales de hardware.

La configuración y el modo de operación se gestionan por cada **Punto de Venta (PDV)**.

---

## Arquitectura del Backend (`back/`)

La lógica fiscal del backend se centra en `back/services/fiscal/`.

### Flujo de Control Principal

1.  **Punto de Venta (`PointOfSaleModel.js`)**: Esta es la entidad principal que controla el comportamiento fiscal.
    *   La tabla `points_of_sale` contiene la configuración clave.
    *   **`emission_type`**: Define el método de facturación (`'FACTURA_ELECTRONICA'` o `'CONTROLADOR_FISCAL'`).
    *   **`mode`**: Define el entorno de operación. **Este es el interruptor principal del sistema.**
        *   `'SIMULADOR'`: Usa un servicio de **prueba local** (`AfipService.js`). **No se conecta a AFIP**. Es para desarrollo y pruebas internas.
        *   `'HOMOLOGACION'`: Usa el **servicio real** (`AfipServiceReal.js`) para conectar con el **entorno de pruebas/homologación de AFIP**.
        *   `'PRODUCCION'`: Usa el **servicio real** (`AfipServiceReal.js`) para conectar con el **entorno de producción de AFIP** para emitir facturas válidas.

2.  **Gestor Fiscal (`FiscalManager.js`)**: Actúa como un orquestador. Lee la configuración del `Punto de Venta` y, utilizando el método estático `build()`, instancia el servicio fiscal correspondiente (`AfipService` o `AfipServiceReal`) de forma asíncrona.

3.  **Servicios Fiscales (`back/services/fiscal/`)**:
    *   **`AfipServiceReal.js`**: Implementa la comunicación real con AFIP usando la librería `@afipsdk/afip.js`. Se inicializa en modo `homologación` o `producción` según se lo indica el `FiscalManager`.
    *   **`AfipService.js`**: Es un servicio de **simulación (mock)** que imita las respuestas de AFIP para el desarrollo local. No requiere conexión a internet ni certificados.
    *   **`FiscalPrinterService.js`**: Lógica para interactuar con controladores fiscales de hardware (si aplica).

4.  **Configuración Fiscal (`FiscalConfigModel.js`)**:
    *   La tabla `fiscal_configs` almacena datos sensibles y específicos de AFIP para un CUIT (y PDV asociado).
    *   Contiene: `cuit`, `razon_social`, rutas a los archivos de certificado (`.crt`) y clave privada (`.key`) de AFIP.
    *   **Nota Importante**: Este modelo también tiene un campo `afip_environment`. Aunque existe, **actualmente no se utiliza** para decidir el modo de operación. El control principal y único es el campo `mode` en la tabla `points_of_sale`.

---

## Arquitectura del Frontend (`front/`)

La interfaz de usuario para la configuración fiscal se encuentra en `src/components/FiscalAdmin.jsx`.

1.  **Componente Principal (`FiscalAdmin.jsx`)**:
    *   Presenta una interfaz con dos pestañas: "Configuración General" y "Puntos de Venta".

2.  **Gestión de Puntos de Venta**:
    *   La pestaña "Puntos de Venta" lista los PDV existentes.
    *   Para crear o editar un PDV, se utiliza el modal `PointOfSaleModal.jsx` (ubicado en `src/styledComponents/`).
    *   En este modal, el campo **"Modo de Operación"** es un desplegable con las tres opciones que controlan todo el flujo:
        *   `Simulador (Local)` -> (mode: `SIMULADOR`)
        *   `Homologación (Pruebas AFIP)` -> (mode: `HOMOLOGACION`)
        *   `Producción (Real AFIP)` -> (mode: `PRODUCCION`)

3.  **Configuración General**:
    *   Esta pestaña permite editar los datos de la tabla `fiscal_configs`, como el CUIT y la Razón Social.

---

## Estado Actual y Próximos Pasos (26/11/2025)

### Problema Identificado
El proyecto estaba utilizando un paquete `npm` obsoleto (`afip`) en lugar del paquete correcto de la documentación oficial (`@afipsdk/afip.js`). Esto causaba errores de tipo `TypeError: ... is not a constructor` al intentar comunicarse con AFIP.

### Acciones Realizadas
1.  Se desinstaló el paquete obsoleto `afip`.
2.  Se instaló el paquete oficial y moderno `@afipsdk/afip.js`.
3.  Se corrigió la instanciación del `FiscalManager` en `fiscalController.js` y `fiscalJobScheduler.js` para usar el método `await FiscalManager.build()` en lugar de `new FiscalManager()`.
4.  Se corrigió un bug en la ruta de los certificados de AFIP que causaba una duplicación de la carpeta `back/`.

### Problema Actual
La nueva librería `@afipsdk/afip.js` requiere un `access_token` para autenticarse, además del CUIT y los certificados. El usuario ya ha generado este token.

### Próximos Pasos (Pendiente)
1.  **Integrar el `access_token`**:
    *   **Opción A (Recomendada y a largo plazo):**
        1.  Modificar el modelo `FiscalConfigModel` para añadir un campo `afip_access_token`.
        2.  Actualizar la interfaz en `FiscalAdmin.jsx` para permitir al usuario guardar este token en la base de datos.
        3.  Leer el token en `AfipServiceReal.js` y pasarlo al constructor de `Afip`.
    *   **Opción B (Temporal, sugerida por el usuario):**
        1.  "Hardcodear" (escribir directamente en el código) el `access_token` en el constructor de `Afip` dentro de `AfipServiceReal.js`. Esto permitirá validar rápidamente la integración.
        2.  **El usuario debe editar manualmente el archivo y pegar su token.**

2.  **Validar la comunicación:** Una vez integrado el `access_token` (mediante la opción B por ahora), realizar una venta de prueba en modo `HOMOLOGACION` y verificar que la comunicación con AFIP sea finalmente exitosa.

3.  **Limpieza y Refactorización (Futuro):** Una vez que todo funcione, eliminar los `console.log` de depuración y reemplazar la solución temporal (Opción B) por la solución recomendada (Opción A).