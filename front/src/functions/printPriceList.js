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

const removeIframe = (iframe) => {
    if (iframe?.parentNode) {
        try {
            iframe.parentNode.removeChild(iframe);
        } catch (error) {
            console.warn('No se pudo quitar el iframe de impresión:', error);
        }
    }
};

export const printPriceList = ({
    groups = [],
    businessConfig = null,
    showStock = false,
    includeCombos = false,
    totalItems = 0
}) => {
    if (!groups.length) return false;

    const hasPresentations = groups.some(group =>
        group.items.some(item => Boolean(item.presentationName))
    );
    const columnCount = 2 + (hasPresentations ? 1 : 0) + (showStock ? 1 : 0);
    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;

    const groupsHtml = groups.map((group) => {
        const rowsHtml = group.items.map((item) => `
            <tr>
                <td>${escapeHtml(item.productName)}</td>
                ${hasPresentations ? `<td class="presentation">${escapeHtml(item.presentationName || '')}</td>` : ''}
                ${showStock ? `<td class="stock">${escapeHtml(item.stockLabel || '—')}</td>` : ''}
                <td class="price">${formatPrice(item.price)}</td>
            </tr>
        `).join('');

        return `
            <tbody class="price-group">
                <tr class="category-row">
                    <td colspan="${columnCount}">${escapeHtml(group.name)}</td>
                </tr>
                ${rowsHtml}
            </tbody>
        `;
    }).join('');

    const headerHtml = `
        <div class="header">
            ${business?.logo ? `<img src="${escapeHtml(business.logo)}" class="logo" alt="Logo" />` : ''}
            <div class="company">
                <div class="company-name">${escapeHtml(business?.name || 'Sistema POS')}</div>
                <div class="company-info">
                    ${business?.address ? `<span>${escapeHtml(business.address)}</span>` : ''}
                    ${business?.phone ? `<span>Tel: ${escapeHtml(business.phone)}</span>` : ''}
                    ${business?.email ? `<span>${escapeHtml(business.email)}</span>` : ''}
                </div>
            </div>
            <div class="title">
                <h1>Lista de precios</h1>
                <p>${escapeHtml(new Date().toLocaleDateString('es-AR'))} · ${totalItems} ítems</p>
                <span class="badge">Uso interno</span>
            </div>
        </div>
    `;

    const tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    ${hasPresentations ? '<th>Presentación</th>' : ''}
                    ${showStock ? '<th class="stock">Stock</th>' : ''}
                    <th class="price">Precio</th>
                </tr>
            </thead>
            ${groupsHtml}
        </table>
    `;

    const footerHtml = `
        <div class="footer">
            <span>Precios sujetos a cambios sin previo aviso. Documento de uso interno.</span>
            ${includeCombos ? '<span>Los combos se incluyen según vigencia; no se valida el stock de sus componentes.</span>' : ''}
        </div>
    `;

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de precios</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 10mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    color: #1f2937;
                    background: #fff;
                    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
                    font-size: 11px;
                    line-height: 1.35;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border-bottom: 2px solid #111827;
                    padding-bottom: 12px;
                    margin-bottom: 14px;
                }

                .logo {
                    max-width: 120px;
                    max-height: 64px;
                    object-fit: contain;
                }

                .company-name {
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .company-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 12px;
                    margin-top: 4px;
                    color: #4b5563;
                    font-size: 10px;
                }

                .title {
                    margin-left: auto;
                    text-align: right;
                }

                .title h1 {
                    margin: 0;
                    font-size: 22px;
                    letter-spacing: 0.3px;
                }

                .title p {
                    margin: 4px 0 0;
                    color: #4b5563;
                    font-size: 10px;
                }

                .badge {
                    display: inline-block;
                    margin-top: 5px;
                    border: 1px solid #111827;
                    padding: 2px 6px;
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    display: table-header-group;
                }

                th {
                    background: #f3f4f6;
                    border-bottom: 1.5px solid #111827;
                    padding: 6px 8px;
                    text-align: left;
                    font-size: 10px;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                }

                td {
                    border-bottom: 1px solid #e5e7eb;
                    padding: 5px 8px;
                    vertical-align: top;
                }

                .price-group {
                    break-inside: auto;
                }

                .category-row td {
                    background: #e5e7eb;
                    border-top: 1px solid #9ca3af;
                    border-bottom: 1px solid #9ca3af;
                    padding: 7px 8px;
                    font-size: 11px;
                    font-weight: 700;
                    break-after: avoid;
                    page-break-after: avoid;
                }

                tr {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                .presentation {
                    color: #6b7280;
                    font-size: 10px;
                }

                .stock {
                    text-align: right;
                    white-space: nowrap;
                }

                .price {
                    text-align: right;
                    white-space: nowrap;
                    font-weight: 600;
                }

                .footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin-top: 16px;
                    border-top: 1px solid #d1d5db;
                    padding-top: 8px;
                    color: #6b7280;
                    font-size: 9px;
                }

                @media print {
                    .header {
                        break-after: avoid;
                        page-break-after: avoid;
                    }
                }
            </style>
        </head>
        <body>
            ${headerHtml}
            ${tableHtml}
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
            console.error('No se pudo imprimir la lista de precios:', error);
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
