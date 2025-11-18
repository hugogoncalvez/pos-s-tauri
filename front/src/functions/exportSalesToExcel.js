import * as XLSX from 'xlsx';
import moment from 'moment';

export const exportSalesToExcel = (sales, filters) => {
    if (!sales || sales.length === 0) {
        console.error("No hay datos de ventas para exportar.");
        return;
    }

    // 1. Formatear los datos para la exportación
    const dataToExport = sales.map(sale => ({
        'ID Venta': sale.id,
        'Fecha': moment(sale.createdAt).format('DD/MM/YYYY HH:mm'),
        'Cliente': sale.Customer?.name || 'Consumidor Final',
        'Cajero': sale.usuario?.username || 'N/A',
        'Métodos de Pago': sale.sale_payments.map(p => p.payment.method).join(', '),
        'Descuento Promoción': sale.promotion_discount,
        'Recargo': sale.surcharge_amount,
        'Total Neto': sale.total_neto,
    }));

    // 2. Crear una hoja de cálculo a partir de los datos
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Ajustar anchos de columna (opcional, pero mejora la legibilidad)
    worksheet['!cols'] = [
        { wch: 10 }, // ID Venta
        { wch: 20 }, // Fecha
        { wch: 30 }, // Cliente
        { wch: 20 }, // Cajero
        { wch: 30 }, // Métodos de Pago
        { wch: 15 }, // Descuento
        { wch: 15 }, // Recargo
        { wch: 15 }, // Total Neto
    ];

    // 3. Crear un nuevo libro de trabajo y añadir la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Ventas');

    // 4. Generar el nombre del archivo y disparar la descarga
    const fileName = `HistorialVentas_${moment().format('YYYYMMDD_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};