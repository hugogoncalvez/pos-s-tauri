import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Chip,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Clear as ClearIcon,
    Edit as EditIcon,
    Print as PrintIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { StyledTableRow, StyledTableCell } from '../styles/styles';
import { UseFetchQuery } from '../hooks/useQuery';
import { usePermissions } from '../hooks/usePermissions';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Api } from '../api/api';
import { printQuote } from '../functions/printQuote';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarCarga } from '../functions/mostrarCarga';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';
import QuoteFormModal from './QuoteFormModal';
import QuoteDetailsModal from './QuoteDetailsModal';

moment.locale('es');

const formatMoney = (value) => Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatDate = (value) => {
    if (!value) return '';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : String(value);
};

const statusLabel = (status) => ({
    borrador: 'Borrador',
    emitido: 'Emitido',
    vencido: 'Vencido',
    convertido: 'Convertido',
    anulado: 'Anulado',
}[status] || status);

const statusColor = (status) => ({
    borrador: 'warning',
    emitido: 'success',
    vencido: 'error',
    convertido: 'info',
    anulado: 'default',
}[status] || 'default');

const columns = [
    { id: 'quote_number', label: 'N°' },
    { id: 'quote_date', label: 'Fecha' },
    { id: 'customer_name', label: 'Cliente', align: 'left' },
    { id: 'valid_until', label: 'Válido hasta' },
    { id: 'status', label: 'Estado' },
    { id: 'total', label: 'Total' },
    { id: 'actions', label: 'Acciones' },
];

const QuotesManager = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { tienePermiso } = usePermissions();
    const { isOnline } = useOnlineStatus();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [selectedQuote, setSelectedQuote] = useState(null);

    const { data: businessConfig } = UseFetchQuery('businessConfig', '/business-config', true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(searchInput);
            setPage(0);
        }, 450);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const filters = useMemo(() => ({
        search: search.trim(),
        status,
        from: fromDate ? fromDate.format('YYYY-MM-DD') : '',
        to: toDate ? toDate.format('YYYY-MM-DD') : '',
    }), [search, status, fromDate, toDate]);

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', String(page + 1));
        params.set('limit', String(rowsPerPage));
        if (filters.search) params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.from) params.set('from', filters.from);
        if (filters.to) params.set('to', filters.to);
        return params.toString();
    }, [page, rowsPerPage, filters]);

    const { data, isLoading, refetch } = UseFetchQuery(
        ['quotes', queryString],
        `/quotes?${queryString}`,
        true,
        0,
        { keepPreviousData: true }
    );

    const quotes = data?.quotes || [];
    const totalRows = data?.pagination?.total || 0;

    const refreshList = () => {
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
        refetch();
    };

    const fetchQuote = async (id) => {
        const response = await Api.get(`/quotes/${id}`);
        return response.data.quote;
    };

    const openDetails = async (quote) => {
        try {
            mostrarCarga('Cargando presupuesto...', theme);
            const fullQuote = await fetchQuote(quote.id);
            setSelectedQuote(fullQuote);
            setDetailsOpen(true);
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo cargar el presupuesto.', theme);
        } finally {
            Swal.close();
        }
    };

    const openEdit = async (quote) => {
        try {
            mostrarCarga('Cargando presupuesto...', theme);
            const fullQuote = await fetchQuote(quote.id);
            setEditingQuote(fullQuote);
            setFormOpen(true);
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo cargar el presupuesto.', theme);
        } finally {
            Swal.close();
        }
    };

    const handlePrint = async (quote) => {
        if (!tienePermiso('accion_imprimir_presupuesto')) return;
        try {
            mostrarCarga('Preparando impresión...', theme);
            const fullQuote = quote.details ? quote : await fetchQuote(quote.id);
            printQuote({ quote: fullQuote, businessConfig });
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo preparar la impresión.', theme);
        } finally {
            Swal.close();
        }
    };

    const changeStatus = async (quote, targetStatus) => {
        try {
            const response = await Api.put(`/quotes/${quote.id}/status`, { status: targetStatus });
            mostrarExito(
                targetStatus === 'emitido' ? 'Presupuesto emitido correctamente.' : 'Presupuesto anulado correctamente.',
                theme
            );
            refreshList();
            if (response.data?.quote && detailsOpen) {
                setSelectedQuote(response.data.quote);
            }
            if (targetStatus === 'anulado') {
                setDetailsOpen(false);
            }
        } catch (error) {
            mostrarError(error.response?.data?.message || error.message || 'No se pudo actualizar el presupuesto.', theme);
        }
    };

    const handleEmit = (quote) => {
        mostrarConfirmacion(
            {
                title: 'Emitir presupuesto',
                text: `¿Emitir ${quote.quote_number || 'este presupuesto'}? Podrá convertirse en venta.`,
                confirmButtonText: 'Sí, emitir',
            },
            theme,
            () => changeStatus(quote, 'emitido')
        );
    };

    const handleAnular = (quote) => {
        mostrarConfirmacion(
            {
                title: 'Anular presupuesto',
                text: `¿Anular ${quote.quote_number || 'este presupuesto'}? Esta acción no se puede deshacer.`,
                confirmButtonText: 'Sí, anular',
                icon: 'warning',
            },
            theme,
            () => changeStatus(quote, 'anulado')
        );
    };

    const handleConvert = (quote) => {
        if (!isOnline) {
            mostrarError('La conversión a venta requiere conexión a internet.', theme);
            return;
        }
        if (!['emitido', 'vencido'].includes(quote.effective_status || quote.status)) {
            mostrarError('Solo se pueden convertir presupuestos emitidos o vencidos.', theme);
            return;
        }
        sessionStorage.setItem('pendingQuoteConversion', JSON.stringify(quote));
        setDetailsOpen(false);
        navigate('/ventas');
    };

    const handleSaved = () => {
        setFormOpen(false);
        setEditingQuote(null);
        refreshList();
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearch('');
        setStatus('');
        setFromDate(null);
        setToDate(null);
        setPage(0);
    };

    const canCreate = tienePermiso('accion_crear_presupuesto');
    const canEdit = tienePermiso('accion_editar_presupuesto');
    const canAnular = tienePermiso('accion_anular_presupuesto');
    const canPrint = tienePermiso('accion_imprimir_presupuesto');

    const renderRow = (quote) => {
        const effective = quote.effective_status || quote.status;
        const editable = effective === 'borrador' || effective === 'emitido';

        return (
            <StyledTableRow hover key={quote.id}>
                <StyledTableCell>{quote.quote_number || '-'}</StyledTableCell>
                <StyledTableCell>{formatDate(quote.quote_date)}</StyledTableCell>
                <StyledTableCell align="left">{quote.customer_name}</StyledTableCell>
                <StyledTableCell>{formatDate(quote.valid_until)}</StyledTableCell>
                <StyledTableCell>
                    <Chip
                        size="small"
                        label={statusLabel(effective)}
                        color={statusColor(effective)}
                    />
                </StyledTableCell>
                <StyledTableCell>{formatMoney(quote.total)}</StyledTableCell>
                <StyledTableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
                        <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => openDetails(quote)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {canEdit && editable && (
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => openEdit(quote)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canPrint && (
                            <Tooltip title="Imprimir">
                                <IconButton size="small" onClick={() => handlePrint(quote)}>
                                    <PrintIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canEdit && effective === 'borrador' && (
                            <Tooltip title="Emitir">
                                <IconButton size="small" color="success" onClick={() => handleEmit(quote)}>
                                    <CheckCircleIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canAnular && (effective === 'borrador' || effective === 'emitido' || effective === 'vencido') && (
                            <Tooltip title="Anular">
                                <IconButton size="small" color="error" onClick={() => handleAnular(quote)}>
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </StyledTableCell>
            </StyledTableRow>
        );
    };

    return (
        <Box sx={{ p: 1 }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    mt: 2,
                    background: (theme) => theme.palette.background.componentHeaderBackground,
                    color: theme.palette.primary.contrastText,
                }}
            >
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid>
                        <Typography variant="h4" gutterBottom>Presupuestos</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Cree, imprima y convierta presupuestos en ventas
                        </Typography>
                    </Grid>
                    <Grid>
                        {canCreate && (
                            <StyledButton
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setEditingQuote(null);
                                    setFormOpen(true);
                                }}
                            >
                                Nuevo presupuesto
                            </StyledButton>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Filtros</Typography>
                    <StyledButton variant="text" onClick={clearFilters}>Limpiar</StyledButton>
                </Box>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <StyledTextField
                            label="Buscar"
                            size="small"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Número, cliente o documento"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton size="small" onClick={() => setSearchInput('')}>
                                            <ClearIcon color="error" fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <StyledTextField
                            select
                            size="small"
                            label="Estado"
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="borrador">Borrador</MenuItem>
                            <MenuItem value="emitido">Emitido</MenuItem>
                            <MenuItem value="vencido">Vencido</MenuItem>
                            <MenuItem value="convertido">Convertido</MenuItem>
                            <MenuItem value="anulado">Anulado</MenuItem>
                        </StyledTextField>
                        <StyledDatePicker
                            label="Desde"
                            value={fromDate}
                            onChange={(value) => {
                                setFromDate(value);
                                setPage(0);
                            }}
                            format="DD/MM/YYYY"
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <StyledDatePicker
                            label="Hasta"
                            value={toDate}
                            onChange={(value) => {
                                setToDate(value);
                                setPage(0);
                            }}
                            format="DD/MM/YYYY"
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </Box>
                </LocalizationProvider>
            </StyledCard>

            <EnhancedTable
                columns={columns}
                data={quotes}
                loading={isLoading}
                count={totalRows}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(Number.parseInt(event.target.value, 10));
                    setPage(0);
                }}
                renderRow={renderRow}
            />

            <QuoteFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingQuote(null);
                }}
                quote={editingQuote}
                onSaved={handleSaved}
            />

            <QuoteDetailsModal
                open={detailsOpen}
                quote={selectedQuote}
                onClose={() => setDetailsOpen(false)}
                onPrint={handlePrint}
                onConvert={handleConvert}
                onAnular={handleAnular}
            />
        </Box>
    );
};

export default QuotesManager;
