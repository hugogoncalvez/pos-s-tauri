const DEFAULT_TOUCH_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_CLEANUP_AGE_MS = 30 * 60 * 1000;

export const createThrottledTouch = (originalTouch, options = {}) => {
    if (typeof originalTouch !== 'function') {
        throw new TypeError('createThrottledTouch requiere una función originalTouch');
    }

    const intervalMs = options.intervalMs ?? DEFAULT_TOUCH_INTERVAL_MS;
    const now = options.now ?? Date.now;
    const lastTouch = new Map();

    const touch = (sessionId, session, callback) => {
        const timestamp = now();
        const previous = lastTouch.get(sessionId);

        if (previous !== undefined && timestamp - previous < intervalMs) {
            if (typeof callback === 'function') callback(null);
            return false;
        }

        lastTouch.set(sessionId, timestamp);
        originalTouch(sessionId, session, callback);
        return true;
    };

    const cleanup = (maxAgeMs = DEFAULT_CLEANUP_AGE_MS) => {
        const cutoff = now() - maxAgeMs;
        for (const [sessionId, timestamp] of lastTouch) {
            if (timestamp < cutoff) lastTouch.delete(sessionId);
        }
    };

    return {
        touch,
        cleanup,
        size: () => lastTouch.size
    };
};
