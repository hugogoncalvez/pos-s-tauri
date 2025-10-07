import { DataTypes } from 'sequelize';
import db from '../database/db.js'; // Asegúrate que la ruta a tu conexión db sea correcta

// Import related models for associations (adjust paths if necessary)
import SalesModel from './SalesModel.js';
import StocksModel from './StocksModel.js';
import PromotionsModel from './PromotionsModel.js';

const SalesDetailsModel = db.define('sale_detail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    sales_Id: { // Note the capitalization 'Id' matching your DDL FK name
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: SalesModel,
            key: 'id',
        },
        comment: 'FK a la tabla sales'
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Puede ser nulo si es un combo
        references: {
            model: StocksModel,
            key: 'id',
        },
        comment: 'FK a la tabla stocks'
    },
    combo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'combos', // Nombre de la tabla de combos
            key: 'id'
        },
        comment: 'FK a la tabla combos si el item vendido es un combo'
    },
    promotion_id: {
        type: DataTypes.BIGINT,
        allowNull: true, // Un item puede no tener promoción
        references: {
            model: PromotionsModel,
            key: 'id',
        },
        comment: 'FK a la tabla promotions'
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3), // Corregido para soportar decimales (productos pesables)
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 3), // Matching your DDL DECIMAL(10,3)
        allowNull: false,
        comment: 'Precio unitario del producto al momento de la venta'
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Costo del producto al momento de la venta'
    }
}, {
    timestamps: true,
    tableName: 'sales_details',
    freezeTableName: true,
    comment: 'Tabla para registrar los detalles (productos) de cada venta',
});

// Define associations later in associations.js
// Example (don't put this here, put in associations.js):
// SalesDetailsModel.belongsTo(SalesModel, { foreignKey: 'sales_Id' });
// SalesDetailsModel.belongsTo(StocksModel, { foreignKey: 'stock_id' });
// SalesDetailsModel.belongsTo(PromotionsModel, { foreignKey: 'promotion_id' });

export default SalesDetailsModel;