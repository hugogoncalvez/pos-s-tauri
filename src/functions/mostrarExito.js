import Swal from "sweetalert2";

export const mostrarExito = (mensaje, theme) => {
    return Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: mensaje,
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        confirmButtonColor: theme.palette.success.main,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
            // Solución para que el Swal se muestre por encima de los modales de MUI
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400'; // z-index de Dialog es 1300
            }
        }
    });
};