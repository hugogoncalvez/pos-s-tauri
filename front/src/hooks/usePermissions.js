import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para gestionar los permisos de usuario.
 * Proporciona una forma sencilla de verificar si el usuario actual
 * tiene un permiso específico y acceder a la lista completa de permisos.
 *
 * @returns {{
 *   permisos: string[],
 *   isLoading: boolean,
 *   tienePermiso: (permisoRequerido: string) => boolean
 * }}
 */
export const usePermissions = () => {
  const context = useContext(AuthContext);

  // Asegurarse de que el hook se usa dentro del proveedor
  if (context === undefined) {
    throw new Error('usePermissions debe ser utilizado dentro de un AuthProvider');
  }

  const { permisos, isLoading } = context;

  /**
   * Verifica si el array de permisos del usuario incluye el permiso requerido.
   * Está memoizada con useCallback para optimizar el rendimiento en componentes hijos.
   * @param {string} permisoRequerido - El string del permiso a verificar (ej: 'crear_producto').
   * @returns {boolean} - `true` si el usuario tiene el permiso, `false` en caso contrario.
   */
  const tienePermiso = useCallback((permisoRequerido) => {
    //console.log(`[usePermissions] Checking permission: ${permisoRequerido}`);
    //console.log(`[usePermissions] User permissions:`, permisos);
    // console.log(`[usePermissions] isLoading: ${isLoading}`);

    if (isLoading) {
      // console.log(`[usePermissions] Returning false because isLoading is true.`);
      return false;
    }

    const hasPermission = permisos?.includes(permisoRequerido) ?? false;
    // console.log(`[usePermissions] Result for ${permisoRequerido}: ${hasPermission}`);
    return hasPermission;
  }, [permisos, isLoading]);

  return {
    permisos,
    isLoading,
    tienePermiso
  };
};
