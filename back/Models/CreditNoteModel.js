import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const CreditNoteModel = db.define('credit_note', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    sale_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cash_session_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    estado: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'emitida'
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'credit_notes',
    freezeTableName: true,
    indexes: [
        { fields: ['customer_id'] },
        { fields: ['sale_id'] },
        { fields: ['fecha'] },
        { fields: ['estado'] }
    ]
});

export default CreditNoteModel;

