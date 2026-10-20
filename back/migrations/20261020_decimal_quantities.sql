-- Fase 1: cantidades decimales y presentaciones virtuales.
-- Aplicar una sola vez sobre una copia de la base antes de producción.

ALTER TABLE stocks
    ADD COLUMN permite_decimales TINYINT(1) NULL DEFAULT NULL
    COMMENT 'Permite vender fracciones de la unidad base. NULL usa fallback por unidad.'
    AFTER tipo_venta;

ALTER TABLE sales_details
    ADD COLUMN presentation_id INT NULL AFTER cost;

ALTER TABLE sales_details
    ADD COLUMN presentation_name VARCHAR(255) NULL AFTER presentation_id;

ALTER TABLE sales_details
    ADD COLUMN presentation_quantity INT NULL AFTER presentation_name;

ALTER TABLE sales_details
    ADD COLUMN unit_name VARCHAR(100) NULL AFTER presentation_quantity;

ALTER TABLE sales_details
    ADD COLUMN line_total DECIMAL(12, 2) NULL AFTER unit_name;

ALTER TABLE sales_details
    ADD INDEX idx_sales_details_presentation (presentation_id);

ALTER TABLE purchases_details
    MODIFY COLUMN quantity DECIMAL(10, 3) NULL;

-- Productos que se venden fraccionados en la primera etapa:
-- 2 m³, 13 kg pesables y 7 metros lineales (caños corrugados y conductores).
UPDATE stocks
SET permite_decimales = 1
WHERE id IN (
    106, 107,
    117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
    258, 259,
    261, 262, 263, 264, 265
);

-- Excepciones que se venden por pieza/unidad y no deben aceptar fracciones.
-- Los caños rígidos quedan pendientes de definición con el usuario.
UPDATE stocks
SET permite_decimales = 0
WHERE id IN (173, 174, 178, 179, 180);
