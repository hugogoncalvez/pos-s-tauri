const sessionHeaderMiddleware = (req, res, next) => {
    const sessionID = req.headers['x-session-id'];

    if (sessionID) {
        console.log('[SessionMiddleware] ✅ SessionID en header:', sessionID);

        // CRÍTICO: Crear cookies object si no existe
        if (!req.cookies) {
            req.cookies = {};
        }

        // Usar la clave de sesión configurada
        const sessionKey = process.env.SESSION_KEY || 'pos_session_key';

        // Establecer el sessionID en cookies para que express-session lo use
        req.cookies[sessionKey] = sessionID;

    } else {
        console.log('[SessionMiddleware] ⚠️ No se encontró X-Session-ID en headers');
    }

    next();
};

export default sessionHeaderMiddleware;