import db from "../database/db.js";
import { DataTypes } from "sequelize";

const CategoriesModel = db.define('stockCategory', {
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
}, {
    timestamps: true,
    tableName: 'stockCategories',
    freezeTableName: true
});

export default CategoriesModel;