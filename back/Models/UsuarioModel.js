import db from "../database/db.js";
import { DataTypes } from "sequelize";

const UsuarioModel = db.define('usuarios', {
  nombre: { type: DataTypes.STRING },
  username: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  activo: { type: DataTypes.BOOLEAN },
  rol_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  theme_preference: {
    type: DataTypes.STRING,
    defaultValue: 'dark'
  }
})

export default UsuarioModel;