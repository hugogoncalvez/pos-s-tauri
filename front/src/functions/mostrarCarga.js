import Swal from "sweetalert2";

export const mostrarCarga = (title = 'Cargando...', theme) => {
    Swal.fire({
        title: title,
        text: 'Por favor, espere...',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
            // Solución para que el Swal se muestre por encima de los modales de MUI
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400'; // z-index de Dialog es 1300
            }
        }
    });
};