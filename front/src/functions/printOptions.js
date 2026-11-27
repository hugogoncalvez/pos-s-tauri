/**
 * Opciones de impresión del reporte de caja.
 * Se guardan por usuario en localStorage para conservar formato y detalle.
 */
export const DEFAULT_PRINT_OPTIONS = Object.freeze({
    isThermal: true,
    detailMethods: ['Mercado Pago'],
    includeCustomer: false
});

const STORAGE_PREFIX = 'pos.printOptions.';

const normalizeOptions = (options = {}) => ({
    isThermal: typeof options.isThermal === 'boolean'
        ? options.isThermal
        : DEFAULT_PRINT_OPTIONS.isThermal,
    detailMethods: Array.isArray(options.detailMethods)
        ? options.detailMethods
            .filter(method => typeof method === 'string' && method.trim())
            .map(method => method.trim())
        : [...DEFAULT_PRINT_OPTIONS.detailMethods],
    includeCustomer: typeof options.includeCustomer === 'boolean'
        ? options.includeCustomer
        : DEFAULT_PRINT_OPTIONS.includeCustomer
});

const getStorageKey = (userId) => `${STORAGE_PREFIX}${userId ?? 'default'}`;

export const loadPrintOptions = (userId) => {
    try {
        const stored = localStorage.getItem(getStorageKey(userId));
        if (!stored) {
            return {
                ...DEFAULT_PRINT_OPTIONS,
                detailMethods: [...DEFAULT_PRINT_OPTIONS.detailMethods]
            };
        }
        return normalizeOptions(JSON.parse(stored));
    } catch {
        return {
            ...DEFAULT_PRINT_OPTIONS,
            detailMethods: [...DEFAULT_PRINT_OPTIONS.detailMethods]
        };
    }
};

export const savePrintOptions = (userId, options) => {
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(normalizeOptions(options)));
    } catch {
        // Si el almacenamiento no está disponible, se mantiene la configuración en memoria.
    }
};
