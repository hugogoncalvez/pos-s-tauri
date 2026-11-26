import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const CreditNoteDetailModel = db.define('credit_note_detail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    credit_note_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    sale_detail_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0
    },
    price: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0
    },
    line_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    product_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    unit_name: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    reingresa_stock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'credit_note_details',
    freezeTableName: true,
    indexes: [
        { fields: ['credit_note_id'] },
        { fields: ['stock_id'] }
    ]
});

export default CreditNoteDetailModel;

