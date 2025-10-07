import React, { useState, useMemo, useEffect, useCallback } from 'react';
import moment from 'moment';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Clear as ClearIcon } from '@mui/icons-material';
import { UseFetchQuery } from '../hooks/useQuery';
import { usePermissions } from '../hooks/usePermissions';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { Update as useUpdate } from '../hooks/useUpdate';
import { useDelete } from '../hooks/useDelete';
import { confirmAction as ConfirmDelete } from '../functions/ConfirmDelete';
import { debounce } from '../functions/Debounce';
import { mostrarCarga } from '../functions/mostrarCarga'; // Nueva importación
import { mostrarExito } from '../functions/mostrarExito'; // Nueva importación
import { mostrarError } from '../functions/MostrarError'; // Nueva importación
import Swal from 'sweetalert2'; // Nueva importación
import { DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Autocomplete, InputAdornment } from '@mui/material';
import PromotionsManagerSkeleton from '../styledComponents/skeletons/PromotionsManagerSkeleton';

const PromotionsManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openPromotionModal, setOpenPromotionModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [formValues, handleInputChange, reset, , setFormValues] = useForm();
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // --- Efecto para manejar el valor de descuento en BOGO ---
  useEffect(() => {
    if (formValues.type === 'BOGO') {
      // Cuando el tipo es BOGO, deshabilita y setea el valor a 0.
      setFormValues(prev => ({ ...prev, discount_value: '0' }));
    }
  }, [formValues.type, setFormValues]);

  const debouncedSetProductSearchTerm = useCallback(
    debounce((newValue) => {
      setProductSearchTerm(newValue);
    }, 500), // 500ms de delay
    []
  );

  const promotionTypeOptions = [
    { value: 'BOGO', label: 'Paga 1 Lleva 2 (BOGO)' },
    { value: 'PERCENT_DISCOUNT_ON_NTH', label: 'Descuento % en N-ésima unidad' },
    { value: 'FIXED_PRICE_ON_NTH', label: 'Precio Fijo en N-ésima unidad' },
  ];

  const statusOptions = [
    { value: 'true', label: 'Activa' },
    { value: 'false', label: 'Inactiva' },
  ];

  const { tienePermiso } = usePermissions();

  // --- Obtener Datos ---
  const { data: promotions, isLoading: isLoadingPromotions, isError: isErrorPromotions, error: errorPromotions, refetch: refetchPromotions } = UseFetchQuery('promotions', '/promotions');
  const { data: productsData, isLoading: productsLoading } = UseFetchQuery(
    ['products', productSearchTerm], // La clave de la query debe incluir el término de búsqueda
    `/stock?limit=100&name=${productSearchTerm}`,
    true,
    0,
    { keepPreviousData: true } // Mantener datos anteriores mientras se carga
  );
  const products = productsData?.products || [];
  const { data: presentations, isLoading: presentationsLoading } = UseFetchQuery('presentations', '/presentations');

  // --- Mutaciones ---
  const addPromotion = useSubmit('addPromotion');
  const updatePromotion = useUpdate('updatePromotion');
  const deletePromotion = useDelete('deletePromotion');

  // --- Manejadores de Eventos (Promociones) ---
  const handleOpenPromotionModal = (promotion = null) => {
    setCurrentPromotion(promotion);
    const initialValues = {
      name: promotion?.name || '',
      type: promotion?.type || '',
      discount_value: promotion?.discount_value || '',
      required_quantity: promotion?.required_quantity || '',
      start_date: promotion?.start_date ? moment.utc(promotion.start_date).format('YYYY-MM-DD') : '',
      end_date: promotion?.end_date ? moment.utc(promotion.end_date).format('YYYY-MM-DD') : '',
      is_active: promotion ? String(promotion.is_active) : 'true',
      products: promotion?.products || [],
      presentations: promotion?.presentations || [],
    };
    setFormValues(initialValues);
    setOpenPromotionModal(true);
  };

  const handleClosePromotionModal = () => {
    setOpenPromotionModal(false);
    setCurrentPromotion(null);
    reset();
  };

  const handlePromotionSubmit = async (event) => {
    event.preventDefault();
    const dataToSend = {
      ...formValues,
      is_active: formValues.is_active === 'true',
      products: formValues.products.map(p => p.id),
      presentations: formValues.presentations.map(p => p.id),
    };

    mostrarCarga(currentPromotion ? 'Actualizando promoción...' : 'Creando promoción...', theme); // Mostrar carga

    try {
      if (currentPromotion) {
        await updatePromotion.mutateAsync({ url: `/promotions/${currentPromotion.id}`, datos: dataToSend });
        mostrarExito('Promoción actualizada con éxito!', theme);
      } else {
        await addPromotion.mutateAsync({ url: '/promotions', values: dataToSend });
        mostrarExito('Promoción creada con éxito!', theme);
      }
      refetchPromotions();
      handleClosePromotionModal();
      Swal.close(); // Cerrar carga en éxito
    } catch (error) {
      Swal.close(); // Cerrar carga en error
      console.error("Error submitting promotion:", error);
      mostrarError(error.response?.data?.message || 'Error al guardar la promoción.', theme); // Mostrar error
    }
  };

  const handleDeletePromotion = async (id) => {
    const result = await ConfirmDelete(() => {}, () => {}, '¿Estás seguro de eliminar esta promoción?', theme); // Pasar mensaje y theme
    if (result.isConfirmed) {
      mostrarCarga('Eliminando promoción...', theme); // Mostrar carga
      try {
        await deletePromotion.mutateAsync({ url: `/promotions/${id}` });
        refetchPromotions();
        Swal.close(); // Cerrar carga en éxito
        mostrarExito('Promoción eliminada con éxito!', theme);
      } catch (error) {
        Swal.close(); // Cerrar carga en error
        console.error("Error deleting promotion:", error);
        mostrarError(error.response?.data?.message || 'Error al eliminar la promoción.', theme); // Mostrar error
      }
    }
  };

  // --- Procesamiento y Paginación ---
  const processedPromotions = useMemo(() => {
    if (!Array.isArray(promotions)) return [];

    const getStatus = (promo) => {
      const now = moment();
      const endDate = promo.end_date ? moment.utc(promo.end_date) : null;

      if (endDate && endDate.endOf('day').isBefore(moment().startOf('day'))) {
        return 'Finalizada';
      }
      return promo.is_active ? 'Activa' : 'Inactiva';
    };

    const statusOrder = { 'Activa': 1, 'Inactiva': 2, 'Finalizada': 3 };

    return promotions
      .map(promo => ({
        ...promo,
        status: getStatus(promo)
      }))
      .sort((a, b) => {
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(b.start_date) - new Date(a.start_date); // Ordenar por fecha de inicio más reciente
      });
  }, [promotions]);

  const paginatedPromotions = useMemo(() => {
    return processedPromotions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [processedPromotions, page, rowsPerPage]);

  // --- Definición de Columnas ---
  const promotionColumns = useMemo(() => [
    { id: 'name', label: 'Nombre', sx: { fontWeight: 'bold' } },
    {
      id: 'status',
      label: 'Estado',
      valueGetter: ({ row }) => {
        const statusConfig = {
          'Activa': { color: theme.palette.success.main, bgcolor: theme.palette.success.light },
          'Inactiva': { color: theme.palette.warning.dark, bgcolor: theme.palette.warning.light },
          'Finalizada': { color: theme.palette.error.dark, bgcolor: theme.palette.error.light },
        };
        const config = statusConfig[row.status] || { color: 'text.secondary', bgcolor: 'grey.200' };

        return (
          <Box
            component="span"
            sx={{
              color: config.color,
              // backgroundColor: config.bgcolor,
              fontWeight: 'bold',
              py: 0.5,
              px: 1.5,
              borderRadius: '12px',
              display: 'inline-block',
              minWidth: '80px',
              textAlign: 'center',
              border: `1px solid ${config.color}`
            }}
          >
            {row.status}
          </Box>
        );
      }
    },
    {
      id: 'type',
      label: 'Tipo',
      valueGetter: ({ row }) => {
        const translations = {
          'BOGO': 'Paga 1 Lleva 2 (BOGO)',
          'PERCENT_DISCOUNT_ON_NTH': 'Descuento % en N-ésima unidad',
          'FIXED_PRICE_ON_NTH': 'Precio Fijo en N-ésima unidad'
        };
        return translations[row.type] || row.type;
      }
    },
    { id: 'discount_value', label: 'Valor Descuento' },
    { id: 'required_quantity', label: 'Cant. Requerida' },
    { id: 'start_date', label: 'Fecha Inicio', valueGetter: ({ row }) => moment.utc(row.start_date).format('DD/MM/YYYY') },
    { id: 'end_date', label: 'Fecha Fin', valueGetter: ({ row }) => moment.utc(row.end_date).format('DD/MM/YYYY') },
    {
      id: 'actions',
      label: 'Acciones',
      valueGetter: ({ row }) => {
        const canManage = tienePermiso('accion_gestionar_promociones');
        return (
          <Box>
            {canManage && (
              <>
                <Tooltip title="Editar Promoción">
                  <IconButton onClick={() => handleOpenPromotionModal(row)} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={row.status === 'Activa' ? "No se puede eliminar una promoción activa" : "Eliminar Promoción"}>
                  <span>
                    <IconButton onClick={() => handleDeletePromotion(row.id)} size="small" color="error" disabled={row.status === 'Activa'}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ], [theme, tienePermiso, handleOpenPromotionModal, handleDeletePromotion]);

  const isPageLoading = isLoadingPromotions || productsLoading || presentationsLoading;

  if (isPageLoading) {
    return <PromotionsManagerSkeleton />;
  }

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
              Gestión de Promociones
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Crea, edita y gestiona las promociones y sus asignaciones a productos.
            </Typography>
          </Grid>
          <Grid item>
            {tienePermiso('accion_gestionar_promociones') && (
              <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenPromotionModal()}>
                Nueva Promoción
              </StyledButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
        <Box mb={2} p={1}>
          <Typography variant="h5">Listado de Promociones</Typography>
        </Box>
        {isErrorPromotions && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar promociones: {errorPromotions?.message || 'Error desconocido'}
          </Alert>
        )}
        <EnhancedTable
          columns={promotionColumns}
          data={paginatedPromotions}
          loading={isLoadingPromotions}
          count={processedPromotions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <StyledDialog
        open={openPromotionModal}
        onClose={handleClosePromotionModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
          {currentPromotion ? 'Editar Promoción' : 'Crear Promoción'}
          <IconButton onClick={handleClosePromotionModal}>
            <CloseIcon color="error" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handlePromotionSubmit}>
          <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  label="Nombre de la Promoción"
                  name="name"
                  value={formValues.name || ''}
                  onChange={handleInputChange}
                  autoFocus
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'name', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  required
                  options={promotionTypeOptions}
                  getOptionLabel={(option) => option.label}
                  value={promotionTypeOptions.find(option => option.value === formValues.type) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'type', value: newValue ? newValue.value : '' } });
                  }}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Tipo de Promoción"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="number"
                  label={formValues.type === 'FIXED_PRICE_ON_NTH' ? 'Precio Fijo' : 'Valor del Descuento'}
                  name="discount_value"
                  value={formValues.discount_value || ''}
                  onChange={handleInputChange}
                  disabled={formValues.type === 'BOGO'}
                  helperText={formValues.type === 'BOGO' ? 'No aplicable para promociones BOGO' : ''}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'discount_value', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="number"
                  label="Cantidad Requerida"
                  name="required_quantity"
                  value={formValues.required_quantity || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'required_quantity', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="date"
                  label="Fecha de Inicio"
                  name="start_date"
                  value={formValues.start_date || ''}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'start_date', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="date"
                  label="Fecha de Fin"
                  name="end_date"
                  value={formValues.end_date || ''}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'end_date', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  required
                  options={statusOptions}
                  getOptionLabel={(option) => option.label}
                  value={statusOptions.find(option => option.value === formValues.is_active) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'is_active', value: newValue ? newValue.value : '' } });
                  }}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Estado"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={products}
                  getOptionLabel={(option) => option.name || ""}
                  getOptionKey={(option) => option.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id} // <-- Añadir esta línea
                  value={formValues.products || []}
                  onChange={(event, newValue) => {
                    setFormValues({ ...formValues, products: newValue });
                  }}
                  onInputChange={(event, newInputValue) => {
                    debouncedSetProductSearchTerm(newInputValue);
                  }}
                  loading={productsLoading}
                  filterOptions={(x) => x}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Productos Aplicables"
                      placeholder="Escribe para buscar productos"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={presentations?.presentations || []}
                  getOptionLabel={(option) => option.name}
                  getOptionKey={(option) => option.id} // Asegurarse de que getOptionKey también esté presente
                  isOptionEqualToValue={(option, value) => option.id === value.id} // <-- Añadir esta línea
                  value={formValues.presentations || []}
                  onChange={(event, newValue) => {
                    setFormValues({ ...formValues, presentations: newValue });
                  }}
                  loading={presentationsLoading} // <--- ADDED THIS LINE
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Presentaciones Aplicables"
                      placeholder="Selecciona presentaciones"
                      InputProps={{ // <--- ADDED THIS BLOCK
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {presentationsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
            <StyledButton onClick={handleClosePromotionModal} variant="outlined" color="secondary" sx={{ padding: '2px 12px' }}>
              Cancelar
            </StyledButton>
            <StyledButton type="submit" variant="contained">
              {currentPromotion ? 'Actualizar' : 'Crear'}
            </StyledButton>
          </DialogActions>
        </Box>
      </StyledDialog>
    </Box>
  );
};

export default PromotionsManager;