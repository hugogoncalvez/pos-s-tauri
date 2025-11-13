import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const FiscalConfig = sequelize.define('fiscal_configs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cuit: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    razon_social: {
        type: DataTypes.STRING,
        allowNull: false
    },
    condicion_iva: {
        type: DataTypes.ENUM('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL'),
        allowNull: false
    },
    afip_certificado_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    afip_clave_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    certificado_vigencia_desde: {
        type: DataTypes.DATE,
        allowNull: true
    },
    certificado_vigencia_hasta: {
        type: DataTypes.DATE,
        allowNull: true
    },
    afip_environment: {
        type: DataTypes.ENUM('HOMOLOGACION', 'PRODUCCION'),
        allowNull: false,
        defaultValue: 'HOMOLOGACION'
    },
    afip_ticket_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    afip_last_token_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'fiscal_configs'
});

export default FiscalConfig;
