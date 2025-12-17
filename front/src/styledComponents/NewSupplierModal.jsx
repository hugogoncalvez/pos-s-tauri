import { useEffect } from 'react';
import {
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledTextField } from './ui/StyledTextField';
import { StyledButton } from './ui/StyledButton';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { useTheme } from '@mui/material/styles';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import SaveAsIcon from '@mui/icons-material/SaveAs';

// ...

export const NewSupplierModal = ({ open, handleClose, initialName = '', onSupplierAdded }) => {
    const theme = useTheme();
    const [values, handleInputChange, reset] = useForm({
        nombre: initialName,
        cuit: '',
        telefono: '',
    });

    const { mutate: createSupplier, status: createSupplierStatus } = useSubmit('createSupplier');
    const isLoading = createSupplierStatus === 'pending';

    useEffect(() => {
        if (open) {
            reset({
                nombre: initialName,
                cuit: '',
                telefono: '',
            });
        }
    }, [open, initialName, reset]);

    const handleSubmit = () => {
        if (!values.nombre || values.nombre.trim() === '') {
            mostrarError('El nombre del proveedor es obligatorio.', theme);
            return;
        }

        createSupplier(
            { url: '/suppliers', values: values },
            {
                onSuccess: (data) => {
                    mostrarExito('Proveedor creado correctamente.', theme);
                    onSupplierAdded(data); // Pasa el nuevo proveedor al componente padre
                    handleClose();
                },
                onError: (error) => {
                    console.error('Error al crear el proveedor:', error);
                    mostrarError('No se pudo crear el proveedor.', theme);
                },
            }
        );
    };
    //...

    return (
        <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                Agregar Nuevo Proveedor
                <IconButton onClick={handleClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                <Box sx={{ backgroundColor: 'background.dialog', p: 3 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: '1fr 1fr'
                            },
                            gap: 2,
                            mt: 1
                        }}
                    >
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / 3' } }}>
                            <TextFieldWithClear
                                autoFocus
                                name="nombre"
                                label="Nombre del Proveedor"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={values.nombre || ''}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'nombre', value: '' } })}
                            />
                        </Box>
                        <TextFieldWithClear
                            name="cuit"
                            label="CUIT"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={values.cuit || ''}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'cuit', value: '' } })}
                        />
                        <TextFieldWithClear
                            name="telefono"
                            label="Teléfono"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={values.telefono || ''}
                            onChange={handleInputChange}
                            onClear={() => handleInputChange({ target: { name: 'telefono', value: '' } })}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={handleClose} variant="outlined" sx={{ padding: '2px 12px' }}>
                    Cancelar
                </StyledButton>
                <StyledButton onClick={handleSubmit} disabled={isLoading} variant="contained" startIcon={isLoading ? <CircularProgress size={20} /> : <SaveAsIcon />}>
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};