import { DataTypes } from 'sequelize';
import db from '../database/db.js';

export const ComboItem = db.define('combo_item', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    combo_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'combos',
            key: 'id'
        }
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'stocks',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    },
    component_presentation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'product_presentations',
            key: 'id'
        }
    }
}, {
    tableName: 'combo_items',
    timestamps: true
});
