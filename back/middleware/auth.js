import db from '../database/db.js';
import { sessionStore } from '../app.js';

export const verificarSesion = async (req, res, next) => {
    if (req.session && req.session.usuario) {
        req.usuario = req.session.usuario;
        req.user = req.session.usuario;
        //console.log('[AuthMiddleware] ✅ Sesión directa encontrada para usuario ID:', req.usuario.id);
        next();
    } else if (req.sessionID) {
        // Si la sesión existe pero req.session.usuario no está poblado, intentar rehidratar
        sessionStore.get(req.sessionID, (error, sessionData) => {
            if (error) {
                console.error('[AuthMiddleware] ❌ Error al rehidratar sesión de la tienda:', error);
                return res.status(401).json({ message: 'No autenticado. Por favor, inicia sesión.' });
            }
            if (sessionData && sessionData.usuario) {
                req.session.usuario = sessionData.usuario;
                req.usuario = req.session.usuario;
                req.user = req.session.usuario;
                //console.log('[AuthMiddleware] ✅ Sesión rehidratada exitosamente para usuario ID:', req.user.id);
                //console.log('[AuthMiddleware] 📦 Sesión rehidratada manualmente para ID:', req.sessionID);
                next();
            } else {
                //console.log('[AuthMiddleware] ❌ Sesión no encontrada en el store para ID:', req.sessionID);
                //console.log('[AuthMiddleware] ⚠️ Sesión no encontrada o sin usuario en la tienda para ID:', req.sessionID);
                res.status(401).json({ message: 'No autenticado. Por favor, inicia sesión.' });
            }
        });
    } else {
        res.status(401).json({ message: 'No autenticado. Por favor, inicia sesión.' });
    }
};

export const verificarPermiso = (permisosRequeridos) => {
    return (req, res, next) => {
        // Asumimos que verificarSesion ya se ejecutó y pobló req.session.usuario
        if (!req.session.usuario || !req.session.usuario.permisos) {
            return res.status(401).json({ error: 'Sesión inválida o permisos no cargados.' });
        }

        const userPermissions = new Set(req.session.usuario.permisos);
        const esArray = Array.isArray(permisosRequeridos);

        let tienePermiso = false;
        if (esArray) {
            // Lógica OR: el usuario debe tener al menos uno de los permisos del array
            tienePermiso = permisosRequeridos.some(p => userPermissions.has(p));
        } else {
            // Lógica para un solo permiso (string)
            tienePermiso = userPermissions.has(permisosRequeridos);
        }

        if (tienePermiso) {
            return next();
        }

        return res.status(403).json({ error: 'Acceso denegado. No tiene los permisos suficientes.' });
    };
};

export const verificarPermisoFlexible = (permisoRequerido, customCondition) => {
    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.usuario) {
                return res.status(401).json({ error: 'Sesión requerida.' });
            }

            const usuarioId = req.session.usuario.id;

            // 1. Verificar si tiene el permiso explícito
            const query = `
                SELECT COUNT(*) as tiene_permiso
                FROM usuarios u
                JOIN roles_permisos rp ON u.rol_id = rp.rol_id
                JOIN permisos p ON rp.permiso_id = p.id
                WHERE u.id = ? AND p.nombre = ?
            `;
            const result = await db.query(query, { replacements: [usuarioId, permisoRequerido], type: db.QueryTypes.SELECT });

            if (result[0].tiene_permiso > 0) {
                return next(); // Tiene el permiso, continuar
            }

            // 2. Si no tiene el permiso, verificar la condición personalizada
            if (customCondition && typeof customCondition === 'function') {
                const customConditionResult = await customCondition(req);
                if (customConditionResult) {
                    return next(); // La condición personalizada se cumple, continuar
                }
            }

            // 3. Si ninguna de las dos se cumple, denegar acceso
            return res.status(403).json({ error: 'Acceso denegado. No tiene los permisos suficientes o no cumple la condición requerida.' });

        } catch (error) {
            console.error("Error al verificar permisos flexibles:", error);
            res.status(500).json({ error: 'Error interno al verificar permisos.' });
        }
    };
};