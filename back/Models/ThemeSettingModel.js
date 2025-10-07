import { DataTypes } from 'sequelize';
import db from '../database/db.js'; // Correct import for your Sequelize instance

const ThemeSetting = db.define('ThemeSettings', { // Use db.define and correct model name
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'ThemeSettings', // Exact table name from SQL dump
  timestamps: true,
  createdAt: 'createdAt', // Matches SQL dump
  updatedAt: 'updatedAt'  // Matches SQL dump
});

export default ThemeSetting;

// import db from "../database/db.js";
// import { DataTypes } from "sequelize";

// const ThemeSettingModel = db.define('ThemeSettings', {
//   key: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//     allowNull: false,
//     unique: true,
//   },
//   value: {
//     type: DataTypes.JSON,
//     allowNull: false,
//   },
// }, {
//   timestamps: true
// });

// export default ThemeSettingModel;