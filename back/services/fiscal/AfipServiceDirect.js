import Afip from '@afipsdk/afip.js';
import fs from 'fs';
import path from 'path';

/**
 * Servicio para la comunicación directa con AFIP utilizando certificados locales.
 */
class AfipServiceDirect {
  constructor(fiscalConfig) {
    console.log('[AfipServiceDirect] Initializing with config:', fiscalConfig);
    try {
        const certPath = path.resolve(fiscalConfig.afip_certificado_path);
        const keyPath = path.resolve(fiscalConfig.afip_clave_path);

        console.log(`[AfipServiceDirect] Reading cert from: ${certPath}`);
        console.log(`[AfipServiceDirect] Reading key from: ${keyPath}`);

        const certContent = fs.readFileSync(certPath, 'utf8');
        const keyContent = fs.readFileSync(keyPath, 'utf8');

        console.log('[AfipServiceDirect] Certificate and Key read successfully.');
        
        const afipOptions = {
            CUIT: fiscalConfig.cuit,
            cert: certContent, // Contenido del certificado
            key: keyContent,   // Contenido de la clave privada
            production: fiscalConfig.afip_environment === 'PRODUCCION', // true para Producción, false para Homologación
        };

        console.log('[AfipServiceDirect] Options passed to Afip constructor:', afipOptions);

        this.afip = new Afip(afipOptions);

        console.log('[AfipServiceDirect] Afip SDK instance created.');

    } catch (error) {
        console.error('[AfipServiceDirect] CRITICAL ERROR IN CONSTRUCTOR:', error);
        // Re-throw the error to ensure the application flow is stopped
        throw error;
    }
  }

    /**
     * Crea un comprobante fiscal electrónico.
     * @param {object} voucherData - Los datos del comprobante.
     * @returns {Promise<object>} - La respuesta de AFIP.
     */
    async createVoucher(voucherData) {
        // La librería espera el número de comprobante, así que primero lo obtenemos.
        const lastVoucher = await this.afip.ElectronicBilling.getLastVoucher(
            voucherData.PtoVta,
            voucherData.CbteTipo
        );

        const nextVoucherNumber = lastVoucher.CbteNro + 1;

        const data = {
            'CantReg': 1,
            'PtoVta': voucherData.PtoVta,
            'CbteTipo': voucherData.CbteTipo,
            'Concepto': voucherData.Concepto,
            'DocTipo': voucherData.DocTipo,
            'DocNro': voucherData.DocNro,
            'CbteDesde': nextVoucherNumber,
            'CbteHasta': nextVoucherNumber,
            'CbteFch': new Date().toISOString().slice(0, 10).replace(/-/g, ""),
            'ImpTotal': voucherData.ImpTotal,
            'ImpTotConc': voucherData.ImpTotConc || 0,
            'ImpNeto': voucherData.ImpNeto,
            'ImpOpEx': voucherData.ImpOpEx || 0,
            'ImpIVA': voucherData.ImpIVA,
            'ImpTrib': voucherData.ImpTrib || 0,
            'MonId': 'PES',
            'MonCotiz': 1,
            // Opcionales como CbtesAsoc, Tributos, Iva, etc., se pueden agregar aquí si vienen en voucherData
        };

        console.log("Enviando a AFIP:", data);
        return this.afip.ElectronicBilling.createVoucher(data);
    }
    
    /**
     * Obtiene el último número de comprobante registrado para un punto de venta y tipo.
     * @param {number} ptoVenta - Punto de Venta
     * @param {number} cbteTipo - Tipo de Comprobante
     * @returns {Promise<object>}
     */
    async getLastVoucherNumber(ptoVenta, cbteTipo) {
         return this.afip.ElectronicBilling.getLastVoucher(ptoVenta, cbteTipo);
    }
    
    /**
     * Obtiene la información de un comprobante ya emitido.
     * @param {number} cbteNro - Número del comprobante
     * @param {number} ptoVenta - Punto de venta
     * @param {number} cbteTipo - Tipo de comprobante
     * @returns {Promise<object>}
     */
    async getVoucherInfo(cbteNro, ptoVenta, cbteTipo) {
        return this.afip.ElectronicBilling.getVoucherInfo(cbteNro, ptoVenta, cbteTipo);
    }

    /**
     * Alias para createVoucher para mantener la compatibilidad con el FiscalManager
     */
    async generateFiscalVoucher(voucherData) {
        return this.createVoucher(voucherData);
    }
}

export default AfipServiceDirect;
