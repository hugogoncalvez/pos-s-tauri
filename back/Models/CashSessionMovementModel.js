import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const CashSessionMovementModel = db.define('cash_session_movements', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    cash_session_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'cash_sessions',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('ingreso', 'egreso'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true // Allow null values for description
    }
}, {
    timestamps: true
});

export default CashSessionMovementModel;
