import React, { useState, useMemo, useEffect } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

import { Box, Typography, useMediaQuery, InputAdornment, IconButton, Paper } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';

import { UseFetchQuery } from '../hooks/useQuery';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { variants } from '../styles/variants';
import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import ProfitReportSkeleton from '../styledComponents/skeletons/ProfitReportSkeleton';

function ProfitReport() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('day').format('YYYY-MM-DD'),
    });

    const { data: profitMarginData, isLoading: profitMarginLoading, refetch } = UseFetchQuery('profitMarginData', `/reports/profit-margin?startDate=${filters.startDate}&endDate=${filters.endDate}`, true);

    const handleDateFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilter = (field) => {
        setFilters(prev => ({ ...prev, [field]: '' }));
    };

    const handleApplyFilters = () => {
        refetch();
    };

    const handleClearFilters = () => {
        setFilters({
            startDate: moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().endOf('day').format('YYYY-MM-DD'),
        });
    };

    const handlePrint = () => {
        if (!profitMarginData || !Array.isArray(profitMarginData.report) || profitMarginData.report.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos disponibles para imprimir. Realiza una consulta primero.',
            });
            return;
        }

        Swal.fire({
            title: 'Generando reporte de márgenes...',
            text: 'Preparando el reporte para impresión...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const currentDate = moment().format('DD/MM/YYYY HH:mm');
            const totalProfit = parseFloat(profitMarginData.summary.overallProfit || 0);
            const processedData = profitMarginData.report.map(item => ({
                productName: item.productName,
                totalQuantitySold: item.totalQuantitySold,
                totalCost: `$ ${parseFloat(item.totalCost || 0).toFixed(2)}`,
                totalSales: `$ ${parseFloat(item.totalRevenue || 0).toFixed(2)}`,
                profit: parseFloat(item.totalProfit || 0)
            }));

            let htmlContent = `
            <html>
            <head>
                <title>Reporte de Márgenes de Ganancia</title>
                <meta charset="UTF-8">
                <style>
                    /* CSS content remains the same */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #fff; line-height: 1.4; }
                    .report-container { max-width: 1000px; margin: 0 auto; background: #fff; }
                    .report-header { background: #f8f9fa; color: #333; padding: 30px; text-align: center; margin-bottom: 30px; border-radius: 8px; border: 2px solid #28a745; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                    .company-info { margin-bottom: 20px; }
                    .company-name { font-size: 32px; font-weight: bold; margin-bottom: 8px; color: #28a745; }
                    .company-details { font-size: 14px; color: #666; margin-bottom: 20px; }
                    .report-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; color: #333; }
                    .report-period { font-size: 16px; color: #666; margin-bottom: 5px; }
                    .generated-date { font-size: 12px; color: #999; }
                    .filters-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745; }
                    .filters-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
                    .filter-item { display: inline-block; background: white; padding: 8px 12px; margin: 4px; border-radius: 20px; border: 1px solid #ddd; font-size: 12px; color: #555; }
                    .summary-section { background: #f8f9fa; color: #333; padding: 25px; border-radius: 8px; margin-bottom: 30px; text-align: center; border: 2px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .summary-title { font-size: 20px; margin-bottom: 10px; color: #666; }
                    .summary-amount { font-size: 36px; font-weight: bold; color: ${totalProfit >= 0 ? '#28a745' : '#dc3545'}; }
                    .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    thead { background: #f8f9fa; border-bottom: 2px solid #28a745; }
                    th { color: #333; padding: 15px 8px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; }
                    td { padding: 12px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    tbody tr:nth-child(even) { background-color: #f8f9fa; }
                    tbody tr:hover { background-color: #e8f5e9; }
                    .text-center { text-align: center; } .text-right { text-align: right; } .text-left { text-align: left; }
                    .profit-positive { color: #28a745; font-weight: bold; }
                    .profit-negative { color: #dc3545; font-weight: bold; }
                    .total-row { background: #e8f5e9 !important; color: #333; font-weight: bold; font-size: 12px; border-top: 2px solid #28a745; }
                    .total-row td { border-bottom: none; padding: 15px 8px; }
                    .statistics-section { display: flex; justify-content: space-around; margin: 30px 0; gap: 20px; }
                    .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #28a745; flex: 1; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #28a745; margin-bottom: 5px; }
                    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 2px dashed #ddd; margin-top: 30px; border-radius: 8px; }
                    .footer-info { font-size: 11px; color: #666; line-height: 1.4; }
                    @media print { body { margin: 0; padding: 15px; font-size: 10px; } .report-header, .summary-section, thead, .total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .report-header { background: #f8f9fa !important; border: 1px solid #333 !important; } .summary-section { background: #f8f9fa !important; border: 1px solid #333 !important; } thead { background: #f8f9fa !important; border-bottom: 2px solid #333 !important; } .total-row { background: #f0f0f0 !important; border-top: 2px solid #333 !important; } .no-print { display: none; } table { font-size: 9px; } th { padding: 8px 4px; } td { padding: 6px 4px; } }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="report-header">
                        <div class="company-info">
                            <div class="company-name">Mi Empresa</div>
                            <div class="company-details">Dirección: Calle Principal 123<br>Tel: (123) 456-7890 | Email: info@miempresa.com</div>
                        </div>
                        <div class="report-title">Reporte de Márgenes de Ganancia</div>
                        <div class="report-period">Período: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}</div>
                        <div class="generated-date">Generado el ${currentDate}</div>
                    </div>
            `;

            htmlContent += '<div class="filters-summary"><div class="filters-title">Filtros Aplicados</div>';
            htmlContent += `<span class="filter-item">Período: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}</span>`;
            htmlContent += '<span class="filter-item">Tipo: Márgenes de Ganancia</span></div>';

            const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalProfit);
            htmlContent += `<div class="summary-section"><div class="summary-title">Ganancia Total del Período</div><div class="summary-amount">${formattedTotal}</div></div>`;

            const totalProducts = processedData.length;
            const totalQuantitySold = processedData.reduce((sum, item) => sum + parseFloat(item.totalQuantitySold || 0), 0);
            const profitableProducts = processedData.filter(item => parseFloat(item.profit) > 0).length;

            htmlContent += `<div class="statistics-section"><div class="stat-card"><div class="stat-number">${totalProducts}</div><div class="stat-label">Productos Analizados</div></div><div class="stat-card"><div class="stat-number">${totalQuantitySold.toLocaleString()}</div><div class="stat-label">Unidades Vendidas</div></div><div class="stat-card"><div class="stat-number">${profitableProducts}</div><div class="stat-label">Productos Rentables</div></div></div>`;

            htmlContent += '<div class="table-container"><table><thead><tr><th class="text-left">Producto</th><th class="text-center">Cantidad Vendida</th><th class="text-right">Costo Total</th><th class="text-right">Venta Total</th><th class="text-right">Ganancia</th></tr></thead><tbody>';

            processedData.forEach(row => {
                const profitValue = parseFloat(row.profit);
                const profitClass = profitValue >= 0 ? 'profit-positive' : 'profit-negative';
                htmlContent += `<tr><td class="text-left">${row.productName || 'N/A'}</td><td class="text-center">${row.totalQuantitySold}</td><td class="text-right">${row.totalCost}</td><td class="text-right">${row.totalSales}</td><td class="text-right ${profitClass}">$ ${profitValue.toFixed(2)}</td></tr>`;
            });

            htmlContent += `<tr class="total-row"><td colspan="4" class="text-right"><strong>GANANCIA TOTAL:</strong></td><td class="text-right"><strong>${formattedTotal}</strong></td></tr>`;
            htmlContent += '</tbody></table></div>';

            htmlContent += `<div class="report-footer"><div class="footer-info">Este reporte de márgenes fue generado automáticamente el ${currentDate}<br>Los datos reflejan las ganancias obtenidas en el período seleccionado<br>Para consultas o aclaraciones, contacte al administrador del sistema</div></div>`;
            htmlContent += '</div></body></html>';

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
                    Swal.fire({ icon: 'error', title: 'Error de Impresión', text: 'No se pudo abrir el diálogo de impresión.' });
                } finally {
                    setTimeout(() => {
                        if (iframe.parentNode) {
                            iframe.parentNode.removeChild(iframe);
                        }
                    }, 1000);
                    Swal.close();
                }
            };

            const printDocument = iframe.contentDocument || iframe.contentWindow.document;
            printDocument.open();
            printDocument.write(htmlContent);
            printDocument.close();

        } catch (error) {
            console.error("Error al generar el reporte para imprimir:", error);
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte de márgenes. Por favor, intente de nuevo.',
            });
        }
    };

    const columns = useMemo(() => [
        { id: 'productName', label: 'Producto' },
        { id: 'totalQuantitySold', label: 'Cantidad Vendida' },
        { id: 'totalCost', label: 'Costo Total' },
        { id: 'totalSales', label: 'Venta Total' },
        {
            id: 'profit',
            label: 'Ganancia',
            valueGetter: ({ row }) => parseFloat(row.profit || 0),
            cellStyle: (row) => ({
                color: parseFloat(row.profit || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 'bold'
            }),
            format: (value) => `$ ${parseFloat(value || 0).toFixed(2)}`
        },
    ], [theme.palette]);

    const processedData = useMemo(() => {
        if (!profitMarginData || !Array.isArray(profitMarginData.report)) {
            return [];
        }
        return profitMarginData.report.map(item => ({
            productName: item.productName,
            totalQuantitySold: item.totalQuantitySold,
            totalCost: `$ ${parseFloat(item.totalCost || 0).toFixed(2)}`,
            totalSales: `$ ${parseFloat(item.totalRevenue || 0).toFixed(2)}`,
            profit: parseFloat(item.totalProfit || 0)
        }));
    }, [profitMarginData]);

    const paginatedData = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, page, rowsPerPage]);

    const totalProfit = useMemo(() => {
        if (!profitMarginData || !profitMarginData.summary) {
            return 0;
        }
        return parseFloat(profitMarginData.summary.overallProfit || 0);
    }, [profitMarginData]);



    return (
        <motion.div
            initial="hidden"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 1.5, type: "easeInOut" }}
            className="relative"
        >
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    mt: 2,
                    background: (theme) => theme.palette.background.componentHeaderBackground,
                    color: theme.palette.primary.contrastText
                }}
            >
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                    Reporte de Márgenes de Ganancia
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Consulta la ganancia de tus productos en un rango de fechas.
                </Typography>
            </Paper>

            <StyledCard elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>
                    <Grid sx={{ width: 'clamp(250px, 25%, 350px)' }}>
                        <StyledTextField
                            label="Fecha Desde"
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={(e) => { handleDateFilterChange(e); e.target.blur(); }}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton size="small" onClick={() => resetFilter('startDate')}>
                                            <ClearIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(250px, 25%, 350px)' }}>
                                    <StyledTextField
                                        label="Fecha Hasta"
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={(e) => { handleDateFilterChange(e); e.target.blur(); }}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size="small" onClick={() => resetFilter('endDate')}>
                                                        <ClearIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />                    </Grid>
                    <Grid sx={{ width: 'clamp(150px, 15%, 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StyledButton
                            variant="contained"
                            onClick={handleApplyFilters}
                            startIcon={<SearchIcon />}
                            fullWidth
                        >
                            Consultar
                        </StyledButton>
                    </Grid>
                    <Grid sx={{ width: 'clamp(150px, 15%, 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StyledButton
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearFilters}
                            fullWidth
                        >
                            Limpiar Filtros
                        </StyledButton>
                    </Grid>
                    <Grid sx={{ width: 'clamp(150px, 15%, 250px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StyledButton
                            variant="contained"
                            color="success"
                            onClick={handlePrint}
                            startIcon={<PrintIcon />}
                            fullWidth
                        >
                            Imprimir Reporte
                        </StyledButton>
                    </Grid>
                </Grid>
            </StyledCard>

            {profitMarginLoading ? (
                <ProfitReportSkeleton />
            ) : (
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Resultados del Reporte
                        </Typography>
                        <Typography variant="h6">
                            Ganancia Total: <span style={{ color: totalProfit >= 0 ? 'green' : 'red' }}>{`$ ${totalProfit.toFixed(2)}`}</span>
                        </Typography>
                    </Box>
                    <EnhancedTable
                        columns={columns}
                        data={paginatedData}
                        loading={false} // Set to false as the skeleton handles the loading state
                        count={processedData.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            )}
        </motion.div>
    );
}

export default ProfitReport;