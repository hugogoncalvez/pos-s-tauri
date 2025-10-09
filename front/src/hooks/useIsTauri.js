import { useState, useEffect } from 'react';
import { isTauri } from '@tauri-apps/api/core';

/**
 * Hook para detectar si la app se está ejecutando en Tauri o Web.
 * Utiliza el método asíncrono oficial de @tauri-apps/api para la máxima fiabilidad
 * tanto en modo de desarrollo como en producción.
 */
export function useIsTauri() {
  const [isTauriEnv, setIsTauriEnv] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkTauri = async () => {
      try {
        const result = await isTauri();
        if (isMounted) {
          setIsTauriEnv(result);
        }
      } catch (error) {
        console.error("Error al verificar el entorno de Tauri:", error);
        if (isMounted) {
          setIsTauriEnv(false);
        }
      }
    };

    checkTauri();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isTauri: isTauriEnv, isLoading: isTauriEnv === null };
}