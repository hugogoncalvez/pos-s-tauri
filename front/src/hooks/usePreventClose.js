import { useEffect } from 'react';

/**
 * Hook para prevenir el cierre de la ventana si hay condiciones pendientes
 * @param {Function} checkBeforeClose - Función async que devuelve true si se puede cerrar
 * @param {Function} onCloseAttempt - Callback cuando se intenta cerrar (opcional)
 */
export const usePreventClose = (checkBeforeClose, onCloseAttempt) => {
  useEffect(() => {
    if (!checkBeforeClose) {
      console.log('ℹ️ No hay checkBeforeClose, saltando configuración');
      return;
    }

    let unlisten;

    const setupListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        console.log('✅ Módulo Tauri cargado correctamente');
        const appWindow = getCurrentWindow();

        unlisten = await appWindow.onCloseRequested(async (event) => {
          console.log('🔴 ¡INTENTO DE CERRAR DETECTADO!');
          event.preventDefault();

          if (onCloseAttempt) {
            onCloseAttempt();
          }

          try {
            const canClose = await checkBeforeClose();
            console.log('✅ canClose:', canClose);

            if (canClose) {
              console.log('🟢 Cerrando aplicación con exit...');
              const { exit } = await import('@tauri-apps/plugin-process');
              await exit(0);
            } else {
              console.log('❌ Cierre cancelado por el usuario');
            }
          } catch (error) {
            console.error('Error al verificar cierre:', error);
          }
        });

        console.log('✅ Listener de cierre configurado');
      } catch (error) {
        console.log('ℹ️ No es entorno Tauri, listener no configurado');
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
        console.log('🧹 Listener de cierre eliminado');
      }
    };
  }, [checkBeforeClose, onCloseAttempt]);
};