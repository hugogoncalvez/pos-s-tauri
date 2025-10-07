import db from "../database/db.js";
import { DataTypes } from "sequelize";

const StocksModel = db.define('stock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    barcode: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10, 2) },
    tipo_venta: {
        type: DataTypes.ENUM('unitario', 'pesable'),
        allowNull: false,
        defaultValue: 'unitario'
    },
    cost: { type: DataTypes.DECIMAL(10, 2) },
    stock: { type: DataTypes.DECIMAL(10, 3) },
    min_stock: { type: DataTypes.DECIMAL(10, 2) },
    supplier_id: { type: DataTypes.INTEGER },
    visible: { type: DataTypes.INTEGER },
}, {
    timestamps: true,
    tableName: 'stocks',
    freezeTableName: true
});

export default StocksModel;