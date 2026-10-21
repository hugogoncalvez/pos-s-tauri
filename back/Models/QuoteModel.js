import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const QuoteModel = db.define('quote', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    quote_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'customers',
            key: 'id',
        },
    },
    customer_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    customer_document: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    customer_phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    customer_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    customer_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id',
        },
    },
    quote_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    valid_until: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'borrador',
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    discount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    terms: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    converted_sale_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'sales',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    tableName: 'quotes',
    freezeTableName: true,
    indexes: [
        { fields: ['customer_id'] },
        { fields: ['user_id'] },
        { fields: ['status'] },
        { fields: ['quote_date'] },
    ],
});

export default QuoteModel;
