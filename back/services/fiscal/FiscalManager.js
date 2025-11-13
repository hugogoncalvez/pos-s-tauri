// back/services/fiscal/FiscalManager.js

import AfipService from './AfipService.js';
import FiscalPrinterService from './FiscalPrinterService.js';
import FiscalError from './FiscalError.js';

class FiscalManager {
    constructor(pointOfSale) {
        if (!pointOfSale || !pointOfSale.emission_type || !pointOfSale.mode) {
            throw new FiscalError('Invalid PointOfSale object provided to FiscalManager.', 'INVALID_POS_DATA', 'FISCAL_MANAGER');
        }
        this.pointOfSale = pointOfSale;
        this.service = this._initializeService();
    }

    _initializeService() {
        const { emission_type, mode } = this.pointOfSale;

        // Determine the environment for the service (HOMOLOGACION or PRODUCCION)
        const environment = mode === 'SIMULADOR' ? 'HOMOLOGACION' : 'PRODUCCION';

        if (emission_type === 'FACTURA_ELECTRONICA') {
            // For now, we only have mock services. In the future, we'd choose RealAfipService or MockAfipService
            return new AfipService(environment);
        } else if (emission_type === 'CONTROLADOR_FISCAL') {
            // For now, we only have mock services. In the future, we'd choose RealFiscalPrinterService or MockFiscalPrinterService
            return new FiscalPrinterService(environment);
        } else {
            throw new FiscalError(`Unsupported emission type: ${emission_type}`, 'UNSUPPORTED_EMISSION_TYPE', 'FISCAL_MANAGER');
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
