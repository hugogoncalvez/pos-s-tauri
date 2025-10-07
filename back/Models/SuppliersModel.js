import db from "../database/db.js";
import { DataTypes } from "sequelize";

const SuppliersModel = db.define('supplier', {
    nombre: { type: DataTypes.STRING },
    cuit: { type: DataTypes.STRING },
    telefono: { type: DataTypes.STRING },
}, {
    timestamps: true,
    tableName: 'suppliers',
    freezeTableName: true
});


export default SuppliersModel