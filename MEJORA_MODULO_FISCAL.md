# Plan de Mejora: Módulo Fiscal (Autogestión de Certificados)

## Objetivo Principal
Utilizar la librería `@afipsdk/afip.js` en un **"modo directo"**, configurándola para que se comunique con los Web Services de la AFIP mediante los certificados y claves privadas locales del cliente. El objetivo es eliminar la dependencia del servicio de pago `app.afipsdk.com` para la obtención de tokens de acceso, dándonos control total sobre la autenticación.

## Plan Detallado

### Fase 1: Implementación de Comunicación Directa con AFIP

**Objetivo:** Configurar `@afipsdk/afip.js` para que se autentique directamente contra el WSAA de AFIP usando certificados locales.

1.  **Confirmar Librería Instalada:**
    *   **Acción:** Asegurarse de que la librería `@afipsdk/afip.js` esté correctamente instalada en el backend.
    *   **Comando a Verificar:**
        ```bash
        pnpm -C back list | grep @afipsdk/afip.js
        ```

2.  **Adaptar `AfipServiceDirect.js` para el Modo Directo:**
    *   **Acción:** Modificar el constructor en `back/services/fiscal/AfipServiceDirect.js`. La librería `@afipsdk/afip.js`, cuando no se le provee un `access_token`, intenta autenticarse directamente. Para ello, necesita el **contenido** de los certificados, no las rutas.
    *   **Implementación Clave:**
        ```javascript
        import Afip from '@afipsdk/afip.js';
        import fs from 'fs';
        import path from 'path';

        class AfipServiceDirect {
            constructor(fiscalConfig) {
                // Leer el CONTENIDO del certificado y la clave desde las rutas guardadas en la config
                const certContent = fs.readFileSync(fiscalConfig.cert_path, 'utf8');
                const keyContent = fs.readFileSync(fiscalConfig.key_path, 'utf8');

                this.afip = new Afip({
                    CUIT: fiscalConfig.cuit,
                    cert: certContent, // Se pasa el contenido del .crt o .pem
                    key: keyContent,   // Se pasa el contenido de la clave privada
                    production: fiscalConfig.afip_environment === 'PRODUCCION', // true para Producción, false para Homologación
                });
            }

            // ... resto de los métodos ...
        }

        export default AfipServiceDirect;
        ```

3.  **Actualizar el `FiscalManager.js`:**
    *   **Acción:** Asegurarse de que `back/services/fiscal/FiscalManager.js` está instanciando `AfipServiceDirect.js` y pasándole el objeto `fiscalConfig` completo.
    *   **Verificación de Implementación:**
        ```javascript
        // back/services/fiscal/FiscalManager.js
        // ... (imports)
        import AfipServiceDirect from './AfipServiceDirect.js'; // Asegurarse de que es el servicio correcto

        // ... (dentro de FiscalManager.build)
        if (pointOfSale.mode === 'HOMOLOGACION' || pointOfSale.mode === 'PRODUCCION') {
            if (!fiscalConfig || !fiscalConfig.cuit || !fiscalConfig.cert_path || !fiscalConfig.key_path) {
                throw new Error('Configuración fiscal incompleta para el modo directo de AFIP. Faltan CUIT o rutas de certificados.');
            }
            // Se pasa el objeto de configuración completo, que contiene las RUTAS
            return new AfipServiceDirect(fiscalConfig);
        }
        // ...
        ```
    *   **Nota:** `FiscalManager` pasa la configuración con las *rutas*, y `AfipServiceDirect` es responsable de *leer el contenido* de esas rutas.

4.  **Limpieza y Pruebas:**
    *   **Acción:** Eliminar cualquier referencia al campo `afip_access_token` o `afip_ticket_path` en la base de datos (`FiscalConfigModel`) y en la UI (`FiscalAdmin.jsx`), ya que no se utilizarán en este modo.
    *   **Acción:** Realizar una prueba de facturación en modo `HOMOLOGACION` para confirmar que el backend puede obtener un Ticket de Acceso (TA) directamente del WSAA y, posteriormente, generar un comprobante.

### Fase 2: Gestión y Aislamiento de Entornos

*(Esta fase no necesita cambios significativos, ya que el `FiscalManager` ya distingue entre `SIMULADOR`, `HOMOLOGACION` y `PRODUCCION`).*

**Objetivo:** Mantener una clara separación de entornos para evitar errores.

1.  **Mantener la Lógica del `FiscalManager`:**
    *   **Acción:** La lógica actual que devuelve un servicio `mock` para `SIMULADOR` y el servicio `AfipServiceDirect` para `HOMOLOGACION`/`PRODUCCION` es correcta y debe mantenerse.

### Fase 3: Gestión de Certificados (Opcional - Mejora a Futuro)

*(Esta fase sigue siendo una mejora válida a largo plazo).*

**Objetivo:** Simplificar la gestión de certificados para el usuario final.

1.  **Almacenar Contenido de Certificados en la Base de Datos:**
    *   **Acción (Futura):** Modificar `FiscalConfigModel` para almacenar `cert_content` y `key_content` (TEXT) en lugar de `cert_path` y `key_path` (VARCHAR).
    *   **Beneficio:** Eliminaría la dependencia de que los archivos existan en una ruta específica en el servidor, haciendo el sistema más portable y fácil de configurar. La UI permitiría pegar el contenido directamente.
---
**Este plan actualizado refleja la estrategia correcta de usar `@afipsdk/afip.js` en modo directo, proporcionando un camino claro para la implementación y depuración.**

---

## Anexo: Estado del Debugging (Error 401 - 2025-12-02)

### Problema Actual
Tras implementar la comunicación en modo directo, la aplicación recibe un error `401 Unauthorized` persistente al intentar comunicarse con los servicios web de AFIP. Esto indica que la autenticación para obtener el Ticket de Acceso (TA) está fallando.

### Verificaciones Realizadas (Problemas Descartados)

Se ha confirmado que el error **NO** se debe a los siguientes problemas comunes:

1.  **✅ Lectura de Archivos:** Se añadieron logs al `AfipServiceDirect.js` que confirman que la aplicación localiza y lee correctamente los archivos de certificado (`.pem`) y clave (`.pem`) desde las rutas especificadas en la base de datos. El error `ENOENT` (Archivo no encontrado) está **resuelto**.

2.  **✅ Validez del Par Certificado/Clave:** Se utilizó la herramienta `openssl` para comparar los módulos del certificado (`afip_cert.pem`) y la clave privada (`afip_key.pem`). Los módulos coinciden, lo que demuestra de forma concluyente que **son un par criptográficamente válido**.

3.  **✅ Configuración de Entorno:** Se verificó mediante logs que la opción `production: false` se está pasando correctamente al constructor de la librería `Afip`, asegurando que la conexión se dirige al entorno de **Homologación** y no a Producción.

4.  **✅ Limpieza del Proyecto:** Se eliminaron archivos de configuración, servicios (`AfipServiceReal.js`) y credenciales obsoletas que pudieran estar causando conflictos.

### Conclusión del Diagnóstico
La causa del error 401 no parece estar en la lógica de la aplicación (rutas, lectura de archivos, configuración), la cual parece ser correcta. El problema debe residir en factores externos o de configuración avanzada.

### Próximos Pasos Recomendados (Checklist)

La investigación debe centrarse ahora en las siguientes áreas:

-   [ ] **Verificar la Hora del Sistema:** Asegurarse de que la fecha, hora y, muy importante, la **zona horaria** del servidor donde se ejecuta el backend sean **exactas**. Una diferencia de tan solo unos minutos con la hora oficial de AFIP puede invalidar la solicitud de autenticación.

-   [ ] **Verificar Delegación de Servicios en AFIP:** Ingresar al portal de AFIP con la clave fiscal correspondiente y confirmar que el CUIT de pruebas (`20226659375`) tiene **delegado y activo** el servicio "Factura Electrónica - Webservice de Homologación" (`wsfe`). Sin esta delegación, el CUIT no tiene permiso para solicitar un TA para ese servicio.

-   [ ] **Revisar Configuración de SoapUI:** Comparar de forma exhaustiva la configuración que previamente funcionó en SoapUI (endpoints exactos, archivos de certificado y clave utilizados, etc.) con la configuración actual. Cualquier mínima diferencia es una pista crucial.

-   [ ] **Verificar Contenido de Archivos:** Aunque el par es válido, abrir los archivos `.pem` para asegurarse de que no contengan espacios o caracteres extraños antes de `-----BEGIN...` o después de `-----END...`.