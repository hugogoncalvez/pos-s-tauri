import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const PendingTicket = db.define('pending_tickets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Un nombre descriptivo para el ticket pendiente, ej: Mesa 5'
  },
  ticket_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Objeto JSON con todos los datos de la venta temporal (productos, cliente, etc.)'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  cash_session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cash_sessions',
      key: 'id'
    }
  },
}, {
  timestamps: true,
  tableName: 'pending_tickets'
});

export default PendingTicket;
