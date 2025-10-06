import { useEffect, useMemo, useState, useCallback } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';


import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { TextField, MenuItem, useMediaQuery, InputAdornment, IconButton, Paper, Box, Autocomplete, Skeleton, CircularProgress } from '@mui/material';
import { StyledButton as Button } from '../styledComponents/ui/StyledButton';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import ClearIcon from '@mui/icons-material/Clear';
import PrintIcon from '@mui/icons-material/Print';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

import { UseFetchQuery } from '../hooks/useQuery';
import { useForm } from '../hooks/useForm';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { variants } from '../styles/variants';
import { mostrarError } from '../functions/MostrarError';
import { mostrarCarga } from '../functions/mostrarCarga';
import { useTheme } from '@mui/material/styles';
import { Api as api } from '../api/api';
import { debounce } from '../functions/Debounce';
import InformesSkeleton from '../styledComponents/skeletons/InformesSkeleton';

const Informes = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:450px)');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, handleFilterChange, resetFilters] = useForm({
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        reportType: 'salesSummary',
        userId: '',
        productId: '',
        categoryId: '',
        supplierId: '',
        paymentMethod: '',
        cashSessionId: '',
    });

    const [productSearchTerm, setProductSearchTerm] = useState('');

    const queryParams = useMemo(() => new URLSearchParams({
        page: page,
        limit: rowsPerPage,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.supplierId && { supplierId: filters.supplierId }),
    }).toString(), [page, rowsPerPage, filters]);

    const summaryQueryParams = useMemo(() => new URLSearchParams({
        reportType: filters.reportType,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.supplierId && { supplierId: filters.supplierId }),
    }).toString(), [filters]);

    const debouncedSetProductSearchTerm = useCallback(
        debounce((newValue) => {
            setProductSearchTerm(newValue);
        }, 500), // 500ms de delay
        []
    );

    const [openFilterSection, setOpenFilterSection] = useState(false);
    const { data: productsData, isLoading: productsLoading } = UseFetchQuery(
        ['stock', productSearchTerm], // La clave de la query debe incluir el término de búsqueda
        `/stock?limit=100&name=${productSearchTerm}`,
        true,
        0,
        { keepPreviousData: true } // Mantener datos anteriores mientras se carga
    );
    const products = productsData?.products || [];
    const { data: suppliers, isLoading: suppliersLoading } = UseFetchQuery('suppliers', '/suppliers', true);

    const { data: reportData, isFetching } = UseFetchQuery(
        [filters.reportType, queryParams],
        `/${filters.reportType === 'salesSummary' ? 'salesdetails' : 'purchasesdetails'}?${queryParams}`,
        !!(filters.reportType && filters.startDate && filters.endDate),
        0,
        { keepPreviousData: true }
    );

    const { data: summaryData, isFetching: isFetchingSummary } = UseFetchQuery(
        ['reportSummary', summaryQueryParams],
        `/reports/summary?${summaryQueryParams}`,
        !!(filters.reportType && filters.startDate && filters.endDate),
        0,
        { keepPreviousData: true }
    );


    const reportTypeOptions = [
        { value: 'salesSummary', label: 'Ventas' },
        { value: 'purchasesSummary', label: 'Compras' },
    ];

    const handleFilterAndResetPage = (e) => {
        handleFilterChange(e);
        setPage(0);
    };

    const resetFieldAndPage = (field) => {
        handleFilterChange({ target: { name: field, value: '' } });
        setPage(0);
    }

    const clearAllFiltersAndResetPage = () => {
        resetFilters();
        setPage(0);
    };

    const handlePrint = async () => {
        mostrarCarga('Generando informe completo...', theme);

        try {
            const { data: fullReport } = await api.get(`/reports/full-data?${summaryQueryParams}`);
            const printData = formatDataForTable(fullReport.rows, filters.reportType, products?.data);
            const reportTitle = filters.reportType === 'salesSummary' ? 'Ventas' : 'Compras';
            const currentDate = moment().format('DD/MM/YYYY HH:mm');

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);

            let htmlContent = `
            <html>
            <head>
                <title>Informe de ${reportTitle}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #fff; line-height: 1.4; }
                    .report-container { max-width: 1200px; margin: 0 auto; background: #fff; }
                    .report-header { background: #f8f9fa; color: #333; padding: 30px; text-align: center; margin-bottom: 30px; border-radius: 8px; border: 2px solid #667eea; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                    .company-info { margin-bottom: 20px; }
                    .company-name { font-size: 32px; font-weight: bold; margin-bottom: 8px; color: #667eea; }
                    .company-details { font-size: 14px; color: #666; margin-bottom: 20px; }
                    .report-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; color: #333; }
                    .report-period { font-size: 16px; opacity: 0.9; margin-bottom: 5px; }
                    .generated-date { font-size: 12px; opacity: 0.8; }
                    .filters-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #667eea; }
                    .filters-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
                    .filter-item { display: inline-block; background: white; padding: 8px 12px; margin: 4px; border-radius: 20px; border: 1px solid #ddd; font-size: 12px; color: #555; }
                    .summary-section { background: #f8f9fa; color: #333; padding: 25px; border-radius: 8px; margin-bottom: 30px; text-align: center; border: 2px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .summary-title { font-size: 20px; margin-bottom: 10px; opacity: 0.9; }
                    .summary-amount { font-size: 36px; font-weight: bold; color: #667eea; }
                    .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    thead { background: #f8f9fa; border-bottom: 2px solid #667eea; }
                    th { color: #333; padding: 15px 8px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; }
                    td { padding: 12px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    tbody tr:nth-child(even) { background-color: #f8f9fa; }
                    tbody tr:hover { background-color: #e3f2fd; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-left { text-align: left; }
                    .total-row { background: #e3f2fd !important; color: #333; font-weight: bold; font-size: 12px; border-top: 2px solid #667eea; }
                    .total-row td { border-bottom: none; padding: 15px 8px; }
                    .statistics-section { display: flex; justify-content: space-around; margin: 30px 0; gap: 20px; }
                    .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #667eea; flex: 1; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
                    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
                    .report-footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 2px dashed #ddd; margin-top: 30px; border-radius: 8px; }
                    .footer-info { font-size: 11px; color: #666; line-height: 1.4; }
                    .page-break { page-break-before: always; }
                    @media print {
                        body { margin: 0; padding: 15px; font-size: 10px; }
                        .report-header, .summary-section, thead, .total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .report-header { background: #f8f9fa !important; border: 1px solid #333 !important; }
                        .summary-section { background: #f8f9fa !important; border: 1px solid #333 !important; }
                        thead { background: #f8f9fa !important; border-bottom: 2px solid #333 !important; }
                        .total-row { background: #f0f0f0 !important; border-top: 2px solid #333 !important; }
                        .no-print { display: none; }
                        table { font-size: 9px; }
                        th { padding: 8px 4px; }
                        td { padding: 6px 4px; }
                    }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="report-header">
                        <div class="company-info">
                            <div class="company-name">Mi Empresa</div>
                            <div class="company-details">
                                Dirección: Calle Principal 123<br>
                                Tel: (123) 456-7890 | Email: info@miempresa.com
                            </div>
                        </div>
                        <div class="report-title">Informe de ${reportTitle}</div>
                        <div class="report-period">
                            Período: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}
                        </div>
                        <div class="generated-date">Generado el ${currentDate}</div>
                    </div>
            `;

            htmlContent += '<div class="filters-summary">';
            htmlContent += '<div class="filters-title">Filtros Aplicados</div>';
            if (filters.startDate || filters.endDate) {
                htmlContent += `<span class="filter-item">Período: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}</span>`;
            }
            if (filters.productId) {
                const selectedProduct = products?.products?.find(p => p.id == filters.productId);
                htmlContent += `<span class="filter-item">Producto: ${selectedProduct?.name || 'N/A'}</span>`;
            }
            if (filters.supplierId) {
                const selectedSupplier = suppliers?.find(s => s.id == filters.supplierId);
                htmlContent += `<span class="filter-item">Proveedor: ${selectedSupplier?.nombre || 'N/A'}</span>`;
            }
            htmlContent += `<span class="filter-item">Tipo: ${reportTitle}</span>`;
            htmlContent += '</div>';

            if (summaryData?.total) {
                const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(summaryData.total);
                htmlContent += `
                <div class="summary-section">
                    <div class="summary-title">Total del Período</div>
                    <div class="summary-amount">${formattedTotal}</div>
                </div>
            `;
            }

            const totalItems = printData.length;
            const avgAmount = summaryData?.total ? (summaryData.total / totalItems) : 0;
            const totalQuantity = printData.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);

            htmlContent += `
            <div class="statistics-section">
                <div class="stat-card">
                    <div class="stat-number">${totalItems}</div>
                    <div class="stat-label">Total Movimientos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalQuantity.toLocaleString()}</div>
                    <div class="stat-label">Cantidad Total</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(avgAmount)}</div>
                    <div class="stat-label">Promedio por Movimiento</div>
                </div>
            </div>
        `;

            htmlContent += '<div class="table-container">';
            htmlContent += '<table>';
            htmlContent += '<thead><tr>';
            columns.forEach(col => {
                htmlContent += `<th class="${col.id === 'quantity' || col.id.includes('cost') ? 'text-right' : col.id === 'date' ? 'text-center' : 'text-left'}">${col.label}</th>`;
            });
            htmlContent += '</tr></thead><tbody>';

            printData.forEach((row, index) => {
                htmlContent += '<tr>';
                columns.forEach(col => {
                    const value = row[col.id] !== undefined && row[col.id] !== null ? row[col.id] : 'N/A';
                    const alignment = col.id === 'quantity' || col.id.includes('cost') ? 'text-right' : col.id === 'date' ? 'text-center' : 'text-left';
                    htmlContent += `<td class="${alignment}">${value}</td>`;
                });
                htmlContent += '</tr>';
            });

            if (summaryData?.total) {
                const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(summaryData.total);
                htmlContent += `
                <tr class="total-row">
                    <td colspan="${columns.length - 1}" class="text-right"><strong>TOTAL GENERAL:</strong></td>
                    <td class="text-right"><strong>${formattedTotal}</strong></td>
                </tr>
            `;
            }

            htmlContent += '</tbody></table></div>';
            htmlContent += `
            <div class="report-footer">
                <div class="footer-info">
                    Este informe fue generado automáticamente el ${currentDate}<br>
                    Datos extraídos del sistema de gestión de inventarios<br>
                    Para consultas o aclaraciones, contacte al administrador del sistema
                </div>
            </div>
        `;
            htmlContent += '</div></body></html>';

            iframe.onload = () => {
                Swal.close();
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (error) {
                    console.error('Error al intentar imprimir:', error);
                    mostrarError('No se pudo abrir el diálogo de impresión.', theme);
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
            printDocument.write(htmlContent);
            printDocument.close();

        } catch (error) {
            Swal.close();
            console.error("Error al generar el informe para imprimir:", error);
            mostrarError('No se pudo generar el informe completo. Por favor, intente de nuevo.', theme);
        }
    };

    const columns = useMemo(() => [
        { id: 'date', label: 'Fecha' },
        { id: 'product', label: 'Producto' },
        { id: 'description', label: 'Descripción' },
        { id: 'supplier', label: 'Proveedor' },
        { id: 'type', label: 'Tipo de Movimiento' },
        { id: 'quantity', label: 'Cantidad' },
        { id: 'unit_cost', label: 'Costo Unitario' },
        { id: 'total_cost', label: 'Costo Total' },
    ], []);

    const formatDataForTable = (movements, reportType, allProducts) => {
        if (!Array.isArray(movements)) return [];
        return movements.map(item => {
            const isSale = reportType === 'salesSummary';
            const stockItem = item.stock || allProducts?.find(prod => prod.id === item.stock_id);

            const unitCost = parseFloat(isSale ? item.price : item.cost || 0);
            const quantity = parseFloat(item.quantity || 0);
            const totalCost = unitCost * quantity;

            return {
                id: item.id,
                date: moment(isSale ? item.sale?.createdAt : item.purchase?.createdAt).format('DD/MM/YYYY'),
                product: stockItem?.name || 'N/A',
                description: stockItem?.description || 'N/A',
                supplier: stockItem?.supplier?.nombre || 'N/A',
                type: isSale ? 'Venta/Egreso' : 'Ingreso',
                quantity: quantity,
                unit_cost: `$ ${unitCost.toFixed(2)}`,
                total_cost: `$ ${totalCost.toFixed(2)}`,
            };
        });
    };


    const data = useMemo(() => {
        return formatDataForTable(reportData?.rows, filters.reportType, products?.data);
    }, [reportData, filters.reportType, products]);


    const totalRows = useMemo(() => {
        return reportData?.count || 0;
    }, [reportData]);

    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(totalRows / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(0);
        }
    }, [totalRows, rowsPerPage, page]);

    useEffect(() => {
        if (filters.startDate && filters.endDate) {
            const start = moment(filters.startDate);
            const end = moment(filters.endDate);

            if (start.isAfter(end)) {
                handleFilterChange({ target: { name: 'endDate', value: filters.startDate } });
            }
        }
    }, [filters.startDate, filters.endDate, handleFilterChange]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isLoading = productsLoading || suppliersLoading || isFetching || isFetchingSummary;

    if (isLoading) {
        return <InformesSkeleton />;
    }

    return (
        <motion.div initial="hidden"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 1.5, type: "easeInOut" }}
            className="relative">
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
                    Informe de Movimientos de Productos
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Aquí puedes ver todos los movimientos de tus productos.
                </Typography>
            </Paper>

            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">Filtros de Búsqueda</Typography>
                    <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                        <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                    </IconButton>
                </Grid>
                <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                    <Grid container spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>

                        <Grid item sx={{ width: 'clamp(250px, 30%, 400px)' }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item>
                                    <TextField
                                        label="Fecha Desde"
                                        type='date'
                                        name='startDate'
                                        value={(filters.startDate) ? filters.startDate.substr(0, 10) : ''}
                                        onChange={handleFilterAndResetPage}
                                        fullWidth
                                        autoComplete='off'
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetFieldAndPage('startDate')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Fecha Hasta"
                                        type='date'
                                        name='endDate'
                                        value={(filters.endDate) ? filters.endDate.substr(0, 10) : ''}
                                        onChange={handleFilterAndResetPage}
                                        fullWidth
                                        autoComplete='off'
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => resetFieldAndPage('endDate')}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item sx={{ width: 'clamp(250px, 30%, 400px)' }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item>
                                    <StyledAutocomplete
                                        options={products || []}
                                        getOptionLabel={(option) => option.name || ""}
                                        getOptionKey={(option) => option.id}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e, value) => {
                                            handleFilterChange({ target: { name: 'productId', value: value?.id } });
                                            setPage(0);
                                        }}
                                        onInputChange={(event, newInputValue) => {
                                            debouncedSetProductSearchTerm(newInputValue);
                                        }}
                                        loading={productsLoading}
                                        filterOptions={(x) => x}
                                        renderInput={(params) => <TextField {...params} label="Producto" fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{productsLoading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />}
                                    />
                                </Grid>
                                <Grid item>
                                    <StyledAutocomplete
                                        options={Array.isArray(suppliers) ? suppliers : []}
                                        getOptionLabel={(option) => option.nombre}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(e, value) => {
                                            handleFilterChange({ target: { name: 'supplierId', value: value?.id } });
                                            setPage(0);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Proveedor" fullWidth />}
                                    />
                                </Grid>
                                <Grid item>
                                    <Autocomplete
                                        fullWidth
                                        size="small"
                                        options={reportTypeOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={reportTypeOptions.find(option => option.value === filters.reportType) || null}
                                        onChange={(event, newValue) => handleFilterAndResetPage({ target: { name: 'reportType', value: newValue ? newValue.value : '' } })}
                                        renderInput={(params) => <TextField {...params} label="Tipo de Reporte" />}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ width: 'clamp(200px, 20%, 300px)' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={clearAllFiltersAndResetPage}
                                    >
                                        Limpiar
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        onClick={handlePrint}
                                        startIcon={<PrintIcon />}
                                    >
                                        Imprimir Informe
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </StyledCard>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Resumen del Informe</Typography>
                        {isFetchingSummary ? (
                            <Skeleton variant="text" width={150} />
                        ) : (
                            <Typography variant="h6" component="p" sx={{ fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(summaryData?.total || 0)}
                            </Typography>
                        )}
                    </Grid>
                </Box>
                <EnhancedTable
                    columns={columns}
                    data={data}
                    pagination={true}
                    count={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    loading={isFetching}
                />
            </Paper>
        </motion.div>
    );
};

export default Informes;
