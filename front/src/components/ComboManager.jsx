import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Autorenew as AutorenewIcon, Close as CloseIcon, Clear as ClearIcon } from '@mui/icons-material';
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
import { DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Autocomplete } from '@mui/material';
import { Api } from '../api/api';
import ComboManagerSkeleton from '../styledComponents/skeletons/ComboManagerSkeleton';

const ComboManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openComboModal, setOpenComboModal] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(null);
  const [formValues, handleInputChange, reset, , setFormValues] = useForm();
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const [comboComponents, setComboComponents] = useState([]);

  const statusOptions = [
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
  ];

  const { tienePermiso } = usePermissions();

  // --- Obtener Datos ---
  const { data: combos, isLoading: combosLoading, isError: isErrorCombos, error: errorCombos, refetch: refetchCombos } = UseFetchQuery('combos', '/combos');
  const { data: productsData, isLoading: productsLoading } = UseFetchQuery(
    ['products', productSearchTerm], // La clave de la query debe incluir el término de búsqueda
    `/stock?limit=100&name=${productSearchTerm}`,
    true,
    0,
    { keepPreviousData: true } // Mantener datos anteriores mientras se carga
  );
  const products = productsData?.products || [];

  // --- Mutaciones ---
  const addCombo = useSubmit('addCombo');
  const updateCombo = useUpdate('updateCombo');
  const deleteCombo = useDelete('deleteCombo');

  // --- Efectos ---
  // Inicializar combo components cuando se edita un combo existente
  useEffect(() => {
    if (currentCombo && currentCombo.combo_items) {
      setComboComponents(currentCombo.combo_items.map(item => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        component_presentation_id: item.component_presentation_id,
      })));
    } else {
      setComboComponents([]);
    }
  }, [currentCombo]);

  const debouncedSetProductSearchTerm = useCallback(
    debounce((newValue) => {
      setProductSearchTerm(newValue);
    }, 500), // 500ms de delay
    []
  );

  // --- Funciones para manejar componentes del combo ---
  const addComboComponent = () => {
    setComboComponents([...comboComponents, {
      stock_id: null,
      quantity: 1,
      component_presentation_id: null
    }]);
  };

  const removeComboComponent = (index) => {
    const newComboComponents = comboComponents.filter((_, i) => i !== index);
    setComboComponents(newComboComponents);
  };

  const updateComboComponent = (index, field, value) => {
    const newComboComponents = [...comboComponents];
    newComboComponents[index] = { ...newComboComponents[index], [field]: value };
    setComboComponents(newComboComponents);
  };

  // --- Manejadores de Eventos (Combos) ---
  const handleOpenComboModal = (combo = null) => {
    setCurrentCombo(combo);
    const initialValues = {
      name: combo?.name || '',
      barcode: combo?.barcode || '',
      price: combo?.price || '',
      is_active: combo ? String(combo.is_active) : 'true',
      start_date: combo?.start_date ? new Date(combo.start_date).toISOString().split('T')[0] : '',
      end_date: combo?.end_date ? new Date(combo.end_date).toISOString().split('T')[0] : '',
    };
    setFormValues(initialValues);
    setOpenComboModal(true);
  };

  const handleCloseComboModal = () => {
    setOpenComboModal(false);
    setCurrentCombo(null);
    setComboComponents([]);
    reset();
  };

  const handleGenerateBarcode = async () => {
    setIsGeneratingBarcode(true);
    try {
      const { data } = await Api.get('/barcodes/generate/combo');
      if (data && data.barcode) {
        setFormValues(prev => ({ ...prev, barcode: data.barcode }));
      }
    } catch (error) {
      console.error("Error al generar el código de barras:", error);
      // Aquí podrías mostrar un error al usuario
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  const handleComboSubmit = async (event) => {
    event.preventDefault();

    if (comboComponents.length === 0) {
      alert('Un combo debe tener al menos un componente.');
      return;
    }

    const hasInvalidComponents = comboComponents.some(comp =>
      !comp.stock_id || !comp.quantity || comp.quantity < 1
    );

    if (hasInvalidComponents) {
      alert('Todos los componentes del combo deben tener un producto seleccionado y una cantidad válida.');
      return;
    }

    const dataToSend = {
      ...formValues,
      is_active: formValues.is_active === 'true',
      combo_items: comboComponents,
    };

    mostrarCarga(currentCombo ? 'Actualizando combo...' : 'Creando combo...', theme); // Mostrar carga

    try {
      if (currentCombo) {
        await updateCombo.mutateAsync({ url: `/combos/${currentCombo.id}`, datos: dataToSend });
        mostrarExito('Combo actualizado con éxito!', theme);
      } else {
        await addCombo.mutateAsync({ url: '/combos', values: dataToSend });
        mostrarExito('Combo creado con éxito!', theme);
      }
      refetchCombos();
      handleCloseComboModal();
      Swal.close(); // Cerrar carga en éxito
    } catch (error) {
      Swal.close(); // Cerrar carga en error
      console.error("Error submitting combo:", error);
      mostrarError(error.response?.data?.message || 'Error al guardar el combo.', theme); // Mostrar error
    }
  };

  const handleDeleteCombo = async (id) => {
    const result = await ConfirmDelete(() => {}, () => {}, '¿Estás seguro de eliminar este combo?', theme); // Pasar mensaje y theme
    if (result.isConfirmed) {
      mostrarCarga('Eliminando combo...', theme); // Mostrar carga
      try {
        await deleteCombo.mutateAsync({ url: `/combos/${id}` });
        refetchCombos();
        Swal.close(); // Cerrar carga en éxito
        mostrarExito('Combo eliminado con éxito!', theme);
      } catch (error) {
        Swal.close(); // Cerrar carga en error
        console.error("Error deleting combo:", error);
        mostrarError(error.response?.data?.message || 'Error al eliminar el combo.', theme); // Mostrar error
      }
    }
  };

  // --- Procesamiento y Paginación ---
  const processedCombos = useMemo(() => {
    if (!Array.isArray(combos)) return [];

    const getStatus = (combo) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Comparar solo fechas
      const endDate = combo.end_date ? new Date(combo.end_date) : null;
      const startDate = combo.start_date ? new Date(combo.start_date) : null;

      if (endDate && endDate < now) {
        return 'Finalizado';
      }
      if (startDate && startDate > now) {
        return 'Programado';
      }
      return combo.is_active ? 'Activo' : 'Inactivo';
    };

    const statusOrder = { 'Activo': 1, 'Programado': 2, 'Inactivo': 3, 'Finalizado': 4 };

    return combos
      .map(combo => ({
        ...combo,
        status: getStatus(combo)
      }))
      .sort((a, b) => {
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(b.start_date) - new Date(a.start_date); // Ordenar por fecha de inicio más reciente
      });
  }, [combos]);

  const paginatedCombos = useMemo(() => {
    return processedCombos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [processedCombos, page, rowsPerPage]);

  // --- Definición de Columnas ---
  const comboColumns = useMemo(() => [
    { id: 'name', label: 'Nombre', sx: { fontWeight: 'bold' } },
    {
      id: 'status',
      label: 'Estado',
      valueGetter: ({ row }) => {
        const statusConfig = {
          'Activo': { color: theme.palette.success.main },
          'Programado': { color: theme.palette.info.main },
          'Inactivo': { color: theme.palette.warning.dark },
          'Finalizado': { color: theme.palette.error.dark },
        };
        const color = statusConfig[row.status]?.color || 'text.secondary';

        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              color: color,
              borderColor: color,
              fontWeight: 'bold',
            }}
            variant="outlined"
          />
        );
      }
    },
    { id: 'barcode', label: 'Código de Barras' },
    { id: 'price', label: 'Precio', valueGetter: ({ row }) => `${parseFloat(row.price).toFixed(2)}` },
    { id: 'start_date', label: 'Fecha Inicio', valueGetter: ({ row }) => new Date(row.start_date).toLocaleDateString() },
    { id: 'end_date', label: 'Fecha Fin', valueGetter: ({ row }) => new Date(row.end_date).toLocaleDateString() },
    {
      id: 'actions',
      label: 'Acciones',
      valueGetter: ({ row }) => (
        <Box>
          {tienePermiso('accion_gestionar_combos') && (
            <Tooltip title="Editar Combo">
              <IconButton onClick={() => handleOpenComboModal(row)} size="small" color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {tienePermiso('accion_gestionar_combos') && (
            <Tooltip title="Eliminar Combo">
              <Box component="span" sx={{ display: 'inline-block' }}>
                <IconButton onClick={() => handleDeleteCombo(row.id)} size="small" color="error" disabled={row.status === 'Activo'}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ], [theme, tienePermiso, handleOpenComboModal, handleDeleteCombo]);

  const isPageLoading = combosLoading || productsLoading;

  if (isPageLoading) {
    return <ComboManagerSkeleton />;
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
              Gestión de Combos
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Crea, edita y gestiona los combos de productos.
            </Typography>
          </Grid>
          <Grid item>
            {tienePermiso('accion_gestionar_combos') && (
              <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenComboModal()}>
                Nuevo Combo
              </StyledButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
        <Box mb={2} p={1}>
          <Typography variant="h5">Listado de Combos</Typography>
        </Box>
        {isErrorCombos && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar combos: {errorCombos?.message || 'Error desconocido'}
          </Alert>
        )}
        <EnhancedTable
          columns={comboColumns}
          data={paginatedCombos}
          loading={combosLoading}
          count={processedCombos.length}
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
        open={openComboModal}
        onClose={handleCloseComboModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
          {currentCombo ? 'Editar Combo' : 'Crear Combo'}
          <IconButton onClick={handleCloseComboModal}>
            <CloseIcon color="error" />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleComboSubmit}>
          <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  label="Nombre del Combo"
                  name="name"
                  value={formValues.name || ''}
                  onChange={handleInputChange}
                  autoFocus
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'name', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  label="Código de Barras"
                  name="barcode"
                  value={formValues.barcode || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'barcode', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generar Código de Barras">
                          <IconButton
                            onClick={handleGenerateBarcode}
                            disabled={isGeneratingBarcode}
                          >
                            {isGeneratingBarcode ? <CircularProgress size={24} /> : <AutorenewIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  required
                  type="number"
                  label="Precio del Combo"
                  name="price"
                  value={formValues.price || ''}
                  onChange={handleInputChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'price', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
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
              <Grid item xs={12} sm={6}>
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

              {/* SECCIÓN PARA COMPONENTES DEL COMBO */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Componentes del Combo
                </Typography>

                {comboComponents.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Agregue al menos un producto o presentación al combo.
                  </Alert>
                )}

                {comboComponents.map((component, index) => (
                  <Box key={index} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <Autocomplete
                          options={products || []}
                          getOptionLabel={(option) => option.name || ""}
                          getOptionKey={(option) => option.id}
                          isOptionEqualToValue={(option, value) => option.id === value.id} // <-- Añadir esta línea
                          value={products?.find(p => p.id === component.stock_id) || null}
                          onChange={(event, newValue) => {
                            const newComboComponents = [...comboComponents];
                            newComboComponents[index] = {
                              ...newComboComponents[index],
                              stock_id: newValue?.id || null,
                              component_presentation_id: null
                            };
                            setComboComponents(newComboComponents);
                          }}
                          onInputChange={(event, newInputValue) => {
                            debouncedSetProductSearchTerm(newInputValue);
                          }}
                          loading={productsLoading}
                          filterOptions={(x) => x}
                          renderInput={(params) => (
                            <StyledTextField
                              {...params}
                              label={`Producto ${index + 1}`}
                              required
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
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          options={component.stock_id ? products?.products?.find(p => p.id === component.stock_id)?.presentations || [] : []}
                          getOptionLabel={(option) => option.name}
                          getOptionKey={(option) => option.id} // Añadir getOptionKey
                          isOptionEqualToValue={(option, value) => option.id === value.id} // <-- Añadir esta línea
                          value={component.stock_id ? products?.products?.find(p => p.id === component.stock_id)?.presentations?.find(pres => pres.id === component.component_presentation_id) || null : null}
                          onChange={(event, newValue) => {
                            updateComboComponent(index, 'component_presentation_id', newValue?.id || null);
                          }}
                          disabled={!component.stock_id}
                          renderInput={(params) => (
                            <StyledTextField
                              {...params}
                              label="Presentación (Opcional)"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <StyledTextField
                          type="number"
                          label="Cantidad"
                          value={component.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value < 1) {
                              updateComboComponent(index, 'quantity', '');
                              return;
                            }
                            const intValue = parseInt(value, 10);
                            if (!isNaN(intValue)) {
                              updateComboComponent(index, 'quantity', intValue);
                            }
                          }}
                          inputProps={{ min: 1, step: 1 }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeComboComponent(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                <StyledButton
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addComboComponent}
                  sx={{ mt: 1 }}
                >
                  Agregar Componente
                </StyledButton>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
            <StyledButton onClick={handleCloseComboModal} variant="outlined" color="secondary" sx={{ padding: '2px 12px' }}>
              Cancelar
            </StyledButton>
            <StyledButton type="submit" variant="contained">
              {currentCombo ? 'Actualizar' : 'Crear'}
            </StyledButton>
          </DialogActions>
        </Box>
      </StyledDialog>
    </Box>
  );
};

export default ComboManager;