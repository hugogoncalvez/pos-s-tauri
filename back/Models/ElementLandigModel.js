import db from "../database/db.js";
import { DataTypes } from "sequelize";

const ElementLandingModel = db.define('landing_elementos', {
    nombre: { type: DataTypes.STRING },
    orden: { type: DataTypes.INTEGER },
    descripcion: { type: DataTypes.STRING },
    imagen: { type: DataTypes.STRING },
    navegar: { type: DataTypes.STRING },
    permiso_requerido: { type: DataTypes.STRING },
}, {
    timestamps: true // Esto habilita los campos createdAt y updatedAt automáticamente
});

export default ElementLandingModel;