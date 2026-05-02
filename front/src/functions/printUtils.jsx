/**
 * Utilidad para imprimir recibos de venta y comprobantes de pago.
 * Personalizado para el mercado brasileño con soporte para datos dinámicos de la empresa.
 */

const sanitizeHtml = (str) => {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const parseMoney = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

const removeIframe = (iframe) => {
    if (iframe && iframe.parentNode) {
        try {
            iframe.parentNode.removeChild(iframe);
        } catch (e) {
            console.warn('Error al remover iframe:', e);
        }
    }
};

export const printReceipt = (data, type, customerName = '', businessData = null, isThermal = false) => {
    // Si no hay businessData, usamos valores por defecto en portugués
    const business = businessData || {
        name: 'Meu Negócio',
        footerText: 'Obrigado pela sua preferência!',
        cnpj: '',
        ie: '',
        address: '',
        logo: ''
    };

    // 1. Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    // 2. Manejador onload con cleanup para evitar memory leaks
    iframe.onload = () => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (error) {
            console.error('Error al intentar imprimir:', error);
            removeIframe(iframe);
        } finally {
            setTimeout(() => removeIframe(iframe), 500);
        }
    };

    // 3. Construir el contenido
    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    let receiptContent = '<html><head><title>Recibo</title>';
    receiptContent += '<meta charset="UTF-8">';
    receiptContent += '<style>';
    
    if (isThermal) {
        // Estilos optimizados para impresoras térmicas (80mm)
        receiptContent += `
            body { 
                font-family: 'Courier New', Courier, monospace; 
                margin: 0; 
                padding: 0; 
                width: 72mm; /* Ajuste para impresoras de 80mm */
                font-size: 12px; 
                line-height: 1.2; 
                color: #000; 
                background: #fff; 
            }
            .receipt-container { width: 100%; border: none; }
            .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .logo-img { 
                max-width: 25mm; 
                max-height: 25mm; 
                margin-bottom: 5px; 
                background-color: #fff; /* Fondo blanco forzado */
            }
            .company-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
            .business-info { font-size: 10px; }
            .non-fiscal-warning { 
                font-size: 14px; 
                font-weight: bold; 
                border: 1px solid #000; 
                padding: 5px; 
                margin: 10px 0; 
                text-align: center; 
            }
            .receipt-title { font-size: 14px; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
            .receipt-body { padding: 0; }
            .info-section { margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { border-bottom: 1px solid #000; text-align: left; font-size: 11px; }
            td { padding: 4px 0; font-size: 11px; border-bottom: 1px dashed #eee; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; border-top: 1px solid #000; }
            .receipt-footer { padding: 10px 0; text-align: center; border-top: 1px dashed #000; margin-top: 10px; font-size: 10px; }
            
            @page { margin: 0; size: auto; }
        `;
    } else {
        // Estilos para A4 / PDF (Existentes)
        receiptContent += `
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; font-size: 13px; line-height: 1.4; color: #333; background: #fff; position: relative; }
            .receipt-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #fff; 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                overflow: hidden; 
                position: relative;
            }
            
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-15deg);
                width: 300px;
                height: 300px;
                opacity: 0.04;
                z-index: 0;
                pointer-events: none;
                background-image: url('${sanitizeHtml(business.logo)}');
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
            }

            .receipt-header { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); color: #333; padding: 20px; text-align: center; border-bottom: 2px solid #667eea; position: relative; z-index: 1; }
            .logo-img { max-width: 60px; max-height: 60px; margin-bottom: 5px; opacity: 0.8; }
            .company-name { font-size: 20px; font-weight: bold; margin: 0 0 5px 0; color: #667eea; }
            .business-info { font-size: 11px; opacity: 0.9; margin-top: 5px; line-height: 1.2; }
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
            .thank-you { font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 5px; }
            .footer-text { font-size: 12px; color: #666; font-style: italic; }
            .payment-methods { background: #e8f5e8; border-radius: 6px; padding: 12px; margin: 15px 0; }
            .payment-methods h4 { margin: 0 0 10px 0; color: #2e7d32; }
            .payment-method-item { display: flex; justify-content: space-between; }
            
            @media print {
                body { margin: 0; padding: 10px; }
                .receipt-container { border: 1px solid #ccc; box-shadow: none; }
                .receipt-header, th, .total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .receipt-header { background: #f5f5f5 !important; color: black !important; border-bottom: 2px solid #ccc; }
                th { background: #f5f5f5 !important; color: black !important; border-bottom: 1px solid #ccc; }
                .total-row { background: #e0e0e0 !important; color: black !important; font-weight: bold; }
            }
        `;
    }

    receiptContent += '</style></head><body>';
    receiptContent += '<div class="receipt-container">';
    
    // Inyectar marca de agua si existe el logo y NO es térmico
    if (business.logo && !isThermal) {
        receiptContent += `<div class="watermark" style="background-image: url('${sanitizeHtml(business.logo)}');"></div>`;
    }

    if (type === 'sale') {
        const sale = data;
        receiptContent += `
            <div class="receipt-header">
                ${business.logo && !isThermal ? `<img src="${sanitizeHtml(business.logo)}" class="logo-img" />` : ''}
                <div class="company-name">${sanitizeHtml(business.name)}</div>
                <div class="business-info">
                    ${business.cnpj ? `CNPJ: ${sanitizeHtml(business.cnpj)} <br>` : ''}
                    ${business.ie ? `IE: ${sanitizeHtml(business.ie)} <br>` : ''}
                    ${business.address ? `${sanitizeHtml(business.address)}` : ''}
                </div>
                ${isThermal ? '<div class="non-fiscal-warning">DOCUMENTO NÃO FISCAL</div>' : ''}
                <div class="receipt-title">Recibo de Venda</div>
                ${sale.id && sale.id !== 'PREVIEW' ? `<div class="receipt-number">#${sanitizeHtml(sale.id)}</div>` : ''}
            </div>
            <div class="receipt-body">
                <div class="info-section">
                    <div class="info-row"><span>Cliente:</span> <span>${sanitizeHtml(customerName) || 'Consumidor Final'}</span></div>
                    <div class="info-row"><span>Data:</span> <span>${new Date(sale.createdAt).toLocaleString('pt-BR')}</span></div>
                </div>
        `;

        if (sale.sale_payments && sale.sale_payments.length > 0) {
            receiptContent += '<div class="payment-methods"><h4>Métodos de Pagamento</h4>';
            sale.sale_payments.forEach(p => {
                receiptContent += `<div class="payment-method-item"><span>${sanitizeHtml(p.payment?.method) || 'N/A'}</span><span>R$ ${parseMoney(p.amount).toFixed(2)}</span></div>`;
            });
            receiptContent += '</div>';
        } else if (parseMoney(sale.total_neto) > 0) {
            receiptContent += '<div class="payment-methods"><h4>Métodos de Pagamento</h4>';
            receiptContent += `<div class="payment-method-item"><span>Crédito</span><span>R$ ${parseMoney(sale.total_neto).toFixed(2)}</span></div>`;
            receiptContent += '</div>';
        }

        receiptContent += '<table><thead><tr><th>Produto</th><th class="text-center">Qtd.</th><th class="text-right">Preço Unit.</th><th class="text-right">Subtotal</th></tr></thead><tbody>';
        if (sale.sale_details && sale.sale_details.length > 0) {
            sale.sale_details.forEach(detail => {
                receiptContent += `
                    <tr>
                        <td>${sanitizeHtml(detail.stock?.name) || 'Produto Desconhecido'}</td>
                        <td class="text-center">${sanitizeHtml(detail.quantity)}</td>
                        <td class="text-right">R$ ${parseMoney(detail.price).toFixed(2)}</td>
                        <td class="text-right">R$ ${(sanitizeHtml(detail.quantity) * parseMoney(detail.price)).toFixed(2)}</td>
                    </tr>
                `;
            });
        }
        receiptContent += '</tbody><tfoot>';
        receiptContent += `
            <tr>
                <td colspan="3" class="text-right" style="border:none; padding-top: 10px;"><strong>Subtotal:</strong></td>
                <td class="text-right" style="border:none; padding-top: 10px;">R$ ${parseMoney(sale.total_amount).toFixed(2)}</td>
            </tr>
        `;

        if (parseMoney(sale.surcharge_amount) > 0) {
            receiptContent += `
                <tr>
                    <td colspan="3" class="text-right" style="border:none;"><strong>Acréscimo:</strong></td>
                    <td class="text-right" style="border:none;">R$ ${parseMoney(sale.surcharge_amount).toFixed(2)}</td>
                </tr>
            `;
        }

        receiptContent += `
            <tr class="total-row">
                <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                <td class="text-right"><strong>R$ ${parseMoney(sale.total_neto).toFixed(2)}</strong></td>
            </tr>
        `;
        receiptContent += '</tfoot></table>';
        receiptContent += '</div>';

} else if (type === 'payment') {
        const payment = data;
        receiptContent += `
            <div class="receipt-header">
                 ${business.logo && !isThermal ? `<img src="${sanitizeHtml(business.logo)}" class="logo-img" />` : ''}
                 <div class="company-name">${sanitizeHtml(business.name)}</div>
                 <div class="business-info">
                    ${business.cnpj ? `CNPJ: ${sanitizeHtml(business.cnpj)} <br>` : ''}
                    ${business.ie ? `IE: ${sanitizeHtml(business.ie)} <br>` : ''}
                    ${business.address ? `${sanitizeHtml(business.address)}` : ''}
                 </div>
                 <div class="receipt-title">Comprovante de Pagamento</div>
                 <div class="receipt-number">#${sanitizeHtml(payment.id)}</div>
            </div>
            <div class="receipt-body">
                 <div class="info-section">
                    <div class="info-row"><span>Cliente:</span> <span>${sanitizeHtml(customerName) || 'N/A'}</span></div>
                    <div class="info-row"><span>Data do Pagamento:</span> <span>${new Date(payment.payment_date).toLocaleString('pt-BR')}</span></div>
                    <div class="info-row"><span>Método de Pagamento:</span> <span>${sanitizeHtml(payment.payment_method) || 'N/A'}</span></div>
                 </div>
                 <h3 style="text-align: center; margin-top: 30px;">Valor Pago: R$ ${parseMoney(payment.amount).toFixed(2)}</h3>
                 ${payment.notes ? `<p><strong>Notas:</strong> ${sanitizeHtml(payment.notes)}</p>` : ''}
            </div>
        `;
    }

    receiptContent += `
        <div class="receipt-footer">
            <div class="footer-text">${sanitizeHtml(business.footerText) || 'Obrigado pela preferência!'}</div>
        </div>
    `;
    receiptContent += '</div></body></html>';

    printDocument.open();
    printDocument.write(receiptContent);
    printDocument.close();
};
