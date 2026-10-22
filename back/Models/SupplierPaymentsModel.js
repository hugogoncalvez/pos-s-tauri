import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierPaymentsModel = db.define('supplier_payment', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'efectivo'
    },
    notes: {
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
    cash_session_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    cash_movement_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    voided_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    voided_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    voided_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    void_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    void_cash_movement_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'supplier_payments',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_id'] },
        { fields: ['purchase_id'] },
        { fields: ['payment_date'] },
        { fields: ['voided_at'] }
    ]
});

export default SupplierPaymentsModel;
