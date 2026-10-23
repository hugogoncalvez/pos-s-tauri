const formatARS = (value) => `$ ${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
    if (!value) return '';
    const raw = String(value);
    const date = raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('es-AR');
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const ORDER_SERIES = '0001';
const orderNumber = (order) => `${ORDER_SERIES}-${String(order?.numero ?? order?.id ?? 0).padStart(5, '0')}`;

/**
 * Genera e imprime el pedido a proveedor con el rediseño aprobado
 * (A4, identidad de la empresa, franja de datos y tabla de ítems).
 * El usuario puede guardar el resultado como PDF desde el diálogo de impresión.
 */
export const printSupplierOrder = (order, businessConfig = {}) => {
    if (!order) return;

    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;
    const companyName = business?.name || 'EL CORRALON';
    const companyAddress = business?.address || '';
    const companyPhone = business?.phone || '';
    const logo = business?.logo
        ? `<img class="brand-logo" src="${escapeHtml(business.logo)}" alt="${escapeHtml(companyName)}" />`
        : `<div class="brand-name">${escapeHtml(companyName)}</div>`;

    const rows = (order.details || []).map(detail => `
                    <tr>
                        <td class="center">${escapeHtml(detail.cantidad)}</td>
                        <td class="center">${escapeHtml(detail.unidad || '')}</td>
                        <td class="detalle">${escapeHtml(detail.detalle || '')}</td>
                        <td class="money">${formatARS(detail.precio_unitario)}</td>
                        <td class="money strong">${formatARS(detail.importe)}</td>
                    </tr>`).join('');

    const htmlContent = `
    <html>
    <head>
        <title>Pedido Nº ${orderNumber(order)}</title>
        <meta charset="UTF-8">
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

            .rule { margin-top: 12px; border-top: 2px solid #1f2933; }

            .meta {
                margin-top: 14px;
                display: grid;
                grid-template-columns: 22% 36% 42%;
                gap: 14px;
                background: #f3f4f6;
                border-left: 5px solid #c2410c;
                padding: 11px 16px;
            }
            .meta .label { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6b7280; }
            .meta .value { display: block; margin-top: 3px; font-size: 12px; font-weight: 700; color: #1f2933; }

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
            table.items td.money { text-align: right; white-space: nowrap; }
            table.items td.strong { font-weight: 700; }

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

            .notes { margin-top: 12px; font-size: 9px; color: #6b7280; }

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
                    <div class="doc-title">PEDIDO DE ${escapeHtml(order.tipo || 'MATERIALES')}</div>
                    <div class="doc-number">Nº ${orderNumber(order)}</div>
                </div>
            </div>
            <div class="rule"></div>

            <div class="meta">
                <div>
                    <span class="label">FECHA</span>
                    <span class="value">${escapeHtml(formatDate(order.fecha))}</span>
                </div>
                <div>
                    <span class="label">PROVEEDOR</span>
                    <span class="value">${escapeHtml(order.supplier?.nombre || '')}</span>
                </div>
                <div>
                    <span class="label">RUBRO</span>
                    <span class="value">${escapeHtml(order.rubro || '')}</span>
                </div>
            </div>

            <table class="items">
                <thead>
                    <tr>
                        <th style="width: 11%">CANTIDAD</th>
                        <th style="width: 9%">UNIDAD</th>
                        <th>DETALLE</th>
                        <th style="width: 18%">P. UNITARIO</th>
                        <th style="width: 18%">SUBTOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="total">
                <span class="label">TOTAL</span>
                <span class="value">${formatARS(order.total)}</span>
            </div>

            ${order.notas ? `<div class="notes">${escapeHtml(order.notas)}</div>` : ''}
        </div>
    </body>
    </html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
};

export default printSupplierOrder;
