// back/services/fiscal/FiscalManager.js

import AfipService from './AfipService.js';
import AfipServiceReal from './AfipServiceReal.js';
import FiscalPrinterService from './FiscalPrinterService.js';
import FiscalError from './FiscalError.js';

class FiscalManager {
    constructor(pointOfSale) {
        this.pointOfSale = pointOfSale;
        this.service = null;
    }

    static async build(pointOfSale) {
        if (!pointOfSale || !pointOfSale.emission_type || !pointOfSale.mode) {
            throw new FiscalError('Invalid PointOfSale object provided to FiscalManager.', 'INVALID_POS_DATA', 'FISCAL_MANAGER');
        }
        const manager = new FiscalManager(pointOfSale);
        await manager._initializeService();
        return manager;
    }

    async _initializeService() {
        const { emission_type: raw_emission_type, mode: raw_mode, id: pointOfSaleId } = this.pointOfSale;
        const emission_type = raw_emission_type?.trim();
        const mode = raw_mode?.trim();

        console.log(`[FiscalManager] Initializing service for POS ID: ${pointOfSaleId}, Emission Type: ${emission_type}, Mode: ${mode}`);

        if (emission_type === 'FACTURA_ELECTRONICA') {
            console.log('[FiscalManager] Emission type is FACTURA_ELECTRONICA.');
            if (mode === 'SIMULADOR') {
                console.log('[FiscalManager] Mode is SIMULADOR. Using mock service.');
                this.service = new AfipService('HOMOLOGACION'); // Mock service, environment doesn't really matter
            } else if (mode === 'HOMOLOGACION' || mode === 'PRODUCCION') {
                console.log(`[FiscalManager] Mode is ${mode}. Using real AFIP service.`);
                const environment = mode; // 'HOMOLOGACION' or 'PRODUCCION'
                const realAfipService = new AfipServiceReal(pointOfSaleId, environment);
                await realAfipService.init();
                this.service = realAfipService;
                console.log('[FiscalManager] Real AFIP service initialized.');
            } else {
                console.error(`[FiscalManager] Unsupported mode for electronic invoicing: ${mode}`);
                throw new FiscalError(`Unsupported mode for electronic invoicing: ${mode}`, 'UNSUPPORTED_MODE', 'FISCAL_MANAGER');
            }
        } else if (emission_type === 'CONTROLADOR_FISCAL') {
            console.log('[FiscalManager] Emission type is CONTROLADOR_FISCAL.');
            // Assuming fiscal printers also have modes
            const environment = (mode === 'PRODUCCION') ? 'PRODUCCION' : 'HOMOLOGACION';
            this.service = new FiscalPrinterService(environment);
        } else {
            console.error(`[FiscalManager] Unsupported emission type: ${emission_type}`);
            throw new FiscalError(`Unsupported emission type: ${emission_type}`, 'UNSUPPORTED_EMISSION_TYPE', 'FISCAL_MANAGER');
        }

        if (!this.service) {
            console.error('[FiscalManager] CRITICAL: Service was not initialized after _initializeService!');
        }
    }

    /**
     * Delegates the call to the appropriate service (AFIP or Fiscal Printer).
     * The method name should be generic, and the service will implement it specifically.
     * For example, a generic `generateVoucher` method.
     * @param {string} methodName - The method to call on the underlying service.
     * @param {Array} args - Arguments to pass to the method.
     */
    async delegate(methodName, ...args) {
        if (typeof this.service[methodName] === 'function') {
            return await this.service[methodName](...args);
        } else {
            throw new FiscalError(`Method "${methodName}" not found on the selected fiscal service.`, 'METHOD_NOT_FOUND', 'FISCAL_MANAGER');
        }
    }

    // Example usage methods (can be expanded as needed)
    async generateFiscalVoucher(voucherData) {
        if (this.pointOfSale.emission_type === 'FACTURA_ELECTRONICA') {
            return await this.delegate('createVoucher', voucherData);
        } else if (this.pointOfSale.emission_type === 'CONTROLADOR_FISCAL') {
            return await this.delegate('printTicket', voucherData);
        }
    }

    async getFiscalLastVoucherNumber() {
        if (this.pointOfSale.emission_type === 'FACTURA_ELECTRONICA') {
            // AFIP needs pointOfSaleId and voucherType for last voucher number
            // This would need to be passed in or derived from context
            return await this.delegate('getLastVoucherNumber', this.pointOfSale.id, '01'); // Example voucher type
        } else if (this.pointOfSale.emission_type === 'CONTROLADOR_FISCAL') {
            return await this.delegate('getLastTicketNumber');
        }
    }
}

export default FiscalManager;
