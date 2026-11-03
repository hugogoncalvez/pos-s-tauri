import { Op } from 'sequelize';
import db from '../database/db.js';
import {
    SupplierModel,
    SupplierQuoteModel,
    SupplierQuoteDetailModel,
    SupplierOrderModel,
    SupplierOrderDetailModel,
    StockModel,
    UnitModel
} from '../database/associations.js';
import SupplierQuoteCounterModel from '../Models/SupplierQuoteCounterModel.js';
import SupplierOrderCounterModel from '../Models/SupplierOrderCounterModel.js';
import { logAudit } from '../middleware/auditMiddleware.js';

const QUOTE_STATES = ['solicitada', 'recibida', 'convertida', 'anulada'];

class ValidationError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = statusCode;
    }
}

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normalizeQuoteState = (value = 'solicitada') => {
    const normalized = String(value).trim().toLowerCase();
    return QUOTE_STATES.includes(normalized) ? normalized : 'solicitada';
};

const unitLabelFrom = (unit) => {
    if (!unit) return null;
    const abreviatura = String(unit.abreviatura || '').trim();
    if (!abreviatura) return String(unit.name || '').trim() || null;
    if (abreviatura.toLowerCase() === 'un' || abreviatura.toLowerCase() === 'unidad') return 'Un.';
    return abreviatura;
};

const parseOptionalPrice = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0) {
        throw new ValidationError('El precio unitario debe ser un número mayor o igual a cero.');
    }
    return roundMoney(price);
};

const buildQuoteDetails = async (details, transaction = null) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new ValidationError('La cotización debe tener al menos un ítem.');
    }

    const result = [];

    for (let index = 0; index < details.length; index++) {
        const detail = details[index];
        const cantidad = Number(detail.cantidad);
        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            throw new ValidationError(`La cantidad de la línea ${index + 1} debe ser mayor a cero.`);
        }

        const detalle = String(detail.detalle || '').trim();
        if (!detalle) {
            throw new ValidationError(`Ingresá el producto de la línea ${index + 1}.`);
        }

        const stockId = detail.stock_id ? parseInt(detail.stock_id, 10) : null;
        let unitsId = detail.units_id ? parseInt(detail.units_id, 10) : null;
        let unidad = String(detail.unidad || '').trim() || null;

        if (Number.isFinite(stockId)) {
            const product = await StockModel.findByPk(stockId, { transaction });
            if (!product) {
                throw new ValidationError(`El producto de la línea ${index + 1} no existe.`);
            }
            unitsId = product.units_id || null;
            if (unitsId) {
                const unit = await UnitModel.findByPk(unitsId, { transaction });
                unidad = unitLabelFrom(unit) || unidad;
            }
        } else if (Number.isFinite(unitsId)) {
            const unit = await UnitModel.findByPk(unitsId, { transaction });
            if (!unit) {
                throw new ValidationError(`La unidad de la línea ${index + 1} no existe.`);
            }
            unidad = unitLabelFrom(unit) || unidad;
        } else {
            throw new ValidationError(`Seleccioná la unidad de la línea ${index + 1}.`);
        }

        const precioUnitario = parseOptionalPrice(detail.precio_unitario);
        const importe = precioUnitario === null ? null : roundMoney(precioUnitario * cantidad);

        result.push({
            stock_id: Number.isFinite(stockId) ? stockId : null,
            units_id: Number.isFinite(unitsId) ? unitsId : null,
            cantidad: roundMoney(cantidad),
            unidad,
            detalle,
            precio_unitario: precioUnitario,
            importe,
            orden: index + 1
        });
    }

    return result;
};

const quoteTotal = (details) => roundMoney(
    details.reduce((sum, detail) => sum + (detail.importe === null ? 0 : Number(detail.importe || 0)), 0)
);

const getQuoteById = async (quoteId, transaction = null) => {
    return SupplierQuoteModel.findByPk(quoteId, {
        transaction,
        include: [
            {
                model: SupplierModel,
                as: 'supplier',
                attributes: ['id', 'nombre', 'cuit', 'telefono'],
                required: false
            },
            {
                model: SupplierOrderModel,
                as: 'order',
                attributes: ['id', 'numero', 'estado'],
                required: false
            },
            {
                model: SupplierQuoteDetailModel,
                as: 'details',
                include: [
                    { model: StockModel, as: 'stock', attributes: ['id', 'name'], required: false },
                    { model: UnitModel, as: 'unit', attributes: ['id', 'name', 'abreviatura'], required: false }
                ],
                separate: true,
                order: [['orden', 'ASC']]
            }
        ]
    });
};

const getQuoteNumber = (quote) => `COT-${String(quote?.numero ?? quote?.id ?? 0).padStart(5, '0')}`;

export const getSupplierQuotes = async (req, res) => {
    try {
        const { page = 1, limit = 20, supplier_id, estado, startDate, endDate } = req.query;
        const where = {};

        if (supplier_id) where.supplier_id = supplier_id;
        if (estado) where.estado = normalizeQuoteState(estado);

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.fecha = { [Op.between]: [start, end] };
        } else if (startDate) {
            where.fecha = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.fecha = { [Op.lte]: end };
        }

        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows } = await SupplierQuoteModel.findAndCountAll({
            where,
            include: [{
                model: SupplierModel,
                as: 'supplier',
                attributes: ['id', 'nombre'],
                required: false
            }, {
                model: SupplierOrderModel,
                as: 'order',
                attributes: ['id', 'numero', 'estado'],
                required: false
            }],
            order: [['id', 'DESC']],
            limit: limitNumber,
            offset
        });

        res.json({
            rows,
            pagination: {
                total: count,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(count / limitNumber)
            }
        });
    } catch (error) {
        console.error('Error al obtener cotizaciones de proveedores:', error);
        res.status(500).json({ message: 'Error al obtener las cotizaciones: ' + error.message });
    }
};

export const getSupplierQuote = async (req, res) => {
    try {
        const quote = await getQuoteById(req.params.id);

        if (!quote) {
            return res.status(404).json({ message: 'Cotización no encontrada' });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error al obtener cotización de proveedor:', error);
        res.status(500).json({ message: 'Error al obtener la cotización: ' + error.message });
    }
};

export const createSupplierQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const body = req.body || {};
        const supplierId = body.supplier_id;
        const fecha = body.fecha;

        if (!supplierId) throw new ValidationError('Debe seleccionar un proveedor.');
        if (!fecha) throw new ValidationError('Debe indicar la fecha de la cotización.');

        const supplier = await SupplierModel.findByPk(supplierId, { transaction });
        if (!supplier) throw new ValidationError('Proveedor no encontrado', 404);
        if (!supplier.activo) throw new ValidationError('No se pueden crear cotizaciones para un proveedor inactivo.');

        const details = await buildQuoteDetails(body.details, transaction);
        if (details.some(detail => detail.precio_unitario !== null)) {
            throw new ValidationError('Los precios se cargan recién cuando la cotización está recibida.');
        }

        await SupplierQuoteCounterModel.findOrCreate({
            where: { id: 1 },
            defaults: { ultimo_numero: 0 },
            transaction
        });
        const counter = await SupplierQuoteCounterModel.findByPk(1, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!counter) throw new ValidationError('No se pudo obtener el correlativo de cotizaciones.');

        const numero = Number(counter.ultimo_numero || 0) + 1;
        const quote = await SupplierQuoteModel.create({
            numero,
            fecha,
            supplier_id: supplier.id,
            rubro: String(body.rubro || '').trim() || null,
            tipo: String(body.tipo || 'MATERIALES').trim().toUpperCase(),
            estado: 'solicitada',
            total: quoteTotal(details),
            notas: String(body.notas || '').trim() || null,
            created_by: req.usuario?.nombre || req.usuario?.username || 'Sistema',
            created_by_id: req.usuario?.id || null
        }, { transaction });

        await SupplierQuoteDetailModel.bulkCreate(
            details.map(detail => ({ ...detail, supplier_quote_id: quote.id })),
            { transaction }
        );
        await counter.update({ ultimo_numero: numero }, { transaction });

        await logAudit({
            user_id: req.usuario.id,
            action: 'CREAR_COTIZACION_PROVEEDOR',
            entity_type: 'supplier_quote',
            entity_id: quote.id,
            new_values: { supplier_id: supplier.id, items: details.length },
            details: `Se creó la cotización ${getQuoteNumber(quote)} para el proveedor ${supplier.nombre} con ${details.length} ítems.`
        }, req, transaction);

        await transaction.commit();
        res.status(201).json(await getQuoteById(quote.id));
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al crear cotización de proveedor:', error);
        res.status(error.statusCode || 500).json({ message: 'Error al crear la cotización: ' + error.message });
    }
};

export const updateSupplierQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await SupplierQuoteModel.findByPk(req.params.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!quote) throw new ValidationError('Cotización no encontrada', 404);
        if (quote.estado === 'convertida' || quote.estado === 'anulada') {
            throw new ValidationError('No se puede editar una cotización convertida o anulada.');
        }

        const body = req.body || {};
        const supplierId = body.supplier_id || quote.supplier_id;
        const supplier = await SupplierModel.findByPk(supplierId, { transaction });
        if (!supplier) throw new ValidationError('Proveedor no encontrado', 404);
        if (!supplier.activo) throw new ValidationError('No se puede usar un proveedor inactivo.');

        const details = await buildQuoteDetails(body.details, transaction);
        if (quote.estado === 'solicitada' && details.some(detail => detail.precio_unitario !== null)) {
            throw new ValidationError('Marcá la cotización como recibida antes de cargar precios.');
        }

        await quote.update({
            fecha: body.fecha || quote.fecha,
            supplier_id: supplier.id,
            rubro: body.rubro !== undefined ? (String(body.rubro || '').trim() || null) : quote.rubro,
            tipo: body.tipo ? String(body.tipo).trim().toUpperCase() : quote.tipo,
            notas: body.notas !== undefined ? (String(body.notas || '').trim() || null) : quote.notas,
            total: quoteTotal(details)
        }, { transaction });

        await SupplierQuoteDetailModel.destroy({
            where: { supplier_quote_id: quote.id },
            transaction
        });
        await SupplierQuoteDetailModel.bulkCreate(
            details.map(detail => ({ ...detail, supplier_quote_id: quote.id })),
            { transaction }
        );

        await logAudit({
            user_id: req.usuario.id,
            action: 'EDITAR_COTIZACION_PROVEEDOR',
            entity_type: 'supplier_quote',
            entity_id: quote.id,
            new_values: { items: details.length },
            details: `Se editó la cotización ${getQuoteNumber(quote)} del proveedor ${supplier.nombre}.`
        }, req, transaction);

        await transaction.commit();
        res.json(await getQuoteById(quote.id));
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al actualizar cotización de proveedor:', error);
        res.status(error.statusCode || 500).json({ message: 'Error al actualizar la cotización: ' + error.message });
    }
};

export const receiveSupplierQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await SupplierQuoteModel.findByPk(req.params.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!quote) throw new ValidationError('Cotización no encontrada', 404);
        if (quote.estado === 'anulada' || quote.estado === 'convertida') {
            throw new ValidationError('No se puede recibir una cotización anulada o convertida.');
        }

        const hadPrices = await SupplierQuoteDetailModel.count({
            where: { supplier_quote_id: quote.id, precio_unitario: { [Op.ne]: null } },
            transaction
        });

        await quote.update({ estado: 'recibida' }, { transaction });
        await logAudit({
            user_id: req.usuario.id,
            action: 'RECIBIR_COTIZACION_PROVEEDOR',
            entity_type: 'supplier_quote',
            entity_id: quote.id,
            new_values: { estado: 'recibida', lineas_con_precio: hadPrices },
            details: `Se recibió la cotización ${getQuoteNumber(quote)} con ${hadPrices} línea(s) con precio.`
        }, req, transaction);

        await transaction.commit();
        res.json(await getQuoteById(quote.id));
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al recibir cotización de proveedor:', error);
        res.status(error.statusCode || 500).json({ message: 'Error al recibir la cotización: ' + error.message });
    }
};

export const convertSupplierQuoteToOrder = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await SupplierQuoteModel.findByPk(req.params.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!quote) throw new ValidationError('Cotización no encontrada', 404);
        if (quote.estado !== 'recibida') {
            throw new ValidationError('Solo se pueden convertir cotizaciones recibidas.');
        }
        if (quote.supplier_order_id) {
            throw new ValidationError('La cotización ya fue convertida en pedido.');
        }

        const supplier = await SupplierModel.findByPk(quote.supplier_id, { transaction });
        if (!supplier) throw new ValidationError('Proveedor no encontrado', 404);
        if (!supplier.activo) throw new ValidationError('No se puede generar un pedido para un proveedor inactivo.');

        const details = await SupplierQuoteDetailModel.findAll({
            where: { supplier_quote_id: quote.id },
            order: [['orden', 'ASC']],
            transaction
        });

        const requestedIds = Array.isArray(req.body?.detail_ids)
            ? new Set(req.body.detail_ids.map(value => String(value)))
            : null;
        const includeUnquoted = req.body?.include_unquoted === true;

        const selectedDetails = details.filter(detail => {
            if (requestedIds) return requestedIds.has(String(detail.id));
            return includeUnquoted || detail.precio_unitario !== null;
        });

        if (!selectedDetails.length) {
            throw new ValidationError('No hay ítems cotizados para convertir. Seleccioná al menos una línea.');
        }

        await SupplierOrderCounterModel.findOrCreate({
            where: { id: 1 },
            defaults: { ultimo_numero: 0 },
            transaction
        });
        const orderCounter = await SupplierOrderCounterModel.findByPk(1, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        const orderNumber = Number(orderCounter.ultimo_numero || 0) + 1;

        const today = new Date();
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

        const order = await SupplierOrderModel.create({
            numero: orderNumber,
            fecha: localDate,
            supplier_id: supplier.id,
            rubro: quote.rubro,
            tipo: quote.tipo || 'MATERIALES',
            estado: 'emitido',
            total: 0,
            notas: [quote.notas, `Origen: cotización ${getQuoteNumber(quote)}.`].filter(Boolean).join('\n'),
            created_by: req.usuario?.nombre || req.usuario?.username || 'Sistema',
            created_by_id: req.usuario?.id || null
        }, { transaction });

        await SupplierOrderDetailModel.bulkCreate(selectedDetails.map((detail, index) => ({
            supplier_order_id: order.id,
            stock_id: detail.stock_id,
            units_id: detail.units_id,
            cantidad: detail.cantidad,
            unidad: detail.unidad,
            detalle: detail.detalle,
            precio_unitario: 0,
            importe: 0,
            orden: index + 1
        })), { transaction });

        await orderCounter.update({ ultimo_numero: orderNumber }, { transaction });
        await quote.update({
            estado: 'convertida',
            supplier_order_id: order.id
        }, { transaction });

        await logAudit({
            user_id: req.usuario.id,
            action: 'CONVERTIR_COTIZACION_PROVEEDOR',
            entity_type: 'supplier_quote',
            entity_id: quote.id,
            new_values: {
                supplier_order_id: order.id,
                items: selectedDetails.length
            },
            details: `Se convirtió la cotización ${getQuoteNumber(quote)} en el pedido ${String(orderNumber).padStart(5, '0')} con ${selectedDetails.length} ítems.`
        }, req, transaction);

        await transaction.commit();
        res.status(201).json({
            message: 'Cotización convertida en pedido correctamente.',
            order: { id: order.id, numero: order.numero, estado: order.estado },
            quote: { id: quote.id, numero: quote.numero, estado: 'convertida', supplier_order_id: order.id }
        });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al convertir cotización en pedido:', error);
        res.status(error.statusCode || 500).json({ message: 'Error al convertir la cotización: ' + error.message });
    }
};

export const voidSupplierQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await SupplierQuoteModel.findByPk(req.params.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!quote) throw new ValidationError('Cotización no encontrada', 404);
        if (quote.estado === 'anulada') {
            throw new ValidationError('La cotización ya está anulada.');
        }
        if (quote.estado === 'convertida') {
            throw new ValidationError('No se puede anular una cotización ya convertida.');
        }

        await quote.update({ estado: 'anulada' }, { transaction });
        await logAudit({
            user_id: req.usuario.id,
            action: 'ANULAR_COTIZACION_PROVEEDOR',
            entity_type: 'supplier_quote',
            entity_id: quote.id,
            old_values: { estado: quote.previous('estado') },
            new_values: { estado: 'anulada' },
            details: `Se anuló la cotización ${getQuoteNumber(quote)}.`
        }, req, transaction);

        await transaction.commit();
        res.json({ success: true, message: 'Cotización anulada correctamente.', data: quote });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al anular cotización de proveedor:', error);
        res.status(error.statusCode || 500).json({ message: 'Error al anular la cotización: ' + error.message });
    }
};
