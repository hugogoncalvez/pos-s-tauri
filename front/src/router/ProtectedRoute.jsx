import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, isLoading, usuario, permisos } = useContext(AuthContext);
  const location = useLocation();

  ////console.log(`[ProtectedRoute] Render. Path: ${location.pathname}, Permiso requerido: ${permission || 'N/A'}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, User: ${usuario?.username}, Permisos del usuario: ${permisos?.join(', ')}`);

  // if (isLoading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && permisos) {
    if (!permisos.includes(permission)) {

      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // //console.log(`[ProtectedRoute] Acceso permitido a ${location.pathname}.`);
  return children;
};
