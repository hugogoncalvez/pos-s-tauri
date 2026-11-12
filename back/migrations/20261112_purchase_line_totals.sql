-- Guarda el total exacto de cada línea de compra para no reconstruirlo
-- desde el costo unitario, que se almacena con tres decimales.
ALTER TABLE purchases_details
    ADD COLUMN line_total DECIMAL(12, 2) NULL DEFAULT NULL AFTER cost;

UPDATE purchases_details
SET line_total = ROUND(quantity * cost, 2)
WHERE line_total IS NULL;
