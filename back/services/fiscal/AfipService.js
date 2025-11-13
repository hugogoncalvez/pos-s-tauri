// back/services/fiscal/AfipService.js

import FiscalError from './FiscalError.js';

class AfipService {
    constructor(environment = 'HOMOLOGACION') {
        this.environment = environment;
        this.lastVoucherNumber = 0; // Simulate correlativity
    }

    async _simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay
    }

    async _checkEnvironment() {
        if (this.environment === 'ERROR_ENV') { // A special environment to simulate errors
            throw new FiscalError('Simulated AFIP environment error', 'AFIP_ENV_ERROR', 'AFIP_MOCK');
        }
    }

    /**
     * Simulates getting the last voucher number from AFIP.
     * @param {number} pointOfSaleId
     * @param {string} voucherType
     * @returns {Promise<number>}
     */
    async getLastVoucherNumber(pointOfSaleId, voucherType) {
        await this._simulateDelay();
        await this._checkEnvironment();
        console.log(`[AFIP Mock] Getting last voucher number for PV ${pointOfSaleId}, type ${voucherType}.`);
        // In a real mock, this might read from a local store or just return a fixed number
        return this.lastVoucherNumber;
    }

    /**
     * Simulates creating a voucher with AFIP.
     * @param {object} voucherData
     * @returns {Promise<object>}
     */
    async createVoucher(voucherData) {
        await this._simulateDelay();
        await this._checkEnvironment();
        console.log(`[AFIP Mock] Creating voucher in ${this.environment} with data:`, voucherData);

        // Simulate incrementing voucher number
        this.lastVoucherNumber++;
        const currentVoucherNumber = this.lastVoucherNumber;

        // Simulate a successful AFIP response
        return {
            CAE: '12345678901234', // Simulated CAE
            CAEFchVto: '20250101', // Simulated CAE expiration date
            CbteDesde: currentVoucherNumber,
            CbteHasta: currentVoucherNumber,
            FchProceso: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            ImptoLiq: 0,
            ImpNeto: voucherData.totalAmount / 1.21, // Example calculation
            ImpIVA: voucherData.totalAmount - (voucherData.totalAmount / 1.21),
            Resultado: 'A', // A = Aprobado
            PtoVta: voucherData.pointOfSaleId,
            CbteTipo: voucherData.voucherType,
            Concepto: 1, // Productos
            DocTipo: voucherData.customerDocType,
            DocNro: voucherData.customerDocNumber,
            FchServDesde: null,
            FchServHasta: null,
            FchVtoPago: null,
            MonId: 'PES',
            MonCotiz: 1,
            CbtesAsoc: null,
            Opcionales: null,
            Observaciones: null,
            Compradores: null,
            // Add more simulated AFIP response fields as needed
        };
    }

    // Other simulated AFIP methods can be added here
}

export default AfipService;
