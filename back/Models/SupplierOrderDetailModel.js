import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierOrderDetailModel = db.define('supplier_order_detail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_order_id: {
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
        allowNull: false,
        defaultValue: 0
    },
    importe: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'supplier_order_details',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_order_id'] },
        { fields: ['stock_id'] }
    ]
});

export default SupplierOrderDetailModel;
