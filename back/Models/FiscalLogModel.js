import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const FiscalLog = sequelize.define('fiscal_logs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    level: {
        type: DataTypes.ENUM('INFO', 'ERROR', 'DEBUG'),
        allowNull: false
    },
    source: {
        type: DataTypes.ENUM('AFIP', 'PRINTER', 'SYSTEM'),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reference_id: {
        type: DataTypes.STRING, // Can be Sale ID, Job ID, etc.
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'fiscal_logs'
});

export default FiscalLog;
