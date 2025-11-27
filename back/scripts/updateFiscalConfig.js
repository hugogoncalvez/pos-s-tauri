// back/scripts/updateFiscalConfig.js
import dotenv from 'dotenv';
import path from 'path';
import { exit } from 'process';

// Cargar las variables de entorno ANTES que cualquier otra cosa
dotenv.config({ path: path.resolve(process.cwd(), 'back', '.env') });

// --- CONFIGURACIÓN ---
// POR FAVOR, REEMPLAZA ESTE VALOR CON EL ID DE TU PUNTO DE VENTA
const POINT_OF_SALE_ID_TO_CONFIGURE = 3;
// ---------------------

const CUIT = '20226659375';
const CERT_PATH = 'back/services/fiscal/test_credentials/nueva.crt';
const KEY_PATH = 'back/services/fiscal/test_credentials/test.key';
const ENVIRONMENT = 'HOMOLOGACION';

async function updateFiscalConfig() {
  // Importar los módulos de la base de datos DESPUÉS de cargar el .env
  const { default: db } = await import('../database/db.js');
  const { default: FiscalConfigModel } = await import('../Models/FiscalConfigModel.js');
  const { default: PointOfSaleModel } = await import('../Models/PointOfSaleModel.js');

  console.log('--- Iniciando script de actualización de configuración fiscal ---');

  try {
    // 1. Verificar la conexión a la base de datos
    await db.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // 2. Verificar que el punto de venta exista
    const pos = await PointOfSaleModel.findByPk(POINT_OF_SALE_ID_TO_CONFIGURE);
    if (!pos) {
      console.error(`Error: No se encontró el Punto de Venta con ID: ${POINT_OF_SALE_ID_TO_CONFIGURE}.`);
      exit(1);
    }
    console.log(`Punto de Venta encontrado: ${pos.name} (ID: ${pos.id})`);

    // 3. Buscar o crear la configuración fiscal para ese punto de venta
    let [fiscalConfig, created] = await FiscalConfigModel.findOrCreate({
      where: { pointOfSaleId: POINT_OF_SALE_ID_TO_CONFIGURE },
      defaults: {
        pointOfSaleId: POINT_OF_SALE_ID_TO_CONFIGURE,
        cuit: CUIT,
        afip_certificado_path: CERT_PATH,
        afip_clave_path: KEY_PATH,
        afip_environment: ENVIRONMENT,
      },
    });

    if (created) {
      console.log('Se ha creado una nueva configuración fiscal con los siguientes datos:');
      console.log(JSON.stringify(fiscalConfig.toJSON(), null, 2));
    } else {
      console.log('Configuración fiscal existente encontrada. Actualizando...');
      // 4. Si ya existía, actualizarla
      await fiscalConfig.update({
        cuit: CUIT,
        afip_certificado_path: CERT_PATH,
        afip_clave_path: KEY_PATH,
        afip_environment: ENVIRONMENT,
      });
      console.log('¡Configuración fiscal actualizada con éxito!');
      console.log('Nuevos datos:');
      console.log(JSON.stringify(fiscalConfig.toJSON(), null, 2));
    }

    console.log('\n--- Script finalizado con éxito ---');
    exit(0);
  } catch (error) {
    console.error('\n--- Ha ocurrido un error durante la ejecución del script ---');
    console.error(error);
    exit(1);
  }
}

updateFiscalConfig();
