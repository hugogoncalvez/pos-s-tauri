import { useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
    CircularProgress
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledTextField } from './ui/StyledTextField';
import { StyledButton } from './ui/StyledButton';
import { useForm } from '../hooks/useForm';
import CloseIcon from '@mui/icons-material/Close';

const PaymentMethodModal = ({ open, onClose, onSave, isLoading, method }) => {
    const [values, handleInputChange, resetForm, , setValues] = useForm(method || {});

    useEffect(() => {
        if (open) { // Only run when modal opens or method changes
            if (method) {
                setValues(method);
            } else {
                setValues({}); // Explicitly set to empty object for new method
            }
        }
    }, [method, open, setValues]);

    const handleSubmit = () => {
        // Aquí puedes agregar validación antes de guardar
        onSave(values);
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                {method ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ backgroundColor: 'background.dialog' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <StyledTextField
                            autoFocus
                            name="method"
                            label="Nombre del Método"
                            value={values?.method || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            name="description"
                            label="Descripción"
                            value={values?.description || ''}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={onClose} variant="outlined" color="secondary">Cancelar</StyledButton>
                <StyledButton onClick={handleSubmit} variant="contained" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default PaymentMethodModal;
