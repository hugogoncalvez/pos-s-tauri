-- Módulo Proveedores: maestro, cuenta corriente, pagos y condición de compra.
-- Aplicar una sola vez sobre una copia/backup de la base.

ALTER TABLE `suppliers`
  ADD COLUMN `email` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `direccion` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `contacto` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `condiciones_pago` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `notas` TEXT DEFAULT NULL,
  ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `initial_debt` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `initial_debt_notes` TEXT DEFAULT NULL,
  ADD COLUMN `initial_debt_date` DATE DEFAULT NULL,
  ADD COLUMN `updated_by` INT DEFAULT NULL;

UPDATE `suppliers` SET `nombre` = TRIM(`nombre`) WHERE `nombre` IS NOT NULL;
UPDATE `suppliers` SET `nombre` = CONCAT('Proveedor sin nombre ', `id`) WHERE `nombre` IS NULL OR `nombre` = '';
UPDATE `suppliers` SET `cuit` = NULLIF(TRIM(`cuit`), '');

CREATE TEMPORARY TABLE `tmp_supplier_name_dupes` (`id` INT NOT NULL PRIMARY KEY);
INSERT INTO `tmp_supplier_name_dupes` (`id`)
SELECT s.`id`
FROM `suppliers` s
JOIN (
  SELECT LOWER(`nombre`) AS `nombre_key`, MIN(`id`) AS `keep_id`
  FROM `suppliers`
  GROUP BY LOWER(`nombre`)
) d ON LOWER(s.`nombre`) = d.`nombre_key` AND s.`id` <> d.`keep_id`;

UPDATE `suppliers` s
JOIN `tmp_supplier_name_dupes` d ON d.`id` = s.`id`
SET s.`nombre` = CONCAT(s.`nombre`, ' (', s.`id`, ')');

DROP TEMPORARY TABLE `tmp_supplier_name_dupes`;

CREATE TEMPORARY TABLE `tmp_supplier_cuit_dupes` (`id` INT NOT NULL PRIMARY KEY);
INSERT INTO `tmp_supplier_cuit_dupes` (`id`)
SELECT s.`id`
FROM `suppliers` s
JOIN (
  SELECT `cuit`, MIN(`id`) AS `keep_id`
  FROM `suppliers`
  WHERE `cuit` IS NOT NULL
  GROUP BY `cuit`
) d ON s.`cuit` = d.`cuit` AND s.`id` <> d.`keep_id`;

UPDATE `suppliers` s
JOIN `tmp_supplier_cuit_dupes` d ON d.`id` = s.`id`
SET s.`cuit` = NULL;

DROP TEMPORARY TABLE `tmp_supplier_cuit_dupes`;

ALTER TABLE `suppliers`
  MODIFY COLUMN `nombre` VARCHAR(255) NOT NULL;

ALTER TABLE `suppliers`
  ADD UNIQUE KEY `uk_suppliers_nombre` (`nombre`),
  ADD UNIQUE KEY `uk_suppliers_cuit` (`cuit`),
  ADD KEY `idx_suppliers_activo` (`activo`),
  ADD KEY `idx_suppliers_updated_by` (`updated_by`),
  ADD CONSTRAINT `fk_suppliers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `purchases`
  ADD COLUMN `supplier_id` INT DEFAULT NULL,
  ADD COLUMN `supplier_name_snapshot` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `payment_condition` VARCHAR(20) NOT NULL DEFAULT 'cuenta corriente',
  ADD COLUMN `updated_by` INT DEFAULT NULL;

ALTER TABLE `purchases`
  ADD KEY `idx_purchases_supplier_id` (`supplier_id`),
  ADD KEY `idx_purchases_payment_condition` (`payment_condition`),
  ADD KEY `idx_purchases_updated_by` (`updated_by`);

ALTER TABLE `purchases`
  ADD CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_purchases_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `supplier_payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_id` INT NOT NULL,
  `purchase_id` INT DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'efectivo',
  `notes` TEXT DEFAULT NULL,
  `created_by` VARCHAR(100) DEFAULT NULL,
  `created_by_id` INT DEFAULT NULL,
  `cash_session_id` BIGINT DEFAULT NULL,
  `cash_movement_id` BIGINT DEFAULT NULL,
  `voided_at` DATETIME DEFAULT NULL,
  `voided_by` VARCHAR(100) DEFAULT NULL,
  `voided_by_id` INT DEFAULT NULL,
  `void_reason` TEXT DEFAULT NULL,
  `void_cash_movement_id` BIGINT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_payments_supplier` (`supplier_id`),
  KEY `idx_supplier_payments_purchase` (`purchase_id`),
  KEY `idx_supplier_payments_date` (`payment_date`),
  KEY `idx_supplier_payments_cash_session` (`cash_session_id`),
  KEY `idx_supplier_payments_voided` (`voided_at`),
  CONSTRAINT `fk_supplier_payments_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_cash_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_cash_movement` FOREIGN KEY (`cash_movement_id`) REFERENCES `cash_session_movements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_void_cash_movement` FOREIGN KEY (`void_cash_movement_id`) REFERENCES `cash_session_movements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payments_voided_by` FOREIGN KEY (`voided_by_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_condition_changes` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `purchase_id` INT NOT NULL,
  `from_condition` VARCHAR(20) DEFAULT NULL,
  `to_condition` VARCHAR(20) NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `changed_by` VARCHAR(100) DEFAULT NULL,
  `changed_by_id` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_purchase_condition_changes_purchase` (`purchase_id`),
  CONSTRAINT `fk_purchase_condition_changes_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_purchase_condition_changes_user` FOREIGN KEY (`changed_by_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE `purchases` p
JOIN `suppliers` s ON LOWER(TRIM(p.`supplier`)) = LOWER(TRIM(s.`nombre`))
SET p.`supplier_id` = s.`id`,
    p.`supplier_name_snapshot` = COALESCE(NULLIF(p.`supplier_name_snapshot`, ''), s.`nombre`),
    p.`payment_condition` = 'contado'
WHERE p.`supplier_id` IS NULL;

UPDATE `purchases`
SET `supplier_name_snapshot` = COALESCE(NULLIF(`supplier_name_snapshot`, ''), NULLIF(`supplier`, ''), 'Proveedor no identificado')
WHERE `supplier_name_snapshot` IS NULL OR `supplier_name_snapshot` = '';

INSERT INTO `supplier_payments`
  (`supplier_id`, `purchase_id`, `amount`, `payment_date`, `payment_method`, `notes`, `created_by`, `createdAt`, `updatedAt`)
SELECT
  p.`supplier_id`, p.`id`, p.`cost`, COALESCE(p.`createdAt`, NOW()), 'otro',
  'Pago histórico migrado desde compras existentes', 'migracion', NOW(), NOW()
FROM `purchases` p
WHERE p.`supplier_id` IS NOT NULL
  AND p.`cost` > 0
  AND NOT EXISTS (
    SELECT 1 FROM `supplier_payments` sp WHERE sp.`purchase_id` = p.`id`
  );

INSERT INTO `permisos` (`nombre`, `descripcion`, `modulo`)
VALUES
  ('ver_vista_proveedores', 'Acceder al módulo de proveedores', 'Proveedores'),
  ('listar_proveedores', 'Listar proveedores', 'Proveedores'),
  ('accion_crear_proveedor', 'Crear proveedores', 'Proveedores'),
  ('accion_editar_proveedor', 'Editar proveedores', 'Proveedores'),
  ('accion_desactivar_proveedor', 'Activar o desactivar proveedores', 'Proveedores'),
  ('ver_cuenta_proveedor', 'Ver cuenta corriente de proveedores', 'Proveedores'),
  ('accion_registrar_pago_proveedor', 'Registrar pagos a proveedores', 'Proveedores'),
  ('accion_anular_pago_proveedor', 'Anular pagos a proveedores', 'Proveedores'),
  ('accion_corregir_condicion_compra', 'Corregir la condición de una compra', 'Proveedores'),
  ('ver_informes_proveedor', 'Ver reportes de proveedores', 'Proveedores')
ON DUPLICATE KEY UPDATE
  `descripcion` = VALUES(`descripcion`),
  `modulo` = VALUES(`modulo`),
  `updatedAt` = CURRENT_TIMESTAMP;

INSERT IGNORE INTO `roles_permisos` (`rol_id`, `permiso_id`)
SELECT r.`id`, p.`id`
FROM `roles` r
JOIN `permisos` p ON p.`nombre` IN (
  'ver_vista_proveedores',
  'listar_proveedores',
  'accion_crear_proveedor',
  'accion_editar_proveedor',
  'accion_desactivar_proveedor',
  'ver_cuenta_proveedor',
  'accion_registrar_pago_proveedor',
  'accion_anular_pago_proveedor',
  'accion_corregir_condicion_compra',
  'ver_informes_proveedor'
)
WHERE r.`id` IN (1, 2);

INSERT INTO `landing_elementos` (`nombre`, `orden`, `descripcion`, `imagen`, `navegar`, `createdAt`, `updatedAt`)
SELECT 'Proveedores', 7, 'Gestionar proveedores, cuenta corriente y pagos', 'proveedores.svg', '/proveedores', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `landing_elementos` WHERE `navegar` = '/proveedores'
);

INSERT INTO `landing_permisos` (`landing_elemento_id`, `permiso_id`)
SELECT le.`id`, p.`id`
FROM `landing_elementos` le
JOIN `permisos` p ON p.`nombre` = 'ver_vista_proveedores'
WHERE le.`navegar` = '/proveedores'
ON DUPLICATE KEY UPDATE `updatedAt` = CURRENT_TIMESTAMP;
