import { useMemo } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UseFetchQuery } from '../hooks/useQuery'; // Keep this import
import { useSubmit } from '../hooks/useSubmit';
import { useDelete } from '../hooks/useDelete';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledButton } from '../styledComponents/ui/StyledButton';

const UserPermissionOverrideManager = ({ open, onClose, user, moduleName, associatedPermissions }) => { // Add associatedPermissions prop
  // 1. OBTENER DATOS
  const { data: allPermissions, isLoading: isLoadingAll, isError: isErrorAll } = UseFetchQuery( // <--- This was missing in previous new_string
    'allPermissions',
    '/permissions'
  );

  const { data: userPermissions, isLoading: isLoadingUser, isError: isErrorUser, refetch: refetchUserPermissions } = UseFetchQuery( // <--- This was missing in previous new_string
    ['userPermissions', user?.id],
    `/users/${user?.id}/permissions`,
    !!user?.id
  );

  const addPermission = useSubmit();
  const removePermission = useDelete();



  // 2. PROCESAR Y FILTRAR PERMISOS PARA EL MÓDULO ACTUAL
  const modulePermissions = useMemo(() => {
    if (!allPermissions || !associatedPermissions) {
      return [];
    }
    // Create a Map for efficient lookups.
    const permissionsMap = new Map(allPermissions.map(p => [p.nombre, p]));
    // Map over the correctly ordered names from the prop and retrieve the full permission object.
    // This preserves the intended order from modulePermissions.js.
    return associatedPermissions
      .map(name => permissionsMap.get(name))
      // Filter out any permissions that might not have been found in the map.
      .filter(Boolean);
  }, [allPermissions, associatedPermissions]);

  const getPermissionState = (permissionId) => {
    const userOverride = userPermissions?.userOverrides?.find(p => p.permission_id === permissionId);
    if (userOverride) {
      return userOverride.type; // 'grant' o 'revoke'
    }
    const hasRolePerm = userPermissions?.rolePermissions?.some(p => p.id === permissionId);
    if (hasRolePerm) {
      return 'inherited'; // Heredado del rol
    }
    return 'default'; // No tiene el permiso por defecto
  };

  // 3. MANEJAR CAMBIOS
  const handlePermissionChange = async (permissionId, newType) => {
    if (newType === 'grant' || newType === 'revoke') {
      await addPermission.mutateAsync({
        url: `/users/${user.id}/permissions`,
        values: { permission_id: permissionId, type: newType },
        showSuccessAlert: false,
      });
    } else { // Si es 'inherited' o 'default', significa que queremos borrar el override
      await removePermission.mutateAsync({
        url: `/users/${user.id}/permissions/${permissionId}`,
        showSuccessAlert: false,
      });
    }
    refetchUserPermissions();
  };

  if (!user) return null;

  const isLoading = isLoadingAll || isLoadingUser;

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog' }}>
        <Box>
          <Typography variant="h6">Permisos Detallados: {moduleName}</Typography>
          <Typography variant="body2" color="textSecondary">Usuario: {user.nombre} (Rol: {user.rol.nombre})</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, backgroundColor: 'background.dialog' }}>
        {isLoading && <CircularProgress />}
        {isErrorAll && <Alert severity="error">Error al cargar la lista de permisos.</Alert>}
        {isErrorUser && <Alert severity="error">Error al cargar los permisos del usuario.</Alert>}

        {!isLoading && !isErrorAll && modulePermissions.map(permission => {
          const state = getPermissionState(permission.id);
          return (
            <Box key={permission.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', py: 1 }}>
              <Box>
                <Typography>{permission.nombre}</Typography>
                <Typography variant="caption" color="textSecondary">{permission.descripcion}</Typography>
              </Box>
              <FormControl component="fieldset">
                <RadioGroup row value={state} onChange={(e) => handlePermissionChange(permission.id, e.target.value)}>
                  <Tooltip title="El permiso es otorgado por el rol del usuario. Para anularlo, selecciona 'Conceder' o 'Revocar'.">
                    <span>
                      <FormControlLabel
                        value="inherited"
                        control={<Radio />}
                        label="Heredado"
                        disabled={state !== 'inherited'}
                      />
                    </span>
                  </Tooltip>
                  <Tooltip title="Otorga este permiso al usuario, incluso si su rol no lo tiene.">
                    <FormControlLabel value="grant" control={<Radio />} label="Conceder" />
                  </Tooltip>
                  <Tooltip title="Revoca este permiso al usuario, incluso si su rol lo tiene.">
                    <FormControlLabel value="revoke" control={<Radio />} label="Revocar" />
                  </Tooltip>
                </RadioGroup>
              </FormControl>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
        <StyledButton onClick={onClose} variant="contained">
          Cerrar
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default UserPermissionOverrideManager;
