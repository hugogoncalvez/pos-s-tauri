import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierQuoteDetailModel = db.define('supplier_quote_detail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_quote_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    units_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cantidad: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0
    },
    unidad: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    detalle: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    importe: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'supplier_quote_details',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_quote_id'] },
        { fields: ['stock_id'] }
    ]
});

export default SupplierQuoteDetailModel;
