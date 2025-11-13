// back/services/fiscal/FiscalPrinterService.js

import FiscalError from './FiscalError.js';

class FiscalPrinterService {
    static lastTicketNumber = 0; // Make it static to persist across instances

    constructor(environment = 'HOMOLOGACION') {
        this.environment = environment;
    }

    async _simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay
    }

    async _checkEnvironment() {
        if (this.environment === 'ERROR_ENV') { // A special environment to simulate errors
            throw new new FiscalError('Simulated Fiscal Printer environment error', 'PRINTER_ENV_ERROR', 'PRINTER_MOCK');
        }
    }

    /**
     * Simulates getting the last ticket number from the fiscal printer.
     * @returns {Promise<number>}
     */
    async getLastTicketNumber() {
        await this._simulateDelay();
        await this._checkEnvironment();
        console.log(`[Fiscal Printer Mock] Getting last ticket number.`);
        return FiscalPrinterService.lastTicketNumber;
    }

    /**
     * Simulates printing a ticket.
     * @param {object} ticketData
     * @returns {Promise<object>}
     */
    async printTicket(ticketData) {
        await this._simulateDelay();
        await this._checkEnvironment();
        console.log(`[Fiscal Printer Mock] Printing ticket in ${this.environment} with data:`, ticketData);

        // Simulate incrementing ticket number
        FiscalPrinterService.lastTicketNumber++; // Access static property
        const currentTicketNumber = FiscalPrinterService.lastTicketNumber;

        // Simulate a successful printer response
        return {
            ticketNumber: currentTicketNumber,
            printDate: new Date().toISOString(),
            // Add more simulated printer response fields as needed
        };
    }

    // Other simulated fiscal printer methods can be added here
}

export default FiscalPrinterService;
