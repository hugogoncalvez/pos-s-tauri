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
    return `$ ${number.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatQuantity = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '';
    return number.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
};

const formatDate = (value) => {
    if (!value) return '';
    const raw = String(value).slice(0, 10);
    const date = raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(value);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('es-AR');
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
const QUOTE_SERIES = '0001';

const formatQuoteNumber = (quote) => {
    const raw = String(quote?.quote_number || '');
    const digits = raw.match(/(\d+)$/);
    const sequence = digits ? Number(digits[1]) : Number(quote?.id);
    if (!Number.isFinite(sequence)) return raw;
    return `${QUOTE_SERIES}-${String(sequence).padStart(8, '0')}`;
};

/**
 * Imprime el presupuesto con el rediseño aprobado de "COTIZACION DE MATERIALES":
 * identidad de la empresa, franja de datos (fecha, origen, cliente), tabla de
 * ítems, bloque FINAL y las tres firmas (CONFECCIONADO / AUTORIZADO / RECIBIDO).
 */
export const printQuote = ({ quote, businessConfig = null }) => {
    if (!quote) return false;

    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;
    const details = Array.isArray(quote.details) ? quote.details : [];
    const status = quote.effective_status || quote.status;
    const origin = quote.origin || ORIGIN_DEFAULT;

    const rawSubtotal = quote.subtotal;
    const parsedSubtotal = Number(rawSubtotal);
    const subtotal = rawSubtotal !== null && rawSubtotal !== undefined && rawSubtotal !== '' && Number.isFinite(parsedSubtotal)
        ? parsedSubtotal
        : details.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
    const discount = Number(quote.discount) || 0;
    const hasDiscount = discount > 0;

    const companyName = business?.name || 'EL CORRALON';
    const companyAddress = business?.address || '';
    const companyPhone = business?.phone || '';
    const logo = business?.logo
        ? `<img class="brand-logo" src="${escapeHtml(business.logo)}" alt="${escapeHtml(companyName)}" />`
        : `<div class="brand-name">${escapeHtml(companyName)}</div>`;

    const rowsHtml = details.map((item) => {
        const extra = [item.presentation_name, item.notes].filter(Boolean).map((text) => escapeHtml(text)).join('<br>');
        const rawQuantity = item.quantity;
        const quantityText = rawQuantity === null || rawQuantity === undefined || rawQuantity === ''
            ? ''
            : formatQuantity(rawQuantity);
        return `
            <tr>
                <td class="center">${escapeHtml(quantityText)}</td>
                <td class="center">${escapeHtml(item.unit_name || '')}</td>
                <td class="detalle">${escapeHtml(item.product_name)}${extra ? `<div class="detalle-extra">${extra}</div>` : ''}</td>
                <td class="money">${formatPrice(item.unit_price)}</td>
                <td class="money strong">${formatPrice(item.line_total)}</td>
            </tr>
        `;
    }).join('');

    const summaryHtml = hasDiscount ? `
        <tr class="summary-row">
            <td colspan="4" class="summary-label">SUBTOTAL</td>
            <td class="money">${formatPrice(subtotal)}</td>
        </tr>
        <tr class="summary-row">
            <td colspan="4" class="summary-label">DESCUENTO</td>
            <td class="money">- ${formatPrice(discount)}</td>
        </tr>` : '';

    const customerMeta = [quote.customer_document, quote.customer_phone ? `Tel. ${quote.customer_phone}` : '']
        .filter(Boolean)
        .map((text) => escapeHtml(text))
        .join(' · ');

    const notesHtml = (quote.notes || quote.terms) ? `
        <div class="notes">
            ${quote.notes ? `<div><span class="notes-label">OBSERVACIONES:</span> ${escapeHtml(quote.notes)}</div>` : ''}
            ${quote.terms ? `<div><span class="notes-label">CONDICIONES:</span> ${escapeHtml(quote.terms)}</div>` : ''}
        </div>
    ` : '';

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <title>${escapeHtml(formatQuoteNumber(quote))}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                @page { size: A4 portrait; margin: 0; }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    color: #1f2933;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .topbar { height: 10px; background: #c2410c; }
                .sheet { width: 100%; max-width: 190mm; margin: 0 auto; padding: 16mm 14mm 18mm; }

                .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
                .brand-name { font-size: 30px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #1f2933; line-height: 1.1; }
                .brand-logo { max-height: 54px; }
                .brand-meta { margin-top: 6px; font-size: 10px; line-height: 1.6; color: #4b5563; }
                .doc { text-align: right; }
                .doc-title { font-size: 17px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #c2410c; }
                .doc-number { margin-top: 4px; font-size: 22px; font-weight: 800; color: #1f2933; }
                .doc-status { margin-top: 4px; font-size: 8px; font-weight: 700; letter-spacing: .12em; color: #9ca3af; }

                .rule { margin-top: 12px; border-top: 2px solid #1f2933; }

                .meta {
                    margin-top: 14px;
                    display: grid;
                    grid-template-columns: 20% 34% 46%;
                    gap: 14px;
                    background: #f3f4f6;
                    border-left: 5px solid #c2410c;
                    padding: 11px 16px;
                }
                .meta .label { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6b7280; }
                .meta .value { display: block; margin-top: 3px; font-size: 12px; font-weight: 700; color: #1f2933; }
                .meta .value-sub { display: block; margin-top: 2px; font-size: 9px; color: #6b7280; }

                table.items { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 16px; }
                table.items thead th {
                    background: #1f2933;
                    color: #fff;
                    padding: 8px 10px;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .06em;
                    text-transform: uppercase;
                    text-align: center;
                }
                table.items tbody td { padding: 10px; font-size: 11px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
                table.items tbody tr:nth-child(even) { background: #fafafa; }
                table.items td.center { text-align: center; }
                table.items td.detalle { text-align: left; font-weight: 500; }
                table.items td.detalle-extra { font-weight: 400; font-size: 9.5px; color: #4b5563; }
                table.items td.money { text-align: right; white-space: nowrap; }
                table.items td.strong { font-weight: 700; }
                table.items tr.summary-row td { border-bottom: none; background: #fff; }
                table.items tr.summary-row td.summary-label { text-align: right; font-size: 10px; font-weight: 600; color: #4b5563; }

                .total {
                    width: 52%;
                    margin-left: auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    align-items: center;
                    background: #c2410c;
                    color: #fff;
                    padding: 12px 22px;
                }
                .total .label { text-align: center; font-size: 13px; font-weight: 800; letter-spacing: .06em; }
                .total .value { text-align: right; font-size: 16px; font-weight: 800; white-space: nowrap; }

                .notes { margin-top: 12px; font-size: 9px; color: #4b5563; line-height: 1.5; }
                .notes .notes-label { font-weight: 700; color: #6b7280; }

                .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 54px; }
                .signatures .sign { text-align: center; }
                .signatures .line { border-top: 1px solid #6b7280; height: 1px; }
                .signatures .label { margin-top: 6px; font-size: 8.5px; font-weight: 700; letter-spacing: .08em; color: #6b7280; }

                .footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: 18px;
                    border-top: 1px solid #d1d5db;
                    padding-top: 6px;
                    font-size: 8.5px;
                    color: #6b7280;
                }

                @media print {
                    .sheet { max-width: none; padding: 14mm 12mm 16mm; }
                }
            </style>
        </head>
        <body>
            <div class="topbar"></div>
            <div class="sheet">
                <div class="head">
                    <div class="brand">
                        ${logo}
                        <div class="brand-meta">
                            ${companyAddress ? `<div>${escapeHtml(companyAddress)}</div>` : ''}
                            ${companyPhone ? `<div>Tel. ${escapeHtml(companyPhone)}</div>` : ''}
                        </div>
                    </div>
                    <div class="doc">
                        <div class="doc-title">COTIZACION DE MATERIALES</div>
                        <div class="doc-number">Nº ${escapeHtml(formatQuoteNumber(quote))}</div>
                        ${status && status !== 'emitido' ? `<div class="doc-status">${escapeHtml(statusLabel(status))}</div>` : ''}
                    </div>
                </div>
                <div class="rule"></div>

                <div class="meta">
                    <div>
                        <span class="label">FECHA</span>
                        <span class="value">${escapeHtml(formatDate(quote.quote_date))}</span>
                    </div>
                    <div>
                        <span class="label">ORIGEN</span>
                        <span class="value">${escapeHtml(origin)}</span>
                    </div>
                    <div>
                        <span class="label">CLIENTE</span>
                        <span class="value">${escapeHtml(quote.customer_name || '')}</span>
                        ${customerMeta ? `<span class="value-sub">${customerMeta}</span>` : ''}
                    </div>
                </div>

                <table class="items">
                    <thead>
                        <tr>
                            <th style="width: 11%">CANTIDAD</th>
                            <th style="width: 9%">UND.</th>
                            <th>DETALLE</th>
                            <th style="width: 17%">PRECIOS</th>
                            <th style="width: 18%">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        ${summaryHtml}
                    </tbody>
                </table>

                <div class="total">
                    <span class="label">MONTO TOTAL</span>
                    <span class="value">${formatPrice(quote.total)}</span>
                </div>

                ${notesHtml}

                <div class="signatures">
                    <div class="sign"><div class="line"></div><div class="label">CONFECCIONADO</div></div>
                    <div class="sign"><div class="line"></div><div class="label">AUTORIZADO</div></div>
                    <div class="sign"><div class="line"></div><div class="label">RECIBIDO</div></div>
                </div>

                <div class="footer">
                    <span>${escapeHtml(business?.footerText || '¡Gracias por su preferencia!')}</span>
                    ${quote.valid_until ? `<span>Presupuesto válido hasta ${escapeHtml(formatDate(quote.valid_until))}.</span>` : ''}
                </div>
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
