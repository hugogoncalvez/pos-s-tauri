export const printReceipt = (data, type, customerName = '') => {
    const printWindow = window.open('', '_blank');

    let receiptContent = '<html><head><title>Recibo</title>';
    receiptContent += '<meta charset="UTF-8">';
    receiptContent += '<style>';

    // Estilos generales mejorados
    receiptContent += `
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 13px; 
            line-height: 1.4;
            color: #333;
            background: #fff;
        }
        
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border: 2px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }
        
        .receipt-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 10px solid #764ba2;
        }
        
        .company-info {
            margin-bottom: 15px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .company-details {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .receipt-title {
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .receipt-number {
            font-size: 16px;
            font-weight: normal;
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        
        .receipt-body {
            padding: 25px;
        }
        
        .info-section {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            align-items: center;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #555;
            min-width: 120px;
        }
        
        .info-value {
            color: #333;
            font-weight: 500;
            text-align: right;
        }
        
        .amount-highlight {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }
        
        .amount-highlight .amount {
            font-size: 28px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .amount-highlight .currency {
            font-size: 18px;
            opacity: 0.9;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            background: #fff;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 12px 8px;
            font-weight: 600;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        td { 
            padding: 10px 8px; 
            border-bottom: 1px solid #eee;
            vertical-align: middle;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: #e3f2fd;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        
        .total-row {
            background: #667eea !important;
            color: white;
            font-weight: bold;
        }
        
        .total-row td {
            border-bottom: none;
            padding: 15px 8px;
        }
        
        .receipt-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 2px dashed #ddd;
        }
        
        .thank-you {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .footer-info {
            font-size: 11px;
            color: #666;
            line-height: 1.3;
        }
        
        .timestamp {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #999;
        }
        
        .payment-methods {
            background: #e8f5e8;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
        }
        
        .payment-methods h4 {
            margin: 0 0 10px 0;
            color: #2e7d32;
            font-size: 14px;
        }
        
        .payment-method-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
        }
        
        .notes-section {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 12px;
            margin: 15px 0;
        }
        
        .notes-section h4 {
            margin: 0 0 8px 0;
            color: #856404;
            font-size: 14px;
        }
        
        .notes-content {
            color: #856404;
            font-size: 12px;
            line-height: 1.4;
        }
        
        @media print {
            body { margin: 0; padding: 10px; }
            .receipt-container { border: 1px solid #000; }
            .no-print { display: none; }
            .receipt-header { background: #333 !important; }
            th { background: #333 !important; }
            .amount-highlight { background: #333 !important; }
        }
    `;

    receiptContent += '</style>';
    receiptContent += '</head><body>';

    receiptContent += '<div class="receipt-container">';

    if (type === 'sale') {
        const sale = data;

        // Header
        receiptContent += `
            <div class="receipt-header">
                <div class="company-info">
                    <div class="company-name">Mi Empresa</div>
                    <div class="company-details">
                        Dirección: Calle Principal 123<br>
                        Tel: (123) 456-7890 | Email: info@miempresa.com
                    </div>
                </div>
                <div class="receipt-title">Recibo de Venta</div>
                <div class="receipt-number">#${sale.id}</div>
            </div>
        `;

        // Body
        receiptContent += '<div class="receipt-body">';

        // Información general
        receiptContent += `
            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">${customerName || 'Consumidor Final'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${new Date(sale.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
                </div>
            </div>
        `;

        // Métodos de pago
        if (sale.sale_payments && sale.sale_payments.length > 0) {
            receiptContent += '<div class="payment-methods">';
            receiptContent += '<h4>Métodos de Pago</h4>';
            sale.sale_payments.forEach(p => {
                receiptContent += `
                    <div class="payment-method-item">
                        <span>${p.payment?.method || 'Método no especificado'}</span>
                        <span>$${parseFloat(p.amount).toFixed(2)}</span>
                    </div>
                `;
            });
            receiptContent += '</div>';
        }

        // Tabla de productos
        receiptContent += '<h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">Detalle de Productos</h3>';
        receiptContent += '<table>';
        receiptContent += `
            <thead>
                <tr>
                    <th class="text-left">Producto</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
        `;
        receiptContent += '<tbody>';

        if (sale.sale_details && sale.sale_details.length > 0) {
            sale.sale_details.forEach(detail => {
                receiptContent += `
                    <tr>
                        <td class="text-left">${detail.stock?.name || 'Producto Desconocido'}</td>
                        <td class="text-center">${detail.quantity}</td>
                        <td class="text-right">$${parseFloat(detail.price).toFixed(2)}</td>
                        <td class="text-right">$${(detail.quantity * detail.price).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        // Fila de total
        receiptContent += `
            <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>$${parseFloat(sale.total_neto).toFixed(2)}</strong></td>
            </tr>
        `;
        receiptContent += '</tbody></table>';

        receiptContent += '</div>'; // Cierra receipt-body

    } else if (type === 'payment') {
        const payment = data;

        // Header para pago
        receiptContent += `
            <div class="receipt-header">
                <div class="company-info">
                    <div class="company-name">Mi Empresa</div>
                    <div class="company-details">
                        Dirección: Calle Principal 123<br>
                        Tel: (123) 456-7890 | Email: info@miempresa.com
                    </div>
                </div>
                <div class="receipt-title">Comprobante de Pago</div>
                <div class="receipt-number">#${payment.id}</div>
            </div>
        `;

        // Body para pago
        receiptContent += '<div class="receipt-body">';

        // Información del pago
        receiptContent += `
            <div class="info-section">
                <div class="info-row">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">${customerName || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha de Pago:</span>
                    <span class="info-value">${new Date(payment.payment_date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Método de Pago:</span>
                    <span class="info-value">${payment.payment_method || 'No especificado'}</span>
                </div>
                ${payment.created_by ? `
                    <div class="info-row">
                        <span class="info-label">Procesado por:</span>
                        <span class="info-value">${payment.created_by}</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Monto destacado
        receiptContent += `
            <div class="amount-highlight">
                <div style="margin-bottom: 5px;">Monto Recibido</div>
                <div class="amount">$${parseFloat(payment.amount).toFixed(2)}</div>
            </div>
        `;

        // Notas si existen
        if (payment.notes) {
            receiptContent += `
                <div class="notes-section">
                    <h4>Observaciones</h4>
                    <div class="notes-content">${payment.notes}</div>
                </div>
            `;
        }

        receiptContent += '</div>'; // Cierra receipt-body
    }

    // Footer común
    receiptContent += `
        <div class="receipt-footer">
            <div class="thank-you">¡Gracias por su ${type === 'sale' ? 'compra' : 'pago'}!</div>
            <div class="footer-info">
                Este documento es un comprobante válido de la transacción realizada.<br>
                Para consultas o reclamos, conserve este recibo.
            </div>
            <div class="timestamp">
                Impreso el ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}
            </div>
        </div>
    `;

    receiptContent += '</div>'; // Cierra receipt-container
    receiptContent += '</body></html>';

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

    printWindow.onafterprint = function () {
        printWindow.close();
    };

    setTimeout(() => {
        if (!printWindow.closed) {
            printWindow.close();
        }
    }, 1000);
};