import FiscalConfigModel from '../Models/FiscalConfigModel.js';
import PointOfSaleModel from '../Models/PointOfSaleModel.js';
import SaleModel from '../Models/SalesModel.js'; // Import SaleModel
import CustomersModel from '../Models/CustomersModel.js'; // Import CustomersModel
import FiscalInvoicesModel from '../Models/FiscalInvoicesModel.js'; // Import FiscalInvoicesModel
import FiscalLogModel from '../Models/FiscalLogModel.js'; // Import FiscalLogModel
import PendingFiscalJobsModel from '../Models/PendingFiscalJobsModel.js'; // Import PendingFiscalJobsModel
import FiscalManager from '../services/fiscal/FiscalManager.js'; // Import FiscalManager
import FiscalError from '../services/fiscal/FiscalError.js'; // Import FiscalError for consistent error handling
import { AFIP_VOUCHER_TYPES } from '../constants/afipVoucherTypes.js'; // Import AFIP voucher types

// --- FiscalConfig Controllers ---

/**
 * @summary Obtiene la configuración fiscal global.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getFiscalConfig = async (req, res) => {
    try {
        // There should only be one config entry
        const config = await FiscalConfigModel.findOne();
        if (!config) {
            // If no config is found, return a default/empty object.
            // This allows the frontend to render the form for the first time.
            return res.status(200).json({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la configuración fiscal: ' + error.message });
    }
};

/**
 * @summary Crea la configuración fiscal global.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createFiscalConfig = async (req, res) => {
    try {
        // Prevent creating more than one config
        const existingConfig = await FiscalConfigModel.count();
        if (existingConfig > 0) {
            return res.status(400).json({ message: 'Ya existe una configuración fiscal. Utilice la ruta PUT para actualizar.' });
        }
        const newConfig = await FiscalConfigModel.create(req.body);
        res.status(201).json(newConfig);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la configuración fiscal: ' + error.message });
    }
};

/**
 * @summary Actualiza o crea la configuración fiscal global (upsert).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updateFiscalConfig = async (req, res) => {
    try {
        // Upsert logic: find if config exists, if so update, otherwise create.
        const [config, created] = await FiscalConfigModel.findOrCreate({
            where: { id: 1 }, // Assuming a single global config with id 1
            defaults: req.body
        });

        if (!created) {
            // If it was found, update it with the request body
            const [updated] = await FiscalConfigModel.update(req.body, {
                where: { id: 1 }
            });

            if (updated) {
                const updatedConfig = await FiscalConfigModel.findByPk(1);
                return res.json(updatedConfig);
            }
        }

        // If it was created, return the created config
        return res.status(201).json(config);

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la configuración fiscal: ' + error.message });
    }
};


// --- PointOfSale Controllers ---

/**
 * @summary Obtiene todos los puntos de venta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getPointsOfSale = async (req, res) => {
    try {
        const pointsOfSale = await PointOfSaleModel.findAll();
        res.json(pointsOfSale);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los puntos de venta: ' + error.message });
    }
};

/**
 * @summary Obtiene un punto de venta por ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getPointOfSaleById = async (req, res) => {
    try {
        const pointOfSale = await PointOfSaleModel.findByPk(req.params.id);
        if (pointOfSale) {
            res.json(pointOfSale);
        } else {
            res.status(404).json({ message: 'Punto de venta no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el punto de venta: ' + error.message });
    }
};

/**
 * @summary Crea un nuevo punto de venta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createPointOfSale = async (req, res) => {
    try {
        const newPointOfSale = await PointOfSaleModel.create(req.body);
        res.status(201).json(newPointOfSale);
    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            const isIdError = error.errors.some(e => e.path === 'PRIMARY');
            if (isIdError) {
                return res.status(400).json({ message: `El número de punto de venta '${req.body.id}' ya existe.` });
            }
            return res.status(400).json({ message: `Error de validación: ${error.errors.map(e => e.message).join(', ')}` });
        }
        res.status(500).json({ message: 'Error al crear el punto de venta: ' + error.message });
    }
};

/**
 * @summary Actualiza un punto de venta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const updatePointOfSale = async (req, res) => {
    try {
        const [updated] = await PointOfSaleModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedPointOfSale = await PointOfSaleModel.findByPk(req.params.id);
            res.json(updatedPointOfSale);
        } else {
            res.status(404).json({ message: 'Punto de venta no encontrado para actualizar.' });
        }
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const isIdError = error.errors.some(e => e.path === 'id');
            if (isIdError) {
                return res.status(400).json({ message: `El número de punto de venta '${req.body.id}' ya está en uso.` });
            }
            return res.status(400).json({ message: `Error de validación: ${error.errors.map(e => e.message).join(', ')}` });
        }
        res.status(500).json({ message: 'Error al actualizar el punto de venta: ' + error.message });
    }
};

/**
 * @summary Elimina un punto de venta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deletePointOfSale = async (req, res) => {
    try {
        const deleted = await PointOfSaleModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send(); // No content
        } else {
            res.status(404).json({ message: 'Punto de venta no encontrado para eliminar.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el punto de venta: ' + error.message });
    }
};

/**
 * @summary Genera un comprobante fiscal para una venta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const generateFiscalInvoice = async (req, res) => {
    const { saleId } = req.params;
    const { pointOfSaleId } = req.body;

    let sale;
    let pointOfSale;
    let voucherData;

    try {
        sale = await SaleModel.findByPk(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        pointOfSale = await PointOfSaleModel.findByPk(pointOfSaleId);
        if (!pointOfSale) {
            return res.status(404).json({ message: 'Punto de venta no encontrado.' });
        }

        const customer = await CustomersModel.findByPk(sale.customer_id);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente no encontrado para la venta.' });
        }

        let voucherType = AFIP_VOUCHER_TYPES.FACTURA_A;
        if (customer.id === 1) {
            voucherType = AFIP_VOUCHER_TYPES.FACTURA_B;
        }

        const fiscalManager = new FiscalManager(pointOfSale);

        voucherData = {
            totalAmount: sale.total_neto,
            customerDocType: '99',
            customerDocNumber: '0',
            pointOfSaleId: pointOfSale.id,
            voucherType: voucherType,
        };

        const fiscalResponse = await fiscalManager.generateFiscalVoucher(voucherData);

        await FiscalLogModel.create({
            level: 'INFO',
            source: pointOfSale.emission_type === 'FACTURA_ELECTRONICA' ? 'AFIP' : 'PRINTER',
            message: `Comprobante fiscal generado exitosamente para la venta ${sale.id}.`,
            reference_id: sale.id,
            metadata: {
                ...fiscalResponse,
                user_id: req.user.id,
                pos_mode: pointOfSale.mode
            },
        });

        const fiscalInvoice = await FiscalInvoicesModel.create({
            sale_id: sale.id,
            point_of_sale_id: pointOfSale.id,
            emission_method: pointOfSale.emission_type,
            invoice_type: voucherData.voucherType,
            invoice_number: fiscalResponse.CbteDesde || fiscalResponse.ticketNumber,
            cae: fiscalResponse.CAE || null,
            cae_due_date: fiscalResponse.CAEFchVto ? new Date(fiscalResponse.CAEFchVto.slice(0, 4), fiscalResponse.CAEFchVto.slice(4, 6) - 1, fiscalResponse.CAEFchVto.slice(6, 8)) : null,
            afip_response_data: pointOfSale.emission_type === 'FACTURA_ELECTRONICA' ? fiscalResponse : null,
            fiscal_printer_data: pointOfSale.emission_type === 'CONTROLADOR_FISCAL' ? fiscalResponse : null,
            status: 'EMITIDO',
        });

        res.status(201).json(fiscalInvoice);

    } catch (error) {
        const isRecoverable = error instanceof FiscalError &&
            error.code !== 'INVALID_POS_DATA' &&
            error.code !== 'UNSUPPORTED_EMISSION_TYPE';

        if (isRecoverable) {
            await PendingFiscalJobsModel.create({
                sale_id: sale.id,
                point_of_sale_id: pointOfSale.id,
                job_data: { saleId, pointOfSaleId, voucherData },
                last_error: error.message,
                status: 'PENDING',
            });
            await FiscalLogModel.create({
                level: 'WARN',
                source: 'SYSTEM',
                message: `Error recuperable al generar comprobante fiscal para la venta ${saleId}. Trabajo encolado.`,
                reference_id: saleId,
                metadata: {
                    pointOfSaleId,
                    user_id: req.user.id,
                    pos_mode: pointOfSale.mode,
                    error: error.message,
                    stack: error.stack,
                    ...(error instanceof FiscalError && { fiscalErrorCode: error.code, fiscalErrorSource: error.source, fiscalErrorMetadata: error.metadata })
                },
            });
            return res.status(202).json({ message: 'Error temporal al generar el comprobante. Se intentará nuevamente en segundo plano.', jobStatus: 'PENDING' });
        } else {
            await FiscalLogModel.create({
                level: 'ERROR',
                source: 'SYSTEM',
                message: `Error al generar comprobante fiscal para la venta ${saleId}: ${error.message}`,
                reference_id: saleId,
                metadata: {
                    pointOfSaleId,
                    user_id: req.user.id,
                    pos_mode: pointOfSale ? pointOfSale.mode : 'N/A', // Safe access
                    error: error.message,
                    stack: error.stack,
                    ...(error instanceof FiscalError && { fiscalErrorCode: error.code, fiscalErrorSource: error.source, fiscalErrorMetadata: error.metadata })
                },
            });
            if (error instanceof FiscalError) {
                return res.status(400).json({ message: error.message, code: error.code, source: error.source, metadata: error.metadata });
            }
            res.status(500).json({ message: 'Error al generar el comprobante fiscal: ' + error.message });
        }
    }
};
