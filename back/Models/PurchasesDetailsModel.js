import db from "../database/db.js";
import { DataTypes } from "sequelize";

const PurchasesDetailsModel = db.define('purchases_details', {
    purchasesId: { type: DataTypes.INTEGER },
    stock_id: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.DECIMAL(10, 3) },
    cost: { type: DataTypes.DECIMAL(10, 3) },
}, {
    timestamps: true // Esto habilita los campos createdAt y updatedAt automáticamente
});

export default PurchasesDetailsModel