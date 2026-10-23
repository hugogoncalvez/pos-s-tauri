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

const MM_TO_PX = 96 / 25.4;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_TOP_MM = 14;
const MARGIN_BOTTOM_MM = 12;
const MARGIN_SIDE_MM = 12;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_SIDE_MM * 2;
const PAGE_INNER_PX = (PAGE_HEIGHT_MM - MARGIN_TOP_MM - MARGIN_BOTTOM_MM) * MM_TO_PX;
const HEADER_GAP_PX = 12;
const PAGE_SAFETY_PX = 12;

const buildStyles = () => `
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        color: #1f2933;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .page {
        position: relative;
        width: ${PAGE_WIDTH_MM}mm;
        height: ${PAGE_HEIGHT_MM - 0.2}mm;
        padding: ${MARGIN_TOP_MM}mm ${MARGIN_SIDE_MM}mm ${MARGIN_BOTTOM_MM}mm;
        display: flex;
        flex-direction: column;
        page-break-after: always;
        break-after: page;
        background: #fff;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .topbar { position: absolute; top: 0; left: 0; right: 0; height: 10px; background: #c2410c; }

    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 2px solid #1f2933; padding-bottom: 10px; margin-bottom: ${HEADER_GAP_PX}px; }
    .brand-name { font-size: 30px; font-weight: 800; color: #1f2933; line-height: 1.1; }
    .brand-logo { max-height: 50px; }
    .brand-meta { margin-top: 6px; font-size: 10px; color: #4b5563; }
    .doc { text-align: right; }
    .doc-title { font-size: 17px; font-weight: 800; letter-spacing: .5px; color: #c2410c; text-transform: uppercase; }
    .doc-sub { margin-top: 3px; font-size: 12px; font-weight: 700; color: #1f2933; }
    .doc-badge { margin-top: 3px; font-size: 8px; font-weight: 700; letter-spacing: .12em; color: #9ca3af; text-transform: uppercase; }

    table.items { width: 100%; border-collapse: collapse; table-layout: fixed; }
    table.items thead th {
        background: #1f2933;
        color: #fff;
        padding: 8px 10px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .06em;
        text-transform: uppercase;
        text-align: left;
    }
    table.items thead th.price, table.items thead th.stock { text-align: right; }
    table.items thead th.presentation { text-align: center; }
    table.items tbody td { padding: 8px 10px; font-size: 10.5px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
    table.items td.presentation { color: #6b7280; font-size: 10px; }
    table.items td.price { text-align: right; font-weight: 700; white-space: nowrap; }
    table.items td.stock { text-align: right; color: #4b5563; white-space: nowrap; }
    table.items tr.category-row td {
        background: #f3f4f6;
        border-left: 4px solid #c2410c;
        border-bottom: none;
        padding: 8px 10px;
        color: #c2410c;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .04em;
        text-transform: uppercase;
    }

    .foot { margin-top: auto; border-top: 1px solid #d1d5db; padding-top: 6px; display: flex; justify-content: space-between; gap: 16px; font-size: 8.5px; color: #6b7280; }

    @media print {
        .page { page-break-after: always; break-after: page; }
        .page:last-child { page-break-after: auto; break-after: auto; }
    }
`;

export const printPriceList = ({
    groups = [],
    businessConfig = null,
    showStock = false,
    includeCombos = false,
    totalItems = 0
}) => {
    const activeGroups = groups.filter(group => (group.items || []).length > 0);
    if (!activeGroups.length) return false;

    const hasPresentations = activeGroups.some(group =>
        group.items.some(item => Boolean(item.presentationName))
    );
    const columnCount = 2 + (hasPresentations ? 1 : 0) + (showStock ? 1 : 0);
    const business = Array.isArray(businessConfig) ? businessConfig[0] : businessConfig;

    const styles = buildStyles();
    const logo = business?.logo
        ? `<img class="brand-logo" src="${escapeHtml(business.logo)}" alt="${escapeHtml(business?.name || '')}" />`
        : `<div class="brand-name">${escapeHtml(business?.name || 'Sistema POS')}</div>`;
    const businessMeta = [
        business?.address,
        business?.phone ? `Tel. ${business.phone}` : ''
    ].filter(Boolean).map((text) => escapeHtml(text)).join(' · ');

    const headerHtml = `
        <header class="head">
            <div class="brand">
                ${logo}
                ${businessMeta ? `<div class="brand-meta">${businessMeta}</div>` : ''}
            </div>
            <div class="doc">
                <div class="doc-title">LISTA DE PRECIOS</div>
                <div class="doc-sub">${escapeHtml(new Date().toLocaleDateString('es-AR'))} · ${totalItems} ítems</div>
                <div class="doc-badge">USO INTERNO</div>
            </div>
        </header>
    `;

    const theadHtml = `
        <tr>
            <th>PRODUCTO</th>
            ${hasPresentations ? '<th class="presentation" style="width: 33%">PRESENTACIÓN</th>' : ''}
            ${showStock ? '<th class="stock" style="width: 9%">STOCK</th>' : ''}
            <th class="price" style="width: 17%">PRECIO</th>
        </tr>
    `;

    const entries = [];
    activeGroups.forEach((group) => {
        entries.push({
            isCategory: true,
            html: `<tr class="category-row"><td colspan="${columnCount}">${escapeHtml(group.name)}</td></tr>`
        });
        group.items.forEach((item) => {
            entries.push({
                isCategory: false,
                html: `
                    <tr>
                        <td>${escapeHtml(item.productName)}</td>
                        ${hasPresentations ? `<td class="presentation">${escapeHtml(item.presentationName || '')}</td>` : ''}
                        ${showStock ? `<td class="stock">${escapeHtml(item.stockLabel || '—')}</td>` : ''}
                        <td class="price">${formatPrice(item.price)}</td>
                    </tr>
                `
            });
        });
    });

    const measure = document.createElement('div');
    measure.style.cssText = `position: absolute; left: -10000px; top: 0; width: ${CONTENT_WIDTH_MM}mm;`;
    measure.innerHTML = `
        <style>${styles}</style>
        ${headerHtml}
        <table class="items"><thead>${theadHtml}</thead><tbody>${entries.map((entry) => entry.html).join('')}</tbody></table>
        <div class="foot"><span>Página</span><span>Página 1 de 1</span></div>
    `;
    document.body.appendChild(measure);

    const headerHeight = measure.querySelector('.head').getBoundingClientRect().height;
    const tableHeadHeight = measure.querySelector('thead').getBoundingClientRect().height;
    const footerHeight = measure.querySelector('.foot').getBoundingClientRect().height;
    const rowElements = Array.from(measure.querySelectorAll('tbody tr'));
    rowElements.forEach((row, index) => {
        entries[index].height = row.getBoundingClientRect().height;
    });
    measure.remove();

    const availableHeight = PAGE_INNER_PX - headerHeight - HEADER_GAP_PX - tableHeadHeight - footerHeight - PAGE_SAFETY_PX;

    const pages = [];
    let current = [];
    let currentHeight = 0;

    entries.forEach((entry) => {
        if (current.length > 0 && currentHeight + entry.height > availableHeight) {
            const carry = current[current.length - 1]?.isCategory ? [current.pop()] : [];
            pages.push(current);
            current = carry;
            currentHeight = carry.reduce((sum, item) => sum + item.height, 0);
        }
        current.push(entry);
        currentHeight += entry.height;
    });
    if (current.length > 0) pages.push(current);

    const footerLeft = `Precios sujetos a cambios sin previo aviso. Documento de uso interno.${includeCombos ? ' Los combos se incluyen según vigencia; no se valida el stock de sus componentes.' : ''}`;

    const pagesHtml = pages.map((pageEntries, index) => `
        <div class="page">
            <div class="topbar"></div>
            ${headerHtml}
            <table class="items">
                <thead>${theadHtml}</thead>
                <tbody>${pageEntries.map((entry) => entry.html).join('')}</tbody>
            </table>
            <div class="foot">
                <span>${escapeHtml(footerLeft)}</span>
                <span>Página ${index + 1} de ${pages.length}</span>
            </div>
        </div>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de precios</title>
            <style>${styles}</style>
        </head>
        <body>
            ${pagesHtml}
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

export default printPriceList;
