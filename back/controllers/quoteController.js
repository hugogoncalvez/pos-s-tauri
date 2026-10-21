import { Op } from 'sequelize';
import db from '../database/db.js';
import {
    QuoteModel,
    QuoteDetailModel,
    CustomerModel,
    UsuarioModel,
    StockModel,
    ProductPresentationsModel,
    UnitModel,
} from '../database/associations.js';
import { logAudit } from '../middleware/auditMiddleware.js';

class QuoteError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'QuoteError';
        this.statusCode = statusCode;
    }
}

const MANAGER_ROLES = new Set(['Administrador', 'Gerente']);
const QUOTE_STATUSES = new Set(['borrador', 'emitido', 'convertido', 'anulado']);
const EDITABLE_STATUSES = new Set(['borrador', 'emitido']);
const DECIMAL_UNIT_NAMES = new Set([
    'kilogramo',
    'litro',
    'metro cúbico',
    'metro cubico',
    'metro lineal',
    'metro',
]);

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const roundQuantity = (value) => Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const todayArgentina = () => {
    const parts = new Intl.DateTimeFormat('en', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
};

const addDays = (dateString, days) => {
    const date = new Date(`${dateString}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const isValidDateString = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const isManager = (req) => MANAGER_ROLES.has(req.usuario?.rol_nombre);

const canAccessQuote = (req, quote) => {
    if (!quote) return false;
    return isManager(req) || Number(quote.user_id) === Number(req.usuario?.id);
};

const stockAllowsDecimalQuantity = (stockItem) => {
    const flag = stockItem?.permite_decimales;
    if (flag !== null && flag !== undefined) {
        return flag === true || Number(flag) === 1;
    }
    const unitName = String(stockItem?.unit?.name || '').trim().toLowerCase();
    return stockItem?.tipo_venta === 'pesable' || DECIMAL_UNIT_NAMES.has(unitName);
};

const requireQuotePermission = (req, permission) => {
    const permissions = req.usuario?.permisos || [];
    if (!permissions.includes(permission)) {
        throw new QuoteError('No tienes permiso para realizar esta acción.', 403);
    }
};

const effectiveStatus = (quote) => {
    const status = quote.status;
    const validUntil = String(quote.valid_until || '').slice(0, 10);
    if (status === 'emitido' && validUntil && validUntil < todayArgentina()) {
        return 'vencido';
    }
    return status;
};

const serializeQuote = (quote) => {
    const data = quote?.toJSON ? quote.toJSON() : { ...quote };
    const details = Array.isArray(data.details)
        ? [...data.details].sort((a, b) => Number(a.id) - Number(b.id))
        : data.details;
    return {
        ...data,
        details,
        effective_status: effectiveStatus(data),
    };
};

const loadQuote = async (id, transaction = null, includeDetails = true) => {
    const include = [
        {
            model: UsuarioModel,
            as: 'user',
            attributes: ['id', 'username', 'nombre'],
            required: false,
        },
    ];
    if (includeDetails) {
        include.push({
            model: QuoteDetailModel,
            as: 'details',
            required: false,
        });
    }
    return QuoteModel.findByPk(id, {
        include,
        transaction,
    });
};

const buildCustomerSnapshot = async (body, transaction) => {
    const customerId = body.customer_id ? Number(body.customer_id) : null;
    if (customerId) {
        const customer = await CustomerModel.findByPk(customerId, { transaction });
        if (!customer) {
            throw new QuoteError('El cliente seleccionado no existe.');
        }
        return {
            customer_id: customer.id,
            customer_name: customer.name,
            customer_document: customer.dni || null,
            customer_phone: customer.phone || null,
            customer_address: customer.address || null,
            customer_email: customer.email || null,
        };
    }

    const name = String(body.customer_name || '').trim();
    if (name.length < 2) {
        throw new QuoteError('El nombre del cliente es obligatorio.');
    }
    return {
        customer_id: null,
        customer_name: name,
        customer_document: body.customer_document ? String(body.customer_document).trim() : null,
        customer_phone: body.customer_phone ? String(body.customer_phone).trim() : null,
        customer_address: body.customer_address ? String(body.customer_address).trim() : null,
        customer_email: body.customer_email ? String(body.customer_email).trim() : null,
    };
};

const normalizeDetails = async (details, transaction) => {
    if (!Array.isArray(details) || details.length === 0) {
        throw new QuoteError('El presupuesto debe tener al menos un ítem.');
    }

    const stockIds = [...new Set(details.map((item) => Number(item.stock_id)).filter(Boolean))];
    const presentationIds = [...new Set(details.map((item) => Number(item.presentation_id)).filter(Boolean))];

    const [stockItems, presentations] = await Promise.all([
        stockIds.length
            ? StockModel.findAll({
                where: { id: { [Op.in]: stockIds } },
                include: [{ model: UnitModel, as: 'unit', attributes: ['name', 'abreviatura'], required: false }],
                transaction,
            })
            : [],
        presentationIds.length
            ? ProductPresentationsModel.findAll({ where: { id: { [Op.in]: presentationIds } }, transaction })
            : [],
    ]);

    const stockMap = new Map(stockItems.map((item) => [Number(item.id), item]));
    const presentationMap = new Map(presentations.map((item) => [Number(item.id), item]));

    return details.map((item, index) => {
        const lineNumber = index + 1;
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unit_price);
        const rawStockId = item.stock_id ? Number(item.stock_id) : null;
        const rawPresentationId = item.presentation_id ? Number(item.presentation_id) : null;

        if (quantity === null || quantity <= 0) {
            throw new QuoteError(`La cantidad del ítem ${lineNumber} debe ser mayor a cero.`);
        }
        if (unitPrice === null || unitPrice < 0) {
            throw new QuoteError(`El precio del ítem ${lineNumber} es inválido.`);
        }

        let stockId = rawStockId;
        let presentation = null;
        let productName = String(item.product_name || '').trim();
        let presentationName = item.presentation_name ? String(item.presentation_name).trim() : null;
        let unitName = item.unit_name ? String(item.unit_name).trim() : null;
        let baseQuantity = quantity;

        if (rawPresentationId) {
            presentation = presentationMap.get(rawPresentationId);
            if (!presentation) {
                throw new QuoteError(`La presentación del ítem ${lineNumber} no existe.`);
            }
            if (!Number.isInteger(quantity)) {
                throw new QuoteError(`La cantidad de ${presentation.name} debe ser un número entero.`);
            }
            if (stockId && Number(presentation.stock_id) !== stockId) {
                throw new QuoteError(`La presentación del ítem ${lineNumber} no pertenece al producto seleccionado.`);
            }
            stockId = Number(presentation.stock_id);
            presentationName = presentationName || presentation.name;
            const factor = toNumber(presentation.quantity_in_base_units);
            if (factor === null || factor <= 0) {
                throw new QuoteError(`La presentación del ítem ${lineNumber} tiene una unidad inválida.`);
            }
            baseQuantity = roundQuantity(quantity * factor);
        }

        let stock = null;
        if (stockId) {
            stock = stockMap.get(stockId);
            if (!stock) {
                throw new QuoteError(`El producto del ítem ${lineNumber} no existe.`);
            }
            productName = productName || stock.name;
            unitName = unitName || stock.unit?.abreviatura || stock.unit?.name || null;
            if (!presentation && !stockAllowsDecimalQuantity(stock) && !Number.isInteger(quantity)) {
                throw new QuoteError(`${stock.name} requiere cantidad entera.`);
            }
        }

        if (!productName) {
            throw new QuoteError(`El ítem ${lineNumber} necesita una descripción.`);
        }

        const lineTotal = roundMoney(quantity * unitPrice);
        const cost = toNumber(item.cost);

        return {
            stock_id: stockId || null,
            presentation_id: presentation?.id || null,
            product_name: productName,
            presentation_name: presentationName,
            unit_name: unitName,
            quantity: roundQuantity(quantity),
            base_quantity: roundQuantity(baseQuantity),
            unit_price: roundMoney(unitPrice),
            line_total: lineTotal,
            cost: cost !== null && cost >= 0 ? roundMoney(cost) : null,
            notes: item.notes ? String(item.notes).trim() : null,
        };
    });
};

const buildQuoteValues = async (body, transaction) => {
    const quoteDate = body.quote_date || todayArgentina();
    const validUntil = body.valid_until || addDays(quoteDate, 15);

    if (!isValidDateString(quoteDate)) {
        throw new QuoteError('La fecha del presupuesto es inválida.');
    }
    if (!isValidDateString(validUntil)) {
        throw new QuoteError('La fecha de validez es inválida.');
    }
    if (validUntil < quoteDate) {
        throw new QuoteError('La fecha de validez no puede ser anterior a la fecha del presupuesto.');
    }

    const status = body.status || 'borrador';
    if (!QUOTE_STATUSES.has(status) || !EDITABLE_STATUSES.has(status)) {
        throw new QuoteError('El estado del presupuesto es inválido.');
    }

    const customerSnapshot = await buildCustomerSnapshot(body, transaction);
    const normalizedDetails = await normalizeDetails(body.details, transaction);
    const subtotal = roundMoney(normalizedDetails.reduce((sum, item) => sum + item.line_total, 0));
    const requestedDiscount = toNumber(body.discount ?? 0);

    if (requestedDiscount === null || requestedDiscount < 0) {
        throw new QuoteError('El descuento es inválido.');
    }

    const discount = roundMoney(Math.min(requestedDiscount, subtotal));
    const total = roundMoney(subtotal - discount);

    return {
        header: {
            ...customerSnapshot,
            quote_date: quoteDate,
            valid_until: validUntil,
            status,
            subtotal,
            discount,
            total,
            notes: body.notes ? String(body.notes).trim() : null,
            terms: body.terms ? String(body.terms).trim() : null,
        },
        details: normalizedDetails,
    };
};

const handleQuoteError = (res, error) => {
    if (error instanceof QuoteError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error en presupuestos:', error);
    return res.status(500).json({ message: 'Error interno al procesar el presupuesto.', details: error.message });
};

export const getQuotes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            from,
            to,
        } = req.query;

        const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
        const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
        const where = {};

        if (!isManager(req)) {
            where.user_id = req.usuario.id;
        }

        if (search && String(search).trim()) {
            const term = `%${String(search).trim()}%`;
            where[Op.or] = [
                { quote_number: { [Op.like]: term } },
                { customer_name: { [Op.like]: term } },
                { customer_document: { [Op.like]: term } },
            ];
        }

        if (status) {
            if (!QUOTE_STATUSES.has(status) && status !== 'vencido') {
                throw new QuoteError('El estado del filtro es inválido.');
            }
            if (status === 'vencido') {
                where.status = 'emitido';
                where.valid_until = { [Op.lt]: todayArgentina() };
            } else {
                where.status = status;
            }
        }

        if (from || to) {
            const range = {};
            if (from) {
                if (!isValidDateString(from)) throw new QuoteError('La fecha desde es inválida.');
                range[Op.gte] = from;
            }
            if (to) {
                if (!isValidDateString(to)) throw new QuoteError('La fecha hasta es inválida.');
                range[Op.lte] = to;
            }
            where.quote_date = range;
        }

        const { count, rows } = await QuoteModel.findAndCountAll({
            where,
            include: [{
                model: UsuarioModel,
                as: 'user',
                attributes: ['id', 'username', 'nombre'],
                required: false,
            }],
            order: [['quote_date', 'DESC'], ['id', 'DESC']],
            limit: parsedLimit,
            offset: (parsedPage - 1) * parsedLimit,
            distinct: true,
        });

        return res.json({
            quotes: rows.map(serializeQuote),
            pagination: {
                total: count,
                page: parsedPage,
                limit: parsedLimit,
                totalPages: Math.ceil(count / parsedLimit),
            },
        });
    } catch (error) {
        return handleQuoteError(res, error);
    }
};

export const getQuote = async (req, res) => {
    try {
        const quote = await loadQuote(req.params.id, null, true);
        if (!quote) {
            throw new QuoteError('Presupuesto no encontrado.', 404);
        }
        if (!canAccessQuote(req, quote)) {
            throw new QuoteError('No tienes acceso a este presupuesto.', 403);
        }
        return res.json({ quote: serializeQuote(quote) });
    } catch (error) {
        return handleQuoteError(res, error);
    }
};

export const createQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { header, details } = await buildQuoteValues(req.body, transaction);
        const quote = await QuoteModel.create({
            ...header,
            user_id: req.usuario.id,
        }, { transaction });

        const quoteNumber = `PRES-${String(quote.id).padStart(6, '0')}`;
        await quote.update({ quote_number: quoteNumber }, { transaction });

        await QuoteDetailModel.bulkCreate(
            details.map((detail) => ({ ...detail, quote_id: quote.id })),
            { transaction }
        );

        await logAudit({
            user_id: req.usuario.id,
            action: 'CREAR_PRESUPUESTO',
            entity_type: 'quote',
            entity_id: quote.id,
            new_values: { quote_number: quoteNumber, customer_name: header.customer_name, total: header.total },
            details: `Se creó el presupuesto ${quoteNumber}.`,
        }, req, transaction);

        await transaction.commit();
        const created = await loadQuote(quote.id, null, true);
        return res.status(201).json({ message: 'Presupuesto creado correctamente.', quote: serializeQuote(created) });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        return handleQuoteError(res, error);
    }
};

export const updateQuote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await loadQuote(req.params.id, transaction, true);
        if (!quote) {
            throw new QuoteError('Presupuesto no encontrado.', 404);
        }
        if (!canAccessQuote(req, quote)) {
            throw new QuoteError('No tienes acceso a este presupuesto.', 403);
        }
        if (!EDITABLE_STATUSES.has(quote.status)) {
            throw new QuoteError('Este presupuesto ya no se puede editar.', 409);
        }

        const body = {
            ...req.body,
            status: req.body.status || quote.status,
        };
        const { header, details } = await buildQuoteValues(body, transaction);

        await quote.update(header, { transaction });
        await QuoteDetailModel.destroy({ where: { quote_id: quote.id }, transaction });
        await QuoteDetailModel.bulkCreate(
            details.map((detail) => ({ ...detail, quote_id: quote.id })),
            { transaction }
        );

        await logAudit({
            user_id: req.usuario.id,
            action: 'ACTUALIZAR_PRESUPUESTO',
            entity_type: 'quote',
            entity_id: quote.id,
            new_values: { quote_number: quote.quote_number, customer_name: header.customer_name, total: header.total, status: header.status },
            details: `Se actualizó el presupuesto ${quote.quote_number}.`,
        }, req, transaction);

        await transaction.commit();
        const updated = await loadQuote(quote.id, null, true);
        return res.json({ message: 'Presupuesto actualizado correctamente.', quote: serializeQuote(updated) });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        return handleQuoteError(res, error);
    }
};

export const updateQuoteStatus = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const quote = await loadQuote(req.params.id, transaction, true);
        if (!quote) {
            throw new QuoteError('Presupuesto no encontrado.', 404);
        }
        if (!canAccessQuote(req, quote)) {
            throw new QuoteError('No tienes acceso a este presupuesto.', 403);
        }

        const targetStatus = req.body.status;
        if (!['emitido', 'anulado'].includes(targetStatus)) {
            throw new QuoteError('Estado solicitado inválido.');
        }

        if (targetStatus === 'emitido') {
            requireQuotePermission(req, 'accion_editar_presupuesto');
        } else {
            requireQuotePermission(req, 'accion_anular_presupuesto');
        }

        if (quote.status === targetStatus) {
            await transaction.commit();
            return res.json({ message: 'El presupuesto ya tiene ese estado.', quote: serializeQuote(quote) });
        }

        if (!EDITABLE_STATUSES.has(quote.status)) {
            throw new QuoteError('Este presupuesto ya no se puede modificar.', 409);
        }
        if (targetStatus === 'emitido' && quote.status !== 'borrador') {
            throw new QuoteError('Solo un presupuesto en borrador puede emitirse.', 409);
        }

        const previousStatus = quote.status;
        await quote.update({ status: targetStatus }, { transaction });
        await logAudit({
            user_id: req.usuario.id,
            action: targetStatus === 'emitido' ? 'EMITIR_PRESUPUESTO' : 'ANULAR_PRESUPUESTO',
            entity_type: 'quote',
            entity_id: quote.id,
            old_values: { status: previousStatus },
            new_values: { status: targetStatus },
            details: `Se ${targetStatus === 'emitido' ? 'emitió' : 'anuló'} el presupuesto ${quote.quote_number}.`,
        }, req, transaction);

        await transaction.commit();
        const updated = await loadQuote(quote.id, null, true);
        return res.json({ message: 'Estado del presupuesto actualizado.', quote: serializeQuote(updated) });
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        return handleQuoteError(res, error);
    }
};
