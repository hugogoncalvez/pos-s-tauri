import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const CreditNoteCounterModel = db.define('credit_note_counter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ultimo_numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: false,
    tableName: 'credit_note_counters',
    freezeTableName: true
});

export default CreditNoteCounterModel;

