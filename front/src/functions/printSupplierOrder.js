const formatARS = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const orderNumber = (order) => String(order?.numero ?? order?.id ?? 0).padStart(5, '0');

/**
 * Genera e imprime el pedido con el mismo layout del formulario impreso
 * "PEDIDO DE MATERIALES" (A4, logo, datos del proveedor y tabla de ítems).
 * El usuario puede guardar el resultado como PDF desde el diálogo de impresión.
 */
export const printSupplierOrder = (order, businessConfig = {}) => {
    if (!order) return;

    const companyName = businessConfig.name || 'EL CORRALON';
    const companyAddress = businessConfig.address || '';
    const companyPhone = businessConfig.phone || '';
    const logo = businessConfig.logo
        ? `<img class="logo-img" src="${escapeHtml(businessConfig.logo)}" alt="${escapeHtml(companyName)}" />`
        : `<div class="logo-text">${escapeHtml(companyName)}</div>`;

    const rows = (order.details || []).map(detail => `
                    <tr>
                        <td class="num">${escapeHtml(detail.cantidad)}</td>
                        <td class="und">${escapeHtml(detail.unidad || '')}</td>
                        <td class="detalle">${escapeHtml(detail.detalle || '')}</td>
                        <td class="num">${formatARS(detail.precio_unitario)}</td>
                        <td class="num">${formatARS(detail.importe)}</td>
                    </tr>`).join('');

    const emptyRows = Array.from({ length: Math.max(0, 6 - (order.details || []).length) })
        .map(() => '<tr><td class="num"></td><td class="und"></td><td class="detalle"></td><td class="num"></td><td class="num"></td></tr>')
        .join('');

    const htmlContent = `
    <html>
    <head>
        <title>Pedido Nº ${orderNumber(order)}</title>
        <meta charset="UTF-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #111; background: #fff; padding: 18mm 14mm; }
            .sheet { width: 100%; max-width: 190mm; margin: 0 auto; }
            .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 6px; }
            .logo-wrap { flex: 1; display: flex; justify-content: center; align-items: center; }
            .logo-text { color: #d0021b; font-size: 30px; font-weight: 800; font-style: italic; letter-spacing: 1px; }
            .logo-img { max-height: 52px; }
            .company { text-align: right; font-size: 11px; line-height: 1.5; }
            .company .name { font-weight: 700; font-size: 13px; }
            table.form { width: 100%; border-collapse: collapse; margin-top: 10px; }
            table.form th, table.form td { border: 1px solid #000; padding: 5px 6px; font-size: 11px; }
            table.form th { background: #f2f2f2; font-style: italic; text-align: left; font-weight: 700; }
            table.form td.num { text-align: right; white-space: nowrap; }
            table.form td.und { text-align: center; }
            table.form td.detalle { font-weight: 600; }
            table.form thead tr th { font-size: 11px; }
            .total-row td { background: #f2f2f2; font-weight: 700; text-align: right; }
            .total-row td.label { text-align: right; font-style: italic; }
            .footer { margin-top: 10px; font-size: 10px; color: #444; text-align: center; }
            @media print {
                body { padding: 0; }
                .sheet { max-width: none; }
                table.form th, table.form td, .total-row td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="sheet">
            <div class="head">
                <div class="logo-wrap">${logo}</div>
                <div class="company">
                    ${companyAddress ? `<div>${escapeHtml(companyAddress)}</div>` : ''}
                    ${companyPhone ? `<div>Tel. ${escapeHtml(companyPhone)}</div>` : ''}
                </div>
            </div>
            <table class="form">
                <tbody>
                    <tr>
                        <th style="width: 22%">PEDIDO DE ${escapeHtml(order.tipo || 'MATERIALES')} Nº:</th>
                        <td style="font-weight: 700; font-style: italic;">${orderNumber(order)}</td>
                    </tr>
                    <tr>
                        <th>FECHA:</th>
                        <td style="font-weight: 700; font-style: italic;">${escapeHtml(formatDate(order.fecha))}</td>
                    </tr>
                    <tr>
                        <th>PROVEEDOR</th>
                        <td style="font-weight: 700; font-style: italic;">${escapeHtml(order.supplier?.nombre || '')}</td>
                    </tr>
                    <tr>
                        <th>RUBRO</th>
                        <td style="font-weight: 700; font-style: italic;">${escapeHtml(order.rubro || '')}</td>
                    </tr>
                </tbody>
            </table>
            <table class="form" style="margin-top: 6px;">
                <thead>
                    <tr>
                        <th style="width: 10%">CANTIDAD</th>
                        <th style="width: 10%">UND.</th>
                        <th>DETALLE</th>
                        <th style="width: 16%">$ PRECIO UNIT.</th>
                        <th style="width: 18%">$ IMPORTE</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    ${emptyRows}
                    <tr class="total-row">
                        <td colspan="4" class="label">TOTAL</td>
                        <td class="num">${formatARS(order.total)}</td>
                    </tr>
                </tbody>
            </table>
            ${order.notas ? `<div class="footer">${escapeHtml(order.notas)}</div>` : ''}
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
