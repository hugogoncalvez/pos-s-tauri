import { AuditLogModel } from '../database/associations.js';

// ... (el resto del middleware que no cambia)

// Función helper para registrar auditorías manualmente
export const logAudit = async (auditData, req) => {
    try {
        // Si se pasa el objeto req, se extraen datos adicionales
        if (req) {
            auditData.ip_address = auditData.ip_address || req.ip || req.connection.remoteAddress;
            auditData.user_agent = auditData.user_agent || req.get('User-Agent');
            auditData.session_id = auditData.session_id || req.sessionID || null;
        }

        await AuditLogModel.create(auditData);
    } catch (error) {
        console.error('Error al registrar auditoría manual:', error);
    }
};

// Middleware específico para operaciones de caja
export const auditCashOperation = (action) => {
    return auditLogger(action, 'cash_session');
};

// Middleware específico para operaciones de ventas
export const auditSaleOperation = (action) => {
    return auditLogger(action, 'sale');
};

// Middleware específico para operaciones de stock
export const auditStockOperation = (action) => {
    return auditLogger(action, 'stock');
};

// Middleware para capturar datos antes de eliminar (para old_values)
export const captureBeforeDelete = (model) => {
    return async (req, res, next) => {
        try {
            if (req.params.id) {
                const record = await model.findByPk(req.params.id);
                req.originalData = record ? record.toJSON() : null;
            }
        } catch (error) {
            console.error('Error al capturar datos antes de eliminar:', error);
        }
        next();
    };
};