import { DataTypes } from 'sequelize';
import db from '../database/db.js';

export const ProductPromotionsModel = db.define('product_promotion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    promotion_id: {
        type: DataTypes.BIGINT, // <--- CHANGED
        references: {
            model: 'promotions',
            key: 'id'
        }
    },
    stock_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'stocks',
            key: 'id'
        }
    },
    presentation_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'product_presentations',
            key: 'id'
        },
        allowNull: true // Puede ser nulo si la promoción aplica a todo el producto
    }
}, {
    tableName: 'product_promotions'
});