import { useEffect, useRef } from 'react';
import { info } from '@tauri-apps/plugin-log';

export const usePreventClose = (checkBeforeClose, onCloseAttempt) => {
  const latestCheckBeforeClose = useRef(checkBeforeClose);
  const latestOnCloseAttempt = useRef(onCloseAttempt);
  const effectRan = useRef(false);

  useEffect(() => {
    latestCheckBeforeClose.current = checkBeforeClose;
    latestOnCloseAttempt.current = onCloseAttempt;
  });

  useEffect(() => {
    if (effectRan.current === true) {
      return;
    }

    info('[usePreventClose DEBUG] useEffect principal montado. Configurando listener...');
    let unlisten;

    const setupListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();

        unlisten = await appWindow.onCloseRequested(async (event) => {
          info('🔴 [usePreventClose DEBUG] onCloseRequested FIRED!');
          event.preventDefault();

          if (latestOnCloseAttempt.current) {
            latestOnCloseAttempt.current();
          }

          if (latestCheckBeforeClose.current) {
            try {
              const canClose = await latestCheckBeforeClose.current();
              if (canClose) {
                // Usar setTimeout para evitar una condición de carrera en Tauri
                setTimeout(() => {
                  if (unlisten) {
                    unlisten();
                  }
                  appWindow.close();
                }, 0);
              } else {
                console.log('❌ Cierre cancelado por el usuario');
              }
            } catch (error) {
              console.error('Error al verificar cierre:', error);
            }
          } else {
            // Desactivar también aquí por si acaso.
            if (unlisten) {
              unlisten();
            }
            await appWindow.close();
          }
        });

        console.log('✅ Listener de cierre configurado.');
      } catch (error) {
        console.log('ℹ️ No es entorno Tauri, listener no configurado', error);
      }
    };

    setupListener();
    effectRan.current = true;

    return () => {
      if (unlisten) {
        unlisten();
        console.log('🧹 Listener de cierre eliminado.');
      }
    };
  }, []);
};
