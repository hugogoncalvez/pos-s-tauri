// back/Models/PermissionModel.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const PermissionModel = db.define('permiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Nombre único del permiso (ej: view_sales, manage_users)'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción amigable del permiso'
    },
    modulo: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'permisos',
    freezeTableName: true
});

export default PermissionModel;