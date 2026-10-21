const escapeHtml = (value) => {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const formatPrice = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '$ 0,00';
    return number.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatQuantity = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return number.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
    });
};

const formatDate = (value) => {
    if (!value) return '';
    const raw = String(value).slice(0, 10);
    const [year, month, day] = raw.split('-');
    if (!year || !month || !day) return raw;
    return `${day}/${month}/${year}`;
};

const removeIframe = (iframe) => {
    if (iframe?.parentNode) {
        try {
            iframe.parentNode.removeChild(iframe);
        } catch (error) {
            console.warn('No se pudo quitar el iframe de impresión:', error);
        }
    }
};

const statusLabel = (status) => {
    switch (status) {
        case 'borrador': return 'BORRADOR';
        case 'emitido': return 'EMITIDO';
        case 'vencido': return 'VENCIDO';
        case 'convertido': return 'CONVERTIDO';
        case 'anulado': return 'ANULADO';
        default: return String(status || '').toUpperCase();
    }
};

export const printQuote = ({ quote, businessConfig = null }) => {
    if (!quote) return false;

    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;
    const details = Array.isArray(quote.details) ? quote.details : [];
    const status = quote.effective_status || quote.status;

    const rowsHtml = details.map((item) => `
        <tr>
            <td>
                <div class="product-name">${escapeHtml(item.product_name)}</div>
                ${item.presentation_name ? `<div class="product-detail">${escapeHtml(item.presentation_name)}</div>` : ''}
                ${item.notes ? `<div class="product-detail">${escapeHtml(item.notes)}</div>` : ''}
            </td>
            <td class="center">${escapeHtml(item.unit_name || '')}</td>
            <td class="right">${formatQuantity(item.quantity)}</td>
            <td class="right">${formatPrice(item.unit_price)}</td>
            <td class="right strong">${formatPrice(item.line_total)}</td>
        </tr>
    `).join('');

    const headerHtml = `
        <div class="header">
            <div class="brand">
                ${business?.logo ? `<img src="${escapeHtml(business.logo)}" class="logo" alt="Logo" />` : ''}
                <div>
                    <div class="company-name">${escapeHtml(business?.name || 'Sistema POS')}</div>
                    <div class="company-info">
                        ${business?.address ? `<span>${escapeHtml(business.address)}</span>` : ''}
                        ${business?.phone ? `<span>Tel: ${escapeHtml(business.phone)}</span>` : ''}
                        ${business?.email ? `<span>${escapeHtml(business.email)}</span>` : ''}
                        ${business?.cuit ? `<span>CUIT: ${escapeHtml(business.cuit)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="document-title">
                <h1>PRESUPUESTO</h1>
                <div class="document-number">${escapeHtml(quote.quote_number || 'Sin número')}</div>
                <span class="status status-${escapeHtml(String(status).toLowerCase())}">${statusLabel(status)}</span>
            </div>
        </div>
    `;

    const metaHtml = `
        <div class="meta-grid">
            <div class="meta-card">
                <div class="meta-label">Cliente</div>
                <div class="meta-value">${escapeHtml(quote.customer_name)}</div>
                ${quote.customer_document ? `<div class="meta-line">Documento: ${escapeHtml(quote.customer_document)}</div>` : ''}
                ${quote.customer_phone ? `<div class="meta-line">Tel: ${escapeHtml(quote.customer_phone)}</div>` : ''}
                ${quote.customer_address ? `<div class="meta-line">${escapeHtml(quote.customer_address)}</div>` : ''}
                ${quote.customer_email ? `<div class="meta-line">${escapeHtml(quote.customer_email)}</div>` : ''}
            </div>
            <div class="meta-card">
                <div class="meta-row"><span>Fecha</span><strong>${formatDate(quote.quote_date)}</strong></div>
                <div class="meta-row"><span>Válido hasta</span><strong>${formatDate(quote.valid_until)}</strong></div>
                <div class="meta-row"><span>Vendedor</span><strong>${escapeHtml(quote.user?.nombre || quote.user?.username || '')}</strong></div>
                <div class="meta-row"><span>Estado</span><strong>${statusLabel(status)}</strong></div>
            </div>
        </div>
    `;

    const tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th class="center">Unidad</th>
                    <th class="right">Cantidad</th>
                    <th class="right">Precio unit.</th>
                    <th class="right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml || '<tr><td colspan="5" class="center">Sin ítems</td></tr>'}
            </tbody>
        </table>
    `;

    const totalsHtml = `
        <div class="totals-wrap">
            <div class="notes">
                ${quote.notes ? `<div class="notes-block"><div class="notes-title">Notas</div><div>${escapeHtml(quote.notes)}</div></div>` : ''}
                ${quote.terms ? `<div class="notes-block"><div class="notes-title">Condiciones</div><div>${escapeHtml(quote.terms)}</div></div>` : ''}
            </div>
            <div class="totals">
                <div class="total-row"><span>Subtotal</span><strong>${formatPrice(quote.subtotal)}</strong></div>
                ${Number(quote.discount) > 0 ? `<div class="total-row"><span>Descuento</span><strong>- ${formatPrice(quote.discount)}</strong></div>` : ''}
                <div class="total-row grand"><span>TOTAL</span><strong>${formatPrice(quote.total)}</strong></div>
            </div>
        </div>
    `;

    const footerHtml = `
        <div class="footer">
            <span>${escapeHtml(business?.footerText || 'Gracias por su consulta.')}</span>
            <span>Presupuesto válido hasta ${formatDate(quote.valid_until)}. Precios sujetos a cambios.</span>
        </div>
    `;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${escapeHtml(quote.quote_number || 'Presupuesto')}</title>
            <style>
                @page { size: A4 portrait; margin: 12mm 11mm; }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    color: #1f2937;
                    background: #fff;
                    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    font-size: 11px;
                    line-height: 1.4;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 18px;
                    border-bottom: 2px solid #111827;
                    padding-bottom: 12px;
                    margin-bottom: 14px;
                }
                .brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
                .logo { max-width: 110px; max-height: 60px; object-fit: contain; }
                .company-name { font-size: 19px; font-weight: 700; line-height: 1.2; }
                .company-info { display: flex; flex-wrap: wrap; gap: 3px 12px; margin-top: 4px; color: #4b5563; font-size: 9.5px; }
                .document-title { text-align: right; flex-shrink: 0; }
                .document-title h1 { margin: 0; font-size: 21px; letter-spacing: 1px; }
                .document-number { margin-top: 3px; color: #374151; font-size: 13px; font-weight: 700; }
                .status {
                    display: inline-block;
                    margin-top: 6px;
                    border: 1px solid #111827;
                    padding: 2px 7px;
                    font-size: 8.5px;
                    font-weight: 700;
                    letter-spacing: 0.6px;
                }
                .status-borrador { border-color: #b45309; color: #b45309; }
                .status-vencido { border-color: #b45309; color: #b45309; }
                .status-anulado { border-color: #b91c1c; color: #b91c1c; }
                .status-convertido { border-color: #047857; color: #047857; }
                .meta-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 12px; margin-bottom: 14px; }
                .meta-card { border: 1px solid #d1d5db; padding: 9px 10px; min-height: 78px; }
                .meta-label { color: #6b7280; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
                .meta-value { font-size: 12px; font-weight: 700; }
                .meta-line { color: #4b5563; font-size: 9.5px; margin-top: 2px; }
                .meta-row { display: flex; justify-content: space-between; gap: 12px; padding: 2px 0; font-size: 10px; }
                .meta-row span { color: #6b7280; }
                .meta-row strong { text-align: right; }
                table { width: 100%; border-collapse: collapse; }
                thead { display: table-header-group; }
                th {
                    background: #f3f4f6;
                    border-top: 1px solid #9ca3af;
                    border-bottom: 1.5px solid #111827;
                    padding: 7px 8px;
                    text-align: left;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                }
                td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; vertical-align: top; }
                tr { break-inside: avoid; page-break-inside: avoid; }
                .product-name { font-weight: 600; }
                .product-detail { color: #6b7280; font-size: 9.5px; margin-top: 1px; }
                .center { text-align: center; }
                .right { text-align: right; white-space: nowrap; }
                .strong { font-weight: 700; }
                .totals-wrap { display: flex; justify-content: space-between; gap: 20px; margin-top: 14px; break-inside: avoid; page-break-inside: avoid; }
                .notes { flex: 1; min-width: 0; }
                .notes-block { margin-bottom: 8px; }
                .notes-title { color: #6b7280; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
                .notes-block div:last-child { white-space: pre-wrap; font-size: 9.5px; }
                .totals { width: 260px; flex-shrink: 0; }
                .total-row { display: flex; justify-content: space-between; gap: 14px; padding: 4px 8px; border-bottom: 1px solid #e5e7eb; }
                .total-row.grand { border-top: 1.5px solid #111827; border-bottom: none; margin-top: 2px; padding-top: 7px; font-size: 14px; }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: 18px;
                    border-top: 1px solid #d1d5db;
                    padding-top: 8px;
                    color: #6b7280;
                    font-size: 8.5px;
                }
                @media print {
                    .header { break-after: avoid; page-break-after: avoid; }
                    .meta-grid { break-after: avoid; page-break-after: avoid; }
                }
            </style>
        </head>
        <body>
            ${headerHtml}
            ${metaHtml}
            ${tableHtml}
            ${totalsHtml}
            ${footerHtml}
        </body>
        </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    iframe.onload = () => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (error) {
            console.error('No se pudo imprimir el presupuesto:', error);
        } finally {
            setTimeout(() => removeIframe(iframe), 1000);
        }
    };

    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(html);
    printDocument.close();

    return true;
};

