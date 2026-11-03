-- Módulo Proveedores: COTIZACIONES de precios.
-- No mueven stock, no generan compra ni saldo. Al convertirse generan un pedido sin precios.
-- Aplicar una sola vez.

CREATE TABLE IF NOT EXISTS `supplier_quotes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `rubro` VARCHAR(255) DEFAULT NULL,
  `tipo` VARCHAR(60) NOT NULL DEFAULT 'MATERIALES',
  `estado` VARCHAR(30) NOT NULL DEFAULT 'solicitada',
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notas` TEXT DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT NULL,
  `created_by_id` INT DEFAULT NULL,
  `supplier_order_id` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_quotes_numero` (`numero`),
  UNIQUE KEY `uk_supplier_quotes_order` (`supplier_order_id`),
  KEY `idx_supplier_quotes_supplier` (`supplier_id`),
  KEY `idx_supplier_quotes_fecha` (`fecha`),
  KEY `idx_supplier_quotes_estado` (`estado`),
  CONSTRAINT `fk_supplier_quotes_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_quotes_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_quotes_order` FOREIGN KEY (`supplier_order_id`) REFERENCES `supplier_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_quote_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_quote_id` INT NOT NULL,
  `stock_id` INT DEFAULT NULL,
  `units_id` INT DEFAULT NULL,
  `cantidad` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  `unidad` VARCHAR(30) DEFAULT NULL,
  `detalle` VARCHAR(255) DEFAULT NULL,
  `precio_unitario` DECIMAL(12,2) DEFAULT NULL,
  `importe` DECIMAL(12,2) DEFAULT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_quote_details_quote` (`supplier_quote_id`),
  KEY `idx_supplier_quote_details_stock` (`stock_id`),
  CONSTRAINT `fk_supplier_quote_details_quote` FOREIGN KEY (`supplier_quote_id`) REFERENCES `supplier_quotes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_quote_details_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_quote_details_unit` FOREIGN KEY (`units_id`) REFERENCES `units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_quote_counters` (
  `id` INT NOT NULL,
  `ultimo_numero` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `supplier_quote_counters` (`id`, `ultimo_numero`)
SELECT 1, COALESCE(MAX(`numero`), 0) FROM `supplier_quotes`;

INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('ver_cotizaciones_proveedor', 'Ver cotizaciones de proveedores', 'Proveedores'),
  ('accion_crear_cotizacion_proveedor', 'Crear cotizaciones de proveedores', 'Proveedores'),
  ('accion_editar_cotizacion_proveedor', 'Editar cotizaciones de proveedores', 'Proveedores'),
  ('accion_recibir_cotizacion_proveedor', 'Registrar recepción de cotizaciones', 'Proveedores'),
  ('accion_convertir_cotizacion_proveedor', 'Convertir cotizaciones en pedidos', 'Proveedores'),
  ('accion_anular_cotizacion_proveedor', 'Anular cotizaciones de proveedores', 'Proveedores')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` IN (
  'ver_cotizaciones_proveedor',
  'accion_crear_cotizacion_proveedor',
  'accion_editar_cotizacion_proveedor',
  'accion_recibir_cotizacion_proveedor',
  'accion_convertir_cotizacion_proveedor',
  'accion_anular_cotizacion_proveedor'
)
WHERE r.`id` IN (1, 2);
