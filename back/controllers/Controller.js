import ElementLandingModel from "../Models/ElementLandigModel.js";
import * as XLSX from 'xlsx';
import {
    UnitModel, StockCategoryModel, StockModel, PurchaseModel, PurchasesDetailsModel,
    SaleModel, SaleDetailModel, CustomerModel, PaymentModel, PromotionModel, UsuarioModel,
    CashSessionsModel, AuditLogModel, RoleModel, SalePaymentModel, CashSessionMovementModel,
    ThemeSettingModel, PendingTicketModel, ProductPresentationsModel, ProductPromotionsModel,
    ComboModel, ComboItem, PermissionModel, UserPermissionModel
} from '../database/associations.js';
import CustomerPaymentsModel from '../Models/CustomerPaymentsModel.js';
import db from '../database/db.js';
import { Op } from "sequelize";
import bcrypt from 'bcryptjs';
import { logAudit } from '../middleware/auditMiddleware.js';
import modulePermissions from '../config/modulePermissions.js';


import SupplierModel from "../Models/SuppliersModel.js";


/**
 * @description Obtiene todos los permisos disponibles en el sistema.
 */
export const getAllPermissions = async (req, res) => {
    try {
        const permissions = await PermissionModel.findAll({ order: [['modulo', 'ASC'], ['nombre', 'ASC']] });
        res.json(permissions);
    } catch (error) {
        console.error("Error al obtener todos los permisos:", error);
        res.status(500).json({ message: 'Error interno al obtener los permisos.' });
    }
};

/**
 * @description Obtiene los permisos de un usuario, combinando los de su rol y sus overrides.
 */
export const getUserPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UsuarioModel.findByPk(id, { include: [{ model: RoleModel, as: 'rol' }] });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // 1. Obtener permisos del rol
        const rolePermissionsQuery = `
            SELECT p.id, p.nombre, p.modulo
            FROM roles_permisos rp
            JOIN permisos p ON rp.permiso_id = p.id
            WHERE rp.rol_id = ?
        `;
        const rolePermissions = await db.query(rolePermissionsQuery, { replacements: [user.rol_id], type: db.QueryTypes.SELECT });

        // 2. Obtener overrides del usuario
        const userOverrides = await UserPermissionModel.findAll({
            where: { user_id: id },
            include: [{ model: PermissionModel, as: 'permiso', attributes: ['id', 'nombre'] }]
        });

        res.json({
            rolePermissions, // Permisos que vienen del rol
            userOverrides    // Permisos específicos (grant/revoke)
        });

    } catch (error) {
        console.error("Error al obtener permisos del usuario:", error);
        res.status(500).json({ message: 'Error interno al obtener los permisos del usuario.' });
    }
};

/**
 * @description Añade o actualiza un permiso personalizado (grant/revoke) para un usuario.
 */
export const addUserPermission = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id: user_id } = req.params;
        const { permission_id, type } = req.body;

        if (!permission_id || !['grant', 'revoke'].includes(type)) {
            return res.status(400).json({ message: 'permission_id y type (grant/revoke) son requeridos.' });
        }

        // Usamos upsert para crear o actualizar el override.
        // Si ya existe un override para este usuario y permiso, se actualizará el tipo.
        await UserPermissionModel.upsert({
            user_id,
            permission_id,
            type
        }, { transaction });

        await logAudit({
            user_id: req.usuario.id,
            action: 'UPDATE_USER_PERMISSION',
            entity_type: 'user_permissions',
            entity_id: user_id,
            new_values: { user_id, permission_id, type },
            details: `Se aplicó el permiso '${type}' (ID: ${permission_id}) al usuario con ID: ${user_id}.`
        }, req, transaction);

        await transaction.commit();
        res.status(200).json({ message: 'Permiso de usuario actualizado correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al añadir permiso de usuario:", error);
        res.status(500).json({ message: 'Error al añadir el permiso.' });
    }
};

/**
 * @description Elimina un permiso personalizado de un usuario.
 */
export const removeUserPermission = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id: user_id, permission_id } = req.params;

        const deleted = await UserPermissionModel.destroy({
            where: {
                user_id,
                permission_id
            },
            transaction
        });

        if (deleted) {
            await logAudit({
                user_id: req.usuario.id,
                action: 'REMOVE_USER_PERMISSION',
                entity_type: 'user_permissions',
                entity_id: user_id,
                old_values: { user_id, permission_id },
                details: `Se eliminó el override de permiso (ID: ${permission_id}) para el usuario con ID: ${user_id}.`
            }, req, transaction);

            await transaction.commit();
            res.status(200).json({ message: 'Permiso personalizado eliminado.' });
        } else {
            await transaction.rollback();
            res.status(404).json({ message: 'No se encontró un permiso personalizado para eliminar.' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error("Error al eliminar permiso de usuario:", error);
        res.status(500).json({ message: 'Error al eliminar el permiso.' });
    }
};

export const getReportSummary = async (req, res) => {
    try {
        const { reportType, startDate, endDate, productId, supplierId } = req.query;

        let whereClause = {};
        let relatedWhereClause = {};
        let stockIncludeWhereClause = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            relatedWhereClause.createdAt = { [Op.between]: [start, end] };
        }
        if (productId) whereClause.stock_id = productId;
        if (supplierId) stockIncludeWhereClause.supplier_id = supplierId;

        let total = 0;
        if (reportType === 'salesSummary') {
            const result = await SaleDetailModel.findOne({
                attributes: [[db.fn('SUM', db.literal('`sale_detail`.`quantity` * `sale_detail`.`price`')), 'total']],
                where: whereClause,
                include: [
                    {
                        model: SaleModel,
                        as: 'sale',
                        where: relatedWhereClause,
                        required: true,
                        attributes: []
                    },
                    {
                        model: StockModel,
                        as: 'stock',
                        where: stockIncludeWhereClause,
                        required: Object.keys(stockIncludeWhereClause).length > 0,
                        attributes: []
                    }
                ],
                raw: true
            });
            total = result ? result.total : 0;
        } else if (reportType === 'purchasesSummary') {
            const result = await PurchasesDetailsModel.findOne({
                attributes: [[db.fn('SUM', db.literal('`purchases_details`.`quantity` * `purchases_details`.`cost`')), 'total']],
                where: whereClause,
                include: [
                    {
                        model: PurchaseModel,
                        as: 'purchase',
                        where: relatedWhereClause,
                        required: true,
                        attributes: []
                    },
                    {
                        model: StockModel,
                        as: 'stock',
                        where: stockIncludeWhereClause,
                        required: Object.keys(stockIncludeWhereClause).length > 0,
                        attributes: []
                    }
                ],
                raw: true
            });
            total = result ? result.total : 0;
        }

        res.json({ total: total || 0 });

    } catch (error) {
        console.error('Error getting report summary:', error);
        res.status(500).json({ message: 'Error getting report summary: ' + error.message });
    }
};

export const getFullReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate, productId, supplierId } = req.query;

        let whereClause = {};
        let relatedWhereClause = {};
        let stockIncludeWhereClause = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            relatedWhereClause.createdAt = { [Op.between]: [start, end] };
        }
        if (productId) whereClause.stock_id = productId;
        if (supplierId) stockIncludeWhereClause.supplier_id = supplierId;

        let rows = [];
        if (reportType === 'salesSummary') {
            rows = await SaleDetailModel.findAll({
                where: whereClause,
                include: [
                    {
                        model: SaleModel, as: 'sale', where: relatedWhereClause, required: true,
                        include: [{ model: UsuarioModel, as: 'usuario', attributes: ['username'] }]
                    },
                    {
                        model: StockModel, as: 'stock', where: stockIncludeWhereClause,
                        required: Object.keys(stockIncludeWhereClause).length > 0,
                        include: [{ model: SupplierModel, attributes: ['nombre'] }]
                    }
                ],
                order: [[{ model: SaleModel, as: 'sale' }, 'createdAt', 'DESC']]
            });
        } else if (reportType === 'purchasesSummary') {
            rows = await PurchasesDetailsModel.findAll({
                where: whereClause,
                include: [
                    {
                        model: PurchaseModel, as: 'purchase', where: relatedWhereClause, required: true
                    },
                    {
                        model: StockModel, as: 'stock', where: stockIncludeWhereClause,
                        required: Object.keys(stockIncludeWhereClause).length > 0,
                        include: [{ model: SupplierModel, attributes: ['nombre'] }]
                    }
                ],
                order: [[{ model: PurchaseModel, as: 'purchase' }, 'createdAt', 'DESC']]
            });
        }

        res.json({ rows });

    } catch (error) {
        console.error('Error getting full report:', error);
        res.status(500).json({ message: 'Error getting full report: ' + error.message });
    }
};


export const checkCustomerDuplicate = async (req, res) => {
    try {
        const { dni, email, customerId } = req.query; // customerId para excluir al cliente actual en edición

        const whereConditions = {
            [Op.or]: []
        };

        if (dni) {
            whereConditions[Op.or].push({ dni });
        }
        if (email) {
            whereConditions[Op.or].push({ email });
        }

        // Si no se proporciona ningún campo para verificar, retornar error
        if (whereConditions[Op.or].length === 0) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un DNI o email para verificar.' });
        }

        // Excluir al cliente actual si se está editando
        if (customerId) {
            whereConditions.id = { [Op.ne]: customerId };
        }

        const existingCustomer = await CustomerModel.findOne({
            where: whereConditions
        });

        if (existingCustomer) {
            let duplicatedField = '';
            if (dni && existingCustomer.dni === dni) duplicatedField = 'DNI';
            else if (email && existingCustomer.email === email) duplicatedField = 'Email';

            return res.json({ exists: true, duplicatedField, customer: existingCustomer });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking customer duplicate:', error);
        res.status(500).json({ message: 'Error al verificar duplicado de cliente', error: error.message });
    }
};


// no borrar
export const getPurchase = async (req, res) => {
    try {
        const purchase = await PurchaseModel.findAll({
            where: {
                id: req.params.id
            },
        })
        res.json(purchase)
    } catch (error) {
        res.json({ message: error.message })
    }
}
export const getPurchases = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            factura,
            supplier,
            startDate,
            endDate,
            stock_id
        } = req.query;

        let whereClause = {};
        if (factura) whereClause.factura = { [Op.like]: `%${factura}%` };
        if (supplier) whereClause.supplier = { [Op.like]: `%${supplier}%` };

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt = { [Op.between]: [start, end] };
        } else if (startDate) {
            whereClause.createdAt = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt = { [Op.lte]: end };
        }

        let includeClause = [{
            model: PurchasesDetailsModel,
            as: 'details',
            required: false,
            include: [{
                model: StockModel,
                as: 'stock',
                attributes: ['id', 'name', 'description', 'units_id', 'tipo_venta']
            }]
        }];

        if (stock_id) {
            includeClause[0].where = { stock_id: stock_id };
            includeClause[0].required = true;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await PurchaseModel.findAndCountAll({
            where: whereClause,
            include: includeClause,
            distinct: true,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
            subQuery: false
        });

        res.json({
            rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error("Error al obtener las compras:", error);
        res.status(500).json({ message: 'Error al obtener las compras: ' + error.message });
    }
};


export const createFullPurchase = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { createdAt, factura, supplier, cost, tempValues } = req.body;

        // 1. Crear la cabecera de la compra
        const newPurchase = await PurchaseModel.create({
            createdAt,
            factura,
            supplier,
            cost
        }, { transaction });

        // 2. Preparar y crear los detalles de la compra
        for (const item of tempValues) {
            const { stock_id, totalPerUnits, costPerUnits } = item;

            // Crear el detalle de la compra
            await PurchasesDetailsModel.create({
                purchasesId: newPurchase.id,
                stock_id,
                quantity: totalPerUnits,
                cost: costPerUnits,
                createdAt: newPurchase.createdAt, // Usar la fecha de la cabecera
                updatedAt: newPurchase.createdAt  // Usar la fecha de la cabecera
            }, { transaction });

            // Actualizar el stock del producto
            const stockItem = await StockModel.findByPk(stock_id, { transaction });
            if (stockItem) {
                await stockItem.increment('stock', {
                    by: totalPerUnits,
                    transaction
                });
                // Opcional: actualizar el costo del producto en stock
                await stockItem.update({
                    cost: costPerUnits
                }, { transaction });
                await checkLowStockAndLog(stock_id, req.user ? req.user.id : null, transaction);
            }
        }

        // 3. Si todo fue bien, confirmar la transacción
        await transaction.commit();

        // 4. Devolver el objeto de la compra recién creada con sus detalles
        const finalPurchase = await PurchaseModel.findByPk(newPurchase.id, {
            include: [{
                model: PurchasesDetailsModel,
                as: 'details',
                include: [{
                    model: StockModel,
                    as: 'stock',
                    attributes: ['name', 'description']
                }]
            }]
        });

        res.status(200).json(finalPurchase);

    } catch (error) {
        // 5. Si algo falló, revertir la transacción
        await transaction.rollback();
        console.error("Error en createFullPurchase:", error);
        res.status(500).json({ message: 'Error al registrar la compra: ' + error.message });
    }
};



export const getPurchaseDetails = async (req, res) => {
    try {
        const {
            page = 0,
            limit = 10,
            startDate,
            endDate,
            productId,
            supplierId,
        } = req.query;

        let whereClause = {};
        let purchaseWhereClause = {};
        let stockIncludeWhereClause = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            purchaseWhereClause.createdAt = {
                [Op.between]: [start, end]
            };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            purchaseWhereClause.createdAt = {
                [Op.gte]: start
            };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            purchaseWhereClause.createdAt = {
                [Op.lte]: end
            };
        }

        if (productId) {
            whereClause.stock_id = productId;
        }

        if (supplierId) {
            stockIncludeWhereClause.supplier_id = supplierId;
        }

        const offset = parseInt(page) * parseInt(limit);

        const { count, rows } = await PurchasesDetailsModel.findAndCountAll({
            where: whereClause,
            attributes: [
                'id',
                'purchasesId',
                'stock_id',
                'quantity',
                'cost'
            ],
            include: [
                {
                    model: PurchaseModel,
                    attributes: ['createdAt'],
                    as: 'purchase',
                    where: purchaseWhereClause,
                    required: Object.keys(purchaseWhereClause).length > 0 // INNER JOIN if purchase filters exist
                },
                {
                    model: StockModel,
                    attributes: ['id', 'name', 'description', 'category_id', 'units_id'],
                    as: 'stock',
                    where: stockIncludeWhereClause,
                    required: Object.keys(stockIncludeWhereClause).length > 0, // INNER JOIN if stock filters exist
                    include: [
                        {
                            model: SupplierModel,
                            attributes: ['nombre']
                        }
                    ]
                }
            ],
            order: [
                [{ model: PurchaseModel, as: 'purchase' }, 'createdAt', 'DESC']
            ],
            distinct: true,
            limit: parseInt(limit),
            offset: offset
        });

        res.json({ rows, count });
    } catch (error) {
        console.error('Error al obtener los detalles de compra:', error);
        res.status(500).json({ message: 'Error al obtener los detalles de compra: ' + error.message });
    }
};

// no borrar
export const deletePurchase = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const purchaseId = req.params.id;

        // 1. Obtener los detalles de la compra antes de eliminarla
        const purchaseDetails = await PurchasesDetailsModel.findAll({
            where: { purchasesId: purchaseId },
            transaction
        });

        // 2. Revertir el stock de cada producto (decrementarlo)
        for (const detail of purchaseDetails) {
            const stockItem = await StockModel.findByPk(detail.stock_id, { transaction });
            if (stockItem) {
                await stockItem.decrement('stock', {
                    by: detail.quantity,
                    transaction
                });
                await checkLowStockAndLog(stockItem.id, req.user ? req.user.id : null, transaction);
            }
        }

        // 3. Eliminar la cabecera de la compra (esto debería cascadear a los detalles si la asociación está bien configurada)
        await PurchaseModel.destroy({
            where: { id: purchaseId },
            transaction
        });

        await transaction.commit();
        res.json({ message: 'Registro eliminado correctamente y stock actualizado.' });
    } catch (error) {
        await transaction.rollback();
        console.error("Error al eliminar la compra y actualizar stock:", error);
        res.status(500).json({ message: 'Error al eliminar la compra: ' + error.message });
    }
};
// no borrar

export const updatePurchase = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const purchaseId = req.params.id;
        const { createdAt, factura, supplier, cost, tempValues } = req.body;

        // 1. Obtener detalles antiguos y crear un mapa para fácil acceso
        const oldDetails = await PurchasesDetailsModel.findAll({
            where: { purchasesId: purchaseId },
            transaction
        });
        const oldDetailsMap = new Map(oldDetails.map(item => [item.stock_id, item.quantity]));

        // 2. Crear mapa de nuevos detalles y obtener todos los IDs de productos involucrados
        const newDetailsMap = new Map(tempValues.map(item => [item.stock_id, item.totalPerUnits]));
        const allStockIds = new Set([...oldDetailsMap.keys(), ...newDetailsMap.keys()]);

        // 3. Calcular y aplicar diferencias de stock
        for (const stockId of allStockIds) {
            const oldQty = oldDetailsMap.get(stockId) || 0;
            const newQty = newDetailsMap.get(stockId) || 0;
            const diff = newQty - oldQty;

            if (diff !== 0) {
                const stockItem = await StockModel.findByPk(stockId, { transaction });
                if (stockItem) {
                    await stockItem.increment('stock', { by: diff, transaction });
                    // Opcional: Actualizar costo si es necesario (aquí se usa el costo del último item)
                    const newItemData = tempValues.find(item => item.stock_id === stockId);
                    if (newItemData) {
                        await stockItem.update({ cost: newItemData.costPerUnits }, { transaction });
                    }
                    await checkLowStockAndLog(stockId, req.user ? req.user.id : null, transaction);
                }
            }
        }

        // 4. Actualizar la cabecera de la compra
        await PurchaseModel.update({
            createdAt,
            factura,
            supplier,
            cost
        }, {
            where: { id: purchaseId },
            transaction
        });

        // 5. Eliminar detalles antiguos y crear los nuevos (reemplazo completo)
        await PurchasesDetailsModel.destroy({
            where: { purchasesId: purchaseId },
            transaction
        });

        const detailsToCreate = tempValues.map(item => ({
            purchasesId: purchaseId,
            stock_id: item.stock_id,
            quantity: item.totalPerUnits,
            cost: item.costPerUnits
        }));

        await PurchasesDetailsModel.bulkCreate(detailsToCreate, { transaction });

        // 6. Confirmar la transacción
        await transaction.commit();

        // 7. Devolver la compra actualizada
        const finalPurchase = await PurchaseModel.findByPk(purchaseId, {
            include: [{
                model: PurchasesDetailsModel,
                as: 'details',
                include: [{
                    model: StockModel,
                    as: 'stock',
                    attributes: ['name', 'description']
                }]
            }]
        });

        res.status(200).json(finalPurchase);

    } catch (error) {
        await transaction.rollback();
        console.error("Error en updatePurchase:", error);
        res.status(500).json({ message: 'Error al actualizar la compra: ' + error.message });
    }
};
// no borrar
export const createStocks = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { presentations, ...productData } = req.body;
        productData.visible = 1; // Asegurar que el producto sea visible por defecto

        // 1. Crear el producto principal
        const newProduct = await StockModel.create(productData, { transaction });

        // 2. Si hay presentaciones, crearlas y asociarlas
        if (presentations && Array.isArray(presentations) && presentations.length > 0) {
            for (const pres of presentations) {
                await ProductPresentationsModel.create({
                    ...pres,
                    stock_id: newProduct.id // Enlazar con el ID del nuevo producto
                }, { transaction });
            }
        }

        // 3. Si todo fue bien, confirmar la transacción
        await transaction.commit();

        res.status(201).json({
            message: 'Producto guardado correctamente',
            product: newProduct
        });

    } catch (error) {
        // 4. Si algo falla, revertir la transacción
        await transaction.rollback();
        console.error("Error en createStocks:", error);
        res.status(500).json({ message: 'Error al crear el producto: ' + error.message });
    }
};


// no borrar
export const getStock = async (req, res) => {
    try {
        const stock = await StockModel.findAll({
            where: {
                id: req.params.id
            },
        })
        res.json(stock)
    } catch (error) {
        res.json({ message: error.message })
    }
}

export const getStocks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            name,
            barcode,
            category_id,
            supplier_id,
            tipo_venta,
            low_stock,
            unpaginated
        } = req.query;

        let whereClause = {
            visible: 1
        };

        if (name) {
            const searchTerms = name.split(' ').filter(term => term.length > 0);
            whereClause[Op.and] = searchTerms.map(term => ({
                name: {
                    [Op.like]: `%${term}%`
                }
            }));
        }
        if (barcode) {
            whereClause.barcode = barcode;
        }
        if (category_id) {
            whereClause.category_id = category_id;
        }
        if (supplier_id) {
            whereClause.supplier_id = supplier_id;
        }
        if (tipo_venta) {
            whereClause.tipo_venta = tipo_venta;
        }

        if (low_stock === 'true') {
            whereClause.stock = {
                [Op.lte]: db.col('min_stock')
            };
        }

        const findOptions = {
            attributes: [
                'id', 'barcode', 'name', 'description', 'cost', 'stock', 'visible',
                'category_id', 'createdAt', 'updatedAt', 'units_id', 'price',
                'min_stock', 'tipo_venta', 'supplier_id',
                [db.col('unit.name'), 'unitName'],
                [db.col('stockCategory.name'), 'categoryName']
            ],
            include: [
                {
                    model: UnitModel,
                    as: 'unit',
                    attributes: [],
                    required: true,
                },
                {
                    model: StockCategoryModel,
                    as: 'stockCategory',
                    attributes: [],
                    required: true,
                },
                {
                    model: SupplierModel,
                    as: 'supplier',
                    attributes: ['nombre'], // Seleccionar 'nombre' directamente desde la asociación
                    required: false,
                },
                // NEW: Include ProductPresentations
                {
                    model: ProductPresentationsModel,
                    as: 'presentations', // Alias defined in associations.js
                    attributes: ['id', 'name', 'quantity_in_base_units', 'price', 'barcode'],
                    required: false, // A product might not have presentations yet
                }
            ],
            where: whereClause,
            order: [
                ["id", "ASC"]
            ],
        };

        if (unpaginated !== 'true') {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            findOptions.limit = parseInt(limit);
            findOptions.offset = offset;
        }

        const { count, rows } = await StockModel.findAndCountAll(findOptions);

        // Mapear los resultados para incluir supplierName en el nivel superior
        const productsWithSupplierName = rows.map(product => ({
            ...product.toJSON(),
            supplierName: product.supplier ? product.supplier.nombre : null
        }));

        res.json({
            products: productsWithSupplierName,
            pagination: unpaginated === 'true'
                ? { total: count, page: 1, limit: count, totalPages: 1 }
                : {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
        });
    } catch (error) {
        console.error("Error al obtener stocks:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;

        // 1. Buscar si el código de barras corresponde a un combo activo
        const combo = await ComboModel.findOne({
            where: { barcode: barcode, is_active: true },
            include: [
                {
                    model: ComboItem,
                    as: 'combo_items',
                    include: [
                        {
                            model: StockModel,
                            as: 'stock',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        if (combo) {
            // Si se encuentra un combo, devolverlo con un tipo específico
            return res.json({ ...combo.toJSON(), type: 'combo' });
        }

        // 2. Si no es un combo, buscar si corresponde a una presentación de producto
        const presentation = await ProductPresentationsModel.findOne({
            where: { barcode },
            include: [
                {
                    model: StockModel,
                    as: 'stock', // Asegúrate que este alias es correcto
                    include: [
                        { model: UnitModel, as: 'unit', attributes: ['name'] },
                        { model: StockCategoryModel, as: 'stockCategory', attributes: ['name'] }
                    ]
                }
            ]
        });

        if (presentation) {
            const presentationJson = presentation.toJSON();
            // Añadir nombres para conveniencia del frontend
            presentationJson.unitName = presentationJson.stock.unit.name;
            presentationJson.categoryName = presentationJson.stock.stockCategory.name;
            // Devolver con un tipo específico
            return res.json({ ...presentationJson, type: 'presentation' });
        }

        // 3. Si no es ni combo ni presentación, buscar un producto base
        const product = await StockModel.findOne({
            where: { barcode, visible: 1 },
            include: [
                { model: UnitModel, as: 'unit', attributes: ['name'] },
                { model: StockCategoryModel, as: 'stockCategory', attributes: ['name'] },
                { model: SupplierModel, as: 'supplier', attributes: ['nombre'] },
                { model: ProductPresentationsModel, as: 'presentations', required: false }
            ]
        });

        if (product) {
            const productJson = product.toJSON();
            // Añadir nombres para conveniencia del frontend
            productJson.unitName = productJson.unit.name;
            productJson.categoryName = productJson.stockCategory.name;
            productJson.supplierName = productJson.supplier ? productJson.supplier.nombre : null;
            // Devolver con un tipo específico
            return res.json({ ...productJson, type: 'product' });
        }

        // 4. Si no se encuentra nada
        res.status(404).json({ message: 'Producto o combo no encontrado' });

    } catch (error) {
        console.error("Error en getProductByBarcode:", error);
        res.status(500).json({ message: 'Error al buscar por código de barras: ' + error.message });
    }
};

// no borrar
export const checkBarcodeGlobalUniqueness = async (req, res) => {
    try {
        const { barcode } = req.params;

        // Check in ProductPresentationsModel
        const existingInPresentations = await ProductPresentationsModel.findOne({
            where: { barcode: barcode }
        });
        if (existingInPresentations) {
            return res.json({ exists: true, source: 'presentation' });
        }

        // Check in ComboModel
        const existingInCombos = await ComboModel.findOne({
            where: { barcode: barcode }
        });
        if (existingInCombos) {
            return res.json({ exists: true, source: 'combo' });
        }

        // Check in StockModel
        const existingInStocks = await StockModel.findOne({
            where: { barcode: barcode }
        });
        if (existingInStocks) {
            return res.json({ exists: true, source: 'stock' });
        }

        return res.json({ exists: false });

    } catch (error) {
        console.error("Error al verificar unicidad global del código de barras:", error);
        res.status(500).json({ message: 'Error al verificar la unicidad del código de barras.', error: error.message });
    }
};

export const updateStock = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { presentations, ...productData } = req.body; // Extract presentations
        const productId = req.params.id;

        // 1. Update the main product data
        await StockModel.update(productData, {
            where: { id: productId },
            transaction
        });

        // 2. Handle presentations: Delete all existing and then recreate from scratch
        // This is a simpler "full replacement" strategy.
        // It's safe because presentations are always sent as a complete list from frontend.
        await ProductPresentationsModel.destroy({
            where: { stock_id: productId },
            transaction
        });

        if (presentations && Array.isArray(presentations) && presentations.length > 0) {
            const presentationsToCreate = presentations.map(pres => ({
                ...pres,
                stock_id: productId // Ensure stock_id is set
            }));
            await ProductPresentationsModel.bulkCreate(presentationsToCreate, { transaction });

        } else {
            console.log("Backend: No new presentations to create.");
        }

        // After updating stock, check for low stock
        await checkLowStockAndLog(productId, req.user ? req.user.id : null, transaction);
        await transaction.commit();
        res.json({ "message": 'Registro actualizado correctamente' })
    } catch (error) {
        await transaction.rollback();
        console.error("Error en updateStock:", error);
        res.status(500).json({ message: error.message })
    }
}

// no borrar
export const deleteStock = async (req, res) => {
    try {
        await StockModel.destroy({
            where: { id: req.params.id }
        })
        res.json({ message: 'Registro eliminado correctamente' })
    } catch (error) {
        res.json({ message: error.message })
    }
}

export const importarStock = async (req, res) => {
    const transaction = await db.transaction();
    try {
        if (!req.file) {
            await transaction.rollback();
            return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const row of data) {
            try {
                const {
                    codigo_barras: barcode,
                    nombre: name,
                    descripcion: description,
                    costo: cost,
                    precio: price,
                    stock,
                    min_stock,
                    tipo_venta = 'unitario', // Default to 'unitario' if not provided unidad: unitName,
                    unidad: unitName,
                    categoria: categoryName,
                    proveedor: supplierName
                } = row;

                if (!name || !unitName || !categoryName) {
                    errors.push(`Fila con datos incompletos (nombre, unidad o categoría): ${JSON.stringify(row)}`);
                    errorCount++;
                    continue;
                }

                // Buscar o crear Unidad
                const [unit, unitCreated] = await UnitModel.findOrCreate({
                    where: { name: unitName },
                    defaults: { name: unitName },
                    transaction
                });
                // Buscar o crear Categoría
                const [category, categoryCreated] = await StockCategoryModel.findOrCreate({
                    where: { name: categoryName },
                    defaults: { name: categoryName },
                    transaction
                });
                // Buscar o crear Proveedor (opcional)
                let supplierId = null;
                if (supplierName) {
                    const [supplier, supplierCreated] = await SupplierModel.findOrCreate({
                        where: { nombre: supplierName },
                        defaults: { nombre: supplierName },
                        transaction
                    });
                    supplierId = supplier.id;
                }

                // Buscar o crear/actualizar Stock
                const [stockItem, created] = await StockModel.findOrCreate({
                    where: { barcode: barcode || null }, // Usar barcode como identificador único si existe
                    defaults: {
                        name,
                        description: description || null,
                        cost: parseFloat(cost) || 0,
                        price: parseFloat(price) || 0,
                        stock: parseInt(stock) || 0,
                        min_stock: parseInt(min_stock) || 0,
                        units_id: unit.id,
                        tipo_venta, // Add tipo_venta to the creation logic units_id: unit.id,
                        category_id: category.id,
                        supplier_id: supplierId,
                        visible: 1 // Por defecto visible
                    },
                    transaction
                });

                if (!created) {
                    // Si no se creó, significa que ya existía, entonces actualizamos
                    await stockItem.update({
                        name,
                        description: description || null,
                        cost: parseFloat(cost) || 0,
                        price: parseFloat(price) || 0,
                        stock: parseInt(stock) || 0, // Actualizar stock existente
                        min_stock: parseInt(min_stock) || 0,
                        units_id: unit.id,
                        category_id: category.id,
                        supplier_id: supplierId,
                        visible: 1
                    }, { transaction });
                    updatedCount++;
                } else {
                    importedCount++;
                }
            } catch (rowError) {
                const errorMessage = `Error procesando fila ${JSON.stringify(row)}: ${rowError.message}`;
                errors.push(errorMessage);
                errorCount++;
                console.error(errorMessage); // LOG: Error por fila
            }
        }

        await transaction.commit();

        // Registrar auditoría
        await logAudit({
            user_id: req.user ? req.user.id : null, // Asume que req.user está disponible si hay autenticación
            action: 'IMPORTAR_STOCK',
            entity_type: 'stock',
            entity_id: null, // No hay un ID de entidad único para la importación masiva
            new_values: { importedCount, updatedCount, errorCount, errors },
            details: `Importación de stock desde Excel. Nuevos: ${importedCount}, Actualizados: ${updatedCount}, Errores: ${errorCount}`
        }, req);

        res.json({
            message: 'Importación de stock finalizada.',
            imported: importedCount,
            updated: updatedCount,
            errors: errorCount,
            details: errors.length > 0 ? errors : 'No se encontraron errores.'
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al importar stock (catch principal):", error);
        res.status(500).json({ message: 'Error al importar stock: ' + error.message });
    }
};

// Landing

export const getAllElements = async (req, res) => {
    try {
        const userPermissions = req.session.usuario?.permisos || [];

        if (userPermissions.length === 0) {
            return res.json([]); // Si no tiene permisos, no ve ninguna tarjeta.
        }

        // 1. Encontrar los IDs de los permisos que tiene el usuario
        const permissions = await PermissionModel.findAll({
            where: {
                nombre: { [Op.in]: userPermissions }
            },
            attributes: ['id']
        });
        const permissionIds = permissions.map(p => p.id);

        if (permissionIds.length === 0) {
            return res.json([]); // Si los nombres de permisos no corresponden a ningun ID, no ve nada.
        }

        // 2. Usar una consulta SQL para obtener los elementos del landing a los que el usuario tiene acceso
        const query = `
            SELECT DISTINCT le.*
            FROM landing_elementos AS le
            JOIN landing_permisos AS lp ON le.id = lp.landing_elemento_id
            WHERE lp.permiso_id IN (:permissionIds)
            ORDER BY le.orden ASC
        `;

        const elements = await db.query(query, {
            replacements: { permissionIds },
            type: db.QueryTypes.SELECT,
            model: ElementLandingModel,
            mapToModel: true
        });

        res.json(elements);

    } catch (error) {
        console.error('Error en getAllElements:', error);
        res.status(500).json({ message: 'Error al obtener los elementos del landing: ' + error.message });
    }
};
// no borrar

export const updateElement = async (req, res) => {
    try {
        await ElementLandingModel.bulkCreate(
            req.body,
            {
                updateOnDuplicate: ['orden']
            }
        )
        res.json({ "message": 'Registro actualizado correctamente' })
    } catch (error) {
        res.json({ message: error.message })
    }
}
// no borrar
export const getCategories = async (req, res) => {
    try {
        const categories = await StockCategoryModel.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        res.status(500).json({ message: 'Error al obtener las categorías: ' + error.message });
    }
}



//no borrar
export const getUnits = async (req, res) => {
    try {
        const units = await UnitModel.findAll({
            order: [['name', 'ASC']]
        });
        res.json(units);
    } catch (error) {
        console.error("Error al obtener las unidades:", error);
        res.status(500).json({ message: 'Error al obtener las unidades: ' + error.message });
    }
}

// Customers Controllers
export const getCustomers = async (req, res) => {
    try {
        const customers = await CustomerModel.findAll({
            order: [['id', 'ASC']]
        });
        res.json(customers);
    } catch (error) {
        res.json({ message: error.message });
    }
};

// Payment Methods Controllers
export const getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentModel.findAll({
            order: [['id', 'ASC']]
        });
        res.json(paymentMethods);
    } catch (error) {
        res.json({ message: error.message });
    }
};

// NUEVO: Obtener todos los métodos de pago con su info de recargo
export const getPaymentSurcharges = async (req, res) => {
    try {
        const paymentMethods = await PaymentModel.findAll({
            order: [['method', 'ASC']]
        });
        res.json(paymentMethods);
    } catch (error) {
        console.error("Error al obtener la configuración de recargos:", error);
        res.status(500).json({ message: 'Error interno al obtener la configuración de recargos.' });
    }
};

// NUEVO: Actualizar la configuración de recargo de un método de pago
export const updatePaymentSurcharge = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id } = req.params;
        const { surcharge_active, surcharge_percentage } = req.body;

        const paymentMethod = await PaymentModel.findByPk(id, { transaction });

        if (!paymentMethod) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Método de pago no encontrado.' });
        }

        const oldValues = {
            surcharge_active: paymentMethod.surcharge_active,
            surcharge_percentage: paymentMethod.surcharge_percentage
        };

        await paymentMethod.update({
            surcharge_active,
            surcharge_percentage
        }, { transaction });

        await logAudit({
            user_id: req.usuario.id,
            action: 'UPDATE_SURCHARGE_CONFIG',
            entity_type: 'payments',
            entity_id: id,
            old_values: oldValues,
            new_values: { surcharge_active, surcharge_percentage },
            details: `Se actualizó el recargo para el método de pago '${paymentMethod.method}'.`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Configuración de recargo actualizada correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al actualizar la configuración de recargo:", error);
        res.status(500).json({ message: 'Error al actualizar la configuración de recargo.' });
    }
};


// Obtener un método de pago por ID
export const getPaymentMethodById = async (req, res) => {
    try {
        const paymentMethod = await PaymentModel.findByPk(req.params.id);
        if (paymentMethod) {
            res.json(paymentMethod);
        } else {
            res.status(404).json({ message: 'Método de pago no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPaymentMethod = async (req, res) => {
    try {
        const newPaymentMethod = await PaymentModel.create(req.body);
        res.json({
            message: 'Método de pago creado correctamente',
            id: newPaymentMethod.id
        });
    } catch (error) {
        console.error("Error al crear método de pago:", error);
        res.status(500).json({ message: error.message });
    }
};

// Actualizar método de pago
export const updatePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const { method, description, active } = req.body;

        const paymentMethod = await PaymentModel.findByPk(id);

        if (!paymentMethod) {
            return res.status(404).json({ message: 'Método de pago no encontrado.' });
        }

        await paymentMethod.update({
            method,
            description,
            active
        });

        res.json({ message: 'Método de pago actualizado correctamente.', paymentMethod });

    } catch (error) {
        console.error("Error al actualizar método de pago:", error);
        res.status(500).json({ message: 'Error al actualizar el método de pago.' });
    }
};

// Eliminar método de pago
export const deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await PaymentModel.destroy({
            where: { id }
        });

        if (deleted) {
            res.json({ message: 'Método de pago eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Método de pago no encontrado.' });
        }

    } catch (error) {
        console.error("Error al eliminar método de pago:", error);
        res.status(500).json({ message: 'Error al eliminar el método de pago.' });
    }
};

//  USUARIO
// crear usuario

// Crear un nuevo usuario de forma segura
export const createUser = async (req, res) => {
    try {
        const { username, password, roleId, nombre, activo } = req.body;

        // 1. Validar que los datos necesarios están presentes
        if (!username || !password || !roleId || !nombre) {
            return res.status(400).json({ message: 'Todos los campos son requeridos: nombre, username, password, roleId.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crear el usuario en la base de datos
        const newUser = await UsuarioModel.create({
            username,
            password: hashedPassword,
            rol_id: roleId,
            nombre,
            activo: activo !== undefined ? activo : true, // Por defecto, activo es true
        });

        // 4. Excluir la contraseña de la respuesta
        const { password: _, ...userWithoutPassword } = newUser.toJSON();

        res.status(201).json({
            message: 'Usuario creado correctamente',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error al crear usuario:", error);
        // Manejar errores de validación de Sequelize (ej. username único)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        res.status(500).json({ message: 'Error interno al crear el usuario.' });
    }
};

// --- Métodos para Roles ---

// Obtener todos los roles
export const getRoles = async (req, res) => {
    try {
        const roles = await RoleModel.findAll();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
    try {
        const role = await RoleModel.findByPk(req.params.id);
        if (role) {
            res.json(role);
        } else {
            res.status(404).json({ message: 'Rol no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo rol
export const createRole = async (req, res) => {
    try {
        const newRole = await RoleModel.create(req.body);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un rol
export const updateRole = async (req, res) => {
    try {
        const [updated] = await RoleModel.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedRole = await RoleModel.findByPk(req.params.id);
            res.json(updatedRole);
        } else {
            res.status(404).json({ message: 'Rol no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un rol
export const deleteRole = async (req, res) => {
    try {
        const deleted = await RoleModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Rol eliminado' });
        } else {
            res.status(404).json({ message: 'Rol no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Métodos para Usuarios ---

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await UsuarioModel.findAll({
            where: {
                id: { [Op.ne]: 1 } // Excluir al super administrador
            },
            attributes: ['id', 'username', 'nombre', 'activo', 'rol_id'],
            include: [{
                model: RoleModel,
                as: 'rol',
                attributes: ['id', 'nombre']
            }],
            order: [['id', 'ASC']]
        });
        res.json(users);
    } catch (error) {
        console.error("Error en getUsers:", error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const user = await UsuarioModel.findByPk(req.params.id, {
            include: [{
                model: RoleModel,
                as: 'rol',
                attributes: ['nombre']
            }]
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, username, password, roleId, activo } = req.body;

        // Regla: No se puede modificar al super administrador
        if (id === '1' || id === 1) {
            return res.status(403).json({ message: 'El super administrador (ID 1) no puede ser modificado.' });
        }

        const updateData = {
            nombre,
            username,
            activo,
            rol_id: roleId
        };

        // Solo actualizar y hashear la contraseña si se proporciona una nueva
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const [updated] = await UsuarioModel.update(updateData, {
            where: { id }
        });

        if (updated) {
            const updatedUser = await UsuarioModel.findByPk(id);
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ message: 'Error al actualizar usuario.', details: error.message });
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = parseInt(req.params.id, 10);
        const requestingUserId = req.usuario.id;

        // Regla 1: No se puede eliminar al super administrador
        if (userIdToDelete === 1) {
            return res.status(403).json({ message: 'El super administrador (ID 1) no puede ser eliminado.' });
        }

        // Regla 2: Un usuario no puede eliminarse a sí mismo
        if (userIdToDelete === requestingUserId) {
            return res.status(403).json({ message: 'No puedes eliminar tu propia cuenta.' });
        }

        // Regla 3: No se puede eliminar al último administrador visible
        const userToDelete = await UsuarioModel.findByPk(userIdToDelete, { include: 'rol' });
        if (userToDelete && userToDelete.rol.nombre === 'Administrador') {
            const adminRole = await RoleModel.findOne({ where: { nombre: 'Administrador' } });
            if (adminRole) {
                const adminCount = await UsuarioModel.count({
                    where: {
                        rol_id: adminRole.id,
                        id: { [Op.ne]: 1 } // Excluir al super admin del conteo
                    }
                });

                if (adminCount <= 1) {
                    return res.status(403).json({ message: 'No se puede eliminar al último administrador del sistema.' });
                }
            }
        }

        const deleted = await UsuarioModel.destroy({
            where: { id: userIdToDelete }
        });

        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: 'Error interno al eliminar el usuario.', details: error.message });
    }
};


// --- Métodos para Ventas (Sales) ---

// Crear una nueva venta (incluye detalles y actualización de stock)

// Helper function to check for low stock and log an audit event
export const checkLowStockAndLog = async (stockId, auditUserId, transaction) => {
    const stockItem = await StockModel.findByPk(stockId, { transaction });
    if (stockItem && stockItem.stock <= stockItem.min_stock) {
        await logAudit({
            user_id: auditUserId, // Use the provided auditUserId
            action: 'ALERTA_STOCK_BAJO',
            entity_type: 'stock',
            entity_id: stockItem.id,
            new_values: { current_stock: stockItem.stock, min_stock: stockItem.min_stock },
            details: `Alerta de stock bajo para el producto ${stockItem.name}. Stock actual: ${stockItem.stock}, Stock mínimo: ${stockItem.min_stock}`
        }, null, transaction); // req is null here as it's an internal call
    }
};

// --- FUNCION MODIFICADA --- //
export const createSale = async (req, res) => {
    const MAX_RETRIES = 3; // cantidad máxima de reintentos
    const BASE_DELAY = 50; // ms (para backoff exponencial)

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const transaction = await db.transaction();
        try {
            const { total_amount, promotion_discount, customer_id, user_id, payments, tempValues, surcharge_amount } = req.body;
            let { total_neto } = req.body;

            // 1. Verificar sesión de caja activa
            const activeSession = await CashSessionsModel.findOne({
                where: { user_id: user_id, status: 'abierta' },
                transaction
            });

            if (!activeSession) {
                await transaction.rollback();
                return res.status(403).json({
                    message: 'No tienes una sesión de caja activa. Por favor, abre una caja antes de registrar una venta.'
                });
            }

            // 2. Validar pagos
            if (!payments || !Array.isArray(payments) || payments.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Se requiere al menos un método de pago.' });
            }

            const totalPaymentsAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

            // Se valida contra total_amount porque los pagos no incluyen el recargo, que se maneja por separado.
            const difference = totalPaymentsAmount - total_amount;

            if (difference < -0.01) { // Se permite una pequeña tolerancia para errores de punto flotante
                await transaction.rollback();
                return res.status(400).json({
                    message: `El monto recibido (${totalPaymentsAmount.toFixed(2)}) es insuficiente para cubrir el total de ${total_amount.toFixed(2)}.`
                });
            }

            // 3. Crear venta principal
            const newSale = await SaleModel.create({
                total_amount,
                promotion_discount,
                surcharge_amount,
                total_neto,
                customer_id,
                user_id,
                cash_session_id: activeSession.id
            }, { transaction });

            // 4. Crear pagos
            for (const payment of payments) {
                await SalePaymentModel.create({
                    sale_id: newSale.id,
                    payment_method_id: payment.payment_method_id,
                    amount: payment.amount
                }, { transaction });

                const paymentMethod = await PaymentModel.findByPk(payment.payment_method_id, { transaction });
                if (paymentMethod && paymentMethod.method &&
                    (paymentMethod.method.toLowerCase().includes('credito') ||
                        paymentMethod.method.toLowerCase().includes('crédito') ||
                        paymentMethod.method.toLowerCase().includes('cuenta corriente'))) {
                    if (customer_id && customer_id !== 1) {
                        const customer = await CustomerModel.findByPk(customer_id, { transaction });
                        if (customer) {
                            const newDebt = parseFloat(customer.debt || 0) + parseFloat(payment.amount);
                            await customer.update({ debt: newDebt }, { transaction });
                        }
                    }
                }
            }

            // 5. Crear detalles de venta y decrementar stock
            if (tempValues && Array.isArray(tempValues)) {
                // Validaciones de stock previas
                for (const item of tempValues) {
                    if (item.is_manual_entry || item.type === 'combo') continue;
                    const stockItem = await StockModel.findByPk(item.stock_id, { transaction });

                    if (!stockItem) {
                        throw new Error(`Producto con ID ${item.stock_id} no fue encontrado.`);
                    }
                    if (!item.force_sale && stockItem.stock < item.quantity) {
                        throw new Error(`Stock insuficiente para el producto "${stockItem.name}".`);
                    }
                    if (stockItem.tipo_venta === 'unitario' && !Number.isInteger(item.quantity)) {
                        throw new Error(`El producto "${stockItem.name}" se vende por unidades enteras.`);
                    }
                    if (stockItem.tipo_venta === 'pesable' && isNaN(parseFloat(item.quantity))) {
                        throw new Error(`Cantidad inválida para el producto pesable "${stockItem.name}".`);
                    }
                }

                // Procesar cada item
                for (const item of tempValues) {
                    if (item.type === 'combo') {
                        // --- Manejo de combos ---
                        await SaleDetailModel.create({
                            sales_Id: newSale.id,
                            combo_id: item.id,
                            quantity: item.quantity,
                            price: item.final_price / item.quantity,
                            cost: 0
                        }, { transaction });

                        const comboItems = await ComboItem.findAll({
                            where: { combo_id: item.id },
                            transaction
                        });

                        for (const comboComponent of comboItems) {
                            const quantityToDecrement = comboComponent.quantity * item.quantity;
                            await StockModel.decrement('stock', {
                                by: quantityToDecrement,
                                where: { id: comboComponent.stock_id },
                                transaction
                            });
                            await checkLowStockAndLog(comboComponent.stock_id, req.user?.id || user_id, transaction);
                        }
                    } else {
                        // --- Productos normales ---
                        const { stock_id, promotion_id, quantity, final_price } = item;
                        let cogs = 0;
                        let stockItem = null;

                        if (stock_id) {
                            stockItem = await StockModel.findByPk(stock_id, { transaction });
                            if (stockItem) cogs = stockItem.cost;
                        }

                        await SaleDetailModel.create({
                            sales_Id: newSale.id,
                            stock_id: item.is_manual_entry ? null : stock_id,
                            promotion_id: promotion_id || null,
                            quantity,
                            price: final_price / quantity,
                            cost: cogs
                        }, { transaction });

                        if (stock_id) {
                            await StockModel.decrement('stock', {
                                by: quantity,
                                where: { id: stock_id },
                                transaction
                            });

                            if (stockItem && stockItem.price !== item.price) {
                                await logAudit({
                                    user_id,
                                    action: 'CAMBIO_PRECIO_MANUAL',
                                    entity_type: 'sale_item',
                                    entity_id: stock_id,
                                    session_id: activeSession.id,
                                    new_values: {
                                        sale_id: newSale.id,
                                        product_name: stockItem.name,
                                        original_price: stockItem.price,
                                        new_price: item.price
                                    },
                                    details: `Cambio de precio para "${stockItem.name}" en venta #${newSale.id}`
                                }, req, transaction);
                            }
                        }

                        if (stock_id && item.force_sale && stockItem.stock - quantity < 0) {
                            await logAudit({
                                user_id,
                                action: 'VENTA_FORZADA_STOCK_NEGATIVO',
                                entity_type: 'stock',
                                entity_id: stock_id,
                                new_values: { product_name: stockItem.name, quantity, stock_before: stockItem.stock, stock_after: stockItem.stock - quantity },
                                details: `Venta forzada de ${quantity} unidades de ${stockItem.name}.`
                            }, req, transaction);
                        }

                        if (item.is_manual_entry) {
                            await logAudit({
                                user_id,
                                action: 'VENTA_PRODUCTO_MANUAL',
                                entity_type: 'sale_item',
                                entity_id: null,
                                new_values: {
                                    product_name: item.name,
                                    quantity: item.quantity,
                                    price: item.price,
                                    description: item.description || 'N/A'
                                },
                                details: `Producto manual "${item.name}" agregado a la venta`
                            }, req, transaction);
                        }

                        if (stock_id) {
                            await checkLowStockAndLog(stock_id, req.user?.id || user_id, transaction); // Usar user_id de la venta como fallback
                        }
                    }
                }
            }

            await transaction.commit();
            return res.json({ message: 'Venta registrada correctamente', id: newSale.id });

        } catch (error) {
            await transaction.rollback();

            // 🔑 DETECCIÓN DE DEADLOCK
            if ((error.original && error.original.code === 'ER_LOCK_DEADLOCK') ||
                (error.original && error.original.code === 'ER_LOCK_WAIT_TIMEOUT')) {
                console.warn(`⚠️ Deadlock detectado en createSale. Intento ${attempt} de ${MAX_RETRIES}`);
                if (attempt < MAX_RETRIES) {
                    // Backoff exponencial
                    await new Promise(r => setTimeout(r, BASE_DELAY * attempt));
                    continue; // reintentar
                }
            }

            // Manejo específico para errores de stock insuficiente
            if (error.message.includes('Stock insuficiente')) {
                console.error("❌ createSale: Error de validación de stock:", error.message);
                return res.status(400).json({ error: error.message });
            }

            console.error("❌ createSale: Error fatal, sin reintento:", error);
            return res.status(500).json({ error: error.message });
        }
    }
};


// Obtener todas las ventas (con opción a incluir detalles básicos)
export const getSales = async (req, res) => {
    try {
        const sales = await SaleModel.findAll({
            include: [ // Incluir datos básicos de relaciones si se necesitan en la lista
                { model: CustomerModel, attributes: ['id', /* 'name', ... */] }, // Ajusta atributos según necesites
                { model: UsuarioModel, attributes: ['id', 'username'] },
                // { model: PaymentModel, attributes: ['id', 'method'] } // Descomentar si es necesario
            ],
            order: [['createdAt', 'DESC']] // Ordenar por fecha descendente
        });
        res.json(sales);
    } catch (error) {
        console.error("Error al obtener las ventas:", error);
        res.status(500).json({ message: error.message || 'Error al obtener las ventas.' });
    }
};

// Obtener los detalles completos de una venta específica
export const getSaleDetails = async (req, res) => {
    try {
        const saleId = req.params.id;
        const sale = await SaleModel.findByPk(saleId, {
            include: [
                { model: CustomerModel }, // Datos completos del cliente
                { model: UsuarioModel },   // Datos completos del usuario (cajero)
                {
                    model: SaleDetailModel,
                    include: [ // Anidar detalles del producto y promoción dentro de cada item de venta
                        { model: StockModel }, // Datos completos del producto
                        { model: PromotionModel } // Datos completos de la promoción
                    ]
                },
                {
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    attributes: ['amount'], // Pedir el monto de la tabla intermedia
                    include: [{
                        model: PaymentModel,
                        as: 'payment',
                        attributes: ['method']
                    }]
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        // Mapear los detalles para asegurar que la cantidad se incluya siempre
        const saleJSON = sale.toJSON();
        saleJSON.sale_details = saleJSON.sale_details.map(detail => ({
            ...detail,
            quantity: detail.quantity // Asegurar que la cantidad esté presente
        }));


        res.json(saleJSON);
    } catch (error) {
        console.error("Error al obtener detalles de la venta:", error);
        res.status(500).json({ message: error.message || 'Error al obtener los detalles de la venta.' });
    }
};

// Crear detalles de venta (similar a createPurchasesDetails)


export const getSalesDetails = async (req, res) => {
    try {
        const {
            page = 0,
            limit = 10,
            startDate,
            endDate,
            productId,
            supplierId,
        } = req.query;

        let whereClause = {};
        let saleWhereClause = {};
        let stockIncludeWhereClause = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            saleWhereClause.createdAt = {
                [Op.between]: [start, end]
            };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            saleWhereClause.createdAt = {
                [Op.gte]: start
            };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            saleWhereClause.createdAt = {
                [Op.lte]: end
            };
        }

        if (productId) {
            whereClause.stock_id = productId;
        }

        if (supplierId) {
            stockIncludeWhereClause.supplier_id = supplierId;
        }

        const offset = parseInt(page) * parseInt(limit);

        const { count, rows } = await SaleDetailModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: SaleModel,
                    as: 'sale',
                    where: saleWhereClause,
                    required: Object.keys(saleWhereClause).length > 0,
                    include: [
                        {
                            model: UsuarioModel,
                            as: 'usuario',
                            attributes: ['username']
                        }
                    ]
                },
                {
                    model: StockModel,
                    as: 'stock',
                    attributes: ['id', 'barcode', 'name', 'description', 'price', 'cost', 'stock', 'min_stock', 'supplier_id', 'visible', 'createdAt', 'updatedAt', 'category_id', 'units_id'],
                    where: stockIncludeWhereClause,
                    required: Object.keys(stockIncludeWhereClause).length > 0,
                    include: [
                        {
                            model: SupplierModel,
                            attributes: ['nombre']
                        }
                    ]
                }
            ],
            order: [
                [{ model: SaleModel, as: 'sale' }, 'createdAt', 'DESC']
            ],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({ rows, count });
    } catch (error) {
        console.error('Error getting sales details:', error);
        res.status(500).json({ message: error.message });
    }
};

// Eliminar una venta (para manejo de transacciones fallidas)
export const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.id;

        // Primero eliminar los detalles de la venta si existen
        await SaleDetailModel.destroy({
            where: { sales_Id: saleId }
        });

        // Luego eliminar la venta principal
        await SaleModel.destroy({
            where: { id: saleId }
        });

        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        res.status(500).json({ message: error.message });
    }
};

// login de usuario

export const loginUsu = async (req, res) => {

    try {
        const login = await UsuarioModel.findAll({
            where: {
                username: req.params.username,
            },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        });
        if (login.length === 0) {
            let respuesta = ({ ...login, error: "No existe el usuario, debe darse de alta", pass: "sin Pass" });
            res.json(respuesta);
        } else {

            res.json(login[0].dataValues)
        }


    } catch (error) {
        console.log({ error })
    }
}

// --- Métodos para Sesiones de Caja (Cash Sessions) ---

// Abrir una nueva sesión de caja
export const openCashSession = async (req, res) => {
    try {
        const { user_id, opening_amount } = req.body;

        // Verificar que no haya una sesión abierta para este usuario
        const existingSession = await CashSessionsModel.findOne({
            where: {
                user_id: user_id,
                status: 'abierta'
            },
            raw: true // Asegura que el resultado sea un objeto de datos plano
        });

        if (existingSession) {
            return res.status(400).json({
                error: 'Ya existe una sesión de caja abierta para este usuario',
                session: existingSession
            });
        }

        // Crear nueva sesión de caja
        const newSession = await CashSessionsModel.create({
            user_id,
            opening_amount,
            opened_at: new Date(),
            status: 'abierta'
        }, { ignoreDuplicates: false });

        // Registrar auditoría
        await logAudit({
            user_id,
            action: 'ABRIR_SESION_CAJA',
            entity_type: 'cash_session',
            entity_id: newSession.id,
            new_values: {
                opening_amount,
                status: 'abierta'
            },
            details: `Apertura de sesión de caja con monto inicial: ${opening_amount}`
        }, req);
        res.status(201).json({ message: 'Sesión de caja abierta correctamente', session: newSession });
    } catch (error) {
        console.error("Error al abrir sesión de caja:", error);
        res.status(500).json({ message: 'Error al abrir la sesión de caja: ' + error.message });
    }
};

export const directCloseSessionByAdmin = async (req, res) => {
    const t = await db.transaction(); // Use db.transaction()
    try {
        const { session_id } = req.params; // Changed from 'id' to 'session_id'
        const { declared_amount, notes } = req.body;
        const adminUserId = req.usuario.id; // Assuming req.usuario is set by auth middleware


        const session = await CashSessionsModel.findByPk(session_id, { transaction: t }); // Use session_id here

        if (!session) {
            await t.rollback();
            return res.status(404).json({ message: 'Sesión de caja no encontrada.' });
        }

        if (session.status === 'cerrada') {
            await t.rollback();
            return res.status(400).json({ message: 'La sesión ya está cerrada.' });
        }

        // Calcular el total de ventas de la sesión
        const sales = await SaleModel.findAll({ // Use SaleModel
            where: { cash_session_id: session.id },
            attributes: [
                [db.fn('SUM', db.col('total_neto')), 'totalSales'] // Use db.fn and db.col
            ],
            transaction: t
        });
        const totalSales = parseFloat(sales[0].dataValues.totalSales || 0);

        // Calcular movimientos de efectivo (ingresos y egresos)
        const movements = await CashSessionMovementModel.findAll({ // Use CashSessionMovementModel
            where: { cash_session_id: session.id },
            attributes: [
                [db.fn('SUM', db.literal('CASE WHEN type = \'ingreso\' THEN amount ELSE 0 END')), 'totalIncome'],
                [db.fn('SUM', db.literal('CASE WHEN type = \'egreso\' THEN amount ELSE 0 END')), 'totalExpense']
            ],
            transaction: t
        });
        const totalIncome = parseFloat(movements[0].dataValues.totalIncome || 0);
        const totalExpense = parseFloat(movements[0].dataValues.totalExpense || 0);

        // Calcular ventas en efectivo (cashSales)
        const cashSalesResult = await SalePaymentModel.findAll({
            attributes: [
                [db.fn('SUM', db.col('sale_payment.amount')), 'cashSales']
            ],
            include: [{
                model: SaleModel,
                as: 'sale',
                attributes: [],
                where: { cash_session_id: session.id }, // Moved the filter here
                required: true // INNER JOIN
            }, {
                model: PaymentModel,
                as: 'payment',
                attributes: [],
                where: { method: 'Efectivo' }, // Assuming 'Efectivo' is the method name for cash
                required: true // INNER JOIN
            }],
            group: ['sale.cash_session_id'], // Group by session_id to get one sum
            transaction: t
        });
        const cashSales = parseFloat(cashSalesResult[0]?.dataValues?.cashSales || 0);


        // Calcular el monto esperado en caja
        const expectedCash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;
        const finalDiscrepancy = declared_amount - expectedCash;

        session.status = 'cerrada';
        session.cashier_declared_amount = declared_amount;
        session.admin_verified_amount = declared_amount;
        session.final_discrepancy = finalDiscrepancy;
        session.closed_at = new Date();
        session.verified_at = new Date();
        session.closed_by_user_id = session.user_id; // El usuario original que abrió la caja
        session.verified_by_admin_id = adminUserId; // El administrador que la cierra
        session.total_sales_at_close = totalSales;
        session.admin_notes = notes || 'Cierre directo por administrador.';

        await session.save({ transaction: t });

        // Registrar en el log de auditoría
        await logAudit({
            user_id: adminUserId,
            action: 'CIERRE_DIRECTO_CAJA_ADMIN',
            entity_type: 'cash_session',
            entity_id: session.id,
            old_values: { status: session.previous('status') },
            new_values: { status: session.status, declared: declared_amount, final_discrepancy: finalDiscrepancy },
            details: `Administrador cerró la caja de ${session.user_id === adminUserId ? 'su propia caja' : `el cajero ${session.user_id}`} directamente. Declarado: ${declared_amount}, Diferencia Final: ${finalDiscrepancy}`
        }, req, t); // Pass req and transaction to logAudit

        await t.commit();
        res.status(200).json({ message: 'Caja cerrada directamente con éxito', session });
    } catch (error) {
        await t.rollback();
        console.error('Error al cerrar la caja directamente:', error);
        res.status(500).json({ message: error.message });
    }
};


// --- NUEVO FLUJO DE CIERRE DE CAJA EN 2 PASOS ---

// Paso 1: Obtener el resumen para el cierre (para el cajero)
export const getSummaryForClose = async (req, res) => {
    try {
        const { session_id } = req.params;
        const session = await CashSessionsModel.findByPk(session_id);

        if (!session || session.status !== 'abierta') {
            return res.status(404).json({ message: 'No se encontró una sesión de caja abierta con ese ID.' });
        }

        // Obtener todas las ventas de esta sesión
        const sales = await SaleModel.findAll({
            where: { cash_session_id: session.id },
            include: [{
                model: SalePaymentModel,
                as: 'sale_payments',
                include: [{
                    model: PaymentModel,
                    as: 'payment',
                    attributes: ['method']
                }]
            }]
        });

        // Calcular totales por método de pago
        const sales_by_method = {};
        let total_sales = 0;
        sales.forEach(sale => {
            total_sales += parseFloat(sale.total_neto);
            (sale.sale_payments || []).forEach(payment => {
                const methodName = payment.payment?.method || 'Desconocido';
                sales_by_method[methodName] = (sales_by_method[methodName] || 0) + parseFloat(payment.amount);
            });
        });

        // Obtener movimientos de caja para la sesión actual
        const movements = await CashSessionMovementModel.findAll({ where: { cash_session_id: session.id } });

        const totalIncome = movements
            .filter(m => m.type === 'ingreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        const totalExpense = movements
            .filter(m => m.type === 'egreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        res.json({
            opening_amount: parseFloat(session.opening_amount),
            sales_by_method,
            total_sales,
            totalIncome,
            totalExpense
        });

    } catch (error) {
        console.error("Error en getSummaryForClose:", error);
        res.status(500).json({ error: error.message });
    }
};

// Paso 2: Iniciar el cierre (Cajero o Admin para su propia caja)
export const initiateClosure = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { session_id } = req.params;
        const { cashier_declared_amount, notes } = req.body;
        const user = req.user; // Contiene id, rol, etc.

        const session = await CashSessionsModel.findByPk(session_id, { transaction });

        if (!session || session.status !== 'abierta') {
            await transaction.rollback();
            return res.status(404).json({ message: 'La sesión no está abierta o no existe.' });
        }

        // --- Recalcular el resumen para asegurar datos frescos ---
        const sales = await SaleModel.findAll({ where: { cash_session_id: session.id }, include: [{ model: SalePaymentModel, as: 'sale_payments', include: [{ model: PaymentModel, as: 'payment' }] }], transaction });
        const cashSales = sales.reduce((sum, sale) => {
            (sale.sale_payments || []).forEach(p => {
                if (p.payment?.method?.toLowerCase().includes('efectivo')) {
                    sum += parseFloat(p.amount);
                }
            });
            return sum;
        }, 0);
        const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0);

        const movements = await CashSessionMovementModel.findAll({ where: { cash_session_id: session.id }, transaction });
        const totalIncome = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);
        const totalExpense = movements.filter(m => m.type === 'egreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);
        const expected_cash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;
        // --- Fin del recálculo ---

        // --- Lógica de Cierre Directo para Administradores ---
        const isAdminClosingOwnSession = (user.rol_nombre === 'Administrador' || user.rol_nombre === 'Gerente') && session.user_id === user.id;

        if (isAdminClosingOwnSession) {
            const final_discrepancy = parseFloat(cashier_declared_amount) - expected_cash;

            await session.update({
                status: 'cerrada',
                cashier_declared_amount, // El admin declara su propio monto
                admin_verified_amount: cashier_declared_amount, // Se auto-verifica
                final_discrepancy,
                notes,
                total_sales_at_close: totalSales,
                closed_by_user_id: user.id,
                verified_by_admin_id: user.id, // Se auto-verifica
                closed_at_user: new Date(),
                verified_at: new Date(),
                verified_at: new Date() // This is the correct field
            }, { transaction });

            await logAudit({
                user_id: user.id,
                action: 'CIERRE_DIRECTO_CAJA_ADMIN',
                entity_type: 'cash_session',
                entity_id: session.id,
                new_values: { status: 'cerrada', declared: cashier_declared_amount, final_discrepancy },
                details: `Administrador cerró su propia caja directamente. Declarado: ${cashier_declared_amount}, Diferencia Final: ${final_discrepancy}`
            }, req, transaction);

            await transaction.commit();
            return res.json({ message: 'Sesión de caja cerrada y verificada directamente.' });
        }

        // --- Flujo Normal para Cajeros ---
        const preliminary_discrepancy = parseFloat(cashier_declared_amount) - expected_cash;

        await session.update({
            status: 'pendiente_cierre',
            cashier_declared_amount,
            notes,
            total_sales_at_close: totalSales,
            preliminary_discrepancy,
            closed_by_user_id: user.id,
            closed_at_user: new Date()
        }, { transaction });

        await logAudit({
            user_id: user.id,
            action: 'INICIO_CIERRE_CAJA',
            entity_type: 'cash_session',
            entity_id: session.id,
            new_values: { status: 'pendiente_cierre', declared: cashier_declared_amount, discrepancy: preliminary_discrepancy },
            details: `Cajero inició cierre. Declarado: ${cashier_declared_amount}, Diferencia Preliminar: ${preliminary_discrepancy}`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Cierre de caja iniciado. Pendiente de revisión por administrador.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error en initiateClosure:", error);
        res.status(500).json({ error: error.message });
    }
};

// Paso 3: Finalizar el cierre (Admin)
export const finalizeClosure = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { session_id } = req.params;
        const { admin_verified_amount, admin_notes } = req.body;
        const admin_id = req.user.id;

        const session = await CashSessionsModel.findByPk(session_id, { transaction });

        if (!session || session.status !== 'pendiente_cierre') {
            await transaction.rollback();
            return res.status(404).json({ message: 'La sesión no está pendiente de cierre.' });
        }

        // Recalcular ventas en efectivo para el cálculo final
        const sales = await SaleModel.findAll({ where: { cash_session_id: session.id }, include: [{ model: SalePaymentModel, as: 'sale_payments', include: [{ model: PaymentModel, as: 'payment' }] }], transaction });
        const cashSales = sales.reduce((sum, sale) => {
            (sale.sale_payments || []).forEach(p => {
                if (p.payment?.method?.toLowerCase().includes('efectivo')) {
                    sum += parseFloat(p.amount);
                }
            });
            return sum;
        }, 0);

        // Obtener movimientos de caja para la sesión actual
        const movements = await CashSessionMovementModel.findAll({ where: { cash_session_id: session.id }, transaction });

        const totalIncome = movements
            .filter(m => m.type === 'ingreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        const totalExpense = movements
            .filter(m => m.type === 'egreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        const expected_cash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;
        const final_discrepancy = parseFloat(admin_verified_amount) - expected_cash;

        // Actualizar la sesión para cerrarla definitivamente
        await session.update({
            status: 'cerrada',
            admin_verified_amount,
            final_discrepancy,
            verified_by_admin_id: admin_id,
            verified_at: new Date(),
            verified_at: new Date(), // This is the correct field
            notes: `${session.notes || ''}\n\nVerificación Admin: ${admin_notes || 'Sin notas.'}`
        }, { transaction });

        // Registrar auditoría
        await logAudit({
            user_id: admin_id,
            action: 'FINALIZAR_CIERRE_CAJA',
            entity_type: 'cash_session',
            entity_id: session.id,
            new_values: { status: 'cerrada', verified_amount: admin_verified_amount, final_discrepancy },
            details: `Admin finalizó cierre. Verificado: ${admin_verified_amount}, Diferencia Final: ${final_discrepancy}`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Sesión de caja cerrada y verificada correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error en finalizeClosure:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener sesión de caja activa del usuario
export const getActiveCashSession = async (req, res) => {
    const { user_id } = req.params;
    console.log(`[Backend] getActiveCashSession: Recibida solicitud para user_id: ${user_id}`);
    try {
        const session = await CashSessionsModel.findOne({
            where: {
                user_id: user_id,
                status: 'abierta'
            },
            include: [{
                model: UsuarioModel,
                as: 'usuario',
                attributes: ['id', 'username', 'rol_id'],
                include: [{
                    model: RoleModel,
                    as: 'rol',
                    attributes: ['nombre']
                }]
            }]
        });

        console.log(`[Backend] getActiveCashSession: Resultado de findOne para user_id ${user_id}: ${session ? 'Sesión encontrada' : 'No se encontró sesión'}`);
        if (session) {
            console.log(`[Backend] getActiveCashSession: Sesión encontrada - ID: ${session.id}, Status: ${session.status}`);
        }

        if (!session) {
            console.log(`[Backend] getActiveCashSession: No se encontró sesión activa para user_id: ${user_id}`);
            return res.status(200).json({ hasActiveSession: false, session: null });
        }

        console.log(`[Backend] getActiveCashSession: Sesión activa encontrada para user_id: ${user_id}, ID de sesión: ${session.id}`);
        // Calcular el current_cash si la sesión está abierta
        const movements = await CashSessionMovementModel.findAll({
            where: { cash_session_id: session.id }
        });

        // Calcular ventas en efectivo para la sesión
        const cashSalesResult = await SalePaymentModel.findOne({
            attributes: [
                [db.fn('SUM', db.col('amount')), 'totalCashSales']
            ],
            include: [
                {
                    model: SaleModel,
                    as: 'sale',
                    attributes: [],
                    where: { cash_session_id: session.id },
                    required: true
                },
                {
                    model: PaymentModel,
                    as: 'payment',
                    attributes: [],
                    where: { method: 'Efectivo' },
                    required: true
                }
            ],
            raw: true
        });
        const cashSales = parseFloat(cashSalesResult?.totalCashSales || 0);

        let totalIngresos = 0;
        let totalEgresos = 0;

        movements.forEach(movement => {
            if (movement.type === 'ingreso') {
                totalIngresos += parseFloat(movement.amount);
            } else if (movement.type === 'egreso') {
                totalEgresos += parseFloat(movement.amount);
            }
        });

        const currentCash = parseFloat(session.opening_amount) + cashSales + totalIngresos - totalEgresos;

        return res.status(200).json({
            hasActiveSession: true,
            session: {
                ...session.toJSON(),
                current_cash: currentCash
            }
        });

    } catch (error) {
        console.error("Error al obtener sesión de caja activa:", error);
        return res.status(500).json({ message: "Error interno del servidor al obtener sesión de caja activa." });
    }
};

// Obtener historial de sesiones de caja
// Obtener historial de sesiones de caja
export const getCashSessionHistory = async (req, res) => {
    try {
        const { user_id, status, start_date, end_date, final_discrepancy, page = 1, limit = 10 } = req.query;
        const requestingUser = req.usuario;

        let whereClause = {};

        if (requestingUser.rol_nombre === 'Cajero') { // Changed from .rol to .rol_nombre
            whereClause.user_id = requestingUser.id;
        } else if (user_id) {
            whereClause.user_id = user_id;
        }

        if (status) {
            const statusArray = status.split(',').map(s => s.trim());
            whereClause.status = { [Op.in]: statusArray };
        }

        if (start_date && end_date) {
            whereClause.opened_at = {
                [Op.between]: [new Date(start_date), (() => {
                    const [year, month, day] = end_date.split('-').map(Number);
                    const d = new Date(year, month - 1, day);
                    d.setHours(23, 59, 59, 999);
                    return d;
                })()]
            };
        }

        if (final_discrepancy) {
            if (final_discrepancy === 'positiva') whereClause.final_discrepancy = { [Op.gt]: 0 };
            else if (final_discrepancy === 'negativa') whereClause.final_discrepancy = { [Op.lt]: 0 };
            else if (final_discrepancy === 'nula') whereClause.final_discrepancy = 0;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await CashSessionsModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['id', 'username'],
                    include: [{ model: RoleModel, as: 'rol', attributes: ['nombre'], required: true }]
                }
            ],
            order: [['opened_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // Recalcular dinámicamente los montos para cada sesión
        const detailedSessions = await Promise.all(rows.map(async (session) => {
            const plainSession = session.toJSON();

            // Safely access role name
            if (session.usuario && session.usuario.rol) {
                plainSession.usuario.rol_nombre = session.usuario.rol.nombre;
            } else {
                plainSession.usuario.rol_nombre = 'Desconocido'; // Fallback for missing role
            }

            // 1. Calcular ventas y desglosar por método de pago
            const sales = await SaleModel.findAll({
                where: { cash_session_id: session.id },
                include: [{
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    include: [{ model: PaymentModel, as: 'payment' }]
                }]
            });

            const paymentMethodsSummary = {};
            sales.forEach(sale => {
                (sale.sale_payments || []).forEach(p => {
                    const methodName = p.payment?.method || 'Desconocido';
                    paymentMethodsSummary[methodName] = (paymentMethodsSummary[methodName] || 0) + parseFloat(p.amount);
                });
            });
            plainSession.payment_methods = paymentMethodsSummary;

            const cashSales = paymentMethodsSummary['Efectivo'] || 0;

            // 2. Calcular movimientos de caja
            const movements = await CashSessionMovementModel.findAll({ where: { cash_session_id: session.id } });
            const totalIncome = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);
            const totalExpense = movements.filter(m => m.type === 'egreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);

            // 3. Calcular monto esperado
            const expected_cash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;

            // 4. Recalcular discrepancias
            plainSession.expected_cash = expected_cash;
            if (plainSession.status === 'pendiente_cierre' || plainSession.status === 'cerrada') {
                plainSession.preliminary_discrepancy = parseFloat(plainSession.cashier_declared_amount) - expected_cash;
            }
            if (plainSession.status === 'cerrada' && plainSession.admin_verified_amount !== null) {
                plainSession.final_discrepancy = parseFloat(plainSession.admin_verified_amount) - expected_cash;
            }

            // 5. Asignar el total de ventas correcto
            plainSession.total_sales_at_close = sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0);


            return plainSession;
        }));

        res.json({
            sessions: detailedSessions,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("Error al obtener historial de sesiones:", error);
        res.status(500).json({ error: error.message });
    }
};
// export const getCashSessionHistory = async (req, res) => {
//     try {
//         const { user_id, status, start_date, end_date, final_discrepancy, page = 1, limit = 10 } = req.query;
//         const requestingUser = req.user;

//         let whereClause = {};

//         if (requestingUser.rol === 'Cajero') {
//             whereClause.user_id = requestingUser.id;
//         } else if (user_id) {
//             whereClause.user_id = user_id;
//         }

//         if (status) {
//             const statusArray = status.split(',').map(s => s.trim());
//             whereClause.status = { [Op.in]: statusArray };
//         }

//         if (start_date && end_date) {
//             whereClause.opened_at = {
//                 [Op.between]: [new Date(start_date), (() => {
//                     const [year, month, day] = end_date.split('-').map(Number);
//                     const d = new Date(year, month - 1, day);
//                     d.setHours(23, 59, 59, 999);
//                     return d;
//                 })()]
//             };
//         }

//         if (final_discrepancy) {
//             if (final_discrepancy === 'positiva') whereClause.final_discrepancy = { [Op.gt]: 0 };
//             else if (final_discrepancy === 'negativa') whereClause.final_discrepancy = { [Op.lt]: 0 };
//             else if (final_discrepancy === 'nula') whereClause.final_discrepancy = 0;
//         }

//         const offset = (parseInt(page) - 1) * parseInt(limit);

//         const { count, rows } = await CashSessionsModel.findAndCountAll({
//             where: whereClause,
//             include: [
//                 {
//                     model: UsuarioModel,
//                     attributes: ['id', 'username'],
//                     include: [{ model: RoleModel, as: 'rol', attributes: ['nombre'], required: true }]
//                 }
//             ],
//             order: [['opened_at', 'DESC']],
//             limit: parseInt(limit),
//             offset: offset
//         });

//         // Recalcular dinámicamente los montos para cada sesión
//         const detailedSessions = await Promise.all(rows.map(async (session) => {
//             const plainSession = session.toJSON();

//             // 1. Calcular ventas y desglosar por método de pago
//             const sales = await SaleModel.findAll({
//                 where: { cash_session_id: session.id },
//                 include: [{
//                     model: SalePaymentModel,
//                     as: 'sale_payments',
//                     include: [{ model: PaymentModel, as: 'payment' }]
//                 }]
//             });

//             const paymentMethodsSummary = {};
//             sales.forEach(sale => {
//                 (sale.sale_payments || []).forEach(p => {
//                     const methodName = p.payment?.method || 'Desconocido';
//                     paymentMethodsSummary[methodName] = (paymentMethodsSummary[methodName] || 0) + parseFloat(p.amount);
//                 });
//             });
//             plainSession.payment_methods = paymentMethodsSummary;

//             const cashSales = paymentMethodsSummary['Efectivo'] || 0;

//             // 2. Calcular movimientos de caja
//             const movements = await CashSessionMovementModel.findAll({ where: { cash_session_id: session.id } });
//             const totalIncome = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);
//             const totalExpense = movements.filter(m => m.type === 'egreso').reduce((sum, m) => sum + parseFloat(m.amount), 0);

//             // 3. Calcular monto esperado
//             const expected_cash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;

//             // 4. Recalcular discrepancias
//             plainSession.expected_cash = expected_cash;
//             if (plainSession.status === 'pendiente_cierre' || plainSession.status === 'cerrada') {
//                 plainSession.preliminary_discrepancy = parseFloat(plainSession.cashier_declared_amount) - expected_cash;
//             }
//             if (plainSession.status === 'cerrada' && plainSession.admin_verified_amount !== null) {
//                 plainSession.final_discrepancy = parseFloat(plainSession.admin_verified_amount) - expected_cash;
//             }

//             // 5. Asignar el total de ventas correcto
//             plainSession.total_sales_at_close = sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0);


//             return plainSession;
//         }));

//         res.json({
//             sessions: detailedSessions,
//             pagination: {
//                 total: count,
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 totalPages: Math.ceil(count / limit)
//             }
//         });
//     } catch (error) {
//         console.error("Error al obtener historial de sesiones:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// Obtener resumen de ventas de la sesión actual
export const getCurrentSessionSummary = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Buscar sesión activa
        const activeSession = await CashSessionsModel.findOne({
            where: {
                user_id: user_id,
                status: 'abierta'
            }
        });

        if (!activeSession) {
            return res.status(404).json({ message: 'No hay sesión de caja activa' });
        }

        // Obtener ventas de la sesión actual
        const sales = await SaleModel.findAll({
            where: {
                user_id: user_id,
                createdAt: {
                    [Op.gte]: activeSession.opened_at,
                    [Op.lte]: new Date()
                }
            },
            include: [
                {
                    model: CustomerModel,
                    attributes: ['name']
                },
                {
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    attributes: ['amount'],
                    include: [{
                        model: PaymentModel,
                        as: 'payment',
                        attributes: ['method']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calcular totales por método de pago
        const paymentMethodTotals = {};
        sales.forEach(sale => {
            const plainSale = sale.toJSON(); // Convertir a objeto plano
            (plainSale.sale_payments || []).forEach(sp => {
                const methodName = sp.payment?.method || 'Desconocido';
                paymentMethodTotals[methodName] = (paymentMethodTotals[methodName] || 0) + parseFloat(sp.amount);
            });
        });

        // Calcular totales
        const summary = {
            session: activeSession,
            sales_count: sales.length,
            total_sales: sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0),
            total_discounts: sales.reduce((sum, sale) => sum + parseFloat(sale.promotion_discount || 0), 0),
            sales: sales,
            payment_method_totals: paymentMethodTotals
        };

        res.json(summary);
    } catch (error) {
        console.error("Error al obtener resumen de sesión:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener resumen detallado de una sesión específica
export const getCashSessionSummary = async (req, res) => {
    try {
        const { session_id } = req.params;

        // Buscar la sesión específica
        const session = await CashSessionsModel.findByPk(session_id, {
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['id', 'username'],
                    include: [{
                        model: RoleModel,
                        as: 'rol',
                        attributes: ['nombre']
                    }]
                },
                {
                    model: CashSessionMovementModel,
                    as: 'movements',
                    attributes: ['type', 'amount', 'description', 'createdAt'],
                    order: [['createdAt', 'ASC']]
                }
            ]
        });

        if (!session) {
            return res.status(404).json({ message: 'Sesión de caja no encontrada' });
        }

        // Obtener ventas de esta sesión específica
        const sales = await SaleModel.findAll({
            where: {
                cash_session_id: session.id, // <--- ESTA ES LA CORRECCIÓN CLAVE
                createdAt: {
                    [Op.gte]: session.opened_at,
                    [Op.lte]: session.closed_at || new Date()
                }
            },
            include: [
                {
                    model: CustomerModel,
                    attributes: ['name']
                },
                {
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    attributes: ['amount'],
                    include: [{
                        model: PaymentModel,
                        as: 'payment',
                        attributes: ['method']
                    }]
                },
                {
                    model: SaleDetailModel,
                    include: [
                        {
                            model: StockModel,
                            attributes: ['name', 'price']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calcular totales y estadísticas detalladas
        const totalIncome = session.movements
            .filter(m => m.type === 'ingreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        const totalExpense = session.movements
            .filter(m => m.type === 'egreso')
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        const summary = {
            ...session.toJSON(),
            sales_count: sales.length,
            total_sales: sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0),
            total_discounts: sales.reduce((sum, sale) => sum + parseFloat(sale.promotion_discount || 0), 0),
            sales: sales,
            totalIncome,
            totalExpense,
            // Estadísticas adicionales
            average_sale: sales.length > 0 ? sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0) / sales.length : 0,
            payment_methods: sales.reduce((acc, sale) => {
                const plainSale = sale.toJSON();
                if (!plainSale.sale_payments) {
                    return acc;
                }

                plainSale.sale_payments.forEach(p => {
                    const method = p.payment?.method || 'Desconocido';
                    acc[method] = (acc[method] || 0) + parseFloat(p.amount);
                });

                const surchargeAmount = parseFloat(plainSale.surcharge_amount || 0);
                if (surchargeAmount > 0) {
                    const nonCashPayment = plainSale.sale_payments.find(p => p.payment?.method !== 'Efectivo');
                    if (nonCashPayment) {
                        const method = nonCashPayment.payment.method;
                        acc[method] = (acc[method] || 0) + surchargeAmount;
                    } else {
                        if (plainSale.sale_payments.length > 0) {
                            const method = plainSale.sale_payments[0].payment?.method || 'Desconocido';
                            acc[method] = (acc[method] || 0) + surchargeAmount;
                        }
                    }
                }

                return acc;
            }, {}),
            hourly_sales: sales.reduce((acc, sale) => {
                const hour = new Date(sale.createdAt).getHours();
                acc[hour] = (acc[hour] || 0) + 1;
                return acc;
            }, {})
        };

        res.json(summary);
    } catch (error) {
        console.error("Error al obtener resumen de sesión:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- Métodos para Auditoría ---

// Obtener logs de auditoría con filtros
export const getAuditLogs = async (req, res) => {
    try {
        const {
            user_id,
            action,
            entity_type,
            start_date,
            end_date,
            session_id, // Nuevo parámetro
            page = 1,
            limit = 50
        } = req.query;

        let whereClause = {};

        if (user_id) {
            whereClause.user_id = user_id;
        }

        if (action) {
            whereClause.action = action;
        }

        if (entity_type) {
            whereClause.entity_type = entity_type;
        }

        if (session_id) { // Nuevo filtro
            whereClause.session_id = session_id;
        }

        if (start_date && end_date) {
            whereClause.createdAt = {
                [Op.between]: [new Date(start_date), (() => {
                    const [yearEnd, monthEnd, dayEnd] = end_date.split('-').map(Number);
                    const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
                    endDateObj.setHours(23, 59, 59, 999);
                    return endDateObj;
                })()]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await AuditLogModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: UsuarioModel,
                    as: 'usuario', // Alias para la asociación
                    attributes: ['id', 'username'],
                    include: [{
                        model: RoleModel,
                        as: 'rol',
                        attributes: ['nombre']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            logs: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("Error al obtener logs de auditoría:", error);
        res.status(500).json({ error: error.message });
    }
};

// Ejecutar cierre automático manual (para testing)
export const manualAutoCloseSessions = async (req, res) => {
    try {
        const { manualAutoClose } = await import('../services/scheduledTasks.js');
        await manualAutoClose();
        res.json({
            message: 'Cierre automático ejecutado manualmente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error en cierre automático manual:", error);
        res.status(500).json({ error: error.message });
    }
};
// Obtener estadísticas de auditoría
export const getAuditStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let whereClause = {};
        if (start_date && end_date) {
            whereClause.createdAt = {
                [Op.between]: [new Date(start_date), (() => {
                    const [yearEnd, monthEnd, dayEnd] = end_date.split('-').map(Number);
                    const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
                    endDateObj.setHours(23, 59, 59, 999);
                    return endDateObj;
                })()]
            };
        }

        // Estadísticas por acción
        const actionStats = await AuditLogModel.findAll({
            where: whereClause,
            attributes: [
                'action',
                [db.fn('COUNT', db.col('id')), 'count']
            ],
            group: ['action'],
            order: [[db.fn('COUNT', db.col('id')), 'DESC']]
        });

        // Estadísticas por tipo de entidad
        const entityStats = await AuditLogModel.findAll({
            where: whereClause,
            attributes: [
                'entity_type',
                [db.fn('COUNT', db.col('id')), 'count']
            ],
            group: ['entity_type'],
            order: [[db.fn('COUNT', db.col('id')), 'DESC']]
        });

        // Estadísticas por usuario
        const userStats = await AuditLogModel.findAll({
            where: whereClause,
            attributes: [
                'user_id',
                [db.fn('COUNT', db.col('audit_logs.id')), 'count']
            ],
            include: [
                {
                    model: UsuarioModel,
                    as: 'usuario',
                    attributes: ['id', 'username'],
                    include: [{
                        model: RoleModel,
                        as: 'rol',
                        attributes: ['id', 'nombre']
                    }]
                }
            ],
            group: [
                'audit_logs.user_id',
                'usuario.id',
                'usuario.username',
                'usuario.rol.id',
                'usuario.rol.nombre'
            ],
            order: [[db.fn('COUNT', db.col('audit_logs.id')), 'DESC']],
            limit: 10
        });

        res.json({
            actionStats,
            entityStats,
            userStats
        });
    } catch (error) {
        console.error("Error al obtener estadísticas de auditoría:", error);
        res.status(500).json({ error: error.message });
    }
};
// Obtener actividad reciente de un usuario
export const getUserActivity = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { limit = 20 } = req.query;

        const activity = await AuditLogModel.findAll({
            where: { user_id },
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['username'],
                    include: [{
                        model: RoleModel,
                        as: 'rol',
                        attributes: ['nombre']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json(activity);
    } catch (error) {
        console.error("Error al obtener actividad del usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener alertas de stock bajo
export const getLowStockAlerts = async (req, res) => {
    try {
        const alerts = await AuditLogModel.findAll({
            where: {
                action: 'LOW_STOCK_ALERT'
            },
            include: [
                {
                    model: StockModel,
                    as: 'stockItem',
                    attributes: ['name', 'stock', 'min_stock', 'barcode'],
                    required: false // Para incluir logs incluso si el producto ya no existe
                },
                {
                    model: UsuarioModel,
                    as: 'usuario',
                    attributes: ['username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50 // Limitar el número de alertas para no sobrecargar
        });

        res.json(alerts);
    } catch (error) {
        console.error("Error al obtener alertas de stock bajo:", error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener estadísticas de clientes
export const getCustomersStats = async (req, res) => {
    try {


        const totalCustomers = await CustomerModel.count();

        const customersWithDebt = await CustomerModel.count({
            where: {
                debt: { [Op.gt]: 0 }
            }
        });

        const totalDebt = await CustomerModel.sum('debt');

        const avgDebt = await CustomerModel.findAll({
            attributes: [
                [db.fn('AVG', db.col('debt')), 'avg_debt']
            ],
            where: {
                debt: { [Op.gt]: 0 }
            }
        });

        res.json({
            totalCustomers,
            customersWithDebt,
            totalDebt: totalDebt || 0,
            averageDebt: avgDebt[0].dataValues.avg_debt || 0
        });
    } catch (error) {
        console.error("Error al obtener estadísticas de clientes:", error);
        res.status(500).json({ error: error.message });
    }
};

// Registrar un ingreso de efectivo en una sesión de caja
export const registerIncome = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id: cash_session_id } = req.params;
        const { amount, description } = req.body;
        const user_id = req.usuario.id;

        if (!amount || parseFloat(amount) <= 0 || !description) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El monto y la descripción son obligatorios.' });
        }

        const session = await CashSessionsModel.findByPk(cash_session_id, { transaction });

        if (!session || session.status !== 'abierta') {
            await transaction.rollback();
            return res.status(404).json({ message: 'La sesión de caja no está abierta o no existe.' });
        }

        // Crear el registro del movimiento
        await CashSessionMovementModel.create({
            cash_session_id,
            user_id,
            type: 'ingreso',
            amount: parseFloat(amount),
            description
        }, { transaction });

        // Registrar en auditoría
        await logAudit({
            user_id,
            action: 'CASH_INCOME',
            entity_type: 'cash_session',
            entity_id: cash_session_id,
            new_values: { amount, description },
            details: `Ingreso de efectivo: ${amount} por "${description}"`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Ingreso registrado correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error en registerIncome:", error);
        res.status(500).json({ error: error.message });
    }
};

// Registrar un egreso de efectivo en una sesión de caja
export const registerExpense = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id: cash_session_id } = req.params;
        const { amount, description } = req.body;
        const user_id = req.usuario.id;

        if (!amount || parseFloat(amount) <= 0 || !description) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El monto y la descripción son obligatorios.' });
        }

        const session = await CashSessionsModel.findByPk(cash_session_id, { transaction });

        if (!session || session.status !== 'abierta') {
            await transaction.rollback();
            return res.status(404).json({ message: 'La sesión de caja no está abierta o no existe.' });
        }

        // Crear el registro del movimiento
        await CashSessionMovementModel.create({
            cash_session_id,
            user_id,
            type: 'egreso',
            amount: parseFloat(amount),
            description
        }, { transaction });

        // Registrar en auditoría
        await logAudit({
            user_id,
            action: 'CASH_EXPENSE',
            entity_type: 'cash_session',
            entity_id: cash_session_id,
            new_values: { amount, description },
            details: `Egreso de efectivo: ${amount} por "${description}"`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Egreso registrado correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error en registerExpense:", error);
        res.status(500).json({ error: error.message });
    }
};

// Crear nuevo cliente
export const createCustomer = async (req, res) => {
    const transaction = await db.transaction();

    try {
        const {
            name,
            email,
            phone,
            address,
            dni,
            discount_percentage = 0,
            credit_limit = 0,
            debt = 0
        } = req.body;

        // Validaciones básicas
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido y debe tener al menos 2 caracteres'
            });
        }

        // Verificar duplicados
        const existingCustomer = await CustomerModel.findOne({
            where: {
                [Op.or]: [
                    email ? { email } : null,
                    phone ? { phone } : null,
                    dni ? { dni } : null
                ].filter(Boolean)
            }
        });

        if (existingCustomer) {
            let duplicateField = '';
            if (existingCustomer.email === email) duplicateField = 'email';
            else if (existingCustomer.phone === phone) duplicateField = 'teléfono';
            else if (existingCustomer.dni === dni) duplicateField = 'DNI';

            return res.status(400).json({
                success: false,
                message: `Ya existe un cliente con este ${duplicateField}`
            });
        }

        const newCustomer = await CustomerModel.create({
            name: name.trim(),
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            address: address?.trim() || null,
            dni: dni?.trim() || null,
            discount_percentage: parseFloat(discount_percentage) || 0,
            credit_limit: parseFloat(credit_limit) || 0,
            debt: parseFloat(debt) || 0
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: newCustomer
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear cliente:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar cliente
export const deleteCustomer = async (req, res) => {
    const transaction = await db.transaction();

    try {
        const { id } = req.params;

        const customer = await CustomerModel.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Verificar si el cliente tiene ventas asociadas
        const salesCount = await SaleModel.count({
            where: { customer_id: id }
        });

        if (salesCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el cliente porque tiene ventas asociadas'
            });
        }

        await customer.destroy({ transaction });
        await transaction.commit();

        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
// Exportar clientes a CSV
export const exportCustomersCSV = async (req, res) => {
    try {
        const customers = await CustomerModel.findAll({
            order: [['name', 'ASC']]
        });

        // Crear CSV header
        const csvHeader = 'ID,Nombre,Email,Teléfono,Dirección,DNI,Descuento %,Límite Crédito,Deuda,Fecha Creación\n';

        // Crear CSV rows
        const csvRows = customers.map(customer => {
            return [
                customer.id,
                `"${customer.name}"`,
                `"${customer.email || ''}"`,
                `"${customer.phone || ''}"`,
                `"${customer.address || ''}"`,
                `"${customer.dni || ''}"`,
                customer.discount_percentage,
                customer.credit_limit,
                customer.debt,
                customer.createdAt.toISOString().split('T')[0]
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=clientes.csv');
        res.send(csvContent);
    } catch (error) {
        console.error('Error al exportar clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al exportar clientes',
            error: error.message
        });
    }
};
// Obtener todos los clientes con paginación y filtros
export const getAllCustomers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'name',
            sortOrder = 'ASC',
            debt_status = 'all' // Nuevo parámetro
        } = req.query;

        const offset = (page - 1) * limit;

        // Construir condiciones de búsqueda
        const whereConditions = {
            // Excluir el cliente genérico "Consumidor Final"
            name: { [Op.ne]: 'Consumidor Final' }
        };

        // Aplicar filtro por estado de deuda
        if (debt_status === 'with_debt') {
            whereConditions.debt = { [Op.gt]: 0 };
        } else if (debt_status === 'no_debt') {
            whereConditions.debt = 0;
        }

        if (search) {
            whereConditions[Op.and] = [
                { name: { [Op.ne]: 'Consumidor Final' } },
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },
                        { dni: { [Op.like]: `%${search}%` } },
                        { id: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const { count, rows } = await CustomerModel.findAndCountAll({
            where: whereConditions,
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{
                model: CustomerPaymentsModel,
                as: 'payments',
                attributes: ['id', 'amount', 'payment_date', 'payment_method'],
                limit: 5,
                order: [['payment_date', 'DESC']]
            }]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const getTotalCustomersDebt = async (req, res) => {
    try {
        const {
            search = '',
            debt_status = 'all'
        } = req.query;

        const whereConditions = {
            name: { [Op.ne]: 'Consumidor Final' }
        };

        if (debt_status === 'with_debt') {
            whereConditions.debt = { [Op.gt]: 0 };
        } else if (debt_status === 'no_debt') {
            whereConditions.debt = { [Op.eq]: 0 };
        }

        if (search) {
            whereConditions[Op.and] = [
                { name: { [Op.ne]: 'Consumidor Final' } },
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },
                        { dni: { [Op.like]: `%${search}%` } },
                        { id: { [Op.like]: `%${search}%` } }
                    ]
                }
            ];
        }

        const totalDebt = await CustomerModel.sum('debt', {
            where: whereConditions,
        });

        res.json({
            success: true,
            totalDebt: totalDebt || 0
        });

    } catch (error) {
        console.error('Error al obtener la deuda total de clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener un cliente por ID
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await CustomerModel.findByPk(id, {
            include: [{
                model: CustomerPaymentsModel,
                as: 'payments',
                order: [['payment_date', 'DESC']]
            }]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // --- START of new logic ---

        // 1. Calculate total payments received
        const totalPaymentsReceived = customer.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

        // 2. Find the ID for the 'Credito' payment method
        const creditPaymentMethod = await PaymentModel.findOne({
            where: { method: { [Op.like]: '%Credito%' } }
        });

        let totalCreditSales = 0;
        if (creditPaymentMethod) {
            // 3. Find all sales on credit for this customer
            const creditSales = await SaleModel.findAll({
                where: { customer_id: id },
                include: [{
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    where: { payment_method_id: creditPaymentMethod.id },
                    required: true
                }]
            });
            // 4. Sum the total of those sales
            totalCreditSales = creditSales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0);
        }

        // 5. Add the calculated totals to the customer object
        const customerData = customer.toJSON();
        customerData.totalCreditSales = totalCreditSales;
        customerData.totalPaymentsReceived = totalPaymentsReceived;

        // --- END of new logic ---

        res.json({
            success: true,
            data: customerData // Send the modified object
        });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener historial de pagos del cliente
export const getCustomerPaymentHistory = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { page = 1, limit = 10, start_date, end_date } = req.query;

        const offset = (page - 1) * limit;

        const customer = await CustomerModel.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Construir condiciones de búsqueda
        let whereConditions = { customer_id };

        // Filtro por fechas si se proporcionan
        if (start_date && end_date) {
            const [yearStart, monthStart, dayStart] = start_date.split('-').map(Number);
            const startDateObj = new Date(yearStart, monthStart - 1, dayStart); // Month is 0-indexed
            startDateObj.setHours(0, 0, 0, 0); // Set to the beginning of the day

            const [yearEnd, monthEnd, dayEnd] = end_date.split('-').map(Number);
            const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd); // Month is 0-indexed
            endDateObj.setHours(23, 59, 59, 999); // Set to the end of the day

            whereConditions.payment_date = {
                [Op.between]: [startDateObj, endDateObj]
            };
        }

        const { count, rows } = await CustomerPaymentsModel.findAndCountAll({
            where: whereConditions,
            order: [['payment_date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Convertir instancias de Sequelize a objetos planos
        const plainRows = rows.map(row => row.toJSON());

        res.json({
            success: true,
            data: {
                payments: plainRows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener historial de pagos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Registrar un nuevo pago para un cliente
export const registerCustomerPayment = async (req, res) => {
    const transaction = await db.transaction();

    try {
        const { customer_id } = req.params;
        const user_id = req.usuario.id;
        const { amount, payment_method = 'efectivo', notes, cash_session_id } = req.body; // cash_session_id viene del front

        const customer = await CustomerModel.findByPk(customer_id, { transaction });
        if (!customer) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'El monto del pago debe ser un número positivo' });
        }

        const paymentData = {
            customer_id,
            amount: parsedAmount,
            payment_date: new Date(),
            payment_method,
            notes,
            created_by: req.usuario.nombre,
            cash_session_id: cash_session_id || null // Asociar si se proporciona
        };
        const payment = await CustomerPaymentsModel.create(paymentData, { transaction });

        // Si el pago es en efectivo y se proporcionó una sesión, registrar el movimiento de caja.
        if (cash_session_id && payment_method === 'efectivo') {
            const session = await CashSessionsModel.findByPk(cash_session_id, { transaction });
            if (!session || session.status !== 'abierta') {
                await transaction.rollback();
                return res.status(400).json({ message: 'La sesión de caja proporcionada no está abierta o no es válida.' });
            }

            await CashSessionMovementModel.create({
                cash_session_id: cash_session_id,
                user_id: user_id,
                type: 'ingreso',
                amount: parsedAmount,
                description: `Abono de cliente: ${customer.name}`
            }, { transaction });

            await logAudit({
                user_id: user_id,
                action: 'CASH_INCOME',
                entity_type: 'cash_session',
                entity_id: cash_session_id,
                session_id: cash_session_id,
                new_values: { amount: parsedAmount, description: `Abono de cliente: ${customer.name}` },
                details: `Ingreso de efectivo por cobranza: ${parsedAmount} a cliente ${customer.name}`
            }, req, transaction);
        }

        const newDebt = parseFloat(customer.debt) - parsedAmount;
        await customer.update({ debt: newDebt }, { transaction });

        await logAudit({
            user_id: user_id,
            action: 'REGISTRAR_PAGO_CLIENTE',
            entity_type: 'customer_payment',
            entity_id: payment.id,
            session_id: cash_session_id || null,
            new_values: { customer_id, amount: parsedAmount, new_debt: newDebt },
            details: `Se registró un pago de ${parsedAmount} para el cliente ${customer.name}. Deuda actualizada a ${newDebt}.`
        }, req, transaction);

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Pago registrado exitosamente',
            data: payment
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al registrar el pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const getCustomerCreditHistory = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { page = 1, limit = 10, start_date, end_date } = req.query;

        const offset = (page - 1) * limit;

        const whereClause = {
            customer_id: customer_id
        };

        if (start_date && end_date) {
            whereClause.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        const creditWhere = {
            method: {
                [Op.or]: [
                    { [Op.like]: '%credito%' },
                    { [Op.like]: '%crédito%' },
                    { [Op.like]: '%cuenta corriente%' },
                    { [Op.like]: '%Credito%' },
                    { [Op.like]: '%Crédito%' },
                    { [Op.like]: '%CREDITO%' },
                    { [Op.like]: '%CRÉDITO%' }
                ]
            }
        };

        const { count, rows } = await SaleModel.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: SaleDetailModel,
                    include: [{ model: StockModel, attributes: ['name', 'price'] }]
                },
                {
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    required: true,
                    include: [{
                        model: PaymentModel,
                        as: 'payment',
                        where: creditWhere,
                        required: true,
                        attributes: ['method']
                    }]
                },
                {
                    model: UsuarioModel,
                    attributes: ['username']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            subQuery: false // Solución definitiva para evitar la subconsulta problemática
        });

        // Asegurarse de que los objetos sean planos para facilitar el acceso en el frontend
        const plainRows = rows.map(row => row.toJSON());

        // Cuando se usa subQuery: false y distinct, el `count` es un array de los elementos contados.
        const totalItems = count;

        res.json({
            success: true,
            data: {
                purchases: plainRows, // Se renombra a 'purchases' para mayor claridad en el frontend.
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems: totalItems,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener historial de crédito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener historial de compras.',
            error: error.message,
            sql: error.sql
        });
    }
};

// --- Métodos para Proveedores (Suppliers) ---

// Crear un nuevo proveedor
export const createSupplier = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre del proveedor es requerido' });
        }
        const newSupplier = await SupplierModel.create({ nombre });
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los proveedores
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await SupplierModel.findAll();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Dashboard Endpoints ---

// Ventas de hoy
export const getSalesToday = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

        const totalToday = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } });
        const totalYesterday = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] } } });

        const change = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday) * 100 : (totalToday > 0 ? 100 : 0);

        res.json({ total: totalToday || 0, change: change.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ventas de la semana
export const getSalesWeek = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
        endOfLastWeek.setHours(23, 59, 59, 999);

        const totalWeek = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfWeek, endOfWeek] } } });
        const totalLastWeek = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfLastWeek, endOfLastWeek] } } });

        const change = totalLastWeek > 0 ? ((totalWeek - totalLastWeek) / totalLastWeek) * 100 : (totalWeek > 0 ? 100 : 0);

        res.json({ total: totalWeek || 0, change: change.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ventas del mes
export const getSalesMonth = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);

        const totalMonth = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } } });
        const totalLastMonth = await SaleModel.sum('total_neto', { where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } });

        const change = totalLastMonth > 0 ? ((totalMonth - totalLastMonth) / totalLastMonth) * 100 : (totalMonth > 0 ? 100 : 0);

        res.json({ total: totalMonth || 0, change: change.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Compras de hoy
export const getPurchasesToday = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const total = await PurchaseModel.sum('cost', { where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } } });
        res.json({ total: total || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Total de clientes
export const getTotalCustomers = async (req, res) => {
    try {
        const total = await CustomerModel.count();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Total de proveedores
export const getTotalSuppliers = async (req, res) => {
    try {
        const total = await SupplierModel.count();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Top 5 productos más vendidos
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await SaleDetailModel.findAll({
            attributes: [
                'stock_id',
                [db.fn('SUM', db.col('quantity')), 'cantidadVendida'],
                [db.fn('SUM', db.literal('`sale_detail`.`quantity` * `sale_detail`.`price`')), 'totalVendido']
            ],
            group: ['stock_id', 'stock.id', 'stock.name', 'stock.stock'],
            order: [[db.fn('SUM', db.col('quantity')), 'DESC']],
            limit: 5,
            include: [{
                model: StockModel,
                as: 'stock',
                attributes: ['name', 'stock']
            }]
        });

        const result = topProducts.map(p => ({
            id: p.stock_id,
            nombre: p.stock.name,
            stock: parseInt(p.stock.stock, 10),
            cantidadVendida: parseInt(p.get('cantidadVendida'), 10),
            totalVendido: parseFloat(p.get('totalVendido')).toFixed(2),
            maxStock: 100 // This value should be dynamic, perhaps from the stock model
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfitMarginReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
        }

        const endDateObj = (() => {
            const [year, month, day] = endDate.split('-').map(Number);
            const d = new Date(year, month - 1, day);
            d.setHours(23, 59, 59, 999);
            return d;
        })();

        const dateRangeWhere = {
            createdAt: {
                [Op.between]: [new Date(startDate), endDateObj]
            }
        };

        const comboCostSubQuery = `(
            SELECT SUM(ci.quantity * s_inner.cost)
            FROM combo_items ci
            JOIN stocks s_inner ON ci.stock_id = s_inner.id
            WHERE ci.combo_id = \`sale_detail\`.\`combo_id\`
        )`;

        const results = await SaleDetailModel.findAll({
            attributes: [
                [db.fn('COALESCE', db.col('stock.name'), db.col('combo.name'), 'Producto Manual'), 'productName'],
                [db.fn('SUM', db.col('quantity')), 'totalQuantitySold'],
                [db.fn('SUM', db.literal('`sale_detail`.`quantity` * `sale_detail`.`price`')), 'totalRevenue'],
                [db.literal(`SUM(\`sale_detail\`.\`quantity\` * CASE WHEN \`sale_detail\`.\`stock_id\` IS NOT NULL THEN \`sale_detail\`.\`cost\` WHEN \`sale_detail\`.\`combo_id\` IS NOT NULL THEN ${comboCostSubQuery} ELSE 0 END)`), 'totalCost'],
                [db.literal(`(SUM(\`sale_detail\`.\`quantity\` * \`sale_detail\`.\`price\`) - SUM(\`sale_detail\`.\`quantity\` * CASE WHEN \`sale_detail\`.\`stock_id\` IS NOT NULL THEN \`sale_detail\`.\`cost\` WHEN \`sale_detail\`.\`combo_id\` IS NOT NULL THEN ${comboCostSubQuery} ELSE 0 END))`), 'totalProfit']
            ],
            include: [
                { model: StockModel, as: 'stock', attributes: [], required: false },
                { model: ComboModel, as: 'combo', attributes: [], required: false }
            ],
            where: dateRangeWhere,
            group: ['productName'],
            order: [[db.literal('totalProfit'), 'DESC']]
        });

        const overallTotals = await SaleDetailModel.findOne({
            attributes: [
                [db.literal('SUM(`sale_detail`.`quantity` * `sale_detail`.`price`)'), 'overallRevenue'],
                [db.literal(`SUM(\`sale_detail\`.\`quantity\` * CASE WHEN \`sale_detail\`.\`stock_id\` IS NOT NULL THEN \`sale_detail\`.\`cost\` WHEN \`sale_detail\`.\`combo_id\` IS NOT NULL THEN ${comboCostSubQuery} ELSE 0 END)`), 'overallCost'],
                [db.literal(`(SUM(\`sale_detail\`.\`quantity\` * \`sale_detail\`.\`price\`) - SUM(\`sale_detail\`.\`quantity\` * CASE WHEN \`sale_detail\`.\`stock_id\` IS NOT NULL THEN \`sale_detail\`.\`cost\` WHEN \`sale_detail\`.\`combo_id\` IS NOT NULL THEN ${comboCostSubQuery} ELSE 0 END))`), 'overallProfit']
            ],
            where: dateRangeWhere
        });


        res.json({
            success: true,
            report: results,
            summary: overallTotals
        });

    } catch (error) {
        console.error("Error al generar el reporte de margen de ganancia:", error);
        res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
    }
};

// export const getProfitMarginReport = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;

//         // Validar fechas
//         if (!startDate || !endDate) {
//             return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
//         }

//         const results = await SaleDetailModel.findAll({
//             attributes: [
//                 [db.col('stock.name'), 'productName'],
//                 [db.fn('SUM', db.col('quantity')), 'totalQuantitySold'],
//                 [db.fn('SUM', db.literal('`sale_detail`.quantity * `sale_detail`.price')), 'totalRevenue'],
//                 [db.fn('SUM', db.literal('`sale_detail`.quantity * `sale_detail`.cost')), 'totalCost'],
//                 [db.literal('SUM(`sale_detail`.quantity * `sale_detail`.price) - SUM(`sale_detail`.quantity * `sale_detail`.cost)'), 'totalProfit'],

//             ],
//             include: [{
//                 model: StockModel,
//                 as: 'stock',
//                 attributes: []
//             }],
//             where: {
//                 createdAt: {
//                     [Op.between]: [new Date(startDate), (() => {
//                         const [yearEnd, monthEnd, dayEnd] = endDate.split('-').map(Number);
//                         const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
//                         endDateObj.setHours(23, 59, 59, 999);
//                         return endDateObj;
//                     })()]
//                 }
//             },
//             group: ['stock.name'],
//             order: [[db.literal('totalProfit'), 'DESC']]
//         });

//         // Calcular totales generales
//         const overallTotals = await SaleDetailModel.findOne({
//             attributes: [
//                 [db.fn('SUM', db.literal('`sale_detail`.quantity * `sale_detail`.price')), 'overallRevenue'],
//                 [db.fn('SUM', db.literal('`sale_detail`.quantity * `sale_detail`.cost')), 'overallCost'],
//                 [db.literal('SUM(`sale_detail`.quantity * `sale_detail`.price) - SUM(`sale_detail`.quantity * `sale_detail`.cost)'), 'overallProfit']
//             ],
//             where: {
//                 createdAt: {
//                     [Op.between]: [new Date(startDate), (() => {
//                         const [yearEnd, monthEnd, dayEnd] = endDate.split('-').map(Number);
//                         const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
//                         endDateObj.setHours(23, 59, 59, 999);
//                         return endDateObj;
//                     })()]
//                 }
//             }
//         });

//         res.json({
//             success: true,
//             report: results,
//             summary: overallTotals
//         });

//     } catch (error) {
//         console.error("Error al generar el reporte de margen de ganancia:", error);
//         res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
//     }
// };

// FUNCIONES IMPORTADAS DESDE CONTROLLERBACKUP

export const getCustomerPurchaseHistory = async (req, res) => {
    try {
        const { customer_id } = req.params;
        const { page = 1, limit = 10, start_date, end_date } = req.query;

        const offset = (page - 1) * limit;

        const customer = await CustomerModel.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        let whereConditions = { customer_id };

        if (start_date && end_date) {
            const [yearStart, monthStart, dayStart] = start_date.split('-').map(Number);
            const startDateObj = new Date(yearStart, monthStart - 1, dayStart);
            startDateObj.setHours(0, 0, 0, 0);

            const [yearEnd, monthEnd, dayEnd] = end_date.split('-').map(Number);
            const endDateObj = new Date(yearEnd, monthEnd - 1, dayEnd);
            endDateObj.setHours(23, 59, 59, 999);

            whereConditions.createdAt = {
                [Op.between]: [startDateObj, endDateObj]
            };
        }

        const creditWhere = {
            method: {
                [Op.or]: [
                    { [Op.like]: '%credito%' },
                    { [Op.like]: '%crédito%' },
                    { [Op.like]: '%cuenta corriente%' },
                    { [Op.like]: '%Credito%' },
                    { [Op.like]: '%Crédito%' },
                    { [Op.like]: '%CREDITO%' },
                    { [Op.like]: '%CRÉDITO%' }
                ]
            }
        };

        const { count, rows } = await SaleModel.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: SaleDetailModel,
                    include: [{ model: StockModel, attributes: ['name', 'price'] }]
                },
                {
                    model: SalePaymentModel,
                    as: 'sale_payments',
                    required: true,
                    include: [{
                        model: PaymentModel,
                        as: 'payment',
                        where: creditWhere,
                        required: true,
                        attributes: ['method']
                    }]
                },
                {
                    model: UsuarioModel,
                    attributes: ['username']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            subQuery: false // Solución definitiva para evitar la subconsulta problemática
        });

        // Asegurarse de que los objetos sean planos para facilitar el acceso en el frontend
        const plainRows = rows.map(row => row.toJSON());

        // Cuando se usa subQuery: false y distinct, el `count` es un array de los elementos contados.
        const totalItems = count;

        res.json({
            success: true,
            data: {
                customer,
                purchases: plainRows, // Se renombra a 'purchases' para mayor claridad en el frontend.
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems: totalItems,
                    itemsPerPage: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener historial de compras a crédito:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener historial de compras.',
            error: error.message,
            sql: error.sql
        });
    }
};

export const updateCustomer = async (req, res) => {
    const transaction = await db.transaction();

    try {
        const { id } = req.params;
        const {
            name,
            email,
            phone,
            address,
            dni,
            discount_percentage,
            credit_limit,
            debt
        } = req.body;

        const customer = await CustomerModel.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Verificar duplicados (excluyendo el cliente actual)
        if (email || phone || dni) {
            const existingCustomer = await CustomerModel.findOne({
                where: {
                    id: { [Op.ne]: id },
                    [Op.or]: [
                        email ? { email } : null,
                        phone ? { phone } : null,
                        dni ? { dni } : null
                    ].filter(Boolean)
                }
            });

            if (existingCustomer) {
                let duplicateField = '';
                if (existingCustomer.email === email) duplicateField = 'email';
                else if (existingCustomer.phone === phone) duplicateField = 'teléfono';
                else if (existingCustomer.dni === dni) duplicateField = 'DNI';

                return res.status(400).json({
                    success: false,
                    message: `Ya existe otro cliente con este ${duplicateField}`
                });
            }
        }

        // Actualizar campos
        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email?.trim() || null;
        if (phone !== undefined) updateData.phone = phone?.trim() || null;
        if (address !== undefined) updateData.address = address?.trim() || null;
        if (dni !== undefined) updateData.dni = dni?.trim() || null;
        if (discount_percentage !== undefined) updateData.discount_percentage = parseFloat(discount_percentage) || 0;
        if (credit_limit !== undefined) updateData.credit_limit = parseFloat(credit_limit) || 0;
        if (debt !== undefined) updateData.debt = parseFloat(debt) || 0;

        await customer.update(updateData, { transaction });
        await transaction.commit();

        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: customer
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar cliente:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await SupplierModel.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await SaleDetailModel.findAll({
            attributes: [
                'stock_id',
                [db.fn('SUM', db.col('sale_detail.quantity')), 'cantidadVendida'],
                [db.fn('SUM', db.literal('`sale_detail`.`quantity` * `sale_detail`.`price`')), 'totalVendido']
            ],
            include: [{
                model: StockModel,
                as: 'stock',
                attributes: ['name', 'stock', 'min_stock'],
                where: {
                    name: {
                        [Op.ne]: 'Producto Manual'
                    }
                }
            }],
            group: ['stock_id', 'stock.id'],
            order: [
                [db.fn('SUM', db.col('quantity')), 'DESC']
            ],
            limit: 5,
            raw: true,
        });

        const formattedProducts = topProducts.map(p => ({
            id: p.stock_id,
            nombre: p['stock.name'],
            stock: parseInt(p['stock.stock'], 10),
            maxStock: (parseInt(p['stock.stock'], 10) + parseInt(p.cantidadVendida, 10)) > 100 ? (parseInt(p['stock.stock'], 10) + parseInt(p.cantidadVendida, 10)) : 100,
            cantidadVendida: parseInt(p.cantidadVendida, 10),
            totalVendido: parseFloat(p.totalVendido).toFixed(2)
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error("Error in getTopSellingProducts:", error);
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo movimiento de caja
export const createCashMovement = async (req, res) => {
    try {
        const { cash_session_id, amount, type, description } = req.body;
        const user_id = req.usuario.id; // Asume que el user_id está disponible en req.usuario

        // Verificar que la sesión de caja exista y esté abierta
        const session = await CashSessionsModel.findByPk(cash_session_id);
        if (!session || session.status !== 'abierta') {
            return res.status(400).json({ message: 'La sesión de caja no existe o no está abierta.' });
        }

        const newMovement = await CashSessionMovementModel.create({
            cash_session_id,
            user_id,
            amount: parseFloat(amount),
            type,
            description
        });

        await logAudit({
            user_id,
            action: 'CASH_MOVEMENT_CREATED',
            entity_type: 'cash_movement',
            entity_id: newMovement.id,
            new_values: { cash_session_id, amount, type, description },
            details: `Movimiento de caja registrado: ${type} de ${amount} en sesión ${cash_session_id}.`
        }, req);

        res.status(201).json({ message: 'Movimiento de caja registrado correctamente', id: newMovement.id, movement: newMovement });
    } catch (error) {
        console.error("Error al crear movimiento de caja:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateThemePreference = async (req, res) => {
    try {
        // 1. Obtener el tema del cuerpo de la solicitud y el ID de usuario de la sesión.
        const { theme } = req.body;
        const userId = req.session.usuario.id;

        // 2. Validar que el tema sea 'light' o 'dark'.
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).json({ message: 'Valor de tema no válido. Debe ser "light" o "dark".' });
        }

        // 3. Actualizar la base de datos usando el modelo de Sequelize.
        await UsuarioModel.update({ theme_preference: theme }, {
            where: { id: userId }
        });

        // 4. Responder con éxito.
        res.status(200).json({ message: 'Preferencia de tema actualizada correctamente.' });

    } catch (error) {
        // 5. Manejar errores.
        console.error('Error al actualizar la preferencia de tema:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el tema.' });
    }
};
// --- Métodos para la Gestión de Temas ---

export const getThemeSettings = async (req, res) => {
    try {
        const themeSettings = await ThemeSettingModel.findOne({
            where: { key: 'activeTheme' }
        });

        if (themeSettings) {
            res.json(themeSettings.value);
        } else {
            // If no theme is set, return an empty object
            res.json({});
        }
    } catch (error) {
        console.error("Error al obtener la configuración del tema:", error);
        res.status(500).json({ message: 'Error al obtener la configuración del tema', error: error.message });
    }
};

export const updateThemeSettings = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { mode, palette } = req.body;

        if (!palette || !mode || !['light', 'dark'].includes(mode)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'El modo (light/dark) y el objeto de paleta son requeridos.' });
        }

        const themeSettings = await ThemeSettingModel.findOne({
            where: { key: 'activeTheme' },
            transaction
        });

        let currentFullPalette;
        if (themeSettings && typeof themeSettings.value === 'object' && !Array.isArray(themeSettings.value)) {
            currentFullPalette = themeSettings.value;
        } else {
            currentFullPalette = { light: {}, dark: {} };
        }

        // Update the palette for the specific mode
        currentFullPalette[mode] = palette;

        await ThemeSettingModel.upsert({
            key: 'activeTheme',
            value: currentFullPalette
        }, { transaction });

        await logAudit({
            user_id: req.usuario.id,
            action: 'ACTUALIZAR_TEMA',
            entity_type: 'theme',
            entity_id: null,
            new_values: { mode, palette }, // Log the mode and the changed palette
            details: `Se actualizó la paleta de colores del modo ${mode}.`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Tema actualizado correctamente.' });
    } catch (error) {
        await transaction.rollback();
        console.error("Error al actualizar la configuración del tema:", error);
        res.status(500).json({ message: 'Error al actualizar la configuración del tema', error: error.message, stack: error.stack });
    }
};

// --- Métodos para Tickets Pendientes ---

// Obtener todos los tickets pendientes
export const getPendingTickets = async (req, res) => {
    try {
        const tickets = await PendingTicketModel.findAll({
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['id', 'nombre', 'username']
                },
                {
                    model: CashSessionsModel,
                    attributes: ['id', 'status']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        console.error("Error al obtener tickets pendientes:", error);
        res.status(500).json({ message: 'Error al obtener tickets pendientes', error: error.message });
    }
};

// Crear un nuevo ticket pendiente
export const createPendingTicket = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { name, ticket_data, cash_session_id } = req.body;
        const user_id = req.usuario.id;

        if (!name || !ticket_data || !user_id || !cash_session_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Faltan datos requeridos para crear el ticket pendiente.' });
        }

        const newTicket = await PendingTicketModel.create({
            name,
            ticket_data,
            user_id,
            cash_session_id
        }, { transaction });

        await logAudit({
            user_id,
            action: 'CREAR_TICKET_PENDIENTE',
            entity_type: 'pending_ticket',
            entity_id: newTicket.id,
            new_values: { name, ticket_data },
            details: `Se creó el ticket pendiente "${name}".`
        }, req, transaction);


        await transaction.commit();
        res.status(201).json({ message: 'Ticket pendiente guardado correctamente', ticket: newTicket });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al crear ticket pendiente:", error);
        res.status(500).json({ message: 'Error al crear el ticket pendiente', error: error.message });
    }
};

// Obtener un ticket pendiente por ID
export const getPendingTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await PendingTicketModel.findByPk(id, {
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['id', 'nombre', 'username']
                }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket pendiente no encontrado.' });
        }

        res.json(ticket);
    } catch (error) {
        console.error("Error al obtener ticket pendiente por ID:", error);
        res.status(500).json({ message: 'Error al obtener el ticket pendiente', error: error.message });
    }
};

export const getCombosSummary = async (req, res) => {
    try {
        const currentDate = new Date();
        const activeCount = await ComboModel.count({
            where: {
                is_active: true,
                start_date: { [Op.lte]: currentDate },
                end_date: { [Op.gte]: currentDate }
            }
        });
        const latestCombo = await ComboModel.findOne({
            order: [['createdAt', 'DESC']],
            attributes: ['name']
        });
        res.json({ activeCount, latestCombo });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el resumen de combos', error: error.message });
    }
};


export const checkBarcodeExists = async (req, res) => {
    try {
        const { barcode } = req.query;
        if (!barcode) {
            return res.status(400).json({ message: 'El código de barras es requerido.' });
        }

        const existingProduct = await StockModel.findOne({
            where: { barcode }
        });

        if (existingProduct) {
            return res.json({ exists: true, product: existingProduct });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error al verificar el código de barras:', error);
        res.status(500).json({ message: 'Error al verificar el código de barras', error: error.message });
    }
};

// Eliminar un ticket pendiente
export const deletePendingTicket = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id } = req.params;
        const user_id = req.usuario.id;

        const ticket = await PendingTicketModel.findByPk(id, { transaction });

        if (!ticket) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Ticket pendiente no encontrado.' });
        }

        await ticket.destroy({ transaction });

        await logAudit({
            user_id,
            action: 'ELIMINAR_TICKET_PENDIENTE',
            entity_type: 'pending_ticket',
            entity_id: id,
            new_values: { name: ticket.name },
            details: `Se eliminó el ticket pendiente "${ticket.name}".`
        }, req, transaction);

        await transaction.commit();
        res.json({ message: 'Ticket pendiente eliminado correctamente.' });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al eliminar ticket pendiente:", error);
        res.status(500).json({ message: 'Error al eliminar el ticket pendiente', error: error.message });
    }
};

// --- Métodos para Promociones ---

// Obtener todas las promociones
export const getPromotions = async (req, res) => {
    try {
        const { is_active, limit } = req.query;
        let whereClause = {};
        const currentDate = new Date();

        // Filtro por estado activo y vigente
        if (is_active === 'true') {
            whereClause.is_active = true;
            whereClause.start_date = { [Op.lte]: currentDate };
            whereClause.end_date = { [Op.gte]: currentDate };
        }

        const promotions = await PromotionModel.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']], // Ordenar por más recientes
            limit: limit ? parseInt(limit) : undefined, // Aplicar límite si se proporciona
            include: [
                {
                    model: StockModel,
                    as: 'stocks',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: ProductPresentationsModel,
                    as: 'presentations',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una promoción por ID
export const getPromotionById = async (req, res) => {
    try {
        const promotion = await PromotionModel.findByPk(req.params.id, {
            include: [
                {
                    model: StockModel,
                    as: 'stocks',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: ProductPresentationsModel,
                    as: 'presentations',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        if (promotion) {
            res.json(promotion);
        } else {
            res.status(404).json({ message: 'Promoción no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear una nueva promoción
export const createPromotion = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { products, presentations, ...promotionData } = req.body;
        const newPromotion = await PromotionModel.create(promotionData, { transaction });

        if (products && products.length > 0) {
            await newPromotion.addStocks(products, { transaction });
        }

        if (presentations && presentations.length > 0) {
            await newPromotion.addPresentations(presentations, { transaction });
        }

        await transaction.commit();
        res.status(201).json(newPromotion);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// Actualizar una promoción
export const updatePromotion = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { products, presentations, ...promotionData } = req.body;
        const promotion = await PromotionModel.findByPk(req.params.id);

        if (!promotion) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Promoción no encontrada' });
        }

        await promotion.update(promotionData, { transaction });

        if (products) {
            await promotion.setStocks(products, { transaction });
        }

        if (presentations) {
            await promotion.setPresentations(presentations, { transaction });
        }

        await transaction.commit();
        res.json(promotion);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// Eliminar una promoción
export const deletePromotion = async (req, res) => {
    try {
        const deleted = await PromotionModel.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Promoción eliminada' });
        } else {
            res.status(404).json({ message: 'Promoción no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPresentations = async (req, res) => {
    try {
        const { search, category_id, limit, mode } = req.query; // Add mode

        // --- NEW DASHBOARD LOGIC ---
        if (mode === 'dashboard') {
            // 1. Get the 3 stock_ids with the most recent presentations
            const recentStockIdsResult = await ProductPresentationsModel.findAll({
                attributes: ['stock_id', [db.fn('MAX', db.col('createdAt')), 'max_createdAt']],
                group: ['stock_id'],
                order: [[db.fn('MAX', db.col('createdAt')), 'DESC']],
                limit: 3,
                raw: true
            });
            const recentStockIds = recentStockIdsResult.map(item => item.stock_id);

            if (recentStockIds.length === 0) {
                return res.json({ presentations: [] });
            }

            // 2. Fetch top 2 presentations for each of those stock_ids
            const presentationsPromises = recentStockIds.map(stockId =>
                ProductPresentationsModel.findAll({
                    where: { stock_id: stockId },
                    order: [['createdAt', 'DESC']],
                    limit: 2,
                    include: [
                        {
                            model: StockModel,
                            as: 'stock',
                            attributes: ['name', 'description', 'category_id', 'tipo_venta'],
                            required: true,
                            include: [{ model: UnitModel, as: 'unit', attributes: ['name'] }]
                        }
                    ]
                })
            );

            const presentationsByStock = await Promise.all(presentationsPromises);
            const allPresentations = presentationsByStock.flat(); // Flatten the array of arrays

            // 3. Format and send
            const formattedPresentations = allPresentations.map(p => ({
                ...p.toJSON(),
                productName: p.stock.name,
                productDescription: p.stock.description,
                tipo_venta: p.stock.tipo_venta,
                unitName: p.stock.unit.name
            }));

            return res.json({ presentations: formattedPresentations });
        }

        // --- EXISTING LOGIC ---
        let whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$stock.name$': { [Op.like]: `%${search}%` } },
                { '$stock.description$': { [Op.like]: `%${search}%` } }
            ];
        }
        if (category_id) {
            whereClause['$stock.category_id$'] = category_id;
        }

        const presentations = await ProductPresentationsModel.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']], // Ordenar por más recientes
            limit: limit ? parseInt(limit) : undefined, // Aplicar límite si se proporciona
            include: [
                {
                    model: StockModel,
                    as: 'stock',
                    attributes: ['name', 'description', 'category_id', 'tipo_venta'],
                    required: true,
                    include: [{ model: UnitModel, as: 'unit', attributes: ['name'] }]
                }
            ]
        });

        // Mapear para incluir el nombre y descripción del producto principal
        const formattedPresentations = presentations.map(p => ({
            ...p.toJSON(),
            productName: p.stock.name,
            productDescription: p.stock.description,
            tipo_venta: p.stock.tipo_venta,
            unitName: p.stock.unit.name
        }));

        res.json({ presentations: formattedPresentations });
    } catch (error) {
        console.error("Error en getPresentations:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- Métodos para Combos ---

// Obtener todos los combos
export const getCombos = async (req, res) => {
    try {
        const { search, is_active, limit } = req.query; // Obtener parámetros de búsqueda, estado y límite
        const currentDate = new Date();

        let whereClause = {};

        // Filtrar por nombre si se proporciona búsqueda
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        // Filtrar por estado si se proporciona is_active
        if (is_active === 'true') {
            whereClause.is_active = true;
            whereClause.start_date = { [Op.lte]: currentDate };
            whereClause.end_date = { [Op.gte]: currentDate };
        } else if (is_active === 'false') {
            whereClause[Op.or] = [
                { is_active: false },
                { start_date: { [Op.gt]: currentDate } },
                { end_date: { [Op.lt]: currentDate } }
            ];
        }

        const combos = await ComboModel.findAll({
            where: whereClause, // Aplicar la cláusula where
            order: [['createdAt', 'DESC']], // Ordenar por más recientes
            limit: limit ? parseInt(limit) : undefined, // Aplicar límite si se proporciona
            include: [
                {
                    model: ComboItem,
                    as: 'combo_items',
                    include: [
                        {
                            model: StockModel,
                            as: 'stock',
                            attributes: ['id', 'name', 'price']
                        }
                    ]
                }
            ]
        });

        res.json(combos); // Devolver los combos filtrados
    } catch (error) {
        console.error("Error en getCombos:", error);
        res.status(500).json({ message: 'Error al obtener los combos', error: error.message });
    }
};

// Obtener un combo por ID
export const getComboById = async (req, res) => {
    try {
        const combo = await ComboModel.findByPk(req.params.id, {
            include: [
                {
                    model: ComboItem,
                    as: 'combo_items',
                    include: [
                        {
                            model: StockModel,
                            as: 'stock',
                            attributes: ['id', 'name', 'price']
                        }
                    ]
                }
            ]
        });
        if (combo) {
            res.json(combo);
        } else {
            res.status(404).json({ message: 'Combo no encontrado' });
        }
    } catch (error) {
        console.error("Error en getComboById:", error);
        res.status(500).json({ message: 'Error al obtener el combo', error: error.message });
    }
};

// Obtener un combo por código de barras
export const getComboByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const combo = await ComboModel.findOne({
            where: { barcode: barcode, is_active: true },
            include: [
                {
                    model: ComboItem,
                    as: 'combo_items',
                    include: [
                        {
                            model: StockModel,
                            as: 'stock',
                            attributes: ['id', 'name', 'price']
                        }
                    ]
                }
            ]
        });
        if (combo) {
            res.json(combo);
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error("Error en getComboByBarcode:", error);
        res.status(500).json({ message: 'Error al buscar combo por código de barras', error: error.message });
    }
};


// Crear un nuevo combo
export const createCombo = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { name, barcode, price, is_active, start_date, end_date, combo_items } = req.body;

        const newCombo = await ComboModel.create({
            name,
            barcode,
            price,
            is_active,
            start_date,
            end_date
        }, { transaction });

        if (combo_items && combo_items.length > 0) {
            const itemsToCreate = combo_items.map(item => ({
                combo_id: newCombo.id,
                stock_id: item.stock_id,
                quantity: item.quantity,
                component_presentation_id: item.component_presentation_id
            }));
            await ComboItem.bulkCreate(itemsToCreate, { transaction });
        }

        await transaction.commit();
        res.status(201).json(newCombo);
    } catch (error) {
        await transaction.rollback();
        console.error("Error en createCombo:", error);
        res.status(500).json({ message: 'Error al crear el combo', error: error.message });
    }
};

// Actualizar un combo
export const updateCombo = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id } = req.params;
        const { name, barcode, price, is_active, start_date, end_date, combo_items } = req.body;

        await ComboModel.update({
            name,
            barcode,
            price,
            is_active,
            start_date,
            end_date
        }, { where: { id }, transaction });

        await ComboItem.destroy({ where: { combo_id: id }, transaction });

        if (combo_items && combo_items.length > 0) {
            const itemsToCreate = combo_items.map(item => ({
                combo_id: id,
                stock_id: item.stock_id,
                quantity: item.quantity,
                component_presentation_id: item.component_presentation_id
            }));
            await ComboItem.bulkCreate(itemsToCreate, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Combo actualizado correctamente' });
    } catch (error) {
        await transaction.rollback();
        console.error("Error en updateCombo:", error);
        res.status(500).json({ message: 'Error al actualizar el combo', error: error.message });
    }
};

// Eliminar un combo
export const deleteCombo = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { id } = req.params;

        await ComboItem.destroy({ where: { combo_id: id }, transaction });

        await ComboModel.destroy({ where: { id }, transaction });

        await transaction.commit();
        res.json({ message: 'Combo eliminado correctamente' });
    } catch (error) {
        await transaction.rollback();
        console.error("Error en deleteCombo:", error);
        res.status(500).json({ message: error.message });
    }
};

// Asignar una promoción a un producto o presentación
export const assignPromotion = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { promotion_id, stock_id, presentation_id } = req.body;

        if (!promotion_id || (!stock_id && !presentation_id)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Se requiere promotion_id y al menos stock_id o presentation_id.' });
        }

        const data = { promotion_id };
        if (stock_id) data.stock_id = stock_id;
        if (presentation_id) data.presentation_id = presentation_id;

        const assignment = await ProductPromotionsModel.create(data, { transaction });

        await transaction.commit();
        res.status(201).json(assignment);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const calculateEAN13CheckDigit = (barcode) => {
    if (barcode.length !== 12) {
        throw new Error("Input must be 12 digits for EAN-13 check digit calculation.");
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
};

export const generateInternalBarcode = async (req, res) => {
    const { type } = req.params;
    const transaction = await db.transaction();

    try {
        const prefixes = {
            presentation: '201',
            combo: '202'
        };

        const prefix = prefixes[type];
        if (!prefix) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Tipo de código de barras no válido.' });
        }

        let lastSequentialNumber = 0; // Start from 0 to ensure first generated is 1

        // Find the maximum barcode ONLY within internally generated barcode tables
        let maxBarcodeFromInternallyGenerated = null;

        const maxPres = await ProductPresentationsModel.max('barcode', {
            where: { barcode: { [Op.like]: `${prefix}%` } },
            transaction
        });
        if (maxPres) {
            maxBarcodeFromInternallyGenerated = maxPres;
        }

        const maxCombo = await ComboModel.max('barcode', {
            where: { barcode: { [Op.like]: `${prefix}%` } },
            transaction
        });
        if (maxCombo && (!maxBarcodeFromInternallyGenerated || maxCombo > maxBarcodeFromInternallyGenerated)) {
            maxBarcodeFromInternallyGenerated = maxCombo;
        }

        if (maxBarcodeFromInternallyGenerated) {
            const lastSequentialPart = maxBarcodeFromInternallyGenerated.substring(prefix.length, maxBarcodeFromInternallyGenerated.length - 1); // Exclude check digit
            lastSequentialNumber = parseInt(lastSequentialPart, 10);
        }

        let newBarcode;
        let isUnique = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 100; // Prevent infinite loops

        while (!isUnique && attempts < MAX_ATTEMPTS) {
            attempts++;
            const currentSequential = lastSequentialNumber + attempts; // Increment from last found or 0
            const sequentialPart = currentSequential.toString().padStart(9, '0');
            const barcodeWithoutCheckDigit = prefix + sequentialPart;
            const checkDigit = calculateEAN13CheckDigit(barcodeWithoutCheckDigit);
            newBarcode = barcodeWithoutCheckDigit + checkDigit;

            // Check uniqueness across ALL barcode tables (internal and external)
            const existingInPresentations = await ProductPresentationsModel.findOne({
                where: { barcode: newBarcode },
                transaction
            });
            const existingInCombos = await ComboModel.findOne({
                where: { barcode: newBarcode },
                transaction
            });
            const existingInStocks = await StockModel.findOne({
                where: { barcode: newBarcode },
                transaction
            });

            if (!existingInPresentations && !existingInCombos && !existingInStocks) {
                isUnique = true;
            } else {
                // If not unique, the loop will continue and increment attempts, trying a new sequential number
            }
        }

        if (!isUnique) {
            await transaction.rollback();
            return res.status(500).json({ message: 'No se pudo generar un código de barras único después de varios intentos.' });
        }

        await transaction.commit();
        res.json({ barcode: newBarcode });

    } catch (error) {
        await transaction.rollback();
        console.error("Error al generar código de barras interno:", error);
        res.status(500).json({ message: 'Error al generar el código de barras.', error: error.message });
    }
};

export const getPromotionsSummary = async (req, res) => {
    try {
        const currentDate = new Date();
        const activeCount = await PromotionModel.count({
            where: {
                is_active: true,
                start_date: { [Op.lte]: currentDate },
                end_date: { [Op.gte]: currentDate }
            }
        });
        const latestPromotion = await PromotionModel.findOne({
            order: [['createdAt', 'DESC']],
            attributes: ['name']
        });
        res.json({ activeCount, latestPromotion });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el resumen de promociones', error: error.message });
    }
};

export const getPresentationsSummary = async (req, res) => {
    try {
        const totalCount = await ProductPresentationsModel.count();
        const latestPresentation = await ProductPresentationsModel.findOne({
            order: [['createdAt', 'DESC']],
            include: [{
                model: StockModel,
                as: 'stock',
                attributes: ['name']
            }],
            attributes: ['name']
        });

        const formattedLatest = latestPresentation ? {
            name: latestPresentation.name,
            productName: latestPresentation.stock.name
        } : null;

        res.json({ totalCount, latestPresentation: formattedLatest });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el resumen de presentaciones', error: error.message });
    }
};

export const getUserModules = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await UsuarioModel.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 1. Obtener permisos del rol usando una consulta directa
        const rolePermissionsQuery = `
            SELECT p.nombre
            FROM roles_permisos rp
            JOIN permisos p ON rp.permiso_id = p.id
            WHERE rp.rol_id = ?
        `;
        const rolePermissionsResult = await db.query(rolePermissionsQuery, {
            replacements: [user.rol_id],
            type: db.QueryTypes.SELECT
        });
        const rolePermissions = rolePermissionsResult.map(p => p.nombre);

        // 2. Obtener overrides explícitos del usuario
        const userOverrides = await UserPermissionModel.findAll({
            where: { user_id: user_id },
            include: [{ model: PermissionModel, as: 'permiso', attributes: ['nombre'] }]
        });
        const overridesMap = new Map(userOverrides.map(ov => [ov.permiso.nombre, ov.type]));

        // 3. Determinar el estado de cada módulo
        const moduleStatus = {};
        for (const moduleName in modulePermissions) {
            const viewPermission = `ver_tarjeta_${moduleName.toLowerCase()}`;
            const override = overridesMap.get(viewPermission);

            if (override) {
                // El override tiene precedencia
                moduleStatus[moduleName] = override === 'grant';
            } else {
                // Si no hay override, se verifica el permiso del rol
                moduleStatus[moduleName] = rolePermissions.includes(viewPermission);
            }
        }

        res.json(moduleStatus);

    } catch (error) {
        console.error(`[getUserModules] Error al obtener módulos del usuario:`, error);
        res.status(500).json({ message: 'Error al obtener los módulos del usuario.' });
    }
};

export const updateUserModules = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { user_id } = req.params;
        const { module, active } = req.body;

        if (!module || !modulePermissions[module]) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Módulo no válido.' });
        }

        const permissionsToUpdate = modulePermissions[module];

        const permissionRecords = await PermissionModel.findAll({
            where: { nombre: { [Op.in]: permissionsToUpdate } },
            attributes: ['id'],
            transaction
        });
        const permissionIds = permissionRecords.map(p => p.id);


        if (permissionIds.length === 0) {
            await transaction.commit();
            return res.status(200).json({ message: `Módulo '${module}' no tiene permisos configurados para actualizar.` });
        }

        if (active) {
            // Si se activa el módulo, conceder explícitamente todos los permisos del módulo
            const overridePromises = permissionIds.map(pid => {
                return UserPermissionModel.upsert({
                    user_id: user_id,
                    permission_id: pid,
                    type: 'grant'
                }, { transaction });
            });
            await Promise.all(overridePromises);

        } else {
            // Si se desactiva el módulo, eliminar cualquier override existente para esos permisos

            await UserPermissionModel.destroy({
                where: {
                    user_id: user_id,
                    permission_id: { [Op.in]: permissionIds }
                },
                transaction
            });

        }

        await transaction.commit();
        res.status(200).json({ message: `Módulo '${module}' ${active ? 'concedido' : 'revocado'} para el usuario.` });

    } catch (error) {
        await transaction.rollback();
        console.error(`[updateUserModules] Error al actualizar módulos para el usuario:`, error);
        res.status(500).json({ message: 'Error al actualizar los módulos del usuario.' });
    }
};