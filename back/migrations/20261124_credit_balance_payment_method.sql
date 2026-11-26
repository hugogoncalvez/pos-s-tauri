-- Método de pago para aplicar saldo a favor de clientes
SET @dbname = DATABASE();
SET @tablename = "payments";
SET @columnname = "is_credit_balance";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TINYINT(1) NOT NULL DEFAULT 0")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

INSERT INTO `payments` (`method`, `description`, `active`, `surcharge_active`, `surcharge_percentage`, `is_credit_balance`, `createdAt`, `updatedAt`)
SELECT 'Saldo a Favor', 'Aplicación de saldo a favor del cliente', 1, 0, 0.00, 1, NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `payments` WHERE `is_credit_balance` = 1 OR LOWER(`method`) = 'saldo a favor'
);

UPDATE `payments`
SET `is_credit_balance` = 1, `surcharge_active` = 0, `surcharge_percentage` = 0.00
WHERE LOWER(`method`) = 'saldo a favor';
