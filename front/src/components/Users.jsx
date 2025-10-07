import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Typography,
  Paper,
  Grid,
  MenuItem,
  Tooltip,
  Alert,
  InputAdornment,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Clear as ClearIcon, VpnKey as VpnKeyIcon, Close as CloseIcon } from '@mui/icons-material';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { Update as useUpdate } from '../hooks/useUpdate';
import { useDelete } from '../hooks/useDelete';
import { useForm } from '../hooks/useForm';
import { usePermissions } from '../hooks/usePermissions';
import { confirmAction as ConfirmDelete } from '../functions/ConfirmDelete';
import { mostrarCarga } from '../functions/mostrarCarga';
import { mostrarError } from '../functions/MostrarError';
import Swal from 'sweetalert2'; // Importar Swal
import PermissionManager from '../styledComponents/PermissionManager.jsx';
import UsersSkeleton from '../styledComponents/skeletons/UsersSkeleton';

const Usuarios = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formValues, handleInputChange, reset, , setFormValues] = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { tienePermiso } = usePermissions();

  // --- Obtener Datos ---
  const { data: roles, isLoading: rolesLoading } = UseFetchQuery('roles', '/roles');
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers, error: errorUsers, refetch: refetchUsers } = UseFetchQuery('users', '/users');

  // --- Mutaciones ---
  const addUser = useSubmit('addUser');
  const updateUser = useUpdate('updateUser');
  const deleteUser = useDelete('deleteUser');

  // --- Manejadores de Eventos (Usuarios) ---
  const handleOpenUserModal = useCallback((user = null) => {
    setCurrentUser(user);
    const initialValues = {
      nombre: user?.nombre || '',
      username: user?.username || '',
      password: '',
      roleId: user?.rol_id || '',
      activo: user ? String(user.activo) : 'true',
    };
    setFormValues(initialValues);
    setOpenUserModal(true);
  }, [setFormValues]);

  const handleCloseUserModal = useCallback(() => {
    setOpenUserModal(false);
    setCurrentUser(null);
    reset();
  }, [reset]);

  const handleOpenPermissionModal = useCallback((user) => {
    setCurrentUser(user);
    setOpenPermissionModal(true);
  }, []);

  const handleClosePermissionModal = useCallback(() => {
    setOpenPermissionModal(false);
    setCurrentUser(null);
  }, []);

  const handleUserSubmit = useCallback(async (event) => {
    event.preventDefault();
    const dataToSend = { ...formValues, activo: formValues.activo === 'true' };

    if (currentUser && !dataToSend.password) {
      delete dataToSend.password;
    }

    mostrarCarga(currentUser ? 'Actualizando usuario...' : 'Creando usuario...', theme);

    try {
      if (currentUser) {
        await updateUser.mutateAsync({ url: `/users/${currentUser.id}`, datos: dataToSend });
      } else {
        await addUser.mutateAsync({ url: '/users', values: dataToSend });
      }
      refetchUsers();
      handleCloseUserModal();
      Swal.close(); // Cerrar la alerta de carga
    } catch (error) {
      console.error("Error submitting user:", error);
      mostrarError(error.response?.data?.message || 'Error al guardar el usuario.', theme);
    }
  }, [currentUser, formValues, addUser, updateUser, refetchUsers, handleCloseUserModal, theme]);

  const handleDeleteUser = useCallback(async (id) => {
    const result = await ConfirmDelete(() => {}, () => {}, theme);
    if (result.isConfirmed) {
      mostrarCarga('Eliminando usuario...', theme); // Mostrar carga
      try {
        await deleteUser.mutateAsync({ url: '/users/', id: id });
        refetchUsers();
        Swal.close(); // Cerrar carga en éxito
      } catch (error) {
        Swal.close(); // Cerrar carga en error
        console.error("Error deleting user:", error);
        mostrarError(error.response?.data?.message || 'Error al eliminar el usuario.', theme); // Mostrar error
      }
    }
  }, [deleteUser, refetchUsers, theme]);

  // --- Procesamiento y Paginación ---
  const processedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user =>
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    return processedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [processedUsers, page, rowsPerPage]);

  // Efecto para ajustar la paginación si la página actual queda sin elementos
  useEffect(() => {
    // Si la página actual es mayor que 0 y no hay elementos para mostrar en la página actual
    // o si el número total de elementos es menor que el inicio de la página actual
    if (page > 0 && processedUsers.length > 0 && page * rowsPerPage >= processedUsers.length) {
      setPage(Math.floor((processedUsers.length - 1) / rowsPerPage));
    } else if (processedUsers.length === 0 && page > 0) {
      // Si no hay usuarios y estamos en una página diferente de la primera
      setPage(0);
    }
  }, [processedUsers.length, page, rowsPerPage]);

  // --- Definición de Columnas ---
  const userColumns = useMemo(() => [
    { id: 'nombre', label: 'Nombre' },
    { id: 'username', label: 'Usuario' },
    { id: 'rol', label: 'Rol', valueGetter: ({ row }) => row.rol?.nombre || 'N/A' },
    { id: 'activo', label: 'Activo', valueGetter: ({ row }) => row.activo ? 'Sí' : 'No' },
    {
      id: 'actions',
      label: 'Acciones',
      valueGetter: ({ row }) => (
        <Box>
          {tienePermiso('accion_editar_usuario') && (
            <Tooltip title="Editar Usuario">
              <IconButton onClick={() => handleOpenUserModal(row)} size="small" color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {tienePermiso('accion_eliminar_usuario') && (
            <Tooltip title="Eliminar Usuario">
              <IconButton onClick={() => handleDeleteUser(row.id)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
          {tienePermiso('accion_gestionar_roles') && (
            <Tooltip title="Gestionar Permisos">
              <IconButton onClick={() => handleOpenPermissionModal(row)} size="small" color="secondary">
                <VpnKeyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ], [handleOpenUserModal, handleDeleteUser, tienePermiso]);

  const isPageLoading = isLoadingUsers || rolesLoading;

  if (isPageLoading) {
    return <UsersSkeleton />;
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
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Crea, edita y gestiona los usuarios y sus roles en el sistema.
            </Typography>
          </Grid>
          <Grid item>
            {tienePermiso('accion_crear_usuario') && (
              <StyledButton variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenUserModal()}>
                Nuevo Usuario
              </StyledButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={1}>
          <Typography variant="h5">Usuarios</Typography>
        </Box>
        <Grid container justifyContent="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={8} md={6} lg={4}> {/* Adjust xs, sm, md, lg as needed */}
            <StyledTextField
              label="Buscar por nombre o usuario"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth /* Use fullWidth inside Grid item */
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <ClearIcon fontSize="small" color="error" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        {isErrorUsers && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar usuarios: {errorUsers?.message || 'Error desconocido'}
          </Alert>
        )}
        <EnhancedTable
          columns={userColumns}
          data={paginatedUsers}
          loading={isLoadingUsers}
          count={processedUsers.length}
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
        open={openUserModal}
        onClose={handleCloseUserModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
          {currentUser ? 'Editar Usuario' : 'Crear Usuario'}
          <IconButton onClick={handleCloseUserModal}>
            <CloseIcon color="error" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Box component="form" onSubmit={handleUserSubmit}>
          <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  id="nombre"
                  label="Nombre Completo"
                  name="nombre"
                  value={formValues.nombre || ''}
                  onChange={handleInputChange}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton size="small" onClick={() => handleInputChange({ target: { name: 'nombre', value: '' } })}>
                          <ClearIcon fontSize="small" color="error" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required
                  id="username"
                  label="Nombre de Usuario"
                  name="username"
                  value={formValues.username || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton size="small" onClick={() => handleInputChange({ target: { name: 'username', value: '' } })}>
                          <ClearIcon fontSize="small" color="error" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  required={!currentUser}
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  value={formValues.password || ''}
                  onChange={handleInputChange}
                  helperText={currentUser ? "Dejar en blanco para no cambiar" : ""}
                  autoComplete="new-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton size="small" onClick={() => handleInputChange({ target: { name: 'password', value: '' } })}>
                          <ClearIcon fontSize="small" color="error" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={roles || []}
                  getOptionLabel={(option) => option.nombre || ''}
                  value={(roles || []).find(r => r.id === formValues.roleId) || null}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'roleId', value: newValue ? newValue.id : '' } });
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Rol"
                      required
                    />
                  )}
                  disablePortal // Buena práctica dentro de diálogos
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]}
                  getOptionLabel={(option) => option.label}
                  value={formValues.activo === 'true' ? { value: 'true', label: 'Activo' } : { value: 'false', label: 'Inactivo' }}
                  onChange={(event, newValue) => {
                    handleInputChange({ target: { name: 'activo', value: newValue ? newValue.value : 'true' } });
                  }}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Estado"
                      required
                    />
                  )}
                  disablePortal
                />
              </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
          </DialogContent>

          <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
            <StyledButton onClick={handleCloseUserModal} variant="outlined" color="secondary" sx={{ padding: '2px 12px' }}>
              Cancelar
            </StyledButton>
            <StyledButton type="submit" variant="contained">
              {currentUser ? 'Actualizar' : 'Crear'}
            </StyledButton>
          </DialogActions>
        </Box>
      </StyledDialog>

      {openPermissionModal && currentUser && (
        <PermissionManager
          open={openPermissionModal}
          onClose={handleClosePermissionModal}
          user={currentUser}
        />
      )}
    </Box>
  );
};

export default Usuarios;