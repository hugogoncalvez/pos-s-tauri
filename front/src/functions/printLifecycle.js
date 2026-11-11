import { getCurrentWebview } from '@tauri-apps/api/webview';
import { getCurrentWindow } from '@tauri-apps/api/window';

const isTauri = () => typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);

const removeIframe = (iframe) => {
    if (!iframe?.parentNode) return;
    try {
        iframe.parentNode.removeChild(iframe);
    } catch (error) {
        console.warn('No se pudo quitar el iframe de impresión:', error);
    }
};

const focusAppWindow = () => {
    try {
        window.focus();
    } catch (error) {
        console.warn('No se pudo enfocar la ventana:', error);
    }

    if (!isTauri()) return;
    getCurrentWindow().setFocus().catch((error) => {
        console.warn('No se pudo restaurar el foco de la ventana:', error);
    });
    getCurrentWebview().setFocus().catch((error) => {
        console.warn('No se pudo restaurar el foco del webview:', error);
    });
};

export const restoreFocusAfterPrint = () => {
    focusAppWindow();
    setTimeout(focusAppWindow, 200);
};

export const attachPrintLifecycle = (iframe) => {
    let finished = false;
    let cleaned = false;
    let cleanupTimer = null;
    let fallbackTimer = null;

    const cleanup = ({ restoreFocus = false } = {}) => {
        if (cleaned) return;
        cleaned = true;
        finished = true;
        if (cleanupTimer) clearTimeout(cleanupTimer);
        if (fallbackTimer) clearTimeout(fallbackTimer);
        window.removeEventListener('focus', handleWindowFocus);
        removeIframe(iframe);
        if (restoreFocus) restoreFocusAfterPrint();
    };

    const handlePrintFinished = () => {
        if (finished) return;
        finished = true;
        restoreFocusAfterPrint();
        cleanupTimer = setTimeout(() => cleanup(), 60000);
    };

    const handleWindowFocus = () => {
        handlePrintFinished();
    };

    try {
        iframe.contentWindow?.addEventListener('afterprint', handlePrintFinished, { once: true });
    } catch (error) {
        console.warn('No se pudo escuchar afterprint:', error);
    }

    window.addEventListener('focus', handleWindowFocus, { once: true });
    fallbackTimer = setTimeout(() => cleanup(), 180000);

    return { cleanup, restoreFocus: restoreFocusAfterPrint };
};
