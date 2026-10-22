-- Módulo Proveedores: PEDIDOS a proveedor (documento imprimible / PDF).
-- El pedido NO mueve stock, NO genera compra ni saldo: es el documento que se imprime
-- y se envía al proveedor. Cuando llega la factura, la compra se carga en el módulo Compras.
-- Aplicar una sola vez, después de 20261022_suppliers.sql.

CREATE TABLE IF NOT EXISTS `supplier_orders` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Correlativo del pedido (se imprime como 5 digitos, ej. 00006)',
  `fecha` DATE NOT NULL,
  `supplier_id` INT NOT NULL,
  `rubro` VARCHAR(255) DEFAULT NULL,
  `tipo` VARCHAR(60) NOT NULL DEFAULT 'MATERIALES',
  `estado` VARCHAR(30) NOT NULL DEFAULT 'emitido',
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notas` TEXT DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT NULL,
  `created_by_id` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_orders_supplier` (`supplier_id`),
  KEY `idx_supplier_orders_fecha` (`fecha`),
  KEY `idx_supplier_orders_estado` (`estado`),
  CONSTRAINT `fk_supplier_orders_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_orders_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_order_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_order_id` INT NOT NULL,
  `stock_id` INT DEFAULT NULL,
  `cantidad` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  `units_id` INT DEFAULT NULL,
  `unidad` VARCHAR(30) DEFAULT NULL,
  `detalle` VARCHAR(255) DEFAULT NULL,
  `precio_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `importe` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `orden` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_order_details_order` (`supplier_order_id`),
  KEY `idx_supplier_order_details_stock` (`stock_id`),
  CONSTRAINT `fk_supplier_order_details_order` FOREIGN KEY (`supplier_order_id`) REFERENCES `supplier_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_order_details_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_order_details_unit` FOREIGN KEY (`units_id`) REFERENCES `units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- El correlativo arranca en 7: los formularios 00001-00006 ya se usaron en papel.
ALTER TABLE `supplier_orders` AUTO_INCREMENT = 7;

-- ------------------------------------------------------------------
-- Carga inicial: pedido Nº 6 (formulario impreso "PEDIDO DE MATERIALES")
-- ------------------------------------------------------------------
INSERT INTO `supplier_orders`
  (`id`, `fecha`, `supplier_id`, `rubro`, `tipo`, `estado`, `total`, `notas`, `created_by`, `created_by_id`, `createdAt`, `updatedAt`)
SELECT 6, '2026-10-21', s.`id`, 'BOLSA/HIDROFUGO', 'MATERIALES', 'emitido', 683820.00,
  'Pedido Nº 00006 cargado desde el formulario impreso (formulario 00001-00006).',
  'migracion', NULL, NOW(), NOW()
FROM `suppliers` s
WHERE s.`nombre` = 'Widmer Alejandro'
  AND NOT EXISTS (SELECT 1 FROM `supplier_orders` WHERE `id` = 6);

INSERT INTO `supplier_order_details`
  (`supplier_order_id`, `stock_id`, `cantidad`, `unidad`, `detalle`, `precio_unitario`, `importe`, `orden`, `createdAt`, `updatedAt`)
SELECT t.`supplier_order_id`, t.`stock_id`, t.`cantidad`, t.`unidad`, t.`detalle`,
       t.`precio_unitario`, t.`importe`, t.`orden`, NOW(), NOW()
FROM (
  SELECT 6 AS `supplier_order_id`,
         (SELECT `id` FROM `stocks` WHERE `name` LIKE 'Cemento portland x 25 kg. Loma Negra%' LIMIT 1) AS `stock_id`,
         80.000 AS `cantidad`, 'bolsa' AS `unidad`, 'Cemento portland x 25 kg. Loma negra.' AS `detalle`,
         7688.75 AS `precio_unitario`, 615100.00 AS `importe`, 1 AS `orden`
  UNION ALL
  SELECT 6, (SELECT `id` FROM `stocks` WHERE `name` LIKE 'Cerecita x 1 kg%' LIMIT 1),
         2.000, 'Un.', 'Hidrofugo Cerecita x 1 kg.', 3490.00, 6980.00, 2
  UNION ALL
  SELECT 6, (SELECT `id` FROM `stocks` WHERE `name` LIKE 'Cerecita x 4 kg%' LIMIT 1),
         2.000, 'Un.', 'Hidrofugo Cerecita x 4 kg.', 9850.00, 19700.00, 3
  UNION ALL
  SELECT 6, (SELECT `id` FROM `stocks` WHERE `name` LIKE 'Cerecita x 10 kg%' LIMIT 1),
         2.000, 'Un.', 'Hidrofugo Cerecita x 10 kg.', 21020.00, 42040.00, 4
) t
WHERE EXISTS (SELECT 1 FROM `supplier_orders` WHERE `id` = 6)
  AND NOT EXISTS (SELECT 1 FROM `supplier_order_details` WHERE `supplier_order_id` = 6);

-- ------------------------------------------------------------------
-- Permisos del sub-módulo Pedidos
-- ------------------------------------------------------------------
INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('ver_pedidos_proveedor', 'Ver pedidos a proveedores', 'Proveedores'),
  ('accion_crear_pedido_proveedor', 'Crear pedidos a proveedores', 'Proveedores'),
  ('accion_editar_pedido_proveedor', 'Editar pedidos a proveedores', 'Proveedores'),
  ('accion_anular_pedido_proveedor', 'Anular pedidos a proveedores', 'Proveedores')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` IN (
  'ver_pedidos_proveedor',
  'accion_crear_pedido_proveedor',
  'accion_editar_pedido_proveedor',
  'accion_anular_pedido_proveedor'
)
WHERE r.`id` IN (1, 2);
