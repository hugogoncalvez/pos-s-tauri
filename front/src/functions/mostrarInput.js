import Swal from "sweetalert2";

export const mostrarInput = (options, theme) => {
    return Swal.fire({
        title: options.title || 'Ingrese un valor',
        input: options.input || 'text',
        inputLabel: options.inputLabel || '',
        inputValue: options.inputValue || '',
        showCancelButton: true,
        confirmButtonText: options.confirmButtonText || 'Aceptar',
        cancelButtonText: options.cancelButtonText || 'Cancelar',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        confirmButtonColor: theme.palette.success.main,
        cancelButtonColor: theme.palette.error.main,
        inputValidator: options.inputValidator,
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '1400';
            }
            // Ejecutar el didOpen personalizado si se proporciona
            if (options.didOpen) {
                options.didOpen();
            }
            // Agregar margen al label del input
            const inputLabel = document.querySelector('.swal2-input-label');
            if (inputLabel) {
                inputLabel.style.paddingLeft = '1rem';
                inputLabel.style.textAlign = 'left';
                inputLabel.style.display = 'block';
            }
        }
    });
};