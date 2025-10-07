import db from '../database/db.js';

export const verificarSesion = (req, res, next) => {
    if (req.session && req.session.usuario) {
        req.usuario = req.session.usuario; next();
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