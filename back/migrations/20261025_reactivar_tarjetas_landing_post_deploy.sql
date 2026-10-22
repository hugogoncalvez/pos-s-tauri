-- Reactivar las tarjetas del landing de "Proveedores" y "Presupuestos".
--
-- CONTEXTO: el 2026-10-22 se aplicaron en produccion las migraciones de los modulos
-- Proveedores (20261022) y Pedidos (20261023/20261024) y la de Presupuestos (20261021),
-- pero el frontend del cliente todavia NO tiene desplegadas las rutas /proveedores ni
-- /presupuestos. Para que nadie haga clic en una tarjeta que no abre nada, se quitaron
-- sus filas de `landing_permisos` (la consulta del landing es un INNER JOIN, asi que
-- sin permiso la tarjeta no se muestra).
--
-- EJECUTAR SOLO DESPUES de desplegar el backend y el frontend nuevos.
-- Es idempotente: se puede correr mas de una vez sin duplicar nada.

INSERT IGNORE INTO `landing_permisos` (`landing_elemento_id`, `permiso_id`, `createdAt`, `updatedAt`)
SELECT le.`id`, p.`id`, NOW(), NOW()
FROM `landing_elementos` le
JOIN `permisos` p ON p.`nombre` = 'ver_vista_proveedores'
WHERE le.`navegar` = '/proveedores';

INSERT IGNORE INTO `landing_permisos` (`landing_elemento_id`, `permiso_id`, `createdAt`, `updatedAt`)
SELECT le.`id`, p.`id`, NOW(), NOW()
FROM `landing_elementos` le
JOIN `permisos` p ON p.`nombre` = 'ver_vista_presupuestos'
WHERE le.`navegar` = '/presupuestos';

-- Verificacion: las dos tarjetas deben volver a listarse con su permiso.
-- SELECT le.nombre, le.navegar, p.nombre FROM landing_elementos le
-- JOIN landing_permisos lp ON lp.landing_elemento_id = le.id
-- JOIN permisos p ON p.id = lp.permiso_id
-- WHERE le.navegar IN ('/proveedores', '/presupuestos');
