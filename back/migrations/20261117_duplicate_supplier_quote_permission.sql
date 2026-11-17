-- Migración para permiso de duplicar cotización de proveedor
INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('accion_duplicar_cotizacion_proveedor', 'Duplicar cotizaciones de proveedores para otro proveedor', 'Proveedores')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` = 'accion_duplicar_cotizacion_proveedor'
WHERE r.`id` IN (1, 2);

