import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar de forma fiable si la aplicación se está ejecutando en un entorno Tauri.
 * @returns {boolean} - Devuelve `true` si está en Tauri, de lo contrario `false`.
 */
export const useIsTauri = () => {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Verificar si window.__TAURI__ existe
    // Este objeto global es inyectado automáticamente por Tauri
    const tauriGlobal = typeof window !== 'undefined' ? window.__TAURI__ : undefined;
    console.log('DEBUG: window.__TAURI__ is', tauriGlobal); // ADD THIS LINE
    setIsTauri(!!tauriGlobal);
  }, []);

  return isTauri;
};
