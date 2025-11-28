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