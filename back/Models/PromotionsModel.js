import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Promotion = db.define('promotion', {
    id: {
        type: DataTypes.BIGINT, // <--- CHANGED
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('BOGO', 'PERCENT_DISCOUNT_ON_NTH', 'FIXED_PRICE_ON_NTH'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    required_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'promotions',
    timestamps: true
});

export default Promotion;