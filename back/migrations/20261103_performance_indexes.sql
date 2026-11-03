-- Índices de rendimiento para caja, Dashboard e informes.
-- Ejecutar en horario de baja actividad y validar antes/después con EXPLAIN.
-- TiDB: crear sobre una copia primero si la tabla es grande.

CREATE INDEX idx_sales_created_at ON sales (createdAt);
CREATE INDEX idx_sales_cash_session_created ON sales (cash_session_id, createdAt);
CREATE INDEX idx_sales_details_sale_stock ON sales_details (sales_Id, stock_id);
