import { Api } from "../api/api";
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles'; // Importar useTheme
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import axios from "axios";


const performSubmission = async ({ url, values, isFormData = false, method = 'post' }) => {
    try {
        let response;
        if (isFormData) {
            // For FormData, always use POST or PUT, depending on the method
            if (method === 'put') {
                response = await axios.put(url, values, { headers: {} });
            } else {
                response = await axios.post(url, values, { headers: {} });
            }
        } else {
            switch (method) {
                case 'post':
                    response = await Api.post(url, values);
                    break;
                case 'put':
                    response = await Api.put(url, values);
                    break;
                case 'patch':
                    response = await Api.patch(url, values);
                    break;
                case 'delete':
                    response = await Api.delete(url, { data: values }); // For DELETE with body
                    break;
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`);
            }
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || error;
    }
};

export const useSubmit = (mutationKey) => {
    const theme = useTheme(); // Inicializar useTheme

    return useMutation({
        mutationFn: ({ url, values, isFormData = false, method = 'post' }) => performSubmission({ url, values, isFormData, method }),
        mutationKey: [mutationKey],
        retry: 3,
        retryDelay: 1000,
        onSuccess: (data, variables) => { // Recibir 'variables'
            // Solo mostrar la alerta si showSuccessAlert no es explícitamente false
            if (variables.showSuccessAlert !== false) {
                mostrarExito('Operación realizada con éxito!', theme);
            }
        },
        onError: (error) => {
            const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
            mostrarError(`Se ha producido un error: ${errorMessage}`, theme);
        }
    });
};

