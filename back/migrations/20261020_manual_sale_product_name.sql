-- Venta manual: conservar el nombre del producto ocasional en el detalle.
ALTER TABLE sales_details
ADD COLUMN product_name VARCHAR(255) NULL AFTER unit_name;
