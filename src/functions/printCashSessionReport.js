import Swal from 'sweetalert2';

/**
 * Genera y muestra una ventana de impresión para el reporte de una sesión de caja.
 * @param {object} session - El objeto de la sesión de caja.
 * @param {object} helpers - Un objeto con funciones de ayuda para formatear.
 * @param {function} helpers.formatCurrency - Función para formatear un número a moneda.
 * @param {function} helpers.formatDate - Función para formatear una fecha.
 * @param {function} helpers.getUserName - Función para obtener el nombre de usuario.
 */
export const printCashSessionReport = (session, { formatCurrency, formatDate, getUserName }) => {
    const getDiscrepancyRow = (label, value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return '';

        let color = '#333'; // Color de texto por defecto
        if (numericValue > 0) color = '#27ae60'; // Verde
        if (numericValue < 0) color = '#c0392b'; // Rojo

        return `
            <div class="info-row total">
                <span>${label}:</span>
                <span style="color: ${color}; font-weight: bold;">${formatCurrency(value)}</span>
            </div>
        `;
    };

    const paymentMethodsHtml = session.payment_methods && Object.keys(session.payment_methods).length > 0
    ? `
    <div class="section">
        <h2>Desglose de Ventas por Método de Pago</h2>
        <div>
        ${Object.entries(session.payment_methods).map(([method, amount]) => `
            <div class="info-row">
                <span>${method}:</span>
                <span>${formatCurrency(amount)}</span>
            </div>
        `).join('')}
        </div>
    </div>
    `
    : '';

    const salesAmount = session.status === 'abierta' ? (session.total_sales || 0) : (session.total_sales_at_close || 0);
    const openingAmount = parseFloat(session.opening_amount) || 0;
    const expectedAmount = session.status === 'abierta' 
        ? openingAmount + (parseFloat(salesAmount) || 0)
        : (session.expected_cash || 0);

    const reportContent = `
        <html>
        <head>
            <title>Reporte de Cierre de Caja - Sesión #${session.id}</title>
            <style>
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
                .header h1 { margin: 0; color: #212529; font-size: 2em; font-weight: 700; }
                .header p { margin: 5px 0; color: #6c757d; font-size: 0.9em; }
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
                hr.solid { border: none; border-top: 1px solid #dee2e6; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
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

                <div class="section">
                    <h2>Resumen Financiero</h2>
                    <div class="info-row"><span>Monto de Apertura:</span> <span>${formatCurrency(session.opening_amount)}</span></div>
                    <div class="info-row"><span>Ventas del Sistema:</span> <span>${formatCurrency(salesAmount)}</span></div>
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