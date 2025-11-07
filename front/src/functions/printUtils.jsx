export const printReceipt = (data, type, customerName = '') => {
    // 1. Crear un iframe oculto de forma robusta
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    // 2. Asignar el manejador onload ANTES de escribir el contenido
    iframe.onload = () => {
        try {
            iframe.contentWindow.focus(); // El foco es importante para algunos navegadores
            iframe.contentWindow.print();
        } catch (error) {
            console.error('Error al intentar imprimir:', error);
        } finally {
            // 5. Limpiar el iframe después de un breve retraso para asegurar que el diálogo de impresión se haya abierto
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 500);
        }
    };

    // 3. Obtener el documento del iframe y construir el contenido
    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    let receiptContent = '<html><head><title>Recibo</title>';
    receiptContent += '<meta charset="UTF-8">';
    receiptContent += '<style>';
    receiptContent += `
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; font-size: 13px; line-height: 1.4; color: #333; background: #fff; }
        .receipt-container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .receipt-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; margin: 0 0 5px 0; }
        .receipt-title { font-size: 20px; font-weight: bold; margin: 15px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
        .receipt-number { font-size: 16px; }
        .receipt-body { padding: 25px; }
        .info-section { background: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #667eea; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .info-label { font-weight: 600; color: #555; }
        .info-value { font-weight: 500; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 8px; text-align: left; }
        td { padding: 10px 8px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { background: #667eea !important; color: white; font-weight: bold; }
        .total-row td { padding: 15px 8px; }
        .receipt-footer { padding: 20px; text-align: center; border-top: 2px dashed #ddd; margin-top: 20px; }
        .thank-you { font-size: 16px; font-weight: 600; color: #667eea; }
        .payment-methods { background: #e8f5e8; border-radius: 6px; padding: 12px; margin: 15px 0; }
        .payment-methods h4 { margin: 0 0 10px 0; color: #2e7d32; }
        .payment-method-item { display: flex; justify-content: space-between; }
        
        @media print {
            body { margin: 0; padding: 10px; }
            .receipt-container { border: 1px solid #ccc; box-shadow: none; }
            
            /* Forzar la impresión de los colores de fondo que definimos a continuación */
            .receipt-header, th, .total-row {
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
            }

            .receipt-header {
                background: #f5f5f5 !important; /* Gris muy claro */
                color: black !important;
                border-bottom: 2px solid #ccc;
            }
            th {
                background: #f5f5f5 !important; /* Gris muy claro */
                color: black !important;
                border-bottom: 1px solid #ccc;
            }
            .total-row {
                background: #e0e0e0 !important; /* Gris un poco más oscuro para el total */
                color: black !important;
                font-weight: bold;
            }
        }
    `;
    receiptContent += '</style></head><body>';
    receiptContent += '<div class="receipt-container">';

    if (type === 'sale') {
        const sale = data;
        receiptContent += `
            <div class="receipt-header">
                <div class="company-name">Mi Empresa</div>
                <div class="receipt-title">Recibo de Venta</div>
                <div class="receipt-number">#${sale.id}</div>
            </div>
            <div class="receipt-body">
                <div class="info-section">
                    <div class="info-row"><span>Cliente:</span> <span>${customerName || 'Consumidor Final'}</span></div>
                    <div class="info-row"><span>Fecha:</span> <span>${new Date(sale.createdAt).toLocaleString('es-ES')}</span></div>
                </div>
        `;

        if (sale.sale_payments && sale.sale_payments.length > 0) {
            receiptContent += '<div class="payment-methods"><h4>Métodos de Pago</h4>';
            sale.sale_payments.forEach(p => {
                receiptContent += `<div class="payment-method-item"><span>${p.payment?.method || 'N/A'}</span><span>$${parseFloat(p.amount).toFixed(2)}</span></div>`;
            });
            receiptContent += '</div>';
        } else if (parseFloat(sale.total_neto) > 0) { // Si no hay pagos pero hay un total, es todo a crédito
            receiptContent += '<div class="payment-methods"><h4>Métodos de Pago</h4>';
            receiptContent += `<div class="payment-method-item"><span>Crédito</span><span>$${parseFloat(sale.total_neto).toFixed(2)}</span></div>`;
            receiptContent += '</div>';
        }

        receiptContent += '<table><thead><tr><th>Producto</th><th class="text-center">Cant.</th><th class="text-right">Precio Unit.</th><th class="text-right">Subtotal</th></tr></thead><tbody>';
        if (sale.sale_details && sale.sale_details.length > 0) {
            sale.sale_details.forEach(detail => {
                receiptContent += `
                    <tr>
                        <td>${detail.stock?.name || 'Producto Desconocido'}</td>
                        <td class="text-center">${detail.quantity}</td>
                        <td class="text-right">$${parseFloat(detail.price).toFixed(2)}</td>
                        <td class="text-right">$${(detail.quantity * detail.price).toFixed(2)}</td>
                    </tr>
                `;
            });
        }
        receiptContent += '</tbody>'; // Cierra el cuerpo de la tabla

        // Abre el footer de la tabla para los totales
        receiptContent += '<tfoot>';
        receiptContent += `
            <tr>
                <td colspan="3" class="text-right" style="border:none; padding-top: 10px;"><strong>Subtotal:</strong></td>
                <td class="text-right" style="border:none; padding-top: 10px;">$${parseFloat(sale.total_amount).toFixed(2)}</td>
            </tr>
        `;

        if (sale.surcharge_amount > 0) {
            receiptContent += `
                <tr>
                    <td colspan="3" class="text-right" style="border:none;"><strong>Recargo:</strong></td>
                    <td class="text-right" style="border:none;">$${parseFloat(sale.surcharge_amount).toFixed(2)}</td>
                </tr>
            `;
        }

        receiptContent += `
            <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>$${parseFloat(sale.total_neto).toFixed(2)}</strong></td>
            </tr>
        `;
        receiptContent += '</tfoot></table>'; // Cierra el footer y la tabla
        receiptContent += '</div>';

    } else if (type === 'payment') {
        const payment = data;
        receiptContent += `
            <div class="receipt-header">
                 <div class="company-name">Mi Empresa</div>
                 <div class="receipt-title">Comprobante de Pago</div>
                 <div class="receipt-number">#${payment.id}</div>
            </div>
            <div class="receipt-body">
                 <div class="info-section">
                    <div class="info-row"><span>Cliente:</span> <span>${customerName || 'N/A'}</span></div>
                    <div class="info-row"><span>Fecha de Pago:</span> <span>${new Date(payment.payment_date).toLocaleString('es-ES')}</span></div>
                    <div class="info-row"><span>Método de Pago:</span> <span>${payment.payment_method || 'N/A'}</span></div>
                 </div>
                 <h3 style="text-align: center; margin-top: 30px;">Monto Pagado: $${parseFloat(payment.amount).toFixed(2)}</h3>
                 ${payment.notes ? `<p><strong>Notas:</strong> ${payment.notes}</p>` : ''}
            </div>
        `;
    }

    receiptContent += '<div class="receipt-footer"><div class="thank-you">¡Gracias por su preferencia!</div></div>';
    receiptContent += '</div></body></html>';

    // 4. Escribir el contenido, lo que disparará el evento onload
    printDocument.open();
    printDocument.write(receiptContent);
    printDocument.close();
};