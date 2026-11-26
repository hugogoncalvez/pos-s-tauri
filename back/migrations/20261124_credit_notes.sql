-- Migración para Notas de Crédito
CREATE TABLE IF NOT EXISTS `credit_notes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `numero` INT NOT NULL,
  `customer_id` BIGINT NOT NULL,
  `sale_id` BIGINT NOT NULL,
  `user_id` INT NOT NULL,
  `cash_session_id` BIGINT NULL,
  `fecha` DATE NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'emitida',
  `notas` TEXT NULL,
  `created_by` VARCHAR(100) NULL,
  `created_by_id` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `credit_notes_numero_unique` (`numero`),
  KEY `credit_notes_customer_id_idx` (`customer_id`),
  KEY `credit_notes_sale_id_idx` (`sale_id`),
  KEY `credit_notes_fecha_idx` (`fecha`),
  KEY `credit_notes_estado_idx` (`estado`),
  CONSTRAINT `fk_credit_notes_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_credit_notes_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_credit_notes_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `credit_note_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `credit_note_id` BIGINT NOT NULL,
  `sale_detail_id` BIGINT NULL,
  `stock_id` INT NULL,
  `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  `price` DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  `line_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `product_name` VARCHAR(255) NULL,
  `unit_name` VARCHAR(30) NULL,
  `reingresa_stock` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `credit_note_details_credit_note_id_idx` (`credit_note_id`),
  KEY `credit_note_details_stock_id_idx` (`stock_id`),
  CONSTRAINT `fk_credit_note_details_credit_note` FOREIGN KEY (`credit_note_id`) REFERENCES `credit_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `credit_note_counters` (
  `id` INT NOT NULL,
  `ultimo_numero` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `credit_note_counters` (`id`, `ultimo_numero`)
SELECT 1, COALESCE(MAX(`numero`), 0) FROM `credit_notes`;

INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('ver_notas_credito', 'Ver notas de crédito emitidas', 'Ventas'),
  ('accion_crear_nota_credito', 'Crear notas de crédito por devolución', 'Ventas'),
  ('accion_anular_nota_credito', 'Anular notas de crédito', 'Ventas')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` IN (
  'ver_notas_credito',
  'accion_crear_nota_credito',
  'accion_anular_nota_credito'
)
WHERE r.`id` IN (1, 2);
