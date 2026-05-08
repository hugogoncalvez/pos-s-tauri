/**
 * Monitor de salud de la base de datos (Estado Cacheado)
 * Evita realizar consultas pesadas en cada latido de /health
 */

let status = {
    mainDb: 'unknown',
    sessionPool: 'unknown',
    lastCheck: null
};

export const updateHealthStatus = (component, isHealthy) => {
    status[component] = isHealthy ? 'healthy' : 'unhealthy';
    status.lastCheck = new Date().toISOString();
};

export const getHealthStatus = () => {
    return {
        ...status,
        overall: (status.mainDb === 'healthy' && status.sessionPool === 'healthy') ? 'ok' : 'warning'
    };
};

// Singleton para exportar el estado
export default {
    updateHealthStatus,
    getHealthStatus
};
