import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import UsuarioModel from '../Models/UsuarioModel.js';
import RoleModel from '../Models/RoleModel.js';
import UserPermissionModel from '../Models/UserPermissionModel.js';
import PermissionModel from '../Models/PermissionModel.js';
import modulePermissions from '../config/modulePermissions.js';
import { logAudit } from '../middleware/auditMiddleware.js';

// --- Función Helper para calcular permisos efectivos ---
async function getEffectivePermissions(rol_id, user_id) {
    const rolePermissionsQuery = `
        SELECT p.nombre
        FROM roles_permisos rp
        JOIN permisos p ON rp.permiso_id = p.id
        WHERE rp.rol_id = ?
    `;
    const basePermissionsRaw = await db.query(rolePermissionsQuery, { replacements: [rol_id], type: db.QueryTypes.SELECT });
    const basePermissions = basePermissionsRaw.map(p => p.nombre);

    const effectivePermissions = new Set();

    // 1. Añadir todos los permisos base del rol (incluyendo los de vista)
    basePermissions.forEach(permiso => {
        effectivePermissions.add(permiso);
    });

    // 2. Expandir los permisos de vista a sus acciones correspondientes
    basePermissions.forEach(permiso => {
        for (const moduleKey in modulePermissions) {
            if (modulePermissions[moduleKey].vista === permiso) {
                modulePermissions[moduleKey].acciones.forEach(action => {
                    effectivePermissions.add(action);
                });
            }
        }
    });

    const overrides = await UserPermissionModel.findAll({
        where: { user_id: user_id },
        include: [{ model: PermissionModel, as: 'permiso', attributes: ['nombre'] }]
    });

    overrides.forEach(override => {
        const permissionName = override.permiso.nombre;
        if (override.type === 'grant') {
            effectivePermissions.add(permissionName);
        } else if (override.type === 'revoke') {
            effectivePermissions.delete(permissionName);
        }
    });

    const finalPermissions = Array.from(effectivePermissions);
    return finalPermissions;
}

const authController = {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
            }

            const query = `
                SELECT u.id, u.nombre, u.username, u.password, u.rol_id, u.theme_preference,
                       r.nombre as rol_nombre
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.username = ? AND u.activo = TRUE
            `;

            const usuarios = await db.query(query, { replacements: [username], type: db.QueryTypes.SELECT });

            if (usuarios.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            const usuario = usuarios[0];
            const passwordValido = await bcrypt.compare(password, usuario.password);

            if (!passwordValido) {
                return res.status(401).json({ error: 'Credenciales inválidas.' });
            }

            const permisosEfectivos = await getEffectivePermissions(usuario.rol_id, usuario.id);

            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                username: usuario.username,
                rol_id: usuario.rol_id,
                rol_nombre: usuario.rol_nombre,
                theme_preference: usuario.theme_preference,
                permisos: permisosEfectivos
            };

            // GUARDAR LA SESIÓN EXPLÍCITAMENTE
            req.session.save(async (err) => {
                if (err) {
                    console.error('❌ Error al guardar la sesión:', err);
                    return res.status(500).json({ error: 'Error al guardar la sesión.' });
                }

                const { password: _, ...usuarioSinPassword } = usuario;
                usuarioSinPassword.permisos = permisosEfectivos;
                usuarioSinPassword.theme_preference = usuario.theme_preference;

                await logAudit({
                    action: 'LOGIN',
                    user_id: usuario.id,
                    entity_type: 'user',
                    entity_id: usuario.id,
                    details: `El usuario ${usuario.username} ha iniciado sesión.`
                }, req);

                // ESTABLECER EL HEADER CON EL SESSION ID
                res.setHeader('X-Session-ID', req.sessionID);
                //console.log('[AUTH] ✅ Login exitoso. SessionID:', req.sessionID);

                res.status(200).json({
                    message: 'Inicio de sesión exitoso',
                    usuario: req.session.usuario,
                    sessionID: req.sessionID
                });
            });

        } catch (error) {
            console.error("❌ Error en el login:", error.stack);
            res.status(500).json({ error: 'Error interno en el servidor durante el login.' });
        }
    },

    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Error al destruir la sesión:', err);
                return res.status(500).json({ error: 'Error al cerrar sesión.' });
            }
            //console.log('[AUTH] ✅ Sesión cerrada exitosamente');
            res.json({ message: 'Sesión cerrada exitosamente.' });
        });
    },

    async verificarEstado(req, res) {
        //console.log('[AUTH] 🔍 Verificando estado. SessionID:', req.sessionID);
        //console.log('[AUTH] 📦 Datos de sesión:', req.session?.usuario ? 'Usuario presente' : 'Sin usuario');

        if (req.session && req.session.usuario) {
            try {
                const userFromDb = await UsuarioModel.findByPk(req.session.usuario.id, {
                    attributes: ['id', 'nombre', 'username', 'rol_id', 'theme_preference'],
                    include: [{ model: RoleModel, as: 'rol', attributes: ['nombre'] }]
                });

                if (userFromDb) {
                    const permisosEfectivos = await getEffectivePermissions(userFromDb.rol_id, userFromDb.id);

                    req.session.usuario = {
                        id: userFromDb.id,
                        nombre: userFromDb.nombre,
                        username: userFromDb.username,
                        rol_id: userFromDb.rol_id,
                        rol_nombre: userFromDb.rol.nombre,
                        theme_preference: userFromDb.theme_preference,
                        permisos: permisosEfectivos
                    };

                    req.session.save((err) => {
                        if (err) {
                            console.error("❌ Error saving session:", err);
                        }

                        // Devolver el sessionID en el header
                        res.setHeader('X-Session-ID', req.sessionID);
                        //console.log('[AUTH] ✅ Usuario autenticado:', userFromDb.username);
                        res.json({ estaLogueado: true, usuario: req.session.usuario });
                    });
                } else {
                    req.session.destroy((err) => {
                        if (err) console.error("❌ Error destroying session:", err);
                        //console.log('[AUTH] ⚠️ Usuario no encontrado en DB');
                        res.json({ estaLogueado: false, usuario: null });
                    });
                }
            } catch (error) {
                console.error("❌ Error en verificarEstado:", error);
                res.status(500).json({ estaLogueado: false, usuario: null, error: 'Error interno del servidor' });
            }
        } else {
            //console.log('[AUTH] ⚠️ Sin sesión activa');
            res.json({ estaLogueado: false, usuario: null });
        }
    },

    async getPermisos(req, res) {
        try {
            if (!req.session || !req.session.usuario || !req.session.usuario.permisos) {
                return res.status(401).json({ error: 'No autenticado o sin permisos definidos.' });
            }
            res.json({ permisos: req.session.usuario.permisos });
        } catch (error) {
            console.error("❌ Error al obtener permisos:", error);
            res.status(500).json({ error: 'Error interno al obtener permisos.' });
        }
    }
};

export default authController;