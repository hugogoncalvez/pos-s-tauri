import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const quantityRef = useRef(null);
  const [formValues, handleInputChange, reset, , setFormValues] = useForm();
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [newComponent, setNewComponent] = useState({
    product: null,
    presentation: null,
    quantity: 1,
  });

  const [comboComponents, setComboComponents] = useState([]);

  //console.log('ComboManager Render - comboComponents:', comboComponents);

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

  const debouncedSetProductSearchTerm = useCallback(
    debounce((newValue) => {
      setProductSearchTerm(newValue);
    }, 500), // 500ms de delay
    []
  );

  // --- Funciones para manejar componentes del combo ---
  const addComboComponent = () => {
    setComboComponents([...comboComponents, {
      _id: `temp_${crypto.randomUUID()}`, // ID único temporal
      stock_id: null,
      quantity: 1,
      component_presentation_id: null
    }]);
  };

  const removeComboComponent = (_id) => {
    //console.log('--- REMOVE COMPONENT ---');
    //console.log('ID to remove:', _id);

    setIsConfirmDialogOpen(true);

    ConfirmDelete(
      () => { // onConfirm
        setComboComponents(prevComboComponents => { // Use functional update
          const newComboComponents = prevComboComponents.filter(item => item._id !== _id);
          //console.log('Combo Components AFTER filter:', newComboComponents);
          return newComboComponents;
        });
        setIsConfirmDialogOpen(false);
      },
      () => { // onCancel
        setIsConfirmDialogOpen(false);
      },
      '¿Estás seguro de eliminar este componente?',
      theme
    );
  };

  const updateComboComponent = (_id, field, value) => {
    //console.log("updateComboComponent:", { _id, field, value });
    const newComboComponents = comboComponents.map(item =>
      item._id === _id ? { ...item, [field]: value } : item
    );
    setComboComponents(newComboComponents);
  };

  const handleAddComponent = () => {
    //console.log('handleAddComponent - newComponent:', newComponent);
    if (!newComponent.product || newComponent.quantity < 1) {
      mostrarError('Selecciona un producto y una cantidad válida.', theme);
      return;
    }

    setComboComponents(prev => [...prev, {
      _id: `temp_${crypto.randomUUID()}`,
      stock_id: newComponent.product.id,
      product_name: newComponent.product.name, // Store name for display
      component_presentation_id: newComponent.presentation?.id || null,
      presentation_name: newComponent.presentation?.name || null, // Store name for display
      quantity: newComponent.quantity,
    }]);

    // Clear the form
    setNewComponent({
      product: null,
      presentation: null,
      quantity: 1,
    });
    setProductSearchTerm(''); // Clear search term for the single Autocomplete
  };
  // --- Manejadores de Eventos (Combos) ---
  const handleOpenComboModal = (combo = null) => {
    //console.log('handleOpenComboModal called with combo:', combo);
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

    if (combo && combo.combo_items) {
      setComboComponents(
        combo.combo_items.map((item) => ({
          _id: item.id
            ? `db_${item.id}`  // prefijo para los que vienen de la BD
            : `temp_${crypto.randomUUID()}`, // genera un UUID único
          stock_id: item.stock_id,
          product_name: item.stock?.name || '',
          component_presentation_id: item.component_presentation_id,
          presentation_name: item.component_presentation?.name || null,
          quantity: item.quantity,
        }))
      );
    } else {
      setComboComponents([]);
    }

    setOpenComboModal(true);
  };

  const handleCloseComboModal = () => {
    //console.log('handleCloseComboModal called');
    if (isConfirmDialogOpen) {
      //console.log('Confirmation dialog is open, preventing modal close.');
      return;
    }
    setOpenComboModal(false);
    setCurrentCombo(null);
    setComboComponents([]);
    setProductSearchTerm('');
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
    //console.log('handleComboSubmit called with formValues:', formValues);
    event.preventDefault();

    if (comboComponents.length === 0) {
      alert('Un combo debe tener al menos un componente.');
      return;
    }

    //console.log('handleComboSubmit - comboComponents:', comboComponents);
    const hasInvalidComponents = comboComponents.some(comp =>
      !comp.stock_id || !comp.quantity || comp.quantity < 1
    );
    //console.log('handleComboSubmit - hasInvalidComponents:', hasInvalidComponents);

    if (hasInvalidComponents) {
      alert('Todos los componentes del combo deben tener un producto seleccionado y una cantidad válida.');
      return;
    }

    const dataToSend = {
      ...formValues,
      is_active: formValues.is_active === 'true',
      combo_items: comboComponents.map(item => ({
        stock_id: item.stock_id,
        quantity: item.quantity,
        component_presentation_id: item.component_presentation_id
      })), // Remover _id antes de enviar
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
    const result = await ConfirmDelete(() => { }, () => { }, '¿Estás seguro de eliminar este combo?', theme); // Pasar mensaje y theme
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
    {
      id: 'start_date', label: 'Fecha Inicio', valueGetter: ({ row }) => {
        const dateString = row.start_date;
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        return localDate.toLocaleDateString();
      }
    },
    {
      id: 'end_date', label: 'Fecha Fin', valueGetter: ({ row }) => {
        const dateString = row.end_date;
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        return localDate.toLocaleDateString();
      }
    },
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

  const componentColumns = useMemo(() => [
    { id: 'product_name', label: 'Producto', align: 'left' },
    { id: 'presentation_name', label: 'Presentación', align: 'left', valueGetter: ({ row }) => row.presentation_name || 'N/A' },
    { id: 'quantity', label: 'Cantidad', align: 'center' },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center',
      valueGetter: ({ row }) => (
        <Box>
          <Tooltip title="Eliminar Componente">
            <IconButton onClick={() => removeComboComponent(row._id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  const isPageLoading = combosLoading;

  //console.log('--- RENDER ---');
  //console.log('Product Search Term:', productSearchTerm);
  //console.log('Products in options:', products.map(p => p.name));
  //console.log('Combo Components State:', comboComponents);

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
        maxWidth="lg"
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
                  onChange={(e) => {
                    handleInputChange(e);
                    if (startDateRef.current) {
                      startDateRef.current.blur();
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'start_date', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                  inputRef={startDateRef}
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
                  onChange={(e) => {
                    handleInputChange(e);
                    if (endDateRef.current) {
                      endDateRef.current.blur();
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'end_date', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                  inputRef={endDateRef}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
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
                      required
                    />
                  )}
                />
              </Grid>

              {/* SECCIÓN PARA AGREGAR COMPONENTES */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Agregar Componente
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={products || []}
                      getOptionLabel={(option) => option.name || ""}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={newComponent.product}
                      onChange={(event, newValue) => {
                        setNewComponent(prev => ({ ...prev, product: newValue, presentation: null }));
                      }}
                      onInputChange={(event, newInputValue) => {
                        debouncedSetProductSearchTerm(newInputValue);
                      }}
                      loading={productsLoading}
                      filterOptions={(x) => x}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          label="Producto"
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
                      options={newComponent.product ? newComponent.product.presentations || [] : []}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={newComponent.presentation}
                      onChange={(event, newValue) => {
                        setNewComponent(prev => ({ ...prev, presentation: newValue }));
                      }}
                      disabled={!newComponent.product}
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
                      value={newComponent.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value < 1) {
                          setNewComponent(prev => ({ ...prev, quantity: '' }));
                          return;
                        }
                        const intValue = parseInt(value, 10);
                        if (!isNaN(intValue)) {
                          setNewComponent(prev => ({ ...prev, quantity: intValue }));
                        }
                      }}
                      inputProps={{ min: 1, step: 1 }}
                      inputRef={quantityRef}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <StyledButton
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddComponent}
                    >
                      Agregar
                    </StyledButton>
                  </Grid>
                </Grid>
              </Grid>

              {/* TABLA DE COMPONENTES AGREGADOS */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Componentes del Combo
                </Typography>
                {comboComponents.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No hay componentes agregados al combo.
                  </Alert>
                )}
                <EnhancedTable
                  columns={componentColumns}
                  data={comboComponents}
                  pagination={false}
                  loading={false}
                />
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