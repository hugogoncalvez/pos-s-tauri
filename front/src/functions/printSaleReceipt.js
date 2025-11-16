import { printContent } from './printUtils.jsx';

const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
const formatDate = (dateString) => new Date(dateString).toLocaleString('es-AR');

export const printSaleReceipt = (saleDetails) => {
    if (!saleDetails) {
        console.error("No hay detalles de la venta para imprimir.");
        return;
    }

    const {
        id,
        createdAt,
        Customer,
        usuario,
        total_neto,
        sale_details,
        sale_payments
    } = saleDetails;

    const itemsHtml = sale_details.map(item => `
        <tr>
            <td>${item.quantity}x</td>
            <td>${item.stock?.name || item.combo?.name || 'Producto Manual'}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.quantity * item.price)}</td>
        </tr>
    `).join('');

    const paymentsHtml = sale_payments.map(p => `
        <div class="info-item">
            <span>${p.payment.method}:</span>
            <span>${formatCurrency(p.amount)}</span>
        </div>
    `).join('');

    const content = `
        <div class="receipt">
            <div class="header">
                <h1>Recibo de Venta</h1>
                <p>ID de Venta: ${id}</p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <span>Fecha:</span>
                    <span>${formatDate(createdAt)}</span>
                </div>
                <div class="info-item">
                    <span>Cajero:</span>
                    <span>${usuario?.username || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span>Cliente:</span>
                    <span>${Customer?.name || 'Consumidor Final'}</span>
                </div>
            </div>

            <h2>Detalle de Productos</h2>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Cant.</th>
                        <th>Producto</th>
                        <th class="text-right">Precio Unit.</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <h2>Detalle de Pagos</h2>
            <div class="info-grid">
                ${paymentsHtml}
            </div>

            <div class="total-section">
                <div class="info-item total">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(total_neto)}</span>
                </div>
            </div>

            <div class="footer">
                <p>Gracias por su compra</p>
            </div>
        </div>
    `;

    const styles = `
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            -webkit-print-color-adjust: exact;
        }
        .receipt {
            width: 80mm;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #ccc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5em;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 0.9em;
        }
        h2 {
            font-size: 1.2em;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-top: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-bottom: 20px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.9em;
        }
        .info-item span:first-child {
            font-weight: bold;
            color: #555;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9em;
        }
        .items-table th, .items-table td {
            padding: 8px 4px;
            border-bottom: 1px solid #eee;
        }
        .items-table th {
            text-align: left;
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .total-section {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #333;
        }
        .total {
            font-size: 1.3em;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.8em;
            color: #777;
        }
    `;

    printContent(content, styles);
};
