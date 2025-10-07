import { DataTypes } from 'sequelize';
import db from '../database/db.js'; // Asegúrate que la ruta a tu conexión db sea correcta

// Import related models for associations (adjust paths if necessary)
import CustomersModel from './CustomersModel.js';
import PaymentModel from './PaymentModel.js';
import UsuarioModel from './UsuarioModel.js'; // Assuming UsuarioModel maps to 'users' table

const SalesModel = db.define('sale', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total bruto de la venta (suma de subtotales de detalles)'
    },
    promotion_discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Puede ser nulo si no hay descuento
        defaultValue: 0.00,
        comment: 'Descuento total aplicado por promociones'
    },
    total_neto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total final a pagar (total_amount - promotion_discount + surcharge_amount)'
    },
    surcharge_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Monto del recargo aplicado según la forma de pago.'
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false, // Según tu DDL, es NOT NULL
        references: {
            model: CustomersModel,
            key: 'id',
        },
        comment: 'FK a la tabla customers'
    },
    
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Según tu DDL, es NOT NULL
        references: {
            model: UsuarioModel, // Assuming UsuarioModel maps to 'users' table
            key: 'id', // Assuming the PK in UsuarioModel is 'id'
        },
        comment: 'FK a la tabla users (cajero que realizó la venta)'
    },
    cash_session_id: {
        type: DataTypes.BIGINT,
        allowNull: true, // Permite nulos, por si una venta no se asocia a una sesión
        references: {
            model: 'cash_sessions', // Nombre de la tabla referenciada
            key: 'id',
        },
        comment: 'FK a la tabla cash_sessions'
    },
    // createdAt y updatedAt son manejados por Sequelize (timestamps: true)
    // y coinciden con tus campos TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}, {
    timestamps: true, // Habilita createdAt y updatedAt
    tableName: 'sales', // Especifica el nombre exacto de la tabla
    freezeTableName: true,
    comment: 'Tabla para registrar las cabeceras de las ventas',
});

// Define associations later in associations.js
// Example (don't put this here, put in associations.js):
// SalesModel.belongsTo(CustomersModel, { foreignKey: 'customer_id' });
// SalesModel.belongsTo(PaymentModel, { foreignKey: 'payment_id' });
// SalesModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });
// SalesModel.hasMany(SalesDetailsModel, { foreignKey: 'sales_Id' });

export default SalesModel;