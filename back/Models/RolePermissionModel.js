// back/Models/RolePermissionModel.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import RoleModel from './RoleModel.js';
import { Permission } from './PermissionModel.js';

export const RolePermission = db.define('RolePermission', {
    rol_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: RoleModel,
            key: 'id'
        }
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Permission,
            key: 'id'
        }
    }
}, {
    timestamps: false,
    tableName: 'roles_permisos',
    freezeTableName: true
});

// Definir las asociaciones
RoleModel.belongsToMany(Permission, { through: RolePermission, foreignKey: 'rol_id' });
Permission.belongsToMany(RoleModel, { through: RolePermission, foreignKey: 'permiso_id' });
