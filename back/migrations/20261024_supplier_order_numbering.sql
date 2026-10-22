-- Numeración de pedidos a proveedor.
-- TiDB (v8.5 serverless) asigna los AUTO_INCREMENT en bloques de 30.000, por lo que el id
-- de la tabla no sirve como número de pedido (daría 30007, 60007...).
-- Se agrega un correlativo de negocio (`numero`) con un contador transaccional en
-- `supplier_order_counters`, que además permite fijar el próximo número desde la base:
--   UPDATE supplier_order_counters SET ultimo_numero = 100 WHERE id = 1;  -- el próximo será 101
-- La tabla se crea con la numeración ya sembrada por 20261023 (pedido Nº 6).

ALTER TABLE `supplier_orders`
  ADD COLUMN `numero` INT DEFAULT NULL;

UPDATE `supplier_orders`
SET `numero` = `id`
WHERE `numero` IS NULL;

ALTER TABLE `supplier_orders`
  MODIFY COLUMN `numero` INT NOT NULL;

ALTER TABLE `supplier_orders`
  ADD UNIQUE KEY `uk_supplier_orders_numero` (`numero`);

CREATE TABLE IF NOT EXISTS `supplier_order_counters` (
  `id` INT NOT NULL,
  `ultimo_numero` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `supplier_order_counters` (`id`, `ultimo_numero`)
SELECT 1, COALESCE(MAX(`numero`), 0) FROM `supplier_orders`;
