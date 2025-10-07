import db from "../database/db.js";
import { DataTypes } from "sequelize";

const UnitsModel = db.define('unit', {
    name: { type: DataTypes.STRING },
    abreviatura: { type: DataTypes.STRING }
}, {
    timestamps: true,
    tableName: 'units',
    freezeTableName: true
});


export default UnitsModel