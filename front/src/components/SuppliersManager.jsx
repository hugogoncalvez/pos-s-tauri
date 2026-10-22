import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tooltip,
    IconButton,
    Chip,
    MenuItem,
    Stack,
    Grid,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BlockIcon from '@mui/icons-material/Block';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTheme } from '@mui/material/styles';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { TextFieldWithClear } from '../styledComponents/ui/TextFieldWithClear';
import { SupplierFormModal } from '../styledComponents/SupplierFormModal';
import { SupplierAccountModal } from '../styledComponents/SupplierAccountModal';
import { SupplierOrdersModal } from '../styledComponents/SupplierOrdersModal';
import { usePermissions } from '../hooks/usePermissions';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { confirmAction } from '../functions/ConfirmDelete';
import { mostrarExito } from '../functions/mostrarExito';
import { StyledTableCell, StyledTableRow } from '../styles/styles';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const columns = [
    { id: 'nombre', label: 'Proveedor', align: 'left' },
    { id: 'cuit', label: 'CUIT' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'purchases_total', label: 'Compras' },
    { id: 'payments_total', label: 'Pagos' },
    { id: 'balance', label: 'Saldo' },
    { id: 'activo', label: 'Estado' },
    { id: 'actions', label: 'Acciones' }
];

export const SuppliersManager = () => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [activoFilter, setActivoFilter] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [accountSupplier, setAccountSupplier] = useState(null);
    const [ordersSupplier, setOrdersSupplier] = useState(null);

    const { mutateAsync: deactivateSupplier } = useSubmit('deactivateSupplier');
    const canViewReports = tienePermiso('ver_informes_proveedor');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 450);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const queryUrl = useMemo(() => {
        const params = new URLSearchParams({
            page: String(page + 1),
            limit: String(rowsPerPage)
        });
        if (search) params.set('search', search);
        if (activoFilter !== '') params.set('activo', activoFilter);
        return `/suppliers?${params.toString()}`;
    }, [page, rowsPerPage, search, activoFilter]);

    const { data, isLoading, refetch } = UseFetchQuery(
        ['suppliers', page, rowsPerPage, search, activoFilter],
        queryUrl,
        true,
        0
    );

    const { data: reportData, refetch: refetchReport } = UseFetchQuery(
        ['suppliersReport'],
        '/suppliers/reports/summary',
        canViewReports,
        0
    );

    const rows = data?.rows || [];
    const total = data?.pagination?.total || 0;
    const totals = reportData?.totals || {};

    const refreshAll = async () => {
        await refetch();
        if (canViewReports) await refetchReport();
    };

    const handleCreate = () => {
        setSelectedSupplier(null);
        setFormOpen(true);
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setFormOpen(true);
    };

    const handleDeactivate = (supplier) => {
        confirmAction(async () => {
            try {
                await deactivateSupplier({
                    url: `/suppliers/${supplier.id}`,
                    method: 'delete',
                    values: {},
                    showSuccessAlert: false
                });
                mostrarExito('Proveedor desactivado correctamente.', theme);
                await refreshAll();
            } catch {
                return;
            }
        }, () => {}, `¿Desactivar a ${supplier.nombre}?`, theme);
    };

    const handleChangePage = (_event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const renderRow = (supplier) => (
        <StyledTableRow hover key={supplier.id}>
            <StyledTableCell align="left" sx={{ py: '6px', fontWeight: 600 }}>
                {supplier.nombre}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px' }}>{supplier.cuit || '-'}</StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px' }}>{supplier.telefono || '-'}</StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px' }}>{formatCurrency(supplier.purchases_total)}</StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px' }}>{formatCurrency(supplier.payments_total)}</StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px', color: Number(supplier.balance) > 0 ? theme.palette.error.main : theme.palette.success.main, fontWeight: 600 }}>
                {formatCurrency(supplier.balance)}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '6px' }}>
                <Chip size="small" color={supplier.activo ? 'success' : 'default'} label={supplier.activo ? 'Activo' : 'Inactivo'} />
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ py: '4px' }}>
                <Stack direction="row" spacing={0.5} justifyContent="center">
                    {tienePermiso('ver_pedidos_proveedor') && (
                        <Tooltip title="Pedidos al proveedor">
                            <IconButton size="small" color="secondary" onClick={() => setOrdersSupplier(supplier)}>
                                <AssignmentIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso('ver_cuenta_proveedor') && (
                        <Tooltip title="Cuenta corriente">
                            <IconButton size="small" color="primary" onClick={() => setAccountSupplier(supplier)}>
                                <AccountBalanceWalletIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tienePermiso('accion_editar_proveedor') && (
                        <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEdit(supplier)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {supplier.activo && tienePermiso('accion_desactivar_proveedor') && (
                        <Tooltip title="Desactivar">
                            <IconButton size="small" color="error" onClick={() => handleDeactivate(supplier)}>
                                <BlockIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </StyledTableCell>
        </StyledTableRow>
    );

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Proveedores</Typography>
                    <Typography variant="body2" color="text.secondary">Maestro, compras y cuenta corriente</Typography>
                </Box>
                {tienePermiso('accion_crear_proveedor') && (
                    <StyledButton variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                        Nuevo proveedor
                    </StyledButton>
                )}
            </Box>

            {canViewReports && (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">Proveedores</Typography>
                            <Typography variant="h6">{totals.suppliers || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">Activos</Typography>
                            <Typography variant="h6">{totals.active || 0}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">Compras</Typography>
                            <Typography variant="h6">{formatCurrency(totals.purchases_total)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">Saldo</Typography>
                            <Typography variant="h6" color={Number(totals.balance) > 0 ? 'error.main' : 'success.main'}>
                                {formatCurrency(totals.balance)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextFieldWithClear
                        name="search"
                        label="Buscar por nombre, CUIT o teléfono"
                        size="small"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onClear={() => setSearchInput('')}
                        sx={{ minWidth: { xs: '100%', sm: 320 } }}
                    />
                    <TextFieldWithClear
                        select
                        name="activo"
                        label="Estado"
                        size="small"
                        value={activoFilter}
                        onChange={(event) => {
                            setActivoFilter(event.target.value);
                            setPage(0);
                        }}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Activos</MenuItem>
                        <MenuItem value="false">Inactivos</MenuItem>
                    </TextFieldWithClear>
                    {isLoading && <CircularProgress size={22} />}
                </Box>
            </Paper>

            <EnhancedTable
                columns={columns}
                data={rows}
                loading={isLoading}
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                renderRow={renderRow}
            />

            <SupplierFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                supplier={selectedSupplier}
                onSaved={refreshAll}
            />

            <SupplierAccountModal
                open={Boolean(accountSupplier)}
                onClose={() => setAccountSupplier(null)}
                supplier={accountSupplier}
                onChanged={refreshAll}
            />

            <SupplierOrdersModal
                open={Boolean(ordersSupplier)}
                onClose={() => setOrdersSupplier(null)}
                supplier={ordersSupplier}
                onChanged={refreshAll}
            />
        </Box>
    );
};
