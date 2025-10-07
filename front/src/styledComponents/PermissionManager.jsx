import { useEffect, useState, useMemo } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormGroup,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import { VpnKey as VpnKeyIcon, Close as CloseIcon } from '@mui/icons-material';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import UserPermissionOverrideManager from './UserPermissionOverrideManager.jsx';
import modulePermissions from '../../../back/config/modulePermissions';

const PermissionManager = ({ open, onClose, user }) => {
  const [openGranularModal, setOpenGranularModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // 1. OBTENER DATOS
  const { data: landingElements, isLoading: isLoadingElements, isError: isErrorElements } = UseFetchQuery(
    'landingElements',
    '/elements',
    open
  );

  const { data: userPermissions, isLoading: isLoadingUserPerms, isError: isErrorUserPerms, refetch: refetchUserPermissions } = UseFetchQuery(
    ['userPermissions', user?.id],
    `/users/${user?.id}/permissions`,
    !!user?.id && open
  );

  const { data: allPermissions, isLoading: isLoadingAllPerms, isError: isErrorAllPerms } = UseFetchQuery(
    'allPermissions',
    '/permissions',
    open
  );

  const updateModule = useSubmit('updateUserModule');

  useEffect(() => {
    if (open && user?.id) {
      refetchUserPermissions();
    }
  }, [open, user, refetchUserPermissions]);



  // 2. MANEJAR CAMBIOS
  const handleModuleChange = async (moduleName, isActive) => {
    await updateModule.mutateAsync({
      url: `/users/${user.id}/modules`,
      values: { module: moduleName, active: isActive },
      showSuccessAlert: true,
      toastSuccess: true,
      successMessage: `Módulo '${moduleName}' ${isActive ? 'concedido' : 'revocado'} para ${user.nombre}.`
    });
    refetchUserPermissions();
  };

  // 3. LÓGICA PARA DETERMINAR PERMISOS
  const hasPermission = useMemo(() => {
    if (!userPermissions || !allPermissions) return () => false;

    const rolePermissionIds = new Set(userPermissions.rolePermissions?.map(p => p.id) || []);
    const finalPermissionIds = new Set(rolePermissionIds);

    userPermissions.userOverrides?.forEach(override => {
      if (override.type === 'grant') {
        finalPermissionIds.add(override.permission_id);
      } else if (override.type === 'revoke') {
        finalPermissionIds.delete(override.permission_id);
      }
    });

    return (permissionName) => {
      if (!permissionName) return false; // Modules without a required permission should be visible
      const permission = allPermissions.find(p => p.nombre === permissionName);
      if (!permission) return false;
      return finalPermissionIds.has(permission.id);
    };
  }, [userPermissions, allPermissions]);

  const isLoading = isLoadingElements || isLoadingUserPerms || isLoadingAllPerms;
  const isError = isErrorElements || isErrorUserPerms || isErrorAllPerms;

  if (!user) return null;

  return (
    <>
      <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKeyIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Módulos para el Usuario:</Typography>
            <Typography component="span" color="primary" variant="h6" sx={{ ml: 1 }}>{user.nombre}</Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, backgroundColor: 'background.dialog' }}>
          {isLoading && <CircularProgress />}
          {isError && <Alert severity="error">Error al cargar la configuración de módulos.</Alert>}

          {!isLoading && !isError && landingElements && (
            <FormGroup>
              {landingElements.sort((a, b) => a.orden - b.orden).map((element) => (
                <Tooltip key={element.id} title={`Activa o desactiva el acceso a ${element.nombre} y todos sus permisos asociados.`} placement="right">
                  <FormControlLabel
                    control={<Switch checked={hasPermission(modulePermissions[element.nombre]?.vista)} onChange={(e) => handleModuleChange(element.nombre, e.target.checked)} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                          {element.nombre}
                        </Typography>
                        {modulePermissions[element.nombre] && (
                          <Tooltip title="Ver y gestionar permisos detallados">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedModule(element.nombre); setOpenGranularModal(true); }}>
                              <VpnKeyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      py: 1,
                      mx: 0,
                      width: '100%',
                      justifyContent: 'space-between',
                      '& .MuiFormControlLabel-label': {
                        fontWeight: 500,
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </FormGroup>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
          <StyledButton onClick={onClose} variant="contained">
            Cerrar
          </StyledButton>
        </DialogActions>
      </StyledDialog>
      {openGranularModal && (
        <UserPermissionOverrideManager
          open={openGranularModal}
          onClose={() => setOpenGranularModal(false)}
          user={user}
          moduleName={selectedModule}
          associatedPermissions={modulePermissions[selectedModule]?.acciones.concat(modulePermissions[selectedModule]?.vista || [])}
        />
      )}
    </>
  );
};

export default PermissionManager;