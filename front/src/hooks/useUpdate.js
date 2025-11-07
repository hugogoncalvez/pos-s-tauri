import { Api } from "../api/api";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles'; // Importar useTheme
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';



export const Update = (key = '') => {

    const theme = useTheme(); // Inicializar useTheme

    return useMutation({
        mutationFn: updating,
        mutationKey: key,

        onSuccess: (data, variables) => {
            if (variables.showSuccessAlert !== false) {
                mostrarExito('Se ha actualizado con éxito !', theme);
            }
        },

        onError: (error) => {
            mostrarError(`Se ha producido un error, por favor vuelva a intentarlo.   :${error}`, theme);
        }
    })

}

const updating = async ({ url, id = '', datos }) => {
    await Api.put(`${url}${id}`, datos)
}
