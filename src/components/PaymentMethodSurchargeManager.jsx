import React, { useState, useMemo, useEffect } from 'react';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { Update } from '../hooks/useUpdate';
import { useDelete } from '../hooks/useDelete';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    IconButton,
    Alert,
    Grid,
    useMediaQuery,
    Tooltip,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTheme } from '@mui/material/styles';
import EditSurchargeModal from '../styledComponents/EditSurchargeModal';
import PaymentMethodModal from '../styledComponents/PaymentMethodModal';
import AddIcon from '@mui/icons-material/Add';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import PaymentMethodSurchargeManagerSkeleton from '../styledComponents/skeletons/PaymentMethodSurchargeManagerSkeleton';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import { confirmAction } from '../functions/ConfirmDelete';

const PaymentMethodSurchargeManager = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { data: paymentMethods, isLoading, error, refetch } = UseFetchQuery(['payments'], '/payment');
    const [surchargeModalOpen, setSurchargeModalOpen] = useState(false);
    const [newMethodModalOpen, setNewMethodModalOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    const mutation = Update();
    const { mutateAsync: createMethod, isLoading: isCreating } = useSubmit();
    const { mutateAsync: deleteMethod, isLoading: isDeleting } = useDelete();

    const isSystemMethod = (methodName) => {
        if (!methodName) return false;
        const systemMethods = ['efectivo', 'mixto', 'credito'];
        return systemMethods.includes(methodName.toLowerCase());
    };

    const handleOpenSurchargeModal = (method) => {
        setSelectedMethod(method);
        setSurchargeModalOpen(true);
    };

    const handleCloseSurchargeModal = () => {
        setSurchargeModalOpen(false);
        setSelectedMethod(null);
    };

    const handleOpenEditModal = (method) => {
        setSelectedMethod(method);
        setNewMethodModalOpen(true);
    };

    useEffect(() => {
        if (!newMethodModalOpen) {
            setSelectedMethod(null);
        }
    }, [newMethodModalOpen]);

    const onToggle = async (method) => {
        await mutation.mutateAsync({
            url: `/payments/${method.id}/surcharge`,
            datos: {
                surcharge_active: !method.surcharge_active,
                surcharge_percentage: method.surcharge_percentage
            }
        }, { onSuccess: () => refetch() });
    };

    const onSaveSurcharge = async (values) => {
        await mutation.mutateAsync({
            url: `/payments/${values.id}/surcharge`,
            datos: values
        }, { onSuccess: () => { refetch(); handleCloseSurchargeModal(); } });
    };

    const handleSaveMethod = async (values) => {
        const isEditing = !!values.id;
        if (isEditing) {
            await mutation.mutateAsync({
                url: `/payment/${values.id}`,
                datos: values
            }, { onSuccess: () => { refetch(); setNewMethodModalOpen(false); } });
        } else {
            await createMethod({
                url: `/payment`,
                values
            }, { onSuccess: () => { refetch(); setNewMethodModalOpen(false); } });
        }
    };

    const handleDeleteMethod = (method) => {
        confirmAction(async () => {
            try {
                await deleteMethod({ url: '/payment', id: parseInt(method.id, 10) });
                refetch();
                mostrarExito('El método de pago ha sido eliminado.', theme);
            } catch (error) {
                console.error('Error al eliminar método de pago:', error);
                mostrarError('No se pudo eliminar el método de pago.', theme);
            }
        }, () => {}, `¿Estás seguro de eliminar el método de pago "${method.method}"?`, theme);
    };

    if (isLoading) return <PaymentMethodSurchargeManagerSkeleton />;
    if (error) return <Alert severity="error">Error al cargar los métodos de pago: {error.message}</Alert>;

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    background: (theme) => theme.palette.background.componentHeaderBackground,
                    color: theme.palette.primary.contrastText
                }}
            >
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                            Métodos de Pago y Recargos
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Crea, edita y gestiona los métodos de pago y sus recargos asociados.
                        </Typography>
                    </Grid>
                    <Grid item>
                        <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={() => setNewMethodModalOpen(true)}>
                            Nuevo Método de Pago
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Método de Pago</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell align="center">Activo</TableCell>
                                <TableCell align="center">Recargo Activo</TableCell>
                                <TableCell align="center">Porcentaje (%)</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paymentMethods?.map((method) => {
                                const methodId = parseInt(method.id, 10);
                                if (isNaN(methodId)) {
                                    console.error("Corrupted payment method ID found:", method.id);
                                    return null; // Skip rendering this corrupted row
                                }
                                return (
                                    <TableRow key={methodId}>
                                        <TableCell component="th" scope="row">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {method.method}
                                                {isSystemMethod(method.method) &&
                                                    <Tooltip title="Método del sistema (no se puede editar)">
                                                        <LockIcon sx={{ fontSize: '1rem', ml: 1, color: 'text.secondary' }} />
                                                    </Tooltip>
                                                }
                                            </Box>
                                        </TableCell>
                                        <TableCell>{method.description}</TableCell>
                                        <TableCell align="center">
                                            <Chip label={method.active ? 'Sí' : 'No'} color={method.active ? 'success' : 'error'} size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={method.surcharge_active}
                                                onChange={() => onToggle(method)}
                                                disabled={mutation.isPending || isSystemMethod(method.method)}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {parseFloat(method.surcharge_percentage).toFixed(2)}%
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="Editar Método de Pago">
                                                    <span>
                                                        <IconButton onClick={() => handleOpenEditModal(method)} color="info" disabled={isSystemMethod(method.method)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Editar Recargo">
                                                    <span>
                                                        <IconButton onClick={() => handleOpenSurchargeModal(method)} color="secondary" disabled={isSystemMethod(method.method)}>
                                                            <MonetizationOnIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Eliminar Método de Pago">
                                                    <span>
                                                        <IconButton onClick={() => handleDeleteMethod(method)} color="error" disabled={isSystemMethod(method.method)}>
                                                            <DeleteForeverIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {selectedMethod && (
                <EditSurchargeModal
                    open={surchargeModalOpen}
                    onClose={handleCloseSurchargeModal}
                    paymentMethod={selectedMethod}
                    onSave={onSaveSurcharge}
                    isLoading={mutation.isPending}
                />
            )}

            <PaymentMethodModal
                open={newMethodModalOpen}
                onClose={() => setNewMethodModalOpen(false)}
                onSave={handleSaveMethod}
                isLoading={isCreating || mutation.isPending}
                method={selectedMethod}
            />
        </Box>
    );
};

export default PaymentMethodSurchargeManager;
