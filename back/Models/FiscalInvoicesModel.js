// back/Models/FiscalInvoicesModel.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import SaleModel from './SalesModel.js';
import PointOfSaleModel from './PointOfSaleModel.js';

const FiscalInvoicesModel = db.define('fiscal_invoices', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SaleModel,
            key: 'id',
        },
    },
    point_of_sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PointOfSaleModel,
            key: 'id',
        },
    },
    emission_method: {
        type: DataTypes.ENUM('CONTROLADOR_FISCAL', 'FACTURA_ELECTRONICA'),
        allowNull: false,
    },
    invoice_type: {
        type: DataTypes.STRING, // Ej: 'FACTURA_A', 'FACTURA_B', 'TICKET'
        allowNull: false,
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cae: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser nulo para controladores fiscales
    },
    cae_due_date: {
        type: DataTypes.DATE,
        allowNull: true, // Puede ser nulo para controladores fiscales
    },
    afip_response_data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    fiscal_printer_data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('PENDIENTE', 'EN_PROCESO', 'REINTENTANDO', 'EMITIDO', 'ERROR'),
        allowNull: false,
        defaultValue: 'PENDIENTE',
    },
}, {
    timestamps: true,
    tableName: 'fiscal_invoices',
});

// Associations
FiscalInvoicesModel.belongsTo(SaleModel, { foreignKey: 'sale_id' });
FiscalInvoicesModel.belongsTo(PointOfSaleModel, { foreignKey: 'point_of_sale_id' });

export default FiscalInvoicesModel;