import Swal from "sweetalert2";

export const mostrarInfo = (mensaje, theme) => {
    return Swal.fire({ // <-- ADD RETURN HERE
        icon: 'info',
        title: 'Información',
        text: mensaje,
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        confirmButtonColor: theme.palette.info.main,
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400';
            }
        }
    });
};