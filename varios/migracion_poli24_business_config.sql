-- Migración: adaptación a Argentina (poli24)
-- Renombra campos fiscales brasileños a argentinos en BusinessConfigs
-- Ejecutar contra la base de datos del sistema antes de levantar el backend nuevo.

ALTER TABLE `BusinessConfigs`
  CHANGE COLUMN `cnpj` `cuit` VARCHAR(255) NULL,
  CHANGE COLUMN `ie` `iibb` VARCHAR(255) NULL,
  ADD COLUMN `taxCondition` VARCHAR(100) NULL AFTER `iibb`;
