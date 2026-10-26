import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierPaymentAllocationModel = db.define('supplier_payment_allocation', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    supplier_payment_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    target_type: {
        type: DataTypes.ENUM('purchase', 'initial_debt'),
        allowNull: false,
        defaultValue: 'purchase'
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    }
}, {
    timestamps: true,
    tableName: 'supplier_payment_allocations',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_payment_id'] },
        { fields: ['purchase_id'] },
        { fields: ['target_type'] }
    ]
});

export default SupplierPaymentAllocationModel;
