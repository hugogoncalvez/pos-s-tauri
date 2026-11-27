import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import CustomersModel from './CustomersModel.js';

const CustomerPaymentsModel = db.define('customer_payments', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: CustomersModel,
            key: 'id'
        }
    },
    cash_session_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'cash_sessions',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
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
        defaultValue: 'efectivo',

    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
    }
}, {
    timestamps: false, // Usamos payment_date en lugar de createdAt/updatedAt
    tableName: 'customer_payments',
    indexes: [
        {
            fields: ['customer_id']
        },
        {
            fields: ['payment_date']
        },
        {
            fields: ['cash_session_id']
        }
    ]
});

export default CustomerPaymentsModel;