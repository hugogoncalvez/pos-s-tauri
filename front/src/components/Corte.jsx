import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Divider,
    Chip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/es';

import { UseFetchQuery } from '../hooks/useQuery';
import { useForm } from '../hooks/useForm';
import { usePermissions } from '../hooks/usePermissions';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { Clear as ClearIcon, Print as PrintIcon } from '@mui/icons-material';
import { mostrarError } from '../functions/MostrarError';
import { printDailyCutReport } from '../functions/printDailyCutReport'; // Se creará esta función

const Corte = () => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();

    const [filters, handleFilterChange, resetFilters] = useForm({
        date: moment().format('YYYY-MM-DD'),
        userId: null,
    });

    const { data: usersData, isLoading: usersLoading, error: usersError } = UseFetchQuery(
        ['users'], '/users', tienePermiso('ver_vista_caja_admin')
    );

    const { data: reportData, isLoading: reportLoading, error: reportError, refetch: refetchReport } = UseFetchQuery(
        ['dailyCutReport', filters.date, filters.userId],
        `/reports/daily-cut?date=${filters.date}${filters.userId ? `&userId=${filters.userId}` : ''}`,
        !!filters.date // Solo habilitar la query si hay una fecha seleccionada
    );

    useEffect(() => {
        moment.locale('es');
    }, []);

    useEffect(() => {
        if (reportError) {
            mostrarError(reportError.response?.data?.message || 'Error al cargar el reporte de corte de caja.', theme);
        }
    }, [reportError, theme]);

    const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);

    const handlePrint = () => {
        if (reportData?.report?.totals) {
            printDailyCutReport(reportData.report, { formatCurrency });
        } else {
            mostrarError('No hay datos para imprimir.', theme);
        }
    };

    const renderSection = (title, content) => (
        <Grid xs={12} sm={6} md={4} lg={3} sx={{ mb: 2 }}>
            <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{title}</Typography>
                <Box>
                    {content}
                </Box>
            </Paper>
        </Grid>
    );

    const renderTotalsSection = (title, value, color = 'text.primary') => (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" color="text.secondary">{title}:</Typography>
            <Typography variant="body1" sx={{ color: color, fontWeight: 'bold' }}>{formatCurrency(value)}</Typography>
        </Box>
    );

    // --- Lógica de Renderizado Condicional ---
    const hasData = reportData?.report?.totals && Object.values(reportData.report.totals).some(v => v !== 0);
    const isEmptyData = reportData?.report?.totals && Object.values(reportData.report.totals).every(v => v === 0);
    const noReportFound = reportData && !reportData.report?.totals;

    return (
        <Box sx={{ p: 1 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2, background: (theme) => theme.palette.background.componentHeaderBackground, color: theme.palette.primary.contrastText }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography variant="h4" gutterBottom>Corte de Caja</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Resumen de movimientos de caja por fecha y cajero</Typography>
                    </Grid>
                    <Grid>
                        <StyledButton variant="outlined" onClick={handlePrint} size="small" startIcon={<PrintIcon />} sx={{ padding: '2px 12px' }} disabled={!hasData || reportLoading}>
                            Imprimir Corte
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid sx={{ width: 'clamp(280px, 30%, 350px)' }}>
                            <StyledDatePicker
                                label="Fecha del Reporte"
                                value={filters.date ? moment(filters.date) : null}
                                onChange={(newValue) => {
                                    handleFilterChange({ target: { name: 'date', value: newValue ? newValue.format('YYYY-MM-DD') : '' } });
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => {
                                                        handleFilterChange({ target: { name: 'date', value: '' } });
                                                    }}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid sx={{ width: 'clamp(280px, 30%, 350px)' }}>
                            <StyledAutocomplete
                                options={Array.isArray(usersData) ? usersData : []}
                                getOptionLabel={(option) => option.username || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                onChange={(event, value) => {
                                    handleFilterChange({ target: { name: 'userId', value: value ? value.id : null } });
                                }}
                                value={usersData?.find(u => u.id === filters.userId) || null}
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        label="Cajero"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => {
                                                        handleFilterChange({ target: { name: 'userId', value: null } });
                                                    }}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid sx={{ width: 'clamp(180px, 15%, 200px)' }}>
                            <StyledButton variant="outlined" color="secondary" onClick={resetFilters} sx={{ padding: '2px 12px' }}>
                                Limpiar Filtros
                            </StyledButton>
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Paper>

            {reportLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {reportError && !reportLoading && (
                <Alert severity="error" sx={{ mt: 2 }}>Error al cargar el reporte: {reportError.response?.data?.message || reportError.message}</Alert>
            )}

            {!reportLoading && !reportError && (
                <>
                    {hasData && (
                        <Grid container spacing={2} justifyContent="center">
                            {/* Sección Entradas de Efectivo */}
                            {renderSection(
                                'Entradas de Efectivo',
                                <>
                                    {renderTotalsSection('Dinero Inicial en Caja', reportData.report.totals.openingAmount)}
                                    {renderTotalsSection('Ingresos de Caja', reportData.report.totals.totalIncome)}
                                    <Divider sx={{ my: 1 }} />
                                    {renderTotalsSection('Total Entradas', reportData.report.totals.openingAmount + reportData.report.totals.totalIncome, 'primary.main')}
                                </>
                            )}

                            {/* Sección Dinero en Caja */}
                            {renderSection(
                                'Dinero en Caja',
                                <>
                                    {renderTotalsSection('Ventas en Efectivo', reportData.report.totals.totalCashSales)}
                                    {renderTotalsSection('Ingresos de Caja', reportData.report.totals.totalIncome)}
                                    {renderTotalsSection('Egresos de Caja', -reportData.report.totals.totalExpense, 'error.main')}
                                    <Divider sx={{ my: 1 }} />
                                    {renderTotalsSection('Total en Caja', reportData.report.totals.openingAmount + reportData.report.totals.totalCashSales + reportData.report.totals.totalIncome - reportData.report.totals.totalExpense, 'primary.main')}
                                </>
                            )}

                            {/* Sección Pagos de Contado */}
                            {renderSection(
                                'Pagos de Contado',
                                <>
                                    {Object.entries(reportData.report.salesByPaymentMethod).map(([method, amount]) => (
                                        <Box key={method} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                            <Typography variant="body2" color="text.secondary">{method}:</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(amount)}</Typography>
                                        </Box>
                                    ))}
                                    <Divider sx={{ my: 1 }} />
                                    {renderTotalsSection('Total Pagos Contado', reportData.report.totals.totalSalesAmount, 'primary.main')}
                                </>
                            )}

                            {/* Sección Ventas por Categoría */}
                            {renderSection(
                                'Ventas por Categoría',
                                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {Object.entries(reportData.report.salesByCategory).map(([category, amount]) => (
                                        <Box key={category} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                            <Typography variant="body2" color="text.secondary">{category}:</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(amount)}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Sección Pagos de Clientes */}
                            {renderSection(
                                'Pagos de Clientes',
                                <>
                                    {renderTotalsSection('Total Abonos Clientes', reportData.report.totals.totalCustomerPayments, 'success.main')}
                                </>
                            )}

                            {/* Sección Totales Generales */}
                            {renderSection(
                                'Totales Generales',
                                <>
                                    {renderTotalsSection('Ventas Totales', reportData.report.totals.totalSalesAmount + reportData.report.totals.totalCustomerPayments, 'primary.main')}
                                    {renderTotalsSection('Ganancia Bruta', reportData.report.totals.totalProfit, 'success.main')}
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        (Ventas Totales - Costo de Productos Vendidos)
                                    </Typography>
                                </>
                            )}

                                                                                            {/* Resumen de Sesiones (si hay más de una o si se filtra por 'Todos') */}

                                                                                            {filters.userId === null && reportData.report.sessions.length > 0 && (                                <Grid xs={12}>
                                    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
                                        <Typography variant="h6" gutterBottom>Detalle de Sesiones Individuales</Typography>
                                        {reportData.report.sessions.map((session) => (
                                            <Box key={session.id} sx={{ mb: 2, p: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold">Cajero: {session.username} ({session.rol})</Typography>
                                                <Typography variant="body2">Apertura: {moment(session.openedAt).format('DD/MM/YYYY HH:mm')}</Typography>
                                                <Typography variant="body2">Monto Inicial: {formatCurrency(session.openingAmount)}</Typography>
                                                <Typography variant="body2">Ventas al Cierre: {formatCurrency(session.totalSalesAtClose)}</Typography>
                                                <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Estado: <Chip label={session.status} size="small" color={session.status === 'cerrada' ? 'default' : 'success'} /></Typography>
                                                {session.status === 'cerrada' && (
                                                    <Typography variant="body2" sx={{ color: session.finalDiscrepancy < 0 ? 'error.main' : 'success.main' }}>
                                                        Diferencia Final: {formatCurrency(session.finalDiscrepancy)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {isEmptyData && (
                        <Alert severity="info" sx={{ mt: 2 }}>No se encontraron movimientos para la fecha y cajero seleccionados.</Alert>
                    )}

                    {noReportFound && (
                        <Alert severity="info" sx={{ mt: 2 }}>No se encontraron datos de sesión para la fecha y cajero seleccionados.</Alert>
                    )}
                </>            )}
        </Box>
    );
};

export default Corte;