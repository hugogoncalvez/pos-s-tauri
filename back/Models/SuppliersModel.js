import db from "../database/db.js";
import { DataTypes } from "sequelize";

const SuppliersModel = db.define('supplier', {
    nombre: { type: DataTypes.STRING(255), allowNull: false },
    cuit: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    telefono: { type: DataTypes.STRING(255), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: true },
    direccion: { type: DataTypes.STRING(255), allowNull: true },
    contacto: { type: DataTypes.STRING(255), allowNull: true },
    condiciones_pago: { type: DataTypes.STRING(255), allowNull: true },
    notas: { type: DataTypes.TEXT, allowNull: true },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    initial_debt: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    initial_debt_notes: { type: DataTypes.TEXT, allowNull: true },
    initial_debt_date: { type: DataTypes.DATEONLY, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
    timestamps: true,
    tableName: 'suppliers',
    freezeTableName: true,
    indexes: [
        { fields: ['nombre'], unique: true },
        { fields: ['cuit'], unique: true },
        { fields: ['activo'] }
    ]
});

export default SuppliersModel;
