import { useMemo } from 'react';

/**
 * Hook para detectar si la app se está ejecutando en Tauri o Web.
 */
export function useIsTauri() {
  const isTauri = useMemo(() => {
    // --- PASO DE DEPURACIÓN --- 
    // Imprimir todo el objeto import.meta.env para ver qué contiene.
    console.log('[useIsTauri - DEBUG] Contenido de import.meta.env:', import.meta.env);

    const tauriDetected = !!import.meta.env.TAURI_PLATFORM;

    if (import.meta.env.MODE === 'development') {
      console.log(`[useIsTauri] Verificación por variable de entorno -> TAURI_PLATFORM: '${import.meta.env.TAURI_PLATFORM}' | isTauri: ${tauriDetected}`);
    }

    return tauriDetected;
  }, []);

  return { isTauri };
}
