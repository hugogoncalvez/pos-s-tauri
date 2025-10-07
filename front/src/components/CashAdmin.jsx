import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    Autocomplete,
    Box,
    Paper,
    Typography,
    CardContent,
    CardActions,
    Chip,
    Alert,
    IconButton,
    Tooltip,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import {
    AccountBalanceWallet as CashIcon,
    History as HistoryIcon,
    Assessment as ReportIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    Print as PrintIcon,
    Person as PersonIcon,
    Clear as ClearIcon,
    KeyboardArrowDown
} from '@mui/icons-material';
import moment from 'moment';
import 'moment/locale/es';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useSubmit } from '../hooks/useSubmit';
import { UseFetchQuery } from '../hooks/useQuery';
import { useForm } from '../hooks/useForm';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarInfo } from '../functions/mostrarInfo';
import { mostrarError } from '../functions/MostrarError';
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';

import CloseCashSessionDialog from '../styledComponents/CloseCashSessionDialog';
import FinalizeClosureDialog from '../styledComponents/FinalizeClosureDialog';
import CashMovementModal from '../styledComponents/CashMovementModal';
import { printCashSessionReport } from '../functions/printCashSessionReport';
import { useTheme } from '@mui/material/styles';
import { Api } from '../api/api';
import CashAdminSkeleton from '../styledComponents/skeletons/CashAdminSkeleton';

const CashAdmin = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const [activeSessions, setActiveSessions] = useState([]);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [error, setError] = useState('');
    const [users, setUsers] = useState({});

    const tableContainerRef = useRef(null);
    const [justFiltered, setJustFiltered] = useState(false);

    // Estados para la visibilidad de secciones y modales
    const [openFilterSection, setOpenFilterSection] = useState(false);

    // Estados para controlar la carga de datos bajo demanda
    const [viewingSessionId, setViewingSessionId] = useState(null);
    const [finalizingSessionId, setFinalizingSessionId] = useState(null);

    // Hooks de mutación
    const { mutateAsync: saveMovement, isLoading: isSavingMovement } = useSubmit();
    const { mutateAsync: initiateClosure, isLoading: isInitiatingClosure } = useSubmit();
    const { mutateAsync: finalizeClosure, isLoading: isFinalizing } = useSubmit();
    const { mutateAsync: directClose } = useSubmit();

    // Estados para filtros
    const [filters, handleFilterChange, resetFilters] = useForm({
        userId: null,
        status: '',
        startDate: '',
        endDate: '',
        finalDiscrepancy: ''
    });

    // Estados para la paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalRows, setTotalRows] = useState(0);

    const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
    const [sessionToFinalize, setSessionToFinalize] = useState(null);
    const [cashMovementModalOpen, setCashMovementModalOpen] = useState(false);

    const { usuario, isLoading: authLoading } = useContext(AuthContext);

    const statusOptions = [
        { value: '', label: 'Todos' },
        { value: 'cerrada', label: 'Cerrada' },
        { value: 'pendiente_cierre', label: 'Pendiente Cierre' },
        { value: 'abierta', label: 'Abierta' }
    ];

    useEffect(() => {
        moment.locale('es');
    }, []);

    // --- QUERIES ---
    const { data: usersData, isLoading: usersLoading, error: usersError } = UseFetchQuery(
        ['users'], '/users', !authLoading && tienePermiso('ver_usuarios')
    );

    const { data: cashSessions, isLoading: cashSessionsLoading, error: cashSessionsError, refetch: refetchCashSessions } = UseFetchQuery('cashSessions', '/cash-sessions/history?status=abierta,pendiente_cierre');

    const historyParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filters.userId && { user_id: filters.userId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
        ...(filters.finalDiscrepancy && { final_discrepancy: filters.finalDiscrepancy })
    }).toString();
    const { data: historyData, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = UseFetchQuery(
        ['sessionHistoryAdmin', historyParams],
        `/cash-sessions/history?${historyParams}`,
        !authLoading
    );

    const { data: detailsData, isLoading: isFetchingDetails, error: detailsError } = UseFetchQuery(
        ['sessionDetails', viewingSessionId],
        `/cash-sessions/${viewingSessionId}/summary`,
        !!viewingSessionId
    );

    const { data: finalizeData, isLoading: isFetchingFinalize, error: finalizeError } = UseFetchQuery(
        ['sessionToFinalize', finalizingSessionId],
        `/cash-sessions/${finalizingSessionId}/summary`,
        !!finalizingSessionId
    );

    // --- EFECTOS PARA PROCESAR DATOS DE QUERIES ---
    useEffect(() => {
        if (usersData) {
            const userMap = usersData.reduce((acc, user) => { acc[user.id] = user.username; return acc; }, {});
            setUsers(userMap);
        }
    }, [usersData]);

    useEffect(() => {
        const processSessions = async () => {
            if (cashSessions && cashSessions.sessions) {
                const sessions = cashSessions.sessions;
                const detailedSessions = await Promise.all(sessions.map(async (session) => {
                    if (session.status === 'abierta') {
                        try {
                            const { data: summaryData } = await Api.get(`/cash-sessions/${session.id}/summary`);
                            const cashSales = summaryData.payment_methods?.Efectivo || 0;
                            const totalIncome = summaryData.totalIncome || 0;
                            const totalExpense = summaryData.totalExpense || 0;
                            const current_cash = parseFloat(session.opening_amount) + cashSales + totalIncome - totalExpense;
                            return { ...session, current_cash };
                        } catch (error) {
                            console.error(`Error fetching summary for session ${session.id}:`, error);
                            return { ...session, current_cash: parseFloat(session.opening_amount) }; // Fallback
                        }
                    } else if (session.status === 'pendiente_cierre') {
                        return { ...session, current_cash: parseFloat(session.cashier_declared_amount || 0) };
                    }
                    return session;
                }));
                setActiveSessions(detailedSessions);
            } else {
                setActiveSessions([]);
            }
        };
        processSessions();
    }, [cashSessions]);

    useEffect(() => {
        if (historyData) {
            setSessionHistory(historyData.sessions || []);
            if (historyData?.pagination?.total !== undefined) {
                setTotalRows(historyData.pagination.total);
            } else {
                setTotalRows(0); // Ensure totalRows is always a number
            }
        } else {
            setSessionHistory([]);
            setTotalRows(0);
        }
    }, [historyData]);

    useEffect(() => {
        if (detailsData) {
            setSessionDetails(detailsData);
            setDetailsDialogOpen(true);
        }
    }, [detailsData]);

    useEffect(() => {
        if (finalizeData) {
            setSessionToFinalize(finalizeData);
            setFinalizeDialogOpen(true);
        }
    }, [finalizeData]);

    useEffect(() => {
        const anyError = usersError || cashSessionsError || historyError || detailsError || finalizeError;
        if (anyError) {
            const errorMessage = anyError.response?.data?.message || anyError.message || 'Ocurrió un error inesperado';
            setError(errorMessage);
        }
    }, [usersError, cashSessionsError, historyError, detailsError, finalizeError]);

    useEffect(() => {
        if (justFiltered && !historyLoading && tableContainerRef.current) {
            setTimeout(() => {
                const y = tableContainerRef.current.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({ top: y, behavior: 'smooth' });
                setJustFiltered(false);
            }, 100);
        }
    }, [historyLoading, justFiltered]);


    // --- HANDLERS DE MUTACIONES ---
    const handleInitiateClosure = async (declaredAmount, notes, onSuccess) => {
        if (!selectedSession) return mostrarError('No hay una sesión seleccionada.', theme);

        const isPrivilegedUser = usuario.rol_nombre === 'Administrador' || usuario.rol_nombre === 'Gerente';

        mostrarCarga('Procesando cierre...', theme);

        try {
            // Si el usuario es admin/gerente, realiza un cierre directo.
            if (isPrivilegedUser) {
                await directClose({
                    url: `/cash-sessions/${selectedSession.id}/direct-close-admin`,
                    values: {
                        declared_amount: parseFloat(declaredAmount),
                        notes: notes.trim()
                    }
                });
                Swal.close();
                await mostrarExito('La caja ha sido cerrada definitivamente.', theme);
            } else {
                // Proceso estándar para cajeros.
                await initiateClosure({
                    url: `/cash-sessions/${selectedSession.id}/initiate-close`,
                    values: {
                        cashier_declared_amount: parseFloat(declaredAmount),
                        notes: notes.trim()
                    }
                });
                Swal.close();
                await mostrarInfo('La caja ha sido enviada para revisión.', theme);
            }

            setCloseDialogOpen(false);
            setSelectedSession(null);
            refetchCashSessions();
            refetchHistory();
            if (onSuccess) onSuccess();

        } catch (err) {
            Swal.close();
            mostrarError(err.response?.data?.message || 'Error al procesar el cierre.', theme);
        }
    };

    const handleFinalizeClosure = async (sessionId, adminAmount, adminNotes) => {
        mostrarCarga('Finalizando cierre...', theme);
        try {
            await finalizeClosure({ url: `/cash-sessions/${sessionId}/finalize-close`, values: { admin_verified_amount: parseFloat(adminAmount), admin_notes: adminNotes.trim() } });
            Swal.close();
            await mostrarExito('La sesión ha sido cerrada y verificada definitivamente.', theme);
            setFinalizeDialogOpen(false);
            setFinalizingSessionId(null); // Limpiar ID
            refetchCashSessions();
            refetchHistory();
        } catch (err) {
            Swal.close();
            mostrarError(err.response?.data?.message || 'Error al finalizar el cierre.', theme);
        }
    };

    const handleSaveMovement = async (movementData) => {
        try {
            await saveMovement({ url: '/cash-sessions/movement', values: movementData });
            await mostrarExito('El movimiento se ha registrado correctamente.', theme);
            setCashMovementModalOpen(false);
            refetchCashSessions();
            refetchHistory();
        } catch (err) {
            mostrarError(err.response?.data?.message || 'Error al registrar el movimiento.', theme);
        }
    };

    // --- HANDLERS DE UI ---
    const openCloseDialog = (session) => {
        setSelectedSession(session);
        setCloseDialogOpen(true);
    };

    const handleViewDetails = (session) => setViewingSessionId(session.id);
    const openFinalizeDialog = (session) => setFinalizingSessionId(session.id);

    // --- HELPERS Y FORMATTERS ---
    const formatCurrency = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount || 0);
    const formatDate = (dateString) => moment(dateString).format('DD/MM/YYYY HH:mm');
    const calculateSessionDuration = (openedAt, closedAt = null) => {
        const start = moment(openedAt);
        const end = closedAt ? moment(closedAt) : moment();
        const duration = end.diff(start, 'hours', true);
        return duration > 0 ? duration.toFixed(1) : '0.0';
    };
    const getDiscrepancyColor = (value) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue === 0) return 'text.secondary';
        return numericValue > 0 ? 'success.main' : 'error.main';
    };
    const getUserName = (session) => {
        const user = session?.usuario;
        if (user?.username && user?.rol?.nombre) {
            return `${user.username} (${user.rol.nombre})`;
        }
        return users[session.user_id] || `Usuario ${session.user_id}`;
    };

    const isLoading = authLoading || usersLoading || cashSessionsLoading || historyLoading;

    if (isLoading) {
        return <CashAdminSkeleton />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2, background: (theme) => theme.palette.background.componentHeaderBackground, color: theme.palette.primary.contrastText }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography variant="h4" gutterBottom>Administración de Cajas</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Vista completa de todas las sesiones de caja</Typography>
                    </Grid>
                    <Grid>
                        <StyledButton variant="outlined" onClick={() => setCashMovementModalOpen(true)} size="small" startIcon={<CashIcon />} sx={{ mr: 1, padding: '2px 12px' }} disabled={activeSessions.length === 0}>
                            Registrar Movimiento
                        </StyledButton>
                        <StyledButton variant="outlined" onClick={() => navigate('/mi-caja')} size="small" startIcon={<PersonIcon />} sx={{ padding: '2px 12px' }}>
                            Mi Caja
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
                <Grid xs={12} sm={4}>
                    <StyledCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <CashIcon color="primary" sx={{ mr: 1.5, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }} />
                                <Typography variant="h6" color="text.secondary">Sesiones Activas</Typography>
                            </Box>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {activeSessions.length}
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid xs={12} sm={4}>
                    <StyledCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <ReportIcon color="success" sx={{ mr: 1.5, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }} />
                                <Typography variant="h6" color="text.secondary">Monto en Cajas</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {formatCurrency(
                                    activeSessions && activeSessions.length > 0 ? activeSessions.reduce((sum, session) => {
                                        if (session.status === 'abierta') {
                                            return sum + parseFloat(session.current_cash || session.opening_amount || 0);
                                        } else if (session.status === 'pendiente_cierre') {
                                            return sum + parseFloat(session.cashier_declared_amount || 0);
                                        }
                                        return sum;
                                    }, 0) : 0
                                )}
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid xs={12} sm={4}>
                    <StyledCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <HistoryIcon color="info" sx={{ mr: 1.5, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }} />
                                <Typography variant="h6" color="text.secondary">Sesiones Hoy</Typography>
                            </Box>
                            <Typography variant="h4" color="info.main" fontWeight="bold">
                                {sessionHistory && sessionHistory.length > 0 ? sessionHistory.filter(session => moment(session.opened_at).isSame(moment(), 'day')).length : 0}
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Sesiones de Caja Activas</Typography>
                {activeSessions.length === 0 ? (
                    <Typography color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>No hay sesiones de caja activas</Typography>
                ) : (
                    <Grid container spacing={1} justifyContent="center">
                        {activeSessions.map((session) => (
                            <Grid xs={6} sm={6} md={4} lg={3} key={session.id}>
                                <StyledCard variant="outlined">
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography variant="h6" color={theme.palette.text.titlePrimary}>{getUserName(session)}</Typography>
                                            <Chip label={session.status.replace('_', ' ')} color={session.status === 'abierta' ? 'success' : 'warning'} size="small" sx={{ textTransform: 'capitalize' }} />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">Apertura: {formatDate(session.opened_at)}</Typography>
                                        <Typography variant="body2" color="textSecondary">Duración: {calculateSessionDuration(session.opened_at)} horas</Typography>
                                        <Typography variant="body1" sx={{ mt: 1.5, fontWeight: 'bold' }}>Monto inicial: {formatCurrency(session.opening_amount)}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ p: 1.5, justifyContent: 'flex-end' }}>
                                        {session.status === 'abierta' && (tienePermiso('ver_cajas_admin') || session.user_id === usuario?.id) && (
                                            <StyledButton size="small" color="error" onClick={() => openCloseDialog(session)} startIcon={<CloseIcon />} sx={{ padding: '2px 12px' }}>Cerrar Caja</StyledButton>
                                        )}
                                        {session.status === 'pendiente_cierre' && tienePermiso('ver_cajas_admin') && (
                                            <StyledButton size="small" variant="contained" color="secondary" onClick={() => openFinalizeDialog(session)}>Revisar y Cerrar</StyledButton>
                                        )}
                                        <Tooltip title="Ver detalles">
                                            <IconButton size="small" onClick={() => handleViewDetails(session)}><ViewIcon /></IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>

            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">Filtros de Historial</Typography>
                    <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                        <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                    </IconButton>
                </Grid>
                <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        {/* Columna para filtros de Usuario, Estado y Diferencia Final */}
                        <Grid sx={{ width: 'clamp(280px, 30%, 350px)', padding: 2 }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid>
                                    <StyledAutocomplete
                                        options={Array.isArray(usersData) ? usersData : []}
                                        getOptionLabel={(option) => option.username || ''}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(event, value) => {
                                            handleFilterChange({ target: { name: 'userId', value: value ? value.id : null } });
                                            setPage(0);
                                            setJustFiltered(true);
                                        }}
                                        value={usersData?.find(u => u.id === filters.userId) || null}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Usuario"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton size='small' onClick={() => {
                                                                handleFilterChange({ target: { name: 'userId', value: null } });
                                                                setPage(0);
                                                                setJustFiltered(true);
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
                                <Grid>
                                    <Autocomplete
                                        options={statusOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={statusOptions.find(o => o.value === filters.status) || null}
                                        onChange={(event, newValue) => {
                                            handleFilterChange({ target: { name: 'status', value: newValue ? newValue.value : '' } });
                                            setPage(0);
                                            setJustFiltered(true);
                                        }}
                                        isOptionEqualToValue={(option, value) => option.value === value.value}
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Estado"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid>
                                    <Autocomplete
                                        options={[{ value: '', label: 'Todos' }, { value: 'positiva', label: 'Positiva' }, { value: 'negativa', label: 'Negativa' }, { value: 'nula', label: 'Nula (0.00)' }]}
                                        getOptionLabel={(option) => option.label}
                                        value={[{ value: '', label: 'Todos' }, { value: 'positiva', label: 'Positiva' }, { value: 'negativa', label: 'Negativa' }, { value: 'nula', label: 'Nula (0.00)' }].find(o => o.value === filters.finalDiscrepancy) || null}
                                        onChange={(event, newValue) => {
                                            handleFilterChange({ target: { name: 'finalDiscrepancy', value: newValue ? newValue.value : '' } });
                                            setPage(0);
                                            setJustFiltered(true);
                                        }}
                                        isOptionEqualToValue={(option, value) => option.value === value.value}
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Diferencia Final"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Columna para filtros de Fecha Desde y Fecha Hasta */}
                        <Grid sx={{ width: 'clamp(280px, 30%, 350px)' }}>
                            <Grid container direction="column" spacing={2}>
                                <Grid>
                                    <StyledTextField
                                        label="Fecha Desde"
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate || ''}
                                        onChange={(e) => { handleFilterChange(e); setPage(0); setJustFiltered(true); }}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => { handleFilterChange({ target: { name: 'startDate', value: '' } }); setPage(0); setJustFiltered(true); }}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid>
                                    <StyledTextField
                                        label="Fecha Hasta"
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate || ''}
                                        onChange={(e) => { handleFilterChange(e); setPage(0); setJustFiltered(true); }}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton size='small' onClick={() => { handleFilterChange({ target: { name: 'endDate', value: '' } }); setPage(0); setJustFiltered(true); }}>
                                                        <ClearIcon fontSize='small' color='error' />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Columna para el botón Limpiar */}
                        <Grid sx={{ width: 'clamp(180px, 15%, 200px)' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Grid>
                                    <StyledButton variant="outlined" color="secondary" onClick={() => {
                                        resetFilters();
                                        setPage(0);
                                        setJustFiltered(true);
                                    }} sx={{ padding: '2px 12px' }}>Limpiar</StyledButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </StyledCard>

            <StyledCard sx={{ p: 2, mb: 3 }} ref={tableContainerRef}>
                <Typography variant="h6" gutterBottom color={theme.palette.text.titlePrimary}>Historial Reciente</Typography>
                <EnhancedTable
                    columns={[
                        { id: 'user', label: 'Usuario', valueGetter: ({ row }) => getUserName(row) },
                        { id: 'opened_at', label: 'Apertura', valueGetter: ({ row }) => formatDate(row.opened_at) },
                        { id: 'closed_at', label: 'Cierre', valueGetter: ({ row }) => row.verified_at ? formatDate(row.verified_at) : '-' },
                        { id: 'opening_amount', label: 'Monto Inicial', valueGetter: ({ row }) => formatCurrency(row.opening_amount) },
                        { id: 'total_sales_at_close', label: 'Ventas (Cierre)', valueGetter: ({ row }) => formatCurrency(row.total_sales_at_close || 0) },
                        { id: 'preliminary_discrepancy', label: 'Dif. Preliminar', valueGetter: ({ row }) => formatCurrency(row.preliminary_discrepancy), cellStyle: (row) => ({ color: getDiscrepancyColor(row.preliminary_discrepancy) }) },
                        { id: 'final_discrepancy', label: 'Dif. Final', valueGetter: ({ row }) => formatCurrency(row.final_discrepancy), cellStyle: (row) => ({ color: getDiscrepancyColor(row.final_discrepancy) }) },
                        { id: 'status', label: 'Estado', valueGetter: ({ row }) => <Chip label={row.status.replace('_', ' ')} color={row.status === 'cerrada' ? 'default' : row.status === 'pendiente_cierre' ? 'warning' : 'success'} size="small" sx={{ textTransform: 'capitalize' }} /> },
                        {
                            id: 'actions', label: 'Acciones', valueGetter: ({ row }) => (
                                <>
                                    <Tooltip title="Ver Detalles">
                                        <IconButton size="small" onClick={() => handleViewDetails(row)}><ViewIcon /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Imprimir reporte"><IconButton size="small" onClick={() => printCashSessionReport(row, { formatCurrency, formatDate, getUserName })}><PrintIcon /></IconButton></Tooltip>
                                    {row.status === 'pendiente_cierre' && tienePermiso('ver_cajas_admin') && (
                                        <Tooltip title="Revisar y Finalizar Cierre"><StyledButton size="small" variant="contained" color="secondary" onClick={() => openFinalizeDialog(row)} sx={{ ml: 1 }}>Revisar</StyledButton></Tooltip>
                                    )}
                                </>
                            )
                        },
                    ]}
                    data={sessionHistory}
                    loading={isLoading}
                    count={totalRows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                />
            </StyledCard>

            <CloseCashSessionDialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} selectedSession={selectedSession} handleInitiateClosure={handleInitiateClosure} getUserName={getUserName} isLoading={isInitiatingClosure} />
            <FinalizeClosureDialog open={finalizeDialogOpen} onClose={() => { setFinalizeDialogOpen(false); setFinalizingSessionId(null); }} sessionData={sessionToFinalize} handleFinalizeClosure={handleFinalizeClosure} isLoading={isFetchingFinalize || isFinalizing} />
            {detailsDialogOpen && (
                <StyledDialog open={detailsDialogOpen} onClose={() => { setDetailsDialogOpen(false); setViewingSessionId(null); }} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                        <Box mb={-2}>
                            Detalles de Sesión de Caja
                            {sessionDetails && (
                                <Typography variant="subtitle2" color="textSecondary" component="div">
                                    Usuario: {getUserName(sessionDetails)}
                                </Typography>
                            )}
                        </Box>
                        <IconButton onClick={() => { setDetailsDialogOpen(false); setViewingSessionId(null); }}>
                            <CloseIcon color="error" />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
                        {isFetchingDetails ? (
                            <Typography sx={{ p: 3, textAlign: 'center' }}>Cargando detalles...</Typography>
                        ) : sessionDetails && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={1}>
                                    <Grid xs={12} md>
                                        <Typography textAlign={'center'} variant="h6" gutterBottom>Información General</Typography>
                                        <Box mb={1}><Typography variant="body2" color="textSecondary">Apertura:</Typography><Typography variant="body1">{formatDate(sessionDetails.opened_at)}</Typography></Box>
                                        <Box mb={1}><Typography variant="body2" color="textSecondary">Cierre:</Typography><Typography variant="body1">{sessionDetails.verified_at ? formatDate(sessionDetails.verified_at) : 'Sesión Activa'}</Typography></Box>
                                        <Box mb={1}><Typography variant="body2" color="textSecondary">Duración:</Typography><Typography variant="body1">{calculateSessionDuration(sessionDetails.opened_at, sessionDetails.closed_at)}</Typography></Box>
                                    </Grid>
                                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                                    <Grid xs={12} md>
                                        <Typography textAlign={'center'} variant="h6" gutterBottom>Resumen Financiero</Typography>
                                        <Box ml={2} mb={1}><Typography variant="body2" color="textSecondary">Monto Apertura:</Typography><Typography variant="h6" color="primary">{formatCurrency(sessionDetails.opening_amount)}</Typography></Box>
                                        <Box ml={2} mb={1}><Typography variant="body2" color="textSecondary">Total Ventas:</Typography><Typography variant="h6" color="success.main">{formatCurrency(sessionDetails.total_sales || 0)}</Typography></Box>
                                        {sessionDetails.payment_methods && Object.entries(sessionDetails.payment_methods).map(([method, amount]) => (
                                            <Box key={method} sx={{ mb: 0.5, pl: 2 }}>
                                                <Typography variant="body2" color="textSecondary" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{method}:</span>
                                                    <span>{formatCurrency(amount)}</span>
                                                </Typography>
                                            </Box>
                                        ))}
                                        {sessionDetails.closing_amount && <Box mb={1}><Typography variant="body2" color="textSecondary">Monto Cierre:</Typography><Typography variant="h6" color="info.main">{formatCurrency(sessionDetails.closing_amount)}</Typography></Box>}
                                    </Grid>
                                    <Grid xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                    </Grid>
                                    <Grid xs={12}>
                                        <Typography variant="h6" gutterBottom sx={{ mt: 0 }}>Movimientos de Caja</Typography>
                                        {sessionDetails.movements && sessionDetails.movements.length > 0 ? (
                                            <TableContainer component={Paper} sx={{ background: 'transparent', border: `1px solid ${theme.palette.divider}` }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Tipo</TableCell>
                                                            <TableCell>Monto</TableCell>
                                                            <TableCell>Descripción</TableCell>
                                                            <TableCell>Fecha</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {sessionDetails.movements.map((movement, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={movement.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                                                        color={movement.type === 'ingreso' ? 'success' : 'error'}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>{formatCurrency(movement.amount)}</TableCell>
                                                                <TableCell>{movement.description}</TableCell>
                                                                <TableCell>{formatDate(movement.createdAt)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No hay movimientos registrados.</Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ backgroundColor: 'background.dialog' }}>
                        <StyledButton sx={{ padding: '2px 12px' }} color='secondary' variant="outlined" onClick={() => { setDetailsDialogOpen(false); setViewingSessionId(null); }}>
                            Cerrar
                        </StyledButton>
                        {sessionDetails && (
                            <StyledButton
                                onClick={() => printCashSessionReport(sessionDetails, { formatCurrency, formatDate, getUserName })}
                                variant="contained"
                                startIcon={<PrintIcon />}
                            >
                                Imprimir Reporte
                            </StyledButton>
                        )}
                    </DialogActions>
                </StyledDialog>
            )}
            <CashMovementModal open={cashMovementModalOpen} onClose={() => setCashMovementModalOpen(false)} onSave={handleSaveMovement} activeSessionId={activeSessions.length > 0 ? activeSessions[0].id : null} userName={activeSessions.length > 0 ? getUserName(activeSessions[0]) : ''} isSaving={isSavingMovement} theme={theme} />
        </Box>
    );
};

export default CashAdmin;