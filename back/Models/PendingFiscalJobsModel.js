// back/Models/PendingFiscalJobsModel.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import SaleModel from './SalesModel.js';
import PointOfSaleModel from './PointOfSaleModel.js';

const PendingFiscalJobsModel = db.define('pending_fiscal_jobs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SaleModel,
            key: 'id',
        },
    },
    point_of_sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PointOfSaleModel,
            key: 'id',
        },
    },
    attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    last_attempt_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'FAILED', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    job_data: {
        type: DataTypes.JSON,
        allowNull: false, // Store the data needed to retry the job
    },
}, {
    timestamps: true,
    tableName: 'pending_fiscal_jobs',
});

// Associations
PendingFiscalJobsModel.belongsTo(SaleModel, { foreignKey: 'sale_id' });
PendingFiscalJobsModel.belongsTo(PointOfSaleModel, { foreignKey: 'point_of_sale_id' });

export default PendingFiscalJobsModel;