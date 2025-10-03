import { Api } from "../api/api";
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles'; // Importar useTheme
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import axios from "axios";



export const useDelete = (key = '') => {

    const theme = useTheme(); // Inicializar useTheme

    return useMutation({
        mutationFn: deletion,
        mutationKey: key,
        // onSettled: () => {
        //     (key !== 'DelNota') ? queryClient.invalidateQueries({ queryKey: ['ATemps'] }) : null
        // },
        onSuccess: () => {
            mostrarExito('Se ha eliminado con éxito !', theme);
        },
        onError: () => {
            mostrarError(`Se ha producido un error, vuelva a intentarlo por favor.`, theme);
        },
        retry: 2

    })

}

const deletion = async ({ url, id, useApi = true }) => {
    useApi ? await Api.delete(`${url}${id}`) : await axios.delete(`https://api.cloudinary.com/v1_1/dsxtxleqw/image/destroy/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 826268339186942`
        }
    });
    //await Api.delete(`${url}${id}`)
}