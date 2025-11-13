import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const PointOfSale = sequelize.define('points_of_sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false // ID will be the AFIP Point of Sale number, not auto-incremented
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emission_type: {
        type: DataTypes.ENUM('CONTROLADOR_FISCAL', 'FACTURA_ELECTRONICA'),
        allowNull: false
    },
    mode: {
        type: DataTypes.ENUM('SIMULADOR', 'PRODUCCION'),
        allowNull: false,
        defaultValue: 'SIMULADOR'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'points_of_sale'
});

export default PointOfSale;
