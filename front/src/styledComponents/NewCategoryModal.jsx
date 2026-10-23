/**
 * NewCategoryModal
 * Modal para crear una nueva categoría de producto rápidamente
 * desde el formulario de carga de producto.
 * Recibe `initialName` para pre-rellenar el nombre que el usuario escribió,
 * y llama a `onCategoryAdded` con la categoría creada al guardar.
 */
import { useEffect } from 'react';
import {
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { useTheme } from '@mui/material/styles';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import CloseIcon from '@mui/icons-material/Close';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { TextFieldWithClear } from './ui/TextFieldWithClear';

export const NewCategoryModal = ({ open, handleClose, initialName = '', onCategoryAdded }) => {
    const theme = useTheme();
    const [values, handleInputChange, reset] = useForm({
        name: initialName,
        description: '',
    });

    const { mutate: createCategory, status: createCategoryStatus } = useSubmit('createCategory');
    const isLoading = createCategoryStatus === 'pending';

    useEffect(() => {
        if (open) {
            reset({
                name: initialName,
                description: '',
            });
        }
    }, [open, initialName, reset]);

    const handleSubmit = () => {
        if (!values.name || values.name.trim() === '') {
            mostrarError('El nombre de la categoría es obligatorio.', theme);
            return;
        }

        createCategory(
            { url: '/category', values: values },
            {
                onSuccess: (data) => {
                    mostrarExito('Categoría creada correctamente.', theme);
                    onCategoryAdded(data);
                    handleClose();
                },
                onError: (error) => {
                    const msg = error?.response?.data?.message || 'No se pudo crear la categoría.';
                    mostrarError(msg, theme);
                },
            }
        );
    };

    return (
        <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                Agregar Nueva Categoría
                <IconButton onClick={handleClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                <Box sx={{ backgroundColor: 'background.dialog', p: 3 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr' },
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        <TextFieldWithClear
                            autoFocus
                            name="name"
                            label="Nombre de la Categoría"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={values.name || ''}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'name', value: '' } })}
                        />
                        <TextFieldWithClear
                            name="description"
                            label="Descripción (opcional)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={values.description || ''}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'description', value: '' } })}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={handleClose} variant="outlined" sx={{ padding: '2px 12px' }}>
                    Cancelar
                </StyledButton>
                <StyledButton
                    onClick={handleSubmit}
                    disabled={isLoading}
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SaveAsIcon />}
                >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};
