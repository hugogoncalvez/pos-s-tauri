import React, { useState, useEffect } from 'react';
import FiscalAdminSkeleton from '../styledComponents/skeletons/FiscalAdminSkeleton';
import PointOfSaleModal from '../styledComponents/PointOfSaleModal'; // Importar el modal
import { EnhancedTable } from '../styledComponents/EnhancedTable'; // Importar la tabla mejorada
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'; // Iconos
import { IconButton, Tooltip, Paper, Typography, Box, Grid, CircularProgress, Alert, Tabs, Tab, TableRow, TableCell } from '@mui/material'; // Componentes MUI adicionales
import { useSubmit } from '../hooks/useSubmit';
import { useDelete } from '../hooks/useDelete';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import { mostrarCarga } from '../functions/mostrarCarga';
import { UseFetchQuery } from '../hooks/useQuery';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { useForm } from '../hooks/useForm';
import { Update } from '../hooks/useUpdate';

// --- Componente para la Pestaña de Configuración General ---
const FiscalConfigTab = () => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const canEdit = tienePermiso('gestionar_configuracion_fiscal');

    const { data: fiscalConfigData, isLoading, isError, error, refetch } = UseFetchQuery(
        'fiscalConfig',
        '/fiscal/fiscal-config'
    );

    const [formValues, handleInputChange, , , setValues] = useForm({});
    const updateConfigMutation = Update('fiscalConfig');

    useEffect(() => {
        if (fiscalConfigData) {
            setValues(fiscalConfigData);
        }
    }, [fiscalConfigData, setValues]);

    const handleSave = () => {
        mostrarCarga('Guardando Configuración Fiscal...', theme); // Show loading indicator
        updateConfigMutation.mutate(
            { url: '/fiscal/fiscal-config', datos: formValues },
            {
                onSuccess: () => {
                    Swal.close(); // Dismiss loading indicator
                    refetch(); // Refetch para asegurar que los datos se actualicen
                    mostrarExito('Configuración fiscal guardada correctamente.', theme);
                },
                onError: (err) => {
                    Swal.close(); // Dismiss loading indicator
                    mostrarError(err.message || 'Error al actualizar la configuración fiscal.', theme);
                }
            }
        );
    };

    if (isLoading) {
        return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
    }

    if (isError) {
        return <Alert severity="error">Error al cargar la configuración fiscal: {error.message}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={6} sx={{ width: 'clamp(250px, 100%, 400px)' }}>
                    <StyledTextField
                        label="CUIT"
                        name="cuit"
                        value={formValues.cuit || ''}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                    />
                </Grid>
                <Grid item xs={12} sm={6} sx={{ width: 'clamp(250px, 100%, 400px)' }}>
                    <StyledTextField
                        label="Razón Social"
                        name="razon_social"
                        value={formValues.razon_social || ''}
                        onChange={handleInputChange}
                        disabled={!canEdit}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StyledAutocomplete
                        options={['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL']}
                        value={formValues.condicion_iva || ''}
                        onChange={(e, newValue) => handleInputChange({ target: { name: 'condicion_iva', value: newValue } })}
                        disabled={!canEdit}
                        isOptionEqualToValue={(option, value) => option === value}
                        renderInput={(params) => (
                            <StyledTextField {...params} label="Condición frente al IVA" />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StyledAutocomplete
                        options={['HOMOLOGACION', 'PRODUCCION']}
                        value={formValues.afip_environment || ''}
                        onChange={(e, newValue) => handleInputChange({ target: { name: 'afip_environment', value: newValue } })}
                        disabled={!canEdit}
                        isOptionEqualToValue={(option, value) => option === value}
                        renderInput={(params) => (
                            <StyledTextField {...params} label="Entorno AFIP" />
                        )}
                    />
                </Grid>
                {/* TODO: Campos para afip_certificado_path, afip_clave_path, certificado_vigencia_desde, afip_ticket_path, afip_last_token_at */}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    {canEdit && (
                        <StyledButton
                            onClick={handleSave}
                            variant="contained"
                            disabled={updateConfigMutation.isLoading}
                        >
                            {updateConfigMutation.isLoading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
                        </StyledButton>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

// --- Componente para Puntos de Venta ---
const PointsOfSaleTab = () => {
    const theme = useTheme();
    const { tienePermiso } = usePermissions();
    const canManage = tienePermiso('gestionar_puntos_de_venta');

    const [openModal, setOpenModal] = useState(false);
    const [selectedPointOfSale, setSelectedPointOfSale] = useState(null);

    const { data: pointsOfSaleData, isLoading, isError, error, refetch } = UseFetchQuery(
        'pointsOfSale',
        '/fiscal/points-of-sale'
    );

    const deleteMutation = useDelete('deletePointOfSale');

    const handleOpenCreateModal = () => {
        setSelectedPointOfSale(null);
        setOpenModal(true);
    };

    const handleOpenEditModal = (pointOfSale) => {
        setSelectedPointOfSale(pointOfSale);
        setOpenModal(true);
    };

    const handleDelete = (pointOfSaleId) => {
        mostrarConfirmacion(
            {
                title: '¿Eliminar Punto de Venta?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            },
            theme,
            () => {
                deleteMutation.mutate(
                    { url: '/fiscal/points-of-sale', id: pointOfSaleId },
                    {
                        onSuccess: () => {
                            mostrarExito('Punto de venta eliminado correctamente.', theme);
                            refetch();
                        },
                        onError: (err) => {
                            mostrarError(err.message || 'Error al eliminar el punto de venta.', theme);
                        }
                    }
                );
            }
        );
    };

    const columns = [
        { id: 'id', label: 'ID', align: 'center' },
        { id: 'name', label: 'Nombre', align: 'left' },
        { id: 'emission_type', label: 'Tipo de Emisión', align: 'center' },
        { id: 'mode', label: 'Modo', align: 'center' },
        { id: 'address', label: 'Dirección', align: 'left' },
        { id: 'is_enabled', label: 'Habilitado', align: 'center', format: (value) => (value ? 'Sí' : 'No') },
        { id: 'actions', label: 'Acciones', align: 'center' }
    ];

    const renderRow = (row) => (
        <TableRow key={row.id}>
            <TableCell align="center">{row.id}</TableCell>
            <TableCell align="left">{row.name}</TableCell>
            <TableCell align="center">{row.emission_type}</TableCell>
            <TableCell align="center">{row.mode}</TableCell>
            <TableCell align="left">{row.address || 'N/A'}</TableCell>
            <TableCell align="center">{row.is_enabled ? 'Sí' : 'No'}</TableCell>
            <TableCell align="center">
                {canManage && (
                    <>
                        <Tooltip title="Editar">
                            <IconButton color="info" size="small" onClick={() => handleOpenEditModal(row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </TableCell>
        </TableRow>
    );


    if (isLoading) {
        return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
    }

    if (isError) {
        return <Alert severity="error">Error al cargar los puntos de venta: {error.message}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {canManage && (
                    <StyledButton
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateModal}
                    >
                        Nuevo Punto de Venta
                    </StyledButton>
                )}
            </Box>
            <EnhancedTable
                columns={columns}
                data={pointsOfSaleData || []}
                loading={isLoading}
                renderRow={renderRow}
                pagination={false} // No paginación por ahora, si la lista es corta
            />
            <PointOfSaleModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                pointOfSale={selectedPointOfSale}
                onSaveSuccess={refetch}
            />
        </Box>
    );
};

// --- Panel de Pestaña (Helper) ---
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`fiscal-admin-tabpanel-${index}`}
            aria-labelledby={`fiscal-admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

// --- Componente Principal ---
const FiscalAdmin = () => {
    const [value, setValue] = useState(0);
    const theme = useTheme();
    const { isLoading: isLoadingPermissions } = usePermissions();

    // No necesitamos cargar fiscal-config aquí, ya se carga en FiscalConfigTab
    // Solo necesitamos el esqueleto si los permisos están cargando
    if (isLoadingPermissions) {
        return <FiscalAdminSkeleton />;
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Paper sx={{ width: '100%', p: 2, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h4" gutterBottom sx={{ p: 2, color: theme.palette.text.primary }}>
                Administración Fiscal
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="fiscal admin tabs">
                    <Tab label="Configuración General" id="fiscal-admin-tab-0" />
                    <Tab label="Puntos de Venta" id="fiscal-admin-tab-1" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <FiscalConfigTab />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <PointsOfSaleTab />
            </TabPanel>
        </Paper>
    );
};

export default FiscalAdmin;
