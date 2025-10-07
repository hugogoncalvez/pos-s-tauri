import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PurchasesModel = db.define('purchase', {
    factura: { type: DataTypes.STRING },
    supplier: { type: DataTypes.STRING },
    cost: { type: DataTypes.DECIMAL(10, 2) },
}, {
    timestamps: true,
    tableName: 'purchases',
    freezeTableName: true
});


export default PurchasesModel