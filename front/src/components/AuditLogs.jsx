import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Paper, Typography, Chip, IconButton, Collapse, Grid,
    Tooltip, CardContent, MenuItem, useMediaQuery, InputAdornment,
    Autocomplete, TextField
} from '@mui/material';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { StyledTableCell, StyledTableRow } from '../styles/styles';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    FilterList as FilterListIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/es';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker';
import FormattedLogDetails from '../styledComponents/FormattedLogDetails';
import { UseFetchQuery } from '../hooks/useQuery';
import { useTheme } from '@mui/material/styles';
import { useForm } from '../hooks/useForm';
import AuditLogsSkeleton from '../styledComponents/skeletons/AuditLogsSkeleton';

const AuditLogs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [expandedRow, setExpandedRow] = useState(null);

    const initialFilterState = {
        user_id: '',
        action: '',
        entity_type: '',
        start_date: '',
        end_date: '',
        session_id: ''
    };

    const [filters, handleFilterChange, resetFilters, , setFilters] = useForm(initialFilterState);

    const { data: logData, refetch: refetchLogs, isLoading, isFetching } = UseFetchQuery(
        ['auditLogs', page, rowsPerPage, filters],
        `/audit/logs?page=${page + 1}&limit=${rowsPerPage}&${new URLSearchParams(filters)}`,
        true,
        0,
        { keepPreviousData: true }
    );

    const { data: stats, isLoading: statsLoading } = UseFetchQuery('auditStats', '/audit/stats', true);

    // Fetch users and payment methods for mapping
    const { data: usersData, isLoading: usersLoading } = UseFetchQuery('users', '/users', true);
    const { data: paymentMethodsData } = UseFetchQuery('paymentMethods', '/payment', true);

    const usersMap = useMemo(() => {
        if (!usersData) return {};
        return usersData.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
        }, {});
    }, [usersData]);

    const paymentMethodsMap = useMemo(() => {
        if (!paymentMethodsData) return new Map();
        return new Map(paymentMethodsData.map(method => [method.id, method.method]));
    }, [paymentMethodsData]);

    const logs = logData?.logs || [];
    const totalCount = logData?.pagination?.total || 0;

    useEffect(() => {
        refetchLogs();
    }, [page, rowsPerPage, filters, refetchLogs]);

    const actionColors = {
        'CREAR_VENTA': 'success',
        'ABRIR_SESION_CAJA': 'primary',
        'FINALIZAR_CIERRE_CAJA': 'secondary',
        'ACTUALIZAR_STOCK': 'warning',
        'ELIMINAR': 'error',
        'LOGIN': 'info',
        'CAMBIO_PRECIO_MANUAL': 'warning',
        'ALERTA_STOCK_BAJO': 'error'
    };

    const entityTypeLabels = {
        'cash_session': 'Sesión de Caja',
        'stock': 'Stock',
        'user': 'Usuario',
        'purchase': 'Compra',
        'system': 'Sistema',
        'sale_item': 'Ítem de Venta'
    };

    const actionLabels = {
        'CREAR_COMPRA': 'Crear Compra',
        'ABRIR_SESION_CAJA': 'Abrir Caja',
        'INICIO_CIERRE_CAJA': 'Iniciar Cierre de Caja',
        'FINALIZAR_CIERRE_CAJA': 'Finalizar Cierre de Caja',
        'CIERRE_DIRECTO_CAJA_ADMIN': 'Cierre Directo (Admin)',
        'ACTUALIZAR_STOCK': 'Actualizar Stock',
        'ELIMINAR_PRODUCTO': 'Eliminar Producto',
        'ELIMINAR_USUARIO': 'Eliminar Usuario',
        'ELIMINAR_CLIENTE': 'Eliminar Cliente',
        'ELIMINAR_PROMOCION': 'Eliminar Promoción',
        'LOGIN': 'Iniciar Sesión',
        'AUTO_CLOSE_CASH_SESSION': 'Cierre Automático Exitoso',
        'AUTO_CLOSE_ERROR': 'Error en Cierre Automático',
        'IMPORTAR_STOCK': 'Importar Stock',
        'ALERTA_STOCK_BAJO': 'Alerta de Stock Bajo',
        'VENTA_FORZADA_STOCK_NEGATIVO': 'Venta con Stock Negativo',
        'VENTA_PRODUCTO_MANUAL': 'Venta de Producto Manual',
        'CAMBIO_PRECIO_MANUAL': 'Cambio de Precio Manual',
        'ALERTA_SESION_PROLONGADA': 'Alerta de Sesión Prolongada'
    };

    const actionOptions = useMemo(() => {
        const options = Object.entries(actionLabels).map(([value, label]) => ({ value, label }));
        return [{ value: '', label: 'Todas' }, ...options];
    }, [actionLabels]);

    const entityTypeOptions = useMemo(() => {
        const options = Object.entries(entityTypeLabels).map(([value, label]) => ({ value, label }));
        return [{ value: '', label: 'Todas' }, ...options];
    }, [entityTypeLabels]);

    const isPageLoading = isLoading || statsLoading || usersLoading;

    if (isPageLoading) {
        return <AuditLogsSkeleton />;
    }

    const handleClearFilters = () => {
        resetFilters(initialFilterState);
        setPage(0);
    };

    const handleSessionFilter = (sessionId) => {
        setFilters({
            ...initialFilterState,
            session_id: sessionId
        });
        setPage(0);
    };

    const clearSessionFilter = () => {
        handleSessionFilter('');
    };

    const toggleRowExpansion = (logId) => {
        setExpandedRow(expandedRow === logId ? null : logId);
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY HH:mm:ss');
    };

    const columns = [
        { id: 'session', label: 'Sesión' },
        { id: 'createdAt', label: 'Fecha' },
        { id: 'user', label: 'Usuario' },
        { id: 'action', label: 'Acción' },
        { id: 'entity', label: 'Entidad' },
        { id: 'details', label: 'Detalles' },
        { id: 'expand', label: 'Ver Más' },
    ];

    const renderLogRow = (log) => (
        <React.Fragment key={log.id}>
            <StyledTableRow hover>
                <StyledTableCell align="center">
                    {log.session_id && (
                        <Tooltip title={`Filtrar por esta sesión: ...${log.session_id.slice(-8)}`}>
                            <IconButton size="small" onClick={() => handleSessionFilter(log.session_id)}>
                                <LinkIcon color={filters.session_id === log.session_id ? "primary" : "inherit"} />
                            </IconButton>
                        </Tooltip>
                    )}
                </StyledTableCell>
                <StyledTableCell align="center">{formatDate(log.createdAt)}</StyledTableCell>
                <StyledTableCell align="center">
                    {log.usuario?.username || 'N/A'}
                    <br />
                    <Typography variant="caption" color="textSecondary">
                        {log.usuario?.rol?.nombre || 'N/A'}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Chip
                        label={actionLabels[log.action] || log.action}
                        color={actionColors[log.action] || 'default'}
                        size="small"
                    />
                </StyledTableCell>
                <StyledTableCell align="center">
                    {entityTypeLabels[log.entity_type] || log.entity_type}
                    {log.entity_id && (
                        <Typography variant="caption" display="block">ID: {log.entity_id}</Typography>
                    )}
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Typography variant="body2" noWrap sx={{ maxWidth: 250, margin: '0 auto' }}>
                        {log.details || 'N/A'}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Tooltip title="Ver detalles completos">
                        <IconButton size="small" onClick={() => toggleRowExpansion(log.id)}>
                            {expandedRow === log.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Tooltip>
                </StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalles Completos
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormattedLogDetails log={log} usersMap={usersMap} paymentMethodsMap={paymentMethodsMap} />
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Agente de Usuario:
                                    </Typography>
                                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                        {typeof log.user_agent === 'string' ? (log.user_agent || 'N/A') : JSON.stringify(log.user_agent)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Dirección IP:
                                    </Typography>
                                    <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                                        {log.ip_address || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </StyledTableCell>
            </StyledTableRow>
        </React.Fragment>
    );

    return (
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
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                    Logs de Auditoría
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Aquí puedes ver todas las acciones registradas en el sistema.
                </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <StyledCard sx={{ height: '100%' }}>
                        {stats && (
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Acciones Más Frecuentes
                                </Typography>
                                {stats.actionStats?.slice(0, 3).map((stat, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                            {typeof stat.action === 'string' ? (actionLabels[stat.action] || stat.action) : JSON.stringify(stat.action)} :
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {typeof stat.count === 'number' ? stat.count : JSON.stringify(stat.count)}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        )}
                    </StyledCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <StyledCard elevation={2} sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" gutterBottom component="div" color="primary">
                                <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Filtros
                            </Typography>
                            {filters.session_id && (
                                <Tooltip title="Quitar filtro de sesión">
                                    <StyledButton
                                        sx={{ padding: '2px 12px' }}
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<LinkOffIcon />}
                                        onClick={clearSessionFilter}
                                    >
                                        Sesión: ...{filters.session_id.slice(-8)}
                                    </StyledButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2, mt: 2, backgroundColor: theme.palette.background.paper }}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <Grid container spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>

                                    {/* Columna para filtros de Acción y Tipo de Entidad */}
                                    <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={actionOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={actionOptions.find(option => option.value === filters.action) || null}
                                                    onChange={(event, newValue) => handleFilterChange({ target: { name: 'action', value: newValue ? newValue.value : '' } })}
                                                    renderInput={(params) => <TextField {...params} label="Acción" />}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Autocomplete
                                                    fullWidth
                                                    size="small"
                                                    options={entityTypeOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    value={entityTypeOptions.find(option => option.value === filters.entity_type) || null}
                                                    onChange={(event, newValue) => handleFilterChange({ target: { name: 'entity_type', value: newValue ? newValue.value : '' } })}
                                                    renderInput={(params) => <TextField {...params} label="Tipo de Entidad" />}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Columna para filtros de Fecha Inicio y Fecha Fin */}
                                    <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }}>
                                        <Grid container direction="column" spacing={2}>
                                            <Grid item>
                                                <StyledDatePicker
                                                    fullWidth
                                                    size="small"
                                                    label="Fecha Inicio"
                                                    value={filters.start_date ? moment(filters.start_date) : null}
                                                    onChange={(newValue) => setFilters(prev => ({ ...prev, start_date: newValue ? newValue.format('YYYY-MM-DD') : '' }))}
                                                    format="DD/MM/YYYY"
                                                    slotProps={{
                                                        textField: {
                                                            InputProps: {
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <IconButton size='small' onClick={() => setFilters(prev => ({ ...prev, start_date: '' }))}>
                                                                            <ClearIcon fontSize='small' color='error' />
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <StyledDatePicker
                                                    fullWidth
                                                    size="small"
                                                    label="Fecha Fin"
                                                    value={filters.end_date ? moment(filters.end_date) : null}
                                                    onChange={(newValue) => setFilters(prev => ({ ...prev, end_date: newValue ? newValue.format('YYYY-MM-DD') : '' }))}
                                                    format="DD/MM/YYYY"
                                                    slotProps={{
                                                        textField: {
                                                            InputProps: {
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <IconButton size='small' onClick={() => setFilters(prev => ({ ...prev, end_date: '' }))}>
                                                                            <ClearIcon fontSize='small' color='error' />
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Columna para el botón Limpiar Filtros */}
                                    <Grid item sx={{ width: 'clamp(150px, 15%, 200px)' }}>
                                        <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Grid item>
                                                <StyledButton
                                                    sx={{ padding: '2px 12px' }}
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={handleClearFilters}
                                                >
                                                    Limpiar Filtros
                                                </StyledButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </LocalizationProvider>
                        </Box>
                    </StyledCard>
                </Grid>
            </Grid>

            <EnhancedTable
                columns={columns}
                data={logs}
                loading={isLoading}
                count={totalCount}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                renderRow={renderLogRow}
            />
        </Box>
    );
};


export default AuditLogs;