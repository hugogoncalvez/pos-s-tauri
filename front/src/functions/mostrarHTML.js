import Swal from "sweetalert2";

export const mostrarHTML = (options, theme) => {
    return Swal.fire({
        title: options.title || 'Información',
        html: options.html || '',
        icon: options.icon || 'info',
        confirmButtonText: options.confirmButtonText || 'Cerrar',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        confirmButtonColor: theme.palette.primary.main,
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400'; // Un z-index más alto que los modales de MUI
            }
        }
    });
};
