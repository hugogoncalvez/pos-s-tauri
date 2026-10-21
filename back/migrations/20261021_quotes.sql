CREATE TABLE IF NOT EXISTS `quotes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `quote_number` VARCHAR(20) DEFAULT NULL,
  `customer_id` BIGINT DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_document` VARCHAR(50) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `customer_address` VARCHAR(255) DEFAULT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `user_id` INT NOT NULL,
  `quote_date` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'borrador',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `terms` TEXT DEFAULT NULL,
  `converted_sale_id` BIGINT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_quotes_quote_number` (`quote_number`),
  KEY `idx_quotes_customer_id` (`customer_id`),
  KEY `idx_quotes_user_id` (`user_id`),
  KEY `idx_quotes_status` (`status`),
  KEY `idx_quotes_quote_date` (`quote_date`),
  KEY `idx_quotes_converted_sale_id` (`converted_sale_id`),
  CONSTRAINT `fk_quotes_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_quotes_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_quotes_converted_sale` FOREIGN KEY (`converted_sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quote_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `quote_id` BIGINT NOT NULL,
  `stock_id` INT DEFAULT NULL,
  `presentation_id` INT DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `presentation_name` VARCHAR(255) DEFAULT NULL,
  `unit_name` VARCHAR(100) DEFAULT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `base_quantity` DECIMAL(12,3) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `line_total` DECIMAL(12,2) NOT NULL,
  `cost` DECIMAL(12,2) DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quote_details_quote_id` (`quote_id`),
  KEY `idx_quote_details_stock_id` (`stock_id`),
  KEY `idx_quote_details_presentation_id` (`presentation_id`),
  CONSTRAINT `fk_quote_details_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_quote_details_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_quote_details_presentation` FOREIGN KEY (`presentation_id`) REFERENCES `product_presentations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('ver_vista_presupuestos', 'Acceder al módulo de presupuestos', 'Presupuestos'),
  ('accion_crear_presupuesto', 'Crear presupuestos', 'Presupuestos'),
  ('accion_editar_presupuesto', 'Editar y emitir presupuestos', 'Presupuestos'),
  ('accion_anular_presupuesto', 'Anular presupuestos', 'Presupuestos'),
  ('accion_convertir_presupuesto', 'Convertir presupuestos en ventas', 'Presupuestos'),
  ('accion_imprimir_presupuesto', 'Imprimir presupuestos', 'Presupuestos')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT INTO `landing_elementos` (`nombre`, `orden`, `descripcion`, `imagen`, `navegar`, `createdAt`, `updatedAt`)
SELECT 'Presupuestos', 6, 'Crear, imprimir y convertir presupuestos en ventas', 'presupuestos.svg', '/presupuestos', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `landing_elementos` WHERE `navegar` = '/presupuestos'
);

INSERT INTO `landing_permisos` (`landing_elemento_id`, `permiso_id`)
SELECT le.`id`, p.`id`
FROM `landing_elementos` le
JOIN `permisos` p ON p.`nombre` = 'ver_vista_presupuestos'
WHERE le.`navegar` = '/presupuestos'
ON DUPLICATE KEY UPDATE `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` IN (
  'ver_vista_presupuestos',
  'accion_crear_presupuesto',
  'accion_editar_presupuesto',
  'accion_anular_presupuesto',
  'accion_convertir_presupuesto',
  'accion_imprimir_presupuesto'
)
WHERE r.`id` IN (1, 2, 3);
