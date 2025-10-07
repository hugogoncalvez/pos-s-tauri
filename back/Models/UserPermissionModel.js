
import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const UserPermissionModel = db.define('user_permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permisos',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('grant', 'revoke'),
    allowNull: false,
    comment: "Indica si el permiso se concede (grant) o se revoca (revoke)",
  },
}, {
  timestamps: true,
  comment: 'Tabla de overrides de permisos para usuarios específicos.',
});

export default UserPermissionModel;
