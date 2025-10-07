const checkPermission = (requiredPermissions) => {
  // Asegurarse de que requiredPermissions sea siempre un array
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (req, res, next) => {
    const userPermissions = req.session.usuario?.permisos || [];

    // Verificar si el usuario tiene AL MENOS UNO de los permisos requeridos
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (hasPermission) {
      return next(); // El usuario tiene el permiso, continuar
    } else {

      return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.' });
    }
  };
};

export default checkPermission;