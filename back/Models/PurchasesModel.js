import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PurchasesModel = db.define('purchase', {
    factura: { type: DataTypes.STRING },
    supplier: { type: DataTypes.STRING },
    supplier_id: { type: DataTypes.INTEGER, allowNull: true },
    supplier_name_snapshot: { type: DataTypes.STRING(255), allowNull: true },
    cost: { type: DataTypes.DECIMAL(10, 2) },
    payment_condition: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'cuenta corriente' },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
    timestamps: true,
    tableName: 'purchases',
    freezeTableName: true,
    indexes: [
        { fields: ['supplier_id'] },
        { fields: ['payment_condition'] }
    ]
});

export default PurchasesModel;
