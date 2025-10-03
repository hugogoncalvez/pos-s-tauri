import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    CircularProgress
} from '@mui/material';
import { StyledButton } from './ui/StyledButton';

const EditSurchargeModal = ({ open, onClose, paymentMethod, onSave, isLoading }) => {
    const [active, setActive] = useState(false);
    const [percentage, setPercentage] = useState('');

    useEffect(() => {
        if (paymentMethod) {
            setActive(paymentMethod.surcharge_active || false);
            setPercentage(paymentMethod.surcharge_percentage || '0');
        }
    }, [paymentMethod]);

    const handleSave = () => {
        const percentageValue = parseFloat(percentage);
        if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
            // Aquí podrías mostrar un error al usuario
            console.error("Porcentaje inválido");
            return;
        }
        onSave({
            id: paymentMethod.id,
            surcharge_active: active,
            surcharge_percentage: percentageValue.toFixed(2)
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Editar Recargo para: {paymentMethod?.method}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center">
                    <Grid item xs={8}>
                        <TextField
                            label="Porcentaje de Recargo (%)"
                            type="number"
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                inputProps: { min: 0, max: 100, step: "0.01" }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControlLabel
                            control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
                            label="Activo"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} variant="outlined" disabled={isLoading}>
                    Cancelar
                </StyledButton>
                <StyledButton onClick={handleSave} variant="contained" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};

export default EditSurchargeModal;
