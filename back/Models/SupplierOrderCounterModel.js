import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SupplierOrderCounterModel = db.define('supplier_order_counter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ultimo_numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    tableName: 'supplier_order_counters',
    freezeTableName: true
});

export default SupplierOrderCounterModel;
