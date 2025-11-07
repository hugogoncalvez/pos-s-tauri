import moment from 'moment';
import 'moment/locale/es';

import Swal from 'sweetalert2';

export const printDailyCutReport = (report, { formatCurrency }) => {
    if (!report) {
        console.error("No hay datos de reporte para imprimir.");
        return;
    }

    moment.locale('es');

    const { date, cashier, totals, salesByPaymentMethod, salesByCategory, sessions } = report;

    const formattedDate = moment(date).format('DD [de] MMMM [de] YYYY');

    let salesByPaymentMethodHtml = '';
    for (const method in salesByPaymentMethod) {
        salesByPaymentMethodHtml += `
            <div class="info-row">
                <span class="label">${method}:</span>
                <span class="value">${formatCurrency(salesByPaymentMethod[method])}</span>
            </div>
        `;
    }

    let salesByCategoryHtml = '';
    for (const category in salesByCategory) {
        salesByCategoryHtml += `
            <div class="info-row">
                <span class="label">${category}:</span>
                <span class="value">${formatCurrency(salesByCategory[category])}</span>
            </div>
        `;
    }

    let sessionsDetailHtml = '';
    if (sessions && sessions.length > 1) {
        sessionsDetailHtml = `
            <div class="section">
                <h2>Detalle de Sesiones Individuales</h2>
                ${sessions.map(session => `
                    <div class="session-card">
                        <div class="info-grid">
                            <div class="info-row"><span class="label">Cajero:</span><span class="value">${session.username} (${session.rol})</span></div>
                            <div class="info-row"><span class="label">Apertura:</span><span class="value">${moment(session.openedAt).format('DD/MM/YYYY HH:mm')}</span></div>
                            <div class="info-row"><span class="label">Monto Inicial:</span><span class="value">${formatCurrency(session.openingAmount)}</span></div>
                            <div class="info-row"><span class="label">Ventas al Cierre:</span><span class="value">${formatCurrency(session.totalSalesAtClose)}</span></div>
                            <div class="info-row"><span class="label">Estado:</span><span class="value">${session.status}</span></div>
                            ${session.status === 'cerrada' ? `
                                <div class="info-row">
                                    <span class="label">Diferencia Final:</span>
                                    <span class="value ${session.finalDiscrepancy < 0 ? 'negative' : 'positive'}">${formatCurrency(session.finalDiscrepancy)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const printContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Corte de Caja - ${formattedDate}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 20px;
                    color: #333;
                    line-height: 1.6;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
                }
                h1, h2, h3 {
                    color: #0056b3;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 10px;
                    margin-top: 25px;
                }
                h1 {
                    text-align: center;
                    color: #004085;
                    font-size: 28px;
                }
                h2 {
                    font-size: 22px;
                    color: #0056b3;
                }
                .header-info {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 14px;
                    color: #555;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px 0;
                    border-bottom: 1px dotted #eee;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .label {
                    font-weight: 600;
                    color: #555;
                }
                .value {
                    font-weight: 600;
                    color: #333;
                }
                .total-row {
                    font-size: 18px;
                    font-weight: bold;
                    padding: 10px 0;
                    border-top: 2px solid #e0e0e0;
                    margin-top: 15px;
                }
                .positive {
                    color: #28a745;
                }
                .negative {
                    color: #dc3545;
                }
                .section {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    border: 1px solid #e0e0e0;
                }
                .session-card {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 10px;
                    margin-bottom: 10px;
                    background-color: #fff;
                }
                @media print {
                    body {
                        margin: 0;
                    }
                    .container {
                        box-shadow: none;
                        border-radius: 0;
                        padding: 15px;
                    }
                    h1 {
                        font-size: 24px;
                    }
                    h2 {
                        font-size: 18px;
                    }
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Reporte de Corte de Caja</h1>
                <div class="header-info">
                    Fecha: ${formattedDate} | Cajero: ${cashier}
                </div>

                <div class="section">
                    <h2>Entradas de Efectivo</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Dinero Inicial en Caja:</span><span class="value">${formatCurrency(totals.openingAmount)}</span></div>
                        <div class="info-row"><span class="label">Ingresos de Caja:</span><span class="value">${formatCurrency(totals.totalIncome)}</span></div>
                        <div class="info-row total-row"><span class="label">Total Entradas:</span><span class="value">${formatCurrency(totals.openingAmount + totals.totalIncome)}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Dinero en Caja</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Ventas en Efectivo:</span><span class="value">${formatCurrency(totals.totalCashSales)}</span></div>
                        <div class="info-row"><span class="label">Ingresos de Caja:</span><span class="value">${formatCurrency(totals.totalIncome)}</span></div>
                        <div class="info-row"><span class="label">Egresos de Caja:</span><span class="value negative">${formatCurrency(totals.totalExpense)}</span></div>
                        <div class="info-row total-row"><span class="label">Total en Caja (Esperado):</span><span class="value">${formatCurrency(totals.openingAmount + totals.totalCashSales + totals.totalIncome - totals.totalExpense)}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Pagos de Contado</h2>
                    <div class="info-grid">
                        ${salesByPaymentMethodHtml}
                        <div class="info-row total-row"><span class="label">Total Pagos Contado:</span><span class="value">${formatCurrency(totals.totalSalesAmount)}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Ventas por Categoría</h2>
                    <div class="info-grid">
                        ${salesByCategoryHtml}
                    </div>
                </div>

                <div class="section">
                    <h2>Pagos de Clientes</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Total Abonos Clientes:</span><span class="value positive">${formatCurrency(totals.totalCustomerPayments)}</span></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Totales Generales</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="label">Ventas Totales:</span><span class="value">${formatCurrency(totals.totalSalesAmount + totals.totalCustomerPayments)}</span></div>
                        <div class="info-row"><span class="label">Ganancia Bruta:</span><span class="value positive">${formatCurrency(totals.totalProfit)}</span></div>
                        <div class="info-row"><span class="label">Costo de Productos Vendidos:</span><span class="value negative">${formatCurrency(totals.totalCost)}</span></div>
                    </div>
                </div>

                ${sessionsDetailHtml}

                <div class="footer-info">
                    <p>Reporte generado el ${moment().format('DD/MM/YYYY HH:mm')}</p>
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
    printDocument.write(printContent);
    printDocument.close();
};
