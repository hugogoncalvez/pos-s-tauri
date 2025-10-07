import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const SalePaymentModel = db.define('sale_payment', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    sale_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'FK a la tabla sales'
    },
    payment_method_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'FK a la tabla payments'
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Monto pagado con este método'
    },
}, {
    timestamps: true,
    tableName: 'sale_payments',
    freezeTableName: true,
    comment: 'Tabla para registrar los métodos de pago de cada venta',
});

export default SalePaymentModel;
