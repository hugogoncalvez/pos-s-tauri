import { DataTypes } from 'sequelize';
import db from '../database/db.js'; // Asegúrate que la ruta a tu conexión db sea correcta

const PaymentModel = db.define('payment', {
    // Asumiendo una estructura básica, ajusta según tu tabla 'payment' real
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    method: { // e.g., 'efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia'
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    surcharge_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el recargo porcentual está activo para este método de pago.'
    },
    surcharge_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'Porcentaje de recargo a aplicar si surcharge_active es true.'
    }
}, {
    // Opciones adicionales del modelo
    timestamps: true, // O false si tu tabla no tiene createdAt/updatedAt
    tableName: 'payments', // Especificar el nombre correcto de la tabla
    freezeTableName: true // Asegura que Sequelize use el nombre de tabla exacto
});

export default PaymentModel;