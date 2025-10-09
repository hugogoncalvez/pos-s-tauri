import { useMemo } from 'react';

/**
 * Hook para detectar si la app se está ejecutando en Tauri o Web.
 * Se basa en la variable de entorno TAURI_ENV_PLATFORM inyectada por el proceso de build de Tauri.
 */
export function useIsTauri() {
  const { isTauri } = useMemo(() => {
    const tauriDetected = !!import.meta.env.TAURI_ENV_PLATFORM;
    return { isTauri: tauriDetected };
  }, []);

  return { isTauri };
}
