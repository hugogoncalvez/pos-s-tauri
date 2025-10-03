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
            { url: '/suppliers', values: values, useApi: true },
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
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <StyledTextField
                                autoFocus
                                name="nombre"
                                label="Nombre del Proveedor"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={values.nombre || ''}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'nombre', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                name="cuit"
                                label="CUIT"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={values.cuit || ''}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'cuit', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                name="telefono"
                                label="Teléfono"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={values.telefono || ''}
                                onChange={handleInputChange}
                                InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleInputChange({ target: { name: 'telefono', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment> }}
                            />
                        </Grid>
                    </Grid>
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