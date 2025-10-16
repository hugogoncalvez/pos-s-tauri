import Swal from "sweetalert2";

export const mostrarConfirmacion = (options, theme) => {
    let htmlContent = options.html || options.text || 'Esta acción no se puede revertir.';

    if (options.stockInfo !== undefined) {
        htmlContent += `<p>Stock Disponible: <strong>${options.stockInfo}</strong></p>`;
    }

    return Swal.fire({
        title: options.title || '¿Estás seguro?',
        html: htmlContent,
        icon: options.icon || 'warning',
        showCancelButton: true,
        confirmButtonColor: theme.palette.success.main,
        cancelButtonColor: theme.palette.error.main,
        confirmButtonText: options.confirmButtonText || 'Sí, continuar',
        cancelButtonText: options.cancelButtonText || 'No, cancelar',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        reverseButtons: true,
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400'; // Un z-index más alto que el modal de MUI (1300)
            }
        }
    });
};