import db from "../database/db.js";
import { DataTypes } from "sequelize";

const CashSessionsModel = db.define('cash_sessions', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    opening_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cashier_declared_amount: { // Renamed from closing_amount
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_sales: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_discounts: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    opened_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    // 'closed_at' is now represented by 'verified_at' for the final closure time.
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('abierta', 'pendiente_cierre', 'cerrada'),
        defaultValue: 'abierta'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // --- New Fields for 2-step closure ---
    preliminary_discrepancy: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    closed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    closed_at_user: {
        type: DataTypes.DATE,
        allowNull: true
    },
    admin_verified_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    final_discrepancy: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    verified_by_admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    total_sales_at_close: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'cash_sessions',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'status']
        }
    ]
});

export default CashSessionsModel;
