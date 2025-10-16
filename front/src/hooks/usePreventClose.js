import { useEffect, useRef } from 'react';
import { info } from '@tauri-apps/plugin-log';
import { getCurrentWindow } from '@tauri-apps/api/window';

// Este hook ahora es mucho más simple. Su única responsabilidad es
// registrar un callback en el evento de cierre y mantenerlo actualizado.
export const usePreventClose = (onCloseRequest) => {
  const latestOnCloseRequest = useRef(onCloseRequest);

  useEffect(() => {
    latestOnCloseRequest.current = onCloseRequest;
  });

  useEffect(() => {
    info('[usePreventClose DEBUG] Configurando listener de cierre único.');

    const appWindow = getCurrentWindow();

    const unlistenPromise = appWindow.onCloseRequested(async (event) => {
      info('🔴 [usePreventClose DEBUG] onCloseRequested FIRED!');
      if (latestOnCloseRequest.current) {
        // Pasa el evento y la función unlisten al callback para que él decida
        await latestOnCloseRequest.current(event, unlistenPromise);
      }
    });

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);
};