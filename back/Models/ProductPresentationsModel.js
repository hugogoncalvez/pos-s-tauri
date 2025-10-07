import { DataTypes } from 'sequelize';
import db from '../database/db.js';

// Helper function for EAN-13 check digit calculation
function calculateEAN13CheckDigit(ean13) {
    if (!ean13 || ean13.length !== 12 || !/^\d+$/.test(ean13)) {
        return null;
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(ean13[i], 10);
        sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
}

// Helper function for EAN-8 check digit calculation
function calculateEAN8CheckDigit(ean8) {
    if (!ean8 || ean8.length !== 7 || !/^\d+$/.test(ean8)) {
        return null;
    }
    let sum = 0;
    for (let i = 0; i < 7; i++) {
        const digit = parseInt(ean8[i], 10);
        sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
}

export const ProductPresentationsModel = db.define('product_presentations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stock_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stocks', // Nombre de la tabla de productos
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de la presentación, ej: "Docena", "Media Horma", "Pack de 6"'
    },
    quantity_in_base_units: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        comment: 'Cuántas unidades base contiene esta presentación. Ej: 12 para una docena.'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'El precio de venta de esta presentación específica.'
    },
    barcode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        comment: 'Código de barras opcional para esta presentación específica.',
        validate: {
            isEANValid(value) {
                if (value === null || value === '') {
                    return; // Barcode is optional, so null or empty is valid
                }
                if (!/^\d+$/.test(value)) {
                    throw new Error('El código de barras solo puede contener dígitos numéricos.');
                }
                if (value.length === 8) {
                    const dataDigits = value.substring(0, 7);
                    const checkDigit = parseInt(value[7], 10);
                    if (calculateEAN8CheckDigit(dataDigits) !== checkDigit) {
                        throw new Error('Dígito de control EAN-8 inválido.');
                    }
                } else if (value.length === 13) {
                    const dataDigits = value.substring(0, 12);
                    const checkDigit = parseInt(value[12], 10);
                    if (calculateEAN13CheckDigit(dataDigits) !== checkDigit) {
                        throw new Error('Dígito de control EAN-13 inválido.');
                    }
                } else {
                    throw new Error('El código de barras debe tener 8 o 13 dígitos.');
                }
            }
        }
    }
}, {
    timestamps: true,
    tableName: 'product_presentations' // Aseguramos el nombre de la tabla
});