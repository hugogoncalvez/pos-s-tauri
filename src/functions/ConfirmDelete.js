import Swal from "sweetalert2";
import { mostrarInfo } from './mostrarInfo'; // Importar la nueva función mostrarInfo

export const confirmAction = async (onConfirm, onDenied = () => {}, message = 'Está seguro que desea eliminar?', theme) => {
    return Swal.fire({
        icon: 'question',
        iconColor: theme.palette.warning.main, // Usar color del tema
        title: message, // Usar el parámetro message
        background: theme.palette.background.paper, // Usar color del tema
        color: theme.palette.text.primary, // Asegurar color de texto
        showDenyButton: true,
        confirmButtonText: 'Si',
        denyButtonText: 'No',
        customClass: {
            popup: 'swal-higher-zindex' // Clase CSS para un z-index más alto
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await onConfirm(); // Ejecuta la función que se pasa como argumento
        } else if (result.isDenied) {
            onDenied(); // Llama al callback onDenied
            mostrarInfo('Nada ha sido eliminado', theme); // Usar la función centralizada
        }
        return result;
    });
};
