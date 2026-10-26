-- Imputación de pagos a proveedores: permite que un pago cubra deuda inicial
-- y/o varias compras sin duplicar el pago ni el movimiento de caja.
-- Aplicar una sola vez sobre una copia/backup de la base.

CREATE TABLE IF NOT EXISTS `supplier_payment_allocations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `supplier_payment_id` BIGINT NOT NULL,
  `purchase_id` INT DEFAULT NULL,
  `target_type` ENUM('purchase', 'initial_debt') NOT NULL DEFAULT 'purchase',
  `amount` DECIMAL(12,2) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_payment_allocations_payment_purchase` (`supplier_payment_id`, `purchase_id`),
  KEY `idx_supplier_payment_allocations_purchase` (`purchase_id`),
  KEY `idx_supplier_payment_allocations_target` (`target_type`),
  CONSTRAINT `fk_supplier_payment_allocations_payment` FOREIGN KEY (`supplier_payment_id`) REFERENCES `supplier_payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_supplier_payment_allocations_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Los pagos históricos estaban vinculados directamente a una compra.
-- Se conserva esa imputación; los pagos genéricos previos no se reimputan.
INSERT INTO `supplier_payment_allocations`
  (`supplier_payment_id`, `purchase_id`, `target_type`, `amount`, `createdAt`, `updatedAt`)
SELECT
  sp.`id`,
  sp.`purchase_id`,
  'purchase',
  sp.`amount`,
  sp.`createdAt`,
  sp.`updatedAt`
FROM `supplier_payments` sp
WHERE sp.`purchase_id` IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `supplier_payment_allocations` spa
    WHERE spa.`supplier_payment_id` = sp.`id`
  );
