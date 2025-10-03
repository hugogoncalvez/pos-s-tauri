import React, { useState, useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Alert,
    Grid,
    InputAdornment,
    IconButton,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { Clear as ClearIcon, Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { StyledDialog } from './ui/StyledDialog';
import { StyledTextField } from './ui/StyledTextField';
import { StyledButton } from './ui/StyledButton';
import { useForm } from '../hooks/useForm';
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';

const CashMovementModal = ({
    open,
    onClose,
    onSave,
    activeSessionId,
    userName,
    isSaving, // Nueva prop para el estado de carga
    theme // <-- Nueva prop
}) => {
    const [formValues, handleInputChange, reset] = useForm({
        amount: '',
        type: 'ingreso',
        description: '',
    });
    const { amount, type, description } = formValues;
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            reset();
            setError('');
        }
    }, [open, reset]);

    const handleSave = async () => { // Added async
        if (isSaving) return; // Evitar múltiples envíos

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Por favor, ingrese un monto válido y mayor que cero.');
            return;
        }

        mostrarCarga('Registrando movimiento...', theme); // Mostrar carga

        const payload = {
            cash_session_id: activeSessionId,
            amount: parseFloat(amount),
            type,
            description: description.trim() || null // Send null if description is empty
        };
        try {
            await onSave(payload); // Await the onSave call
            Swal.close(); // Cerrar carga en éxito
            onClose(); // Close the modal on success
        } catch (err) {
            Swal.close(); // Cerrar carga en error
            // El error es manejado por el componente padre que pasa onSave
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} PaperProps={{ sx: { width: 'clamp(400px, 70vw, 550px)', margin: 'auto' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog' }}>
                Registrar Movimiento de Caja
                <IconButton onClick={onClose} sx={{ color: 'error.main' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
                <Box sx={{ p: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                        Usuario: <strong>{userName}</strong> | ID de Sesión: <strong>{activeSessionId}</strong>
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Monto"
                                type="number"
                                name="amount"
                                fullWidth
                                value={amount}
                                onChange={handleInputChange}
                                variant="outlined"
                                inputProps={{ step: "0.01" }}
                                sx={{ width: 'clamp(150px, 100%, 300px)' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('amount')} size="small">
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={[{ value: 'ingreso', label: 'Ingreso' }, { value: 'egreso', label: 'Egreso' }]}
                                getOptionLabel={(option) => option.label}
                                value={type === 'ingreso' ? { value: 'ingreso', label: 'Ingreso' } : { value: 'egreso', label: 'Egreso' }}
                                onChange={(event, newValue) => {
                                    handleInputChange({ target: { name: 'type', value: newValue ? newValue.value : '' } });
                                }}
                                isOptionEqualToValue={(option, value) => option.value === value.value} // <-- FIX
                                fullWidth
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        label="Tipo de Movimiento"
                                        variant="outlined"
                                        sx={{ width: 'clamp(150px, 100%, 300px)' }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Descripción"
                                name="description"
                                fullWidth
                                multiline
                                rows={3}
                                value={description}
                                onChange={handleInputChange}
                                variant="outlined"
                                sx={{ width: 'clamp(300px, 100%, 600px)' }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}`, backgroundColor: 'background.dialog' }}>
                <StyledButton variant='outlined' onClick={onClose} disabled={isSaving}>
                    Cancelar
                </StyledButton>
                <StyledButton onClick={handleSave} variant="contained" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar Movimiento'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

CashMovementModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    activeSessionId: PropTypes.number,
    userName: PropTypes.string,
    isSaving: PropTypes.bool, // Definir la nueva prop
    theme: PropTypes.object.isRequired // <-- Nueva propType
};

export default CashMovementModal;
