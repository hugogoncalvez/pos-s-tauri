import React, { useContext, useState, useMemo } from 'react';
import { Box, Paper, Typography, useMediaQuery, IconButton, TextField, MenuItem, InputAdornment, Tooltip, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { motion } from 'framer-motion';
import { variants } from '../styles/variants';
import SalesHistorySkeleton from '../styledComponents/skeletons/SalesHistorySkeleton';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { UseFetchQuery } from '../hooks/useQuery';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import SalesChart from './charts/SalesChart';
import SaleDetailsModal from '../styledComponents/SaleDetailsModal';
import { exportSalesToExcel } from '../functions/exportSalesToExcel';
import { KeyboardArrowDown, Clear as ClearIcon, Visibility as ViewIcon, Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/es';

/**
 * Componente SalesHistory
 * ... (docstring)
 */
const SalesHistory = ({ scope = 'all' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { usuario, isLoading: authLoading } = useContext(AuthContext);
    const { tienePermiso } = usePermissions();

    const [openFilterSection, setOpenFilterSection] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);

    const [filters, handleFilterChange, resetFilters] = useForm({
        startDate: '',
        endDate: '',
        userId: null,
        customerId: null,
        paymentMethodId: null,
        minTotal: '',
        maxTotal: ''
    });

    const effectiveScope = (scope === 'all' && tienePermiso('ver_ventas_global')) ? 'all' : 'user';

    const viewTitle = effectiveScope === 'all' ? 'Historial de Ventas Global' : 'Mi Historial de Ventas';
    const viewSubtitle = effectiveScope === 'all' ? 'Análisis completo de todas las transacciones' : 'Revisa todas tus transacciones realizadas';

    // --- QUERIES ---
    const { data: usersData, isLoading: usersLoading } = UseFetchQuery(['users'], '/users', effectiveScope === 'all');
    const { data: customersData, isLoading: customersLoading } = UseFetchQuery(['customers'], '/customers/all');
    const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = UseFetchQuery(['paymentMethods'], '/payment');

    const salesParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.paymentMethodId && { paymentMethodId: filters.paymentMethodId }),
        ...(filters.minTotal && { minTotal: filters.minTotal }),
        ...(filters.maxTotal && { maxTotal: filters.maxTotal }),
    }).toString();

    const { data: salesData, isLoading: salesLoading, error: salesError } = UseFetchQuery(
        ['salesHistory', salesParams],
        `/sales?${salesParams}`
    );

    const isLoading = authLoading || salesLoading || (effectiveScope === 'all' && usersLoading) || customersLoading || paymentMethodsLoading;

    const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
    const formatDate = (dateString) => moment(dateString).format('DD/MM/YYYY HH:mm');

    const handleViewDetails = (saleId) => {
        setSelectedSaleId(saleId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSaleId(null);
    };

    const handleExport = () => {
        if (salesData?.sales) {
            exportSalesToExcel(salesData.sales, filters);
        }
    };

    const { chartData, kpis } = useMemo(() => {
        if (!salesData?.sales) {
            return { chartData: [], kpis: { totalSales: 0, transactionCount: 0, averageTicket: 0 } };
        }

        const dailySales = salesData.sales.reduce((acc, sale) => {
            const date = moment(sale.createdAt).format('YYYY-MM-DD');
            acc[date] = (acc[date] || 0) + parseFloat(sale.total_neto);
            return acc;
        }, {});

        const chartData = Object.keys(dailySales).map(date => ({
            date,
            total: dailySales[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        const totalSales = salesData.sales.reduce((sum, sale) => sum + parseFloat(sale.total_neto), 0);
        const transactionCount = salesData.pagination.total;
        const averageTicket = transactionCount > 0 ? totalSales / transactionCount : 0;

        return { chartData, kpis: { totalSales, transactionCount, averageTicket } };
    }, [salesData]);

    const salesColumns = [
        { id: 'id', label: 'ID Venta', valueGetter: ({ row }) => row.id },
        { id: 'createdAt', label: 'Fecha', valueGetter: ({ row }) => formatDate(row.createdAt) },
        { id: 'customer', label: 'Cliente', valueGetter: ({ row }) => row.Customer?.name || 'Consumidor Final' },
        { id: 'user', label: 'Cajero', valueGetter: ({ row }) => row.usuario?.username || 'N/A' },
        {
            id: 'paymentMethods', label: 'Métodos de Pago', valueGetter: ({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {row.sale_payments?.map(p => (
                        <Chip key={p.payment.method} label={p.payment.method} size="small" />
                    ))}
                </Box>
            )
        },
        { id: 'total_neto', label: 'Total', valueGetter: ({ row }) => formatCurrency(row.total_neto), align: 'right' },
        {
            id: 'actions', label: 'Acciones', valueGetter: ({ row }) => (
                <>
                    <Tooltip title="Ver Detalles">
                        <IconButton size="small" onClick={() => handleViewDetails(row.id)}><ViewIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Imprimir Ticket">
                        <IconButton size="small" onClick={() => handleViewDetails(row.id)}><PrintIcon /></IconButton>
                    </Tooltip>
                </>
            )
        },
    ];

    if (isLoading) {
        return <SalesHistorySkeleton />;
    }

    return (
        <motion.div initial="hidden" animate="enter" exit="exit" variants={variants} transition={{ duration: 0.8, type: "easeInOut" }}>
            <Box sx={{ p: 1 }}>
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
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid>
                            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                                {viewTitle}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {viewSubtitle}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Sección de KPIs */}
                <Grid container spacing={3} mb={4} justifyContent="center">
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Venta Total</Typography>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">{formatCurrency(kpis.totalSales)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Nº de Transacciones</Typography>
                            <Typography variant="h4" color="success.main" fontWeight="bold">{kpis.transactionCount}</Typography>
                        </Paper>
                    </Grid>
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Ticket Promedio</Typography>
                            <Typography variant="h4" color="info.main" fontWeight="bold">{formatCurrency(kpis.averageTicket)}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Gráfico de Ventas */}
                {chartData.length > 0 && <SalesChart data={chartData} />}

                {/* Sección de Filtros */}
                <StyledCard sx={{ p: 2, mb: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Filtros</Typography>
                        <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                            <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                        </IconButton>
                    </Grid>
                    <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                        <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2, mt: 2, backgroundColor: theme.palette.background.paper }}>
                            <Grid container spacing={2} justifyContent="center" alignItems="center">
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledTextField label="Fecha Desde" type="date" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledTextField label="Fecha Hasta" type="date" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                {effectiveScope === 'all' && (
                                    <Grid xs={12} sm={6} md={3}>
                                        <StyledAutocomplete
                                            options={usersData || []}
                                            getOptionLabel={(option) => option.username || ''}
                                            onChange={(event, value) => handleFilterChange({ target: { name: 'userId', value: value ? value.id : null } })}
                                            renderInput={(params) => <TextField {...params} label="Usuario" />}
                                        />
                                    </Grid>
                                )}
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledAutocomplete
                                        options={customersData?.data || []}
                                        getOptionLabel={(option) => option.name || ''}
                                        onChange={(event, value) => handleFilterChange({ target: { name: 'customerId', value: value ? value.id : null } })}
                                        renderInput={(params) => <TextField {...params} label="Cliente" />}
                                    />
                                </Grid>
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledTextField select label="Método de Pago" name="paymentMethodId" value={filters.paymentMethodId || ''} onChange={handleFilterChange}>
                                        <MenuItem value="">Todos</MenuItem>
                                        {(paymentMethodsData || []).map(method => (
                                            <MenuItem key={method.id} value={method.id}>{method.method}</MenuItem>
                                        ))}
                                    </StyledTextField>
                                </Grid>
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledTextField label="Total Mínimo" name="minTotal" type="number" value={filters.minTotal} onChange={handleFilterChange} />
                                </Grid>
                                <Grid xs={12} sm={6} md={3}>
                                    <StyledTextField label="Total Máximo" name="maxTotal" type="number" value={filters.maxTotal} onChange={handleFilterChange} />
                                </Grid>

                                <Grid xs={12} sm={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                    <StyledButton variant="contained" color="success" startIcon={<DownloadIcon />} onClick={handleExport} disabled={!salesData?.sales || salesData.sales.length === 0}>Exportar</StyledButton>
                                    <StyledButton variant="outlined" color="secondary" onClick={() => { resetFilters(); setPage(0); }}>Limpiar</StyledButton>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </StyledCard>

                {/* Tabla de Ventas */}
                <StyledCard sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom color={theme.palette.text.titlePrimary}>Resultados</Typography>
                    <EnhancedTable
                        columns={salesColumns}
                        data={salesData?.sales || []}
                        loading={isLoading}
                        count={salesData?.pagination?.total || 0}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </StyledCard>

                {/* Modal de Detalles */}
                <SaleDetailsModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    saleId={selectedSaleId}
                />
            </Box>
        </motion.div>
    );
};

export default SalesHistory;
