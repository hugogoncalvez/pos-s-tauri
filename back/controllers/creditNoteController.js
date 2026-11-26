import { Op } from 'sequelize';
import db from '../database/db.js';
import {
    CreditNoteModel,
    CreditNoteDetailModel,
    SaleModel,
    SaleDetailModel,
    CustomerModel,
    StockModel,
    UsuarioModel
} from '../database/associations.js';
import CreditNoteCounterModel from '../Models/CreditNoteCounterModel.js';
import { logAudit } from '../middleware/auditMiddleware.js';

class ValidationError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = statusCode;
    }
}

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const getCreditNoteNumber = (cn) => `NC-${String(cn?.numero ?? cn?.id ?? 0).padStart(5, '0')}`;

/**
 * Obtener los ítems de una venta indicando cuánto se compró, cuánto ya se devolvió y cuánto queda disponible
 */
export const getSaleReturnableItems = async (req, res) => {
    try {
        const { sale_id } = req.params;

        const sale = await SaleModel.findByPk(sale_id, {
            include: [
                {
                    model: SaleDetailModel,
                    as: 'sale_details',
                    include: [{ model: StockModel, as: 'stock', attributes: ['id', 'name', 'stock'] }]
                },
                {
                    model: CustomerModel,
                    as: 'customer',
                    attributes: ['id', 'name', 'dni', 'phone', 'debt', 'credit_balance']
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        // Obtener notas de crédito previas de esta venta (que no estén anuladas)
        const previousCreditNotes = await CreditNoteModel.findAll({
            where: { sale_id, estado: { [Op.ne]: 'anulada' } },
            include: [{ model: CreditNoteDetailModel, as: 'details' }]
        });

        // Mapear lo ya devuelto por sale_detail_id
        const returnedMap = new Map();
        for (const cn of previousCreditNotes) {
            for (const detail of cn.details || []) {
                if (detail.sale_detail_id) {
                    const current = returnedMap.get(Number(detail.sale_detail_id)) || 0;
                    returnedMap.set(Number(detail.sale_detail_id), current + Number(detail.quantity));
                }
            }
        }

        const items = (sale.sale_details || []).map(detail => {
            const purchasedQty = Number(detail.quantity);
            const returnedQty = returnedMap.get(Number(detail.id)) || 0;
            const availableQty = Math.max(0, roundMoney(purchasedQty - returnedQty));
            const unitPrice = detail.price ? Number(detail.price) : (purchasedQty > 0 ? Number(detail.line_total) / purchasedQty : 0);

            return {
                sale_detail_id: detail.id,
                stock_id: detail.stock_id,
                product_name: detail.product_name || detail.stock?.name || 'Producto sin nombre',
                unit_name: detail.unit_name || 'Un.',
                presentation_name: detail.presentation_name || null,
                purchased_quantity: purchasedQty,
                already_returned_quantity: returnedQty,
                available_quantity: availableQty,
                unit_price: roundMoney(unitPrice),
                current_stock: detail.stock ? Number(detail.stock.stock) : null
            };
        });

        res.json({
            sale: {
                id: sale.id,
                fecha: sale.createdAt,
                total_neto: sale.total_neto,
                customer: sale.customer
            },
            items
        });
    } catch (error) {
        console.error('Error al obtener ítems retornables:', error);
        res.status(500).json({ message: 'Error al consultar ítems de la venta: ' + error.message });
    }
};

/**
 * Crear una nueva Nota de Crédito por devolución de materiales
 */
export const createCreditNote = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { sale_id, items, notas, cash_session_id } = req.body || {};
        const user_id = req.usuario?.id;

        if (!sale_id) throw new ValidationError('Debe especificar la venta origen.');
        if (!Array.isArray(items) || items.length === 0) {
            throw new ValidationError('Debe seleccionar al menos un producto a devolver.');
        }

        const sale = await SaleModel.findByPk(sale_id, {
            include: [{ model: SaleDetailModel, as: 'sale_details' }],
            transaction
        });
        if (!sale) throw new ValidationError('Venta no encontrada.', 404);

        const customer = await CustomerModel.findByPk(sale.customer_id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!customer) throw new ValidationError('Cliente de la venta no encontrado.', 404);

        // Validar cantidades contra devoluciones previas
        const previousCreditNotes = await CreditNoteModel.findAll({
            where: { sale_id, estado: { [Op.ne]: 'anulada' } },
            include: [{ model: CreditNoteDetailModel, as: 'details' }],
            transaction
        });

        const returnedMap = new Map();
        for (const cn of previousCreditNotes) {
            for (const d of cn.details || []) {
                if (d.sale_detail_id) {
                    const cur = returnedMap.get(Number(d.sale_detail_id)) || 0;
                    returnedMap.set(Number(d.sale_detail_id), cur + Number(d.quantity));
                }
            }
        }

        const saleDetailsMap = new Map((sale.sale_details || []).map(d => [Number(d.id), d]));
        const creditNoteDetailsToCreate = [];
        let totalCreditNote = 0;
        const stockIncrements = [];

        for (const item of items) {
            const saleDetail = saleDetailsMap.get(Number(item.sale_detail_id));
            if (!saleDetail) {
                throw new ValidationError(`El ítem ${item.sale_detail_id} no pertenece a esta venta.`);
            }

            const returnQty = Number(item.quantity);
            if (!Number.isFinite(returnQty) || returnQty <= 0) {
                throw new ValidationError(`Cantidad a devolver inválida para ${saleDetail.product_name || 'ítem'}.`);
            }

            const purchasedQty = Number(saleDetail.quantity);
            const alreadyReturned = returnedMap.get(Number(saleDetail.id)) || 0;
            const availableQty = roundMoney(purchasedQty - alreadyReturned);

            if (returnQty > availableQty + 0.001) {
                throw new ValidationError(`No se puede devolver ${returnQty} de "${saleDetail.product_name}". Máximo disponible: ${availableQty}.`);
            }

            const unitPrice = saleDetail.price ? Number(saleDetail.price) : (purchasedQty > 0 ? Number(saleDetail.line_total) / purchasedQty : 0);
            const lineTotal = roundMoney(unitPrice * returnQty);
            totalCreditNote += lineTotal;

            const reingresa = item.reingresa_stock !== false; // por defecto true

            creditNoteDetailsToCreate.push({
                sale_detail_id: saleDetail.id,
                stock_id: saleDetail.stock_id,
                quantity: returnQty,
                price: roundMoney(unitPrice),
                line_total: lineTotal,
                product_name: saleDetail.product_name,
                unit_name: saleDetail.unit_name || 'Un.',
                reingresa_stock: reingresa
            });

            if (reingresa && saleDetail.stock_id) {
                stockIncrements.push({ stock_id: saleDetail.stock_id, qty: returnQty });
            }
        }

        totalCreditNote = roundMoney(totalCreditNote);

        // Obtener siguiente correlativo
        await CreditNoteCounterModel.findOrCreate({
            where: { id: 1 },
            defaults: { ultimo_numero: 0 },
            transaction
        });
        const counter = await CreditNoteCounterModel.findByPk(1, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!counter) throw new ValidationError('No se pudo obtener el correlativo de notas de crédito.');

        const numero = Number(counter.ultimo_numero || 0) + 1;
        const today = new Date();
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

        const creditNote = await CreditNoteModel.create({
            numero,
            customer_id: customer.id,
            sale_id: sale.id,
            user_id: user_id || sale.user_id,
            cash_session_id: cash_session_id || null,
            fecha: localDate,
            total: totalCreditNote,
            estado: 'emitida',
            notas: notas ? String(notas).trim() : null,
            created_by: req.usuario?.nombre || req.usuario?.username || 'Sistema',
            created_by_id: user_id || null
        }, { transaction });

        // Crear detalles
        await CreditNoteDetailModel.bulkCreate(
            creditNoteDetailsToCreate.map(detail => ({
                ...detail,
                credit_note_id: creditNote.id
            })),
            { transaction }
        );

        // Incrementar stock físico de los productos devueltos
        for (const inc of stockIncrements) {
            await StockModel.increment('stock', {
                by: inc.qty,
                where: { id: inc.stock_id },
                transaction
            });
        }

        // Ajustar deuda y saldo a favor del cliente
        const currentDebt = parseFloat(customer.debt) || 0;
        const currentBalance = parseFloat(customer.credit_balance) || 0;
        let debtDeducted = 0;
        let creditAdded = 0;

        if (currentDebt > 0) {
            debtDeducted = Math.min(currentDebt, totalCreditNote);
            const remainingCredit = roundMoney(totalCreditNote - debtDeducted);
            const newDebt = roundMoney(currentDebt - debtDeducted);
            const newBalance = roundMoney(currentBalance + remainingCredit);
            creditAdded = remainingCredit;
            await customer.update({ debt: newDebt, credit_balance: newBalance }, { transaction });
        } else {
            creditAdded = totalCreditNote;
            const newBalance = roundMoney(currentBalance + totalCreditNote);
            await customer.update({ credit_balance: newBalance }, { transaction });
        }

        await counter.update({ ultimo_numero: numero }, { transaction });

        // Auditoría
        await logAudit({
            user_id: user_id || 1,
            action: 'CREAR_NOTA_CREDITO',
            entity_type: 'credit_note',
            entity_id: creditNote.id,
            session_id: cash_session_id || null,
            new_values: {
                numero,
                sale_id: sale.id,
                customer_id: customer.id,
                total: totalCreditNote,
                items_count: creditNoteDetailsToCreate.length,
                deuda_anterior: currentDebt,
                deuda_descontada: debtDeducted,
                saldo_a_favor_agregado: creditAdded,
                nuevo_saldo_a_favor: roundMoney(currentBalance + creditAdded)
            },
            details: `Se emitió la Nota de Crédito ${getCreditNoteNumber(creditNote)} por $${totalCreditNote} al cliente ${customer.name} (Venta #${sale.id}). Se reingresaron ${stockIncrements.length} productos al stock. Saldo a favor acreditado: $${creditAdded}.`
        }, req, transaction);

        await transaction.commit();

        // Cargar completa para retornar
        const fullCreditNote = await getCreditNoteById(creditNote.id);
        res.status(201).json(fullCreditNote);
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        console.error('Error al crear nota de crédito:', error);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getCreditNoteById = async (id, transaction = null) => {
    return CreditNoteModel.findByPk(id, {
        transaction,
        include: [
            {
                model: CustomerModel,
                as: 'customer',
                attributes: ['id', 'name', 'dni', 'phone', 'email', 'debt', 'credit_balance']
            },
            {
                model: SaleModel,
                as: 'sale',
                attributes: ['id', 'createdAt', 'total_neto']
            },
            {
                model: UsuarioModel,
                as: 'user',
                attributes: ['id', 'nombre', 'username']
            },
            {
                model: CreditNoteDetailModel,
                as: 'details',
                include: [{ model: StockModel, as: 'stock', attributes: ['id', 'name'] }]
            }
        ]
    });
};

/**
 * Obtener listado de Notas de Crédito
 */
export const getCreditNotes = async (req, res) => {
    try {
        const { page = 1, limit = 20, customer_id, sale_id, startDate, endDate } = req.query;
        const where = {};

        if (customer_id) where.customer_id = customer_id;
        if (sale_id) where.sale_id = sale_id;

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
        const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNumber - 1) * limitNumber;

        const { count, rows } = await CreditNoteModel.findAndCountAll({
            where,
            include: [
                { model: CustomerModel, as: 'customer', attributes: ['id', 'name', 'dni', 'phone'] },
                { model: SaleModel, as: 'sale', attributes: ['id', 'createdAt', 'total_neto'] },
                {
                    model: CreditNoteDetailModel,
                    as: 'details',
                    separate: true,
                    order: [['id', 'ASC']],
                    include: [{ model: StockModel, as: 'stock', attributes: ['id', 'name'] }]
                }
            ],
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
        console.error('Error al listar notas de crédito:', error);
        res.status(500).json({ message: 'Error al listar notas de crédito: ' + error.message });
    }
};

/**
 * Obtener una Nota de Crédito por ID
 */
export const getCreditNote = async (req, res) => {
    try {
        const creditNote = await getCreditNoteById(req.params.id);
        if (!creditNote) {
            return res.status(404).json({ message: 'Nota de crédito no encontrada.' });
        }
        res.json(creditNote);
    } catch (error) {
        console.error('Error al obtener nota de crédito:', error);
        res.status(500).json({ message: 'Error al obtener nota de crédito: ' + error.message });
    }
};

