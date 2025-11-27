import fs from 'fs';
import path from 'path';
import Afip from '@afipsdk/afip.js';
import FiscalConfigModel from '../../Models/FiscalConfigModel.js';
import FiscalError from './FiscalError.js';

class AfipServiceReal {
    constructor(pointOfSaleId, environment) {
        this.pointOfSaleId = pointOfSaleId;
        this.environment = environment === 'PRODUCCION' ? 'PRODUCTION' : 'HOMOLOGACION'; // afip.js uses 'PRODUCTION' not 'PRODUCCION'
        this.afip = null;
        this.config = null;
    }

    async init() {
        try {
            this.config = await FiscalConfigModel.findOne({ where: { pointOfSaleId: this.pointOfSaleId } });

            if (!this.config) {
                throw new FiscalError(
                    `Fiscal configuration not found for PointOfSale ID: ${this.pointOfSaleId}`,
                    'FISCAL_CONFIG_NOT_FOUND',
                    'AFIP_SERVICE_REAL'
                );
            }

            const certPath = path.resolve(this.config.afip_certificado_path);
            const keyPath = path.resolve(this.config.afip_clave_path);

            if (!fs.existsSync(certPath)) {
                throw new FiscalError(
                    `AFIP certificate file not found at: ${certPath}`,
                    'AFIP_CERT_NOT_FOUND',
                    'AFIP_SERVICE_REAL'
                );
            }
            if (!fs.existsSync(keyPath)) {
                throw new FiscalError(
                    `AFIP private key file not found at: ${keyPath}`,
                    'AFIP_KEY_NOT_FOUND',
                    'AFIP_SERVICE_REAL'
                );
            }

            if (!this.config.afip_access_token) {
                throw new FiscalError(
                    `AFIP access token is missing in the configuration for PointOfSale ID: ${this.pointOfSaleId}`,
                    'AFIP_TOKEN_NOT_FOUND',
                    'AFIP_SERVICE_REAL'
                );
            }

            this.afip = new Afip({
                CUIT: this.config.cuit,
                cert: fs.readFileSync(certPath, 'utf8'),
                key: fs.readFileSync(keyPath, 'utf8'),
                access_token: this.config.afip_access_token,
                res_folder: path.resolve('afip_res'), // Folder to store WSAA tickets
                ta_folder: path.resolve('afip_ta'), // Folder to store TA tickets
                production: this.environment === 'PRODUCTION' ? true : false,
            });

        } catch (error) {
            console.error("[AFIP Service Real] Initialization error:", error);
            throw new FiscalError(
                `Failed to initialize AFIP service: ${error.message}`,
                'AFIP_INIT_FAILED',
                'AFIP_SERVICE_REAL',
                error.stack
            );
        }
    }

    async getLastVoucherNumber(voucherType, pointOfSaleNumber) {
        if (!this.afip) {
            throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        }
        try {
            const response = await this.afip.ElectronicBilling.getLastVoucher(pointOfSaleNumber, voucherType);

            let lastVoucher = 0;
            const parsedResponse = parseInt(response, 10);
            if (!isNaN(parsedResponse)) {
                lastVoucher = parsedResponse;
            }
            
            return lastVoucher;
        } catch (error) {
            console.error("[AFIP Service Real] Error getting last voucher number:", error);
            throw new FiscalError(
                `Failed to get last voucher number from AFIP: ${error.message}`,
                'AFIP_GET_LAST_VOUCHER_FAILED',
                'AFIP_SERVICE_REAL',
                error.stack
            );
        }
    }

    async createVoucher(voucherData) {
        if (!this.afip) {
            throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        }
        try {
            const afipVoucherData = await this._mapVoucherDataToAfipFormat(voucherData);
            const res = await this.afip.ElectronicBilling.createVoucher(afipVoucherData);
            
            return {
                ...res,
                CbteDesde: afipVoucherData.CbteDesde
            };
        } catch (error) {
            console.error("[AFIP Service Real] Error creating voucher:", error);
            const errorMessage = error.message || 'Unknown error';
            const errorStack = error.stack || '';
            const afipErrors = error.errors || null;
            const afipObservations = error.observations || null;

            if (afipErrors) console.error("[AFIP Service Real] AFIP Errors:", afipErrors);
            if (afipObservations) console.error("[AFIP Service Real] AFIP Observations:", afipObservations);

            throw new FiscalError(
                `Failed to create voucher with AFIP: ${errorMessage}`,
                'AFIP_CREATE_VOUCHER_FAILED',
                'AFIP_SERVICE_REAL',
                { stack: errorStack, afipErrors, afipObservations }
            );
        }
    }

    async _mapVoucherDataToAfipFormat(voucherData) {
        const {
            totalAmount,
            customerDocType,
            customerDocNumber,
            pointOfSaleId,
            voucherType,
        } = voucherData;

        // 1. Get the next voucher number
        const lastVoucher = await this.getLastVoucherNumber(voucherType, pointOfSaleId);
        const nextVoucherNumber = lastVoucher + 1;

        // 2. Prepare date
        const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0].replace(/-/g, '');

        // 3. Calculate amounts (assuming 21% IVA for now)
        // This is a simplification. A real system should get tax rates from products.
        const impTotal = parseFloat(totalAmount);
        const impNeto = parseFloat((impTotal / 1.21).toFixed(2));
        const impIVA = parseFloat((impTotal - impNeto).toFixed(2));

        // 4. Determine customer concept and IVA condition based on voucher type
        // This is a simplification based on common practice.
        // FACTURA A -> discriminates IVA, usually for registered taxpayers
        // FACTURA B -> does not discriminate IVA, usually for final consumers
        let docTipo = customerDocType || '99'; // 99 for Consumidor Final
        let docNro = customerDocNumber || '0';
        let concepto = 1; // 1: Productos, 2: Servicios, 3: Productos y Servicios
        
        // This mapping needs to be verified against real AFIP specs
        const ivaAlicuotas = [
            {
                Id: 5, // Id for 21% IVA
                BaseImp: impNeto,
                Importe: impIVA,
            },
        ];

        const afipData = {
            'CantReg': 1,
            'PtoVta': pointOfSaleId,
            'CbteTipo': voucherType,
            'Concepto': concepto,
            'DocTipo': docTipo,
            'DocNro': docNro,
            'CbteDesde': nextVoucherNumber,
            'CbteHasta': nextVoucherNumber,
            'CbteFch': fecha,
            'ImpTotal': impTotal,
            'ImpTotConc': 0, // Importe neto no gravado
            'ImpNeto': impNeto,
            'ImpOpEx': 0, // Importe exento de IVA
            'ImpIVA': impIVA,
            'ImpTrib': 0, //Importe total de tributos
            'MonId': 'PES',
            'MonCotiz': 1,
            'CondicionIVAReceptorId': 5, // As per AFIP error message and common practice for Factura B (Consumidor Final)
            'Iva': ivaAlicuotas,
        };

        return afipData;
    }

    /**
     * @summary Gets available voucher concepts from AFIP.
     * @returns {Promise<Array>}
     */
    async getVoucherConcepts() {
        if (!this.afip) throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        try {
            return await this.afip.ElectronicBilling.getVoucherConcepts();
        } catch (error) {
            throw new FiscalError(`Failed to get voucher concepts from AFIP: ${error.message}`, 'AFIP_GET_CONCEPTS_FAILED', 'AFIP_SERVICE_REAL', error.stack);
        }
    }

    /**
     * @summary Gets available document types from AFIP.
     * @returns {Promise<Array>}
     */
    async getDocumentTypes() {
        if (!this.afip) throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        try {
            return await this.afip.ElectronicBilling.getDocumentTypes();
        } catch (error) {
            throw new FiscalError(`Failed to get document types from AFIP: ${error.message}`, 'AFIP_GET_DOC_TYPES_FAILED', 'AFIP_SERVICE_REAL', error.stack);
        }
    }

    /**
     * @summary Gets available IVA types from AFIP.
     * @returns {Promise<Array>}
     */
    async getIvaTypes() {
        if (!this.afip) throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        try {
            return await this.afip.ElectronicBilling.getIvaTypes();
        } catch (error) {
            throw new FiscalError(`Failed to get IVA types from AFIP: ${error.message}`, 'AFIP_GET_IVA_TYPES_FAILED', 'AFIP_SERVICE_REAL', error.stack);
        }
    }

    /**
     * @summary Gets available Recipient VAT Condition types from AFIP.
     * @returns {Promise<Array>}
     */
    async getCondicionIvaReceptorTypes() {
        if (!this.afip) throw new FiscalError('AFIP service not initialized.', 'AFIP_NOT_INITIALIZED', 'AFIP_SERVICE_REAL');
        try {
            return await this.afip.ElectronicBilling.getRecipientIVAConditionTypes();
        } catch (error) {
            throw new FiscalError(`Failed to get Recipient VAT Condition types from AFIP: ${error.message}`, 'AFIP_GET_RECEPTOR_IVA_TYPES_FAILED', 'AFIP_SERVICE_REAL', error.stack);
        }
    }
}

export default AfipServiceReal;
