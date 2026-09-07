import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const ComandaModel = db.define('comandas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre de la mesa o pedido, ej: Mesa 4, Pedido #12'
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en_preparacion', 'entregado', 'facturada', 'cancelada'),
    defaultValue: 'pendiente',
    allowNull: false,
    comment: 'Estado del pedido en cocina/barra'
  },
  comanda_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Objeto JSON con los ítems, observaciones de cocina, cliente y metadatos'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  cash_session_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'cash_sessions',
      key: 'id'
    }
  },
}, {
  timestamps: true,
  tableName: 'comandas'
});

// Sincronizar automáticamente la tabla en MySQL si no existe
ComandaModel.sync().then(() => {
  console.log('✅ Tabla "comandas" verificada/creada en la base de datos MySQL.');
}).catch((err) => {
  console.error('⚠️ Error al sincronizar la tabla "comandas":', err.message);
});

export default ComandaModel;
