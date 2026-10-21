import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const QuoteDetailModel = db.define('quote_detail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    quote_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'quotes',
            key: 'id',
        },
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'stocks',
            key: 'id',
        },
    },
    presentation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'product_presentations',
            key: 'id',
        },
    },
    product_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    presentation_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    unit_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
    },
    base_quantity: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    line_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'quote_details',
    freezeTableName: true,
    indexes: [
        { fields: ['quote_id'] },
        { fields: ['stock_id'] },
    ],
});

export default QuoteDetailModel;
