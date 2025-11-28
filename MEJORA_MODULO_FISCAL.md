# Plan de Mejora: Módulo Fiscal (Eliminación de Dependencia a Terceros)

Ahora que el módulo fiscal es funcional utilizando el paquete `@afipsdk/afip.js` y comprendiendo las implicaciones de seguridad y privacidad, el siguiente paso es mejorar la arquitectura para eliminar la dependencia de un servicio de terceros. Esto nos permitirá tener control total sobre el flujo de facturación, mejorar la seguridad y la privacidad, y eliminar costos futuros asociados a dicho servicio.

## Objetivo Principal
Reemplazar la comunicación mediada por el SDK `@afipsdk/afip.js` (que se conecta a un servicio de terceros) por una comunicación directa con los Web Services de la AFIP, utilizando una librería de código abierto.

## Plan Detallado

### Fase 1: Implementación de Comunicación Directa con AFIP

**Objetivo:** Eliminar la dependencia de un servicio de terceros para la comunicación con AFIP, obteniendo control total sobre el flujo y los datos.

1.  **Reemplazar la Librería Comercial por una de Código Abierto:**
    *   **Acción:** Desinstalar `@afipsdk/afip.js` e instalar la librería `afip` (la versión moderna y mantenida de código abierto para Node.js).
    *   **Comandos a Ejecutar:**
        ```bash
        pnpm -C back remove @afipsdk/afip.js
        pnpm -C back add afip
        ```

2.  **Crear un Nuevo Servicio `AfipServiceDirect.js`:**
    *   **Acción:** Crear un nuevo archivo `back/services/fiscal/AfipServiceDirect.js`. Este servicio encapsulará la lógica de comunicación directa con AFIP usando la librería `afip`.
    *   **Implementación (Ejemplo de Constructor y Método):**
        ```javascript
        import Afip from 'afip';
        import path from 'path'; // Asegurarse de que 'path' está disponible si se usa para rutas de archivos

        class AfipServiceDirect {
            constructor(fiscalConfig) {
                // La configuración fiscal ya tiene el CUIT y las rutas a los certificados
                this.afip = new Afip({
                    CUIT: fiscalConfig.cuit,
                    cert: fiscalConfig.cert_path, // Ruta al archivo .crt
                    key: fiscalConfig.key_path,   // Ruta al archivo .key
                    production: fiscalConfig.afip_environment === 'PRODUCCION', // 'true' para Producción AFIP, 'false' para Homologación AFIP
                });
            }

            async createInvoice(invoiceData) {
                // Ejemplo: Obtener el último comprobante y crear el siguiente
                // (La implementación exacta dependerá de cómo se usa en el FiscalManager)
                const lastVoucher = await this.afip.getLastVoucher(
                    invoiceData.PtoVta, // Punto de venta
                    invoiceData.CbteTipo // Tipo de comprobante
                );

                const newVoucher = {
                    ...invoiceData, // Datos de la factura
                    // Aquí se pueden agregar otros campos necesarios por la librería 'afip'
                    // como el número de comprobante, si no está en invoiceData
                };
                
                const result = await this.afip.createNextVoucher(newVoucher);
                return result; // Devuelve la respuesta de AFIP (CAE, fecha vencimiento, etc.)
            }

            async getLastVoucher(PtoVta, CbteTipo) {
                return this.afip.getLastVoucher(PtoVta, CbteTipo);
            }

            async getVoucherInfo(CbteNro, PtoVta, CbteTipo) {
                return this.afip.getVoucherInfo(CbteNro, PtoVta, CbteTipo);
            }
            // ... implementar otros métodos que actualmente usa AfipServiceReal.js
        }

        export default AfipServiceDirect;
        ```

3.  **Actualizar el `FiscalManager.js`:**
    *   **Acción:** Modificar la lógica en `back/services/fiscal/FiscalManager.js` para que, en lugar de instanciar `AfipServiceReal.js`, instancie `AfipServiceDirect.js` cuando el `emission_type` sea `'FACTURA_ELECTRONICA'` y el `mode` sea `'HOMOLOGACION'` o `'PRODUCCION'`.
    *   **Implementación (Ejemplo):**
        ```javascript
        // back/services/fiscal/FiscalManager.js
        import AfipService from './AfipService.js'; // El mock
        // import AfipServiceReal from './AfipServiceReal.js'; // Descomentar al eliminarlo
        import AfipServiceDirect from './AfipServiceDirect.js'; // Nuevo servicio
        import FiscalPrinterService from './FiscalPrinterService.js';
        import PointOfSaleModel from '../../Models/PointOfSaleModel.js';
        import FiscalConfigModel from '../../Models/FiscalConfigModel.js';

        class FiscalManager {
            static async build(pointOfSaleId) {
                const pointOfSale = await PointOfSaleModel.findByPk(pointOfSaleId);
                if (!pointOfSale) {
                    throw new Error(`Punto de venta con ID ${pointOfSaleId} no encontrado.`);
                }

                const fiscalConfig = await FiscalConfigModel.findOne({
                    where: { cuit: pointOfSale.cuit },
                });

                if (pointOfSale.emission_type === 'FACTURA_ELECTRONICA') {
                    if (pointOfSale.mode === 'SIMULADOR') {
                        return new AfipService();
                    } else if (pointOfSale.mode === 'HOMOLOGACION' || pointOfSale.mode === 'PRODUCCION') {
                        // AQUÍ ES DONDE SE USARÍA EL NUEVO SERVICIO DIRECTO
                        // Asegurarse de que fiscalConfig tiene los datos de certificados
                        if (!fiscalConfig || !fiscalConfig.cuit || !fiscalConfig.cert_path || !fiscalConfig.key_path) {
                            throw new Error('Configuración fiscal incompleta para AFIP.');
                        }
                        return new AfipServiceDirect({
                            cuit: fiscalConfig.cuit,
                            cert_path: fiscalConfig.cert_path,
                            key_path: fiscalConfig.key_path,
                            afip_environment: pointOfSale.mode === 'PRODUCCION' ? 'PRODUCCION' : 'HOMOLOGACION',
                        });
                    }
                } else if (pointOfSale.emission_type === 'CONTROLADOR_FISCAL') {
                    // Lógica para el controlador fiscal
                    return new FiscalPrinterService(pointOfSale);
                }
                throw new Error(`Modo de emisión fiscal '${pointOfSale.emission_type}' o modo '${pointOfSale.mode}' no soportado.`);
            }
        }
        export default FiscalManager;
        ```

4.  **Limpieza Final:**
    *   **Acción:** Eliminar el archivo `back/services/fiscal/AfipServiceReal.js` una vez que todas las pruebas pasen con `AfipServiceDirect.js`.
    *   **Acción:** Eliminar cualquier referencia al `afip_access_token` de la base de datos (`FiscalConfigModel`) y de la interfaz de usuario (`FiscalAdmin.jsx`), ya que este campo dejará de ser relevante.

### Fase 2: Refactorización y Aislamiento de Entornos (Mejora de la Robustez)

**Objetivo:** Fortalecer la separación de entornos para prevenir errores de configuración y asegurar que el desarrollo local no interactúe accidentalmente con la AFIP.

1.  **Control de Entorno mediante Variables de Entorno:**
    *   **Acción:** Utilizar una variable de entorno `NODE_ENV` para determinar el entorno de ejecución (desarrollo, homologación, producción).
    *   **Implementación:**
        *   Asegúrate de que en tu archivo `.env` (en la raíz del backend) tengas `NODE_ENV=development` para el desarrollo local.
        *   En el servidor de producción, esta variable deberá ser `NODE_ENV=production`.
        *   Modificar el método `FiscalManager.build()` para usar esta variable:
            ```javascript
            // dentro de FiscalManager.js, al inicio del build
            if (process.env.NODE_ENV !== 'production' && pointOfSale.mode !== 'SIMULADOR') {
                // En desarrollo, si el modo no es SIMULADOR, forzar a HOMOLOGACION o lanzar error
                // O mejor aún: si no es producción, y el modo no es SIMULADOR, siempre devolver el mock
                console.warn('Advertencia: En entorno de desarrollo/local, las llamadas a AFIP se redirigirán a Homologación o a un mock. Desactivando modo Producción.');
                return new AfipService(); // Siempre usar el mock en desarrollo si no es explícitamente SIMULADOR
            }
            // ... el resto de la lógica para decidir AfipServiceDirect o FiscalPrinterService
            ```
    *   **Nota:** La lógica del `mode` en la tabla `points_of_sale` (SIMULADOR, HOMOLOGACION, PRODUCCION) seguirá siendo útil para definir el entorno *dentro* del `AfipServiceDirect` cuando se esté en `NODE_ENV=production`.

### Fase 3: Gestión Avanzada de Certificados (Seguridad y Usabilidad)

**Objetivo:** Simplificar y asegurar la gestión de los certificados digitales de AFIP, haciéndolos parte integral de la configuración de la base de datos.

1.  **Almacenar Contenido de Certificados Directamente en la Base de Datos:**
    *   **Acción:** Modificar la tabla `fiscal_configs` y el `FiscalConfigModel` para que en lugar de `cert_path` y `key_path` (rutas a archivos), se almacenen `cert_content` y `key_content` (el contenido base64 o texto plano de los certificados).
    *   **Cambio en el Modelo:**
        ```javascript
        // En back/Models/FiscalConfigModel.js
        // ...
        cert_content: {
            type: DataTypes.TEXT, // Almacenar el contenido completo del certificado
            allowNull: true,
        },
        key_content: {
            type: DataTypes.TEXT, // Almacenar el contenido completo de la clave privada
            allowNull: true,
        },
        // ... eliminar cert_path y key_path
        ```
    *   **Actualizar la Interfaz de Usuario (`FiscalAdmin.jsx`):**
        *   **Acción:** Reemplazar los campos de entrada de rutas por áreas de texto (`<textarea>`) donde el usuario pueda pegar directamente el contenido de sus archivos `.crt` y `.key`.
        *   **Acción Opcional:** Añadir una funcionalidad para que, al subir un archivo `.crt` o `.key`, el contenido se lea y se pegue automáticamente en el `textarea`.
    *   **Adaptar `AfipServiceDirect.js`:**
        *   **Acción:** Modificar el constructor de `AfipServiceDirect` para que, en lugar de leer los certificados desde un archivo en la ruta especificada, reciba directamente el `cert_content` y `key_content` como strings y los pase al constructor de la librería `afip`. La librería `afip` soporta pasar el contenido directamente.

**Este plan te permitirá tomar el control total de tu integración con AFIP, eliminando dependencias de terceros y mejorando la robustez y seguridad de tu sistema fiscal.**