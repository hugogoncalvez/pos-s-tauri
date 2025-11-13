// back/services/fiscal/FiscalError.js

class FiscalError extends Error {
    constructor(message, code = 'FISCAL_ERROR', source = 'SYSTEM', metadata = {}) {
        super(message);
        this.name = 'FiscalError';
        this.code = code;
        this.source = source;
        this.metadata = metadata;

        // Capturing the stack trace, excluding the constructor call from it.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FiscalError);
        }
    }
}

export default FiscalError;
