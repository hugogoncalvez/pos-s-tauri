-- Actualizar las imágenes de las tarjetas del landing reemplazadas por PNG.
--
-- Las bases existentes (local y producción) ya se corrigieron manualmente;
-- esta migración deja el cambio reproducible y es idempotente.
-- Ejecutar junto con el deploy del frontend que incluye los PNG.

UPDATE `landing_elementos`
SET `imagen` = 'presupuesto.png', `updatedAt` = CURRENT_TIMESTAMP
WHERE `navegar` = '/presupuestos'
  AND `imagen` IN ('presupuestos.svg', 'presupuesto.svg', 'presupuestos.png');

UPDATE `landing_elementos`
SET `imagen` = 'proveedores.png', `updatedAt` = CURRENT_TIMESTAMP
WHERE `navegar` = '/proveedores'
  AND `imagen` = 'proveedores.svg';
