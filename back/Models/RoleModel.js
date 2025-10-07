import db from "../database/db.js";
import { DataTypes } from "sequelize";

const RoleModel = db.define('roles', {
    nombre: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.STRING },
}, {
    timestamps: true
});

export default RoleModel;
