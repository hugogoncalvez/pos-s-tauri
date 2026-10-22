import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const PurchaseConditionChangeModel = db.define('purchase_condition_change', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    from_condition: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    to_condition: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    changed_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    changed_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'purchase_condition_changes',
    freezeTableName: true,
    indexes: [
        { fields: ['purchase_id'] }
    ]
});

export default PurchaseConditionChangeModel;
