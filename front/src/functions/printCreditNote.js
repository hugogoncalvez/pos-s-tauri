import { attachPrintLifecycle } from './printLifecycle';

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

const formatCreditNoteNumber = (cn) => {
    return `NC-${String(cn?.numero ?? cn?.id ?? 0).padStart(5, '0')}`;
};

export const printCreditNote = (creditNote, businessConfig = null) => {
    if (!creditNote) return false;

    const business = Array.isArray(businessConfig) ? businessConfig[0] : (businessConfig || {});
    const details = Array.isArray(creditNote.details) ? creditNote.details : [];
    const customer = creditNote.customer || {};
    const sale = creditNote.sale || {};

    const companyName = business?.name || 'Sistema POS';
    const companyAddress = business?.address || '';
    const companyPhone = business?.phone || '';
    const companyCuit = business?.cuit || '';
    const companyTax = business?.taxCondition || '';
    const logo = business?.logo
        ? `<img class="brand-logo" src="${escapeHtml(business.logo)}" alt="${escapeHtml(companyName)}" />`
        : '';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
        document.body.removeChild(iframe);
        return false;
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <title>Nota de Crédito ${escapeHtml(formatCreditNoteNumber(creditNote))}</title>
    <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #222;
            margin: 0;
            padding: 0;
            font-size: 13px;
            line-height: 1.4;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .brand-logo { max-height: 110px; max-width: 240px; object-fit: contain; margin-bottom: 6px; }
        .company-name { font-size: 18px; font-weight: bold; color: #2c3e50; }
        .company-meta { font-size: 11px; color: #555; line-height: 1.3; }
        .doc-box {
            text-align: right;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 10px 14px;
            min-width: 220px;
        }
        .doc-title { font-size: 16px; font-weight: bold; color: #c0392b; letter-spacing: 0.5px; }
        .doc-number { font-size: 18px; font-weight: bold; margin: 4px 0; color: #222; }
        .doc-meta { font-size: 11px; color: #555; }
        .section-box {
            background: #fafafa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 16px;
            font-size: 12px;
        }
        .info-label { font-weight: bold; color: #555; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 12px;
        }
        th {
            background-color: #2c3e50;
            color: #fff;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            text-transform: uppercase;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
        }
        tr:nth-child(even) td { background-color: #fcfcfc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }
        .totals-table {
            width: 280px;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 6px 10px;
            font-size: 13px;
        }
        .total-row {
            font-size: 16px;
            font-weight: bold;
            background: #f1f2f6;
            border-top: 2px solid #2c3e50;
            border-bottom: 2px solid #2c3e50;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            background: #27ae60;
            color: white;
        }
        .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-around;
            text-align: center;
        }
        .sign-line {
            width: 180px;
            border-top: 1px solid #777;
            padding-top: 4px;
            font-size: 11px;
            color: #444;
        }
        .footer-note {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px dashed #ccc;
            font-size: 10px;
            color: #777;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            ${logo}
            <div class="company-name">${escapeHtml(companyName)}</div>
            <div class="company-meta">
                ${companyAddress ? `${escapeHtml(companyAddress)}<br />` : ''}
                ${companyPhone ? `Tel: ${escapeHtml(companyPhone)}<br />` : ''}
                ${companyCuit ? `CUIT: ${escapeHtml(companyCuit)} - ` : ''}${companyTax ? `${escapeHtml(companyTax)}` : ''}
            </div>
        </div>
        <div class="doc-box">
            <div class="doc-title">NOTA DE CRÉDITO</div>
            <div class="doc-number">${escapeHtml(formatCreditNoteNumber(creditNote))}</div>
            <div class="doc-meta">
                <strong>Fecha:</strong> ${escapeHtml(formatDate(creditNote.fecha))}<br />
                <strong>Venta Ref:</strong> Ticket #${escapeHtml(String(sale?.id || creditNote.sale_id || '-'))}
            </div>
        </div>
    </div>

    <div class="section-box">
        <div class="info-grid">
            <div><span class="info-label">Cliente:</span> ${escapeHtml(customer?.name || 'Cliente')}</div>
            <div><span class="info-label">DNI / CUIT:</span> ${escapeHtml(customer?.dni || '-')}</div>
            <div><span class="info-label">Teléfono:</span> ${escapeHtml(customer?.phone || '-')}</div>
            <div><span class="info-label">Emitido por:</span> ${escapeHtml(creditNote.created_by || creditNote.user?.nombre || 'Caja')}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto / Detalle</th>
                <th class="text-center">Cant. Devuelta</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${details.map(d => `
                <tr>
                    <td><strong>${escapeHtml(d.product_name || d.stock?.name || 'Producto')}</strong></td>
                    <td class="text-center">${escapeHtml(formatQuantity(d.quantity))} ${escapeHtml(d.unit_name || '')}</td>
                    <td class="text-right">${escapeHtml(formatPrice(d.price))}</td>
                    <td class="text-right">${escapeHtml(formatPrice(d.line_total))}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals-container">
        <table class="totals-table">
            <tr class="total-row">
                <td><strong>TOTAL CRÉDITO:</strong></td>
                <td class="text-right"><strong>${escapeHtml(formatPrice(creditNote.total))}</strong></td>
            </tr>
        </table>
    </div>

    ${creditNote.notas ? `
        <div class="section-box" style="margin-bottom: 20px;">
            <span class="info-label">Observaciones:</span>
            <div style="font-size: 11px; margin-top: 3px;">${escapeHtml(creditNote.notas)}</div>
        </div>
    ` : ''}

    <div class="signatures">
        <div class="sign-line">Confeccionó / Comercio</div>
        <div class="sign-line">Firma del Cliente</div>
    </div>

    <div class="footer-note">
        Este documento certifica la devolución de mercadería y el saldo acreditado a favor del cliente.<br />
        DOCUMENTO NO VÁLIDO COMO FACTURA
    </div>
</body>
</html>`;

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = attachPrintLifecycle(iframe);
    setTimeout(() => {
        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch (e) {
            console.error('Error al imprimir Nota de Crédito:', e);
            cleanup.cleanup({ restoreFocus: true });
        }
    }, 250);

    return true;
};

