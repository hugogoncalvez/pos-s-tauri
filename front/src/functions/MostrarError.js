import Swal from "sweetalert2";

export const mostrarError = (mensaje, theme) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        confirmButtonColor: theme.palette.error.main,
        timer: 1500, // Un poco más de tiempo para errores
        timerProgressBar: true,
        didOpen: () => {
            // Solución para que el Swal se muestre por encima de los modales de MUI
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400'; // z-index de Dialog es 1300
            }
        }
    });
};