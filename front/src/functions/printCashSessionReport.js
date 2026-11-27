import Swal from 'sweetalert2';

/**
 * Genera y muestra una ventana de impresión para el reporte de una sesión de caja.
 * @param {object} session - El objeto de la sesión de caja.
 * @param {object} helpers - Un objeto con funciones de ayuda para formatear.
 * @param {function} helpers.formatCurrency - Función para formatear un número a moneda.
 * @param {function} helpers.formatDate - Función para formatear una fecha.
 * @param {function} helpers.getUserName - Función para obtener el nombre de usuario.
 * @param {object} options - Opciones de impresión.
 * @param {boolean} options.isThermal - Si es true imprime en 80 mm; si no, en A4.
 * @param {string[]} options.detailMethods - Métodos de pago a detallar línea por línea.
 * @param {boolean} options.includeCustomer - Si se incluye el nombre del cliente.
 */
export const printCashSessionReport = (
    session,
    { formatCurrency, formatDate, getUserName, businessConfig },
    { isThermal = true, detailMethods = [], includeCustomer = false } = {}
) => {
    const getDiscrepancyRow = (label, value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return '';

        let color = '#333'; // Color de texto por defecto
        if (numericValue > 0) color = '#27ae60'; // Verde
        if (numericValue < 0) color = '#c0392b'; // Rojo
        if (isThermal) color = '#000';

        return `
            <div class="info-row total">
                <span>${label}:</span>
                <span style="color: ${color}; font-weight: bold;">${formatCurrency(value)}</span>
            </div>
        `;
    };

    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const paymentMethodsHtml = session.payment_methods && Object.keys(session.payment_methods).length > 0
    ? `
    <div class="section">
        <h2>Desglose de Ventas por Método de Pago</h2>
        <div>
        ${Object.entries(session.payment_methods).map(([method, amount]) => `
            <div class="info-row">
                <span>${escapeHtml(method)}:</span>
                <span>${formatCurrency(amount)}</span>
            </div>
        `).join('')}
        </div>
    </div>
    `
    : '';

    const normalizeMethod = (method) => String(method || '').trim().toLowerCase();
    const detailMethodSet = new Set(
        (Array.isArray(detailMethods) ? detailMethods : [])
            .map(normalizeMethod)
            .filter(Boolean)
    );

    const detailRows = (Array.isArray(session.sales) ? session.sales : [])
        .flatMap(sale => (sale.sale_payments || [])
            .filter(salePayment => detailMethodSet.has(normalizeMethod(salePayment.payment?.method)))
            .map(salePayment => ({
                saleId: sale.id,
                date: sale.createdAt,
                customer: sale.Customer?.name || '',
                method: salePayment.payment?.method || 'Desconocido',
                amount: parseFloat(salePayment.amount) || 0
            })))
        .sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            return dateDiff !== 0 ? dateDiff : a.saleId - b.saleId;
        });

    const detailMethodsHtml = detailRows.length > 0
        ? `
    <div class="section">
        <h2>Detalle de Movimientos</h2>
        ${isThermal
            ? detailRows.map(row => `
                <div class="detail-item">
                    <div class="detail-line">
                        <span>#${row.saleId} - ${formatDate(row.date)}</span>
                        <span>${formatCurrency(row.amount)}</span>
                    </div>
                    <div class="detail-subline">
                        ${escapeHtml(row.method)}${includeCustomer && row.customer ? ` - ${escapeHtml(row.customer)}` : ''}
                    </div>
                </div>
            `).join('')
            : `
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Venta</th>
                        <th>Fecha</th>
                        <th>Método</th>
                        ${includeCustomer ? '<th>Cliente</th>' : ''}
                        <th class="amount">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    ${detailRows.map(row => `
                        <tr>
                            <td>#${row.saleId}</td>
                            <td>${formatDate(row.date)}</td>
                            <td>${escapeHtml(row.method)}</td>
                            ${includeCustomer ? `<td>${escapeHtml(row.customer || '-')}</td>` : ''}
                            <td class="amount">${formatCurrency(row.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
    </div>
    `
        : '';

    const salesAmount = session.status === 'abierta' ? (session.total_sales || 0) : (session.total_sales_at_close || 0);
    const openingAmount = parseFloat(session.opening_amount) || 0;
    const cashSalesFromMethods = Object.entries(session.payment_methods || {})
        .filter(([method]) => String(method).toLowerCase().includes('efectivo'))
        .reduce((sum, [, amount]) => sum + (parseFloat(amount) || 0), 0);
    const cashSalesAmount = session.cash_sales != null
        ? (parseFloat(session.cash_sales) || 0)
        : cashSalesFromMethods;
    const totalIncome = parseFloat(session.totalIncome) || 0;
    const totalExpense = parseFloat(session.totalExpense) || 0;
    const expectedAmount = session.expected_cash != null
        ? (parseFloat(session.expected_cash) || 0)
        : openingAmount + cashSalesAmount + totalIncome - totalExpense;

    const a4Styles = `
                @page {
                    size: A4;
                    margin: 0;
                }
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                body { 
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 15px;
                    background-color: #fff;
                    color: #333;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .container {
                    max-width: 800px;
                    margin: auto;
                    padding: 25px;
                    border: 1px solid #dee2e6;
                    background-color: #fff;
                    box-shadow: none;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 25px;
                    border-bottom: 2px solid #e9ecef;
                    padding-bottom: 20px;
                }
                .header h1 { margin: 5px 0; color: #212529; font-size: 1.8em; font-weight: 700; }
                .header p { margin: 2px 0; color: #6c757d; font-size: 0.9em; }
                .company-logo { max-height: 80px; margin-bottom: 10px; border-radius: 8px; }
                .company-name { font-size: 1.5em; font-weight: 700; color: #212529; margin-bottom: 5px; }
                .section { margin-bottom: 25px; }
                .section h2 {
                    border-bottom: 1px solid #ced4da;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    color: #495057;
                    font-size: 1.4em;
                    font-weight: 500;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px 24px;
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f1f3f5;
                    font-size: 0.95em;
                }
                .info-row:last-child { border-bottom: none; }
                .info-row span:first-child { color: #495057; }
                .info-row span:last-child { font-weight: 500; color: #212529; }
                .total { font-size: 1.05em; }
                .notes-section { background-color: #fffbe6; border-left: 5px solid #fcc419; padding: 15px 20px; margin-top: 25px; border-radius: 4px; }
                .notes-section h3 { margin-top: 0; color: #fab005; font-size: 1.2em; }
                .notes-section p { margin: 8px 0; }
                .detail-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
                .detail-table th, .detail-table td { padding: 8px 10px; border-bottom: 1px solid #f1f3f5; text-align: left; }
                .detail-table th { color: #495057; font-weight: 500; background-color: #f8f9fa; }
                .detail-table .amount { text-align: right; white-space: nowrap; }
                hr.solid { border: none; border-top: 1px solid #dee2e6; margin: 15px 0; }
    `;

    const thermalStyles = `
        @page { margin: 0; size: auto; }
        body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 0;
            width: 72mm;
            font-size: 12px;
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        .container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            border: none;
            background: #fff;
            box-shadow: none;
        }
        .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 6px;
        }
        .company-logo {
            max-width: 25mm;
            max-height: 25mm;
            margin-bottom: 4px;
            border-radius: 0;
        }
        .company-name { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 2px; }
        .header h1 { margin: 3px 0; color: #000; font-size: 13px; font-weight: bold; }
        .header p { margin: 1px 0; color: #000; font-size: 10px; }
        .section { margin-bottom: 8px; }
        .section h2 {
            border-bottom: 1px dashed #000;
            padding-bottom: 3px;
            margin: 6px 0 4px;
            color: #000;
            font-size: 11px;
            font-weight: bold;
        }
        .info-grid { display: block; }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 4px;
            padding: 1px 0;
            border-bottom: none;
            font-size: 11px;
        }
        .info-row:last-child { border-bottom: none; }
        .info-row span:first-child { flex: 1; color: #000; }
        .info-row span:last-child { font-weight: bold; color: #000; text-align: right; white-space: nowrap; }
        .total { font-size: 13px; font-weight: bold; }
        .notes-section {
            background: #fff;
            border: 1px dashed #000;
            padding: 5px 6px;
            margin-top: 6px;
            border-radius: 0;
        }
        .notes-section h3 { margin: 0 0 3px; color: #000; font-size: 11px; }
        .notes-section p { margin: 2px 0; font-size: 10px; }
        .detail-item { border-bottom: 1px dashed #999; padding: 2px 0; }
        .detail-line { display: flex; justify-content: space-between; gap: 4px; font-size: 11px; }
        .detail-line span:last-child { font-weight: bold; white-space: nowrap; }
        .detail-subline { font-size: 10px; }
        hr.solid { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    `;

    const reportContent = `
        <html>
        <head>
            <title>Reporte de Cierre de Caja - Sesión #${session.id}</title>
            <style>${isThermal ? thermalStyles : a4Styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    ${businessConfig?.logo ? `<img src="${businessConfig.logo}" class="company-logo">` : ''}
                    <div class="company-name">${businessConfig?.name || 'Sistema POS'}</div>
                    ${businessConfig?.address ? `<p>${businessConfig.address}</p>` : ''}
                    ${businessConfig?.phone || businessConfig?.email ? `<p>${businessConfig.phone ? `Tel: ${businessConfig.phone}` : ''} ${businessConfig.email ? `| Email: ${businessConfig.email}` : ''}</p>` : ''}
                    <hr class="solid">
                    <h1>Reporte de Cierre de Caja</h1>
                    <p>ID de Sesión: #${session.id}</p>
                    <p>Fecha de Impresión: ${new Date().toLocaleString('es-AR')}</p>
                </div>
                
                <div class="section">
                    <h2>Detalles de la Sesión</h2>
                    <div class="info-grid">
                        <div class="info-row"><span>Cajero:</span> <span>${getUserName(session)}</span></div>
                        <div class="info-row"><span>Estado:</span> <span>${session.status.replace(/_/g, ' ')}</span></div>
                        <div class="info-row"><span>Apertura:</span> <span>${formatDate(session.opened_at)}</span></div>
                        <div class="info-row"><span>Cierre:</span> <span>${session.verified_at ? formatDate(session.verified_at) : (session.closed_at ? formatDate(session.closed_at) : 'N/A')}</span></div>
                    </div>
                </div>

                ${paymentMethodsHtml}

                ${detailMethodsHtml}

                <div class="section">
                    <h2>Resumen Financiero</h2>
                    <div class="info-row"><span>Monto de Apertura:</span> <span>${formatCurrency(session.opening_amount)}</span></div>
                    <div class="info-row"><span>Ventas del Sistema:</span> <span>${formatCurrency(salesAmount)}</span></div>
                    <div class="info-row"><span>Ventas en Efectivo:</span> <span>${formatCurrency(cashSalesAmount)}</span></div>
                    ${totalIncome > 0 ? `<div class="info-row"><span>Ingresos de Caja:</span> <span>${formatCurrency(totalIncome)}</span></div>` : ''}
                    ${totalExpense > 0 ? `<div class="info-row"><span>Egresos de Caja:</span> <span>${formatCurrency(totalExpense)}</span></div>` : ''}
                    <div class="info-row total"><span>Monto Esperado (Sistema):</span> <span>${formatCurrency(expectedAmount)}</span></div>
                    <hr class="solid">
                    <div class="info-row"><span>Monto Declarado (Cajero):</span> <span>${formatCurrency(session.cashier_declared_amount)}</span></div>
                    ${getDiscrepancyRow('Diferencia Preliminar', session.preliminary_discrepancy)}
                    <hr class="solid">
                    <div class="info-row"><span>Monto Verificado (Admin):</span> <span>${formatCurrency(session.admin_verified_amount)}</span></div>
                    ${getDiscrepancyRow('Diferencia Final', session.final_discrepancy)}
                </div>

                ${(session.notes || session.admin_notes) ? `
                <div class="section notes-section">
                    <h3>Observaciones</h3>
                    ${session.notes ? `<p><strong>Cajero:</strong> ${session.notes.replace(/\n\nVerificación Admin:.*$/, '').trim()}</p>` : ''}
                    ${session.admin_notes ? `<p><strong>Administrador:</strong> ${session.admin_notes}</p>` : ''}
                </div>
                ` : ''}
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
            console.error('Error al intentar imprimir:', error);
            Swal.fire('Error', 'No se pudo completar la impresión.', 'error');
        } finally {
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 1000);
        }
    };

    const printDocument = iframe.contentDocument || iframe.contentWindow.document;
    printDocument.open();
    printDocument.write(reportContent);
    printDocument.close();
};