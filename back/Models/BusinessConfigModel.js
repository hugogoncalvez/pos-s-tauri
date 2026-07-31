import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const BusinessConfigModel = db.define('BusinessConfigs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Mi Negocio'
  },
  cuit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  iibb: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxCondition: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  footerText: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'BusinessConfigs',
  timestamps: true
});

export default BusinessConfigModel;
