import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierQuoteModel = db.define('supplier_quote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    rubro: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING(60),
        allowNull: false,
        defaultValue: 'MATERIALES'
    },
    estado: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'solicitada'
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    supplier_order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'supplier_quotes',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_id'] },
        { fields: ['fecha'] },
        { fields: ['estado'] }
    ]
});

export default SupplierQuoteModel;
