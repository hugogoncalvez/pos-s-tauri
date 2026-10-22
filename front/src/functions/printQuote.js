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
    return `$${number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatQuantity = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return number.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
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

const ORIGIN_DEFAULT = 'OFICINA CENTRAL';

/**
 * Imprime el presupuesto replicando el formato de "COTIZACION DE MATERIALES" que usa el cliente:
 * logo y datos de la empresa, cabecera (Nº, fecha, origen, cliente), tabla CANTIDAD / UND. /
 * DETALLE / PRECIOS / TOTAL con fila FINAL y los tres campos de firma
 * (CONFECCIONADO / AUTORIZADO / RECIBIDO).
 */
export const printQuote = ({ quote, businessConfig = null }) => {
    if (!quote) return false;

    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;
    const details = Array.isArray(quote.details) ? quote.details : [];
    const status = quote.effective_status || quote.status;
    const origin = quote.origin || ORIGIN_DEFAULT;

    const rowsHtml = details.map((item) => {
        const extra = [item.presentation_name, item.notes].filter(Boolean).map((text) => escapeHtml(text)).join('<br>');
        return `
            <tr>
                <td class="num">${escapeHtml(formatQuantity(item.quantity))}</td>
                <td class="und">${escapeHtml(item.unit_name || '')}</td>
                <td class="detalle">${escapeHtml(item.product_name)}${extra ? `<div class="detalle-extra">${extra}</div>` : ''}</td>
                <td class="num">${formatPrice(item.unit_price)}</td>
                <td class="num">${formatPrice(item.line_total)}</td>
            </tr>
        `;
    }).join('');

    const emptyRows = Array.from({ length: Math.max(0, 6 - details.length) })
        .map(() => '<tr><td class="num"></td><td class="und"></td><td class="detalle"></td><td class="num"></td><td class="num"></td></tr>')
        .join('');

    const companyBlock = `
        <div class="company">
            ${business?.address ? `<div>${escapeHtml(business.address)}</div>` : ''}
            ${business?.phone ? `<div>Tel. ${escapeHtml(business.phone)}</div>` : ''}
        </div>
    `;

    const logoBlock = business?.logo
        ? `<img class="logo-img" src="${escapeHtml(business.logo)}" alt="${escapeHtml(business?.name || '')}" />`
        : `<div class="logo-text">${escapeHtml(business?.name || 'EL CORRALON')}</div>`;

    const headerHtml = `
        <div class="head">
            <div class="logo-wrap">${logoBlock}</div>
            ${companyBlock}
        </div>
        <table class="form head-table">
            <tbody>
                <tr>
                    <th class="label wide">COTIZACION DE MATERIALES Nº:</th>
                    <td class="strong italic">${escapeHtml(quote.quote_number || '')}</td>
                    <th class="label"></th>
                    <td class="status">${escapeHtml(statusLabel(status))}</td>
                </tr>
                <tr>
                    <th class="label">FECHA:</th>
                    <td class="strong italic">${escapeHtml(formatDate(quote.quote_date))}</td>
                    <th class="label">ORIGEN:</th>
                    <td class="strong italic">${escapeHtml(origin)}</td>
                </tr>
                <tr>
                    <th class="label">CLIENTE</th>
                    <td class="strong italic" colspan="3">
                        ${escapeHtml(quote.customer_name || '')}
                        ${quote.customer_document ? `<span class="muted"> - ${escapeHtml(quote.customer_document)}</span>` : ''}
                        ${quote.customer_phone ? `<span class="muted"> - Tel: ${escapeHtml(quote.customer_phone)}</span>` : ''}
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    const tableHtml = `
        <table class="form items">
            <thead>
                <tr>
                    <th class="num" style="width: 11%">CANTIDAD</th>
                    <th class="und" style="width: 11%">UND.</th>
                    <th>DETALLE</th>
                    <th class="num" style="width: 17%">PRECIOS</th>
                    <th class="num" style="width: 19%">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml || emptyRows}
                <tr class="final-row">
                    <td colspan="4" class="right">FINAL</td>
                    <td class="num">${formatPrice(quote.total)}</td>
                </tr>
            </tbody>
        </table>
    `;

    const notesHtml = (quote.notes || quote.terms)
        ? `
        <table class="form notes-table">
            <tbody>
                ${quote.notes ? `<tr><th class="label">OBSERVACIONES</th><td>${escapeHtml(quote.notes)}</td></tr>` : ''}
                ${quote.terms ? `<tr><th class="label">CONDICIONES</th><td>${escapeHtml(quote.terms)}</td></tr>` : ''}
            </tbody>
        </table>
        `
        : '';

    const signaturesHtml = `
        <table class="form signatures">
            <tbody>
                <tr>
                    <td>CONFECCIONADO</td>
                    <td>AUTORIZADO</td>
                    <td>RECIBIDO</td>
                </tr>
                <tr class="sign-space">
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    `;

    const footerHtml = `
        <div class="footer">
            <span>${escapeHtml(business?.footerText || '¡Gracias por su preferencia!')}</span>
            <span>Presupuesto válido hasta ${escapeHtml(formatDate(quote.valid_until))}.</span>
        </div>
    `;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>${escapeHtml(quote.quote_number || 'Cotizacion')}</title>
            <style>
                @page { size: A4 portrait; margin: 12mm 12mm; }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    color: #111;
                    background: #fff;
                    font-family: Calibri, Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 1.35;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .sheet { width: 100%; max-width: 190mm; margin: 0 auto; }
                .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 6px; }
                .logo-wrap { flex: 1; display: flex; justify-content: center; align-items: center; }
                .logo-text { color: #d0021b; font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: 1px; }
                .logo-img { max-height: 52px; }
                .company { text-align: right; font-size: 11px; line-height: 1.45; }
                table.form { width: 100%; border-collapse: collapse; margin-top: 8px; }
                table.form th, table.form td { border: 1px solid #000; padding: 5px 6px; font-size: 11px; }
                table.form th.label { background: #f2f2f2; font-style: italic; text-align: left; font-weight: 700; width: 18%; }
                table.form td.strong { font-weight: 700; }
                table.form td.italic { font-style: italic; }
                table.form td.muted { font-weight: 400; color: #444; }
                table.form td.status { text-align: right; font-weight: 700; letter-spacing: 0.5px; }
                table.form th.num, table.form td.num { text-align: right; white-space: nowrap; }
                table.form th.und, table.form td.und { text-align: center; }
                table.form td.detalle { font-weight: 600; }
                table.form td.detalle-extra { font-weight: 400; font-size: 9.5px; color: #333; }
                table.items thead th { background: #f2f2f2; font-style: italic; text-align: left; font-weight: 700; }
                table.items tr.final-row td { background: #f2f2f2; font-weight: 700; }
                table.items tr.final-row td.right { text-align: right; }
                table.notes-table th.label { width: 18%; }
                table.signatures { margin-top: 26px; }
                table.signatures td { text-align: center; font-style: italic; font-weight: 700; height: 22px; }
                table.signatures tr.sign-space td { height: 70px; }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: 14px;
                    border-top: 1px solid #000;
                    padding-top: 6px;
                    font-size: 9px;
                }
            </style>
        </head>
        <body>
            <div class="sheet">
                ${headerHtml}
                ${tableHtml}
                ${notesHtml}
                ${signaturesHtml}
                ${footerHtml}
            </div>
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

export default printQuote;
