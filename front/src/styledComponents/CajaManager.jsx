import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    DialogTitle, DialogContent, DialogActions, Typography, Box,
    CircularProgress, Alert, IconButton, useTheme, InputAdornment
} from '@mui/material';
import {
    PointOfSale as CashRegisterIcon,
    Money as MoneyIcon,
    Close as CloseIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { mostrarExito } from '../functions/mostrarExito'; // Import mostrarExito
import { mostrarError } from '../functions/MostrarError'; // Import mostrarError
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { StyledTextField } from './ui/StyledTextField';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';

export const CajaManager = ({ open, onClose, userId, activeSession = null }) => {
    const theme = useTheme();
    const [formValues, handleInputChange, resetForm] = useForm({ openingAmount: '' });
    const [error, setError] = useState('');
    const openingAmountInputRef = useRef(null);

    // Usamos el hook para la mutación
    const { mutateAsync: openSession, isLoading, error: submitError } = useSubmit();

    useEffect(() => {
        if (open) {
            // Resetear todos los estados al abrir
            resetForm();
            setError('');
            // Enfocar el campo de monto después de que el diálogo se abra
            setTimeout(() => {
                if (openingAmountInputRef.current) {
                    openingAmountInputRef.current.focus();
                }
            }, 300);

        }
    }, [open, resetForm]);

    useEffect(() => {
        if (submitError) {
            const errorMessage = submitError.response?.data?.error || 'Error al abrir la sesión de caja';
            setError(errorMessage);
        }
    }, [submitError]);

    const handleOpenSession = async () => {
        const { openingAmount } = formValues;
        if (!openingAmount || parseFloat(openingAmount) < 0) {
            return setError('Debe ingresar un monto inicial válido'); // This is not a Swal.fire
        }

        mostrarCarga('Abriendo caja...', theme);

        try {
            const response = await openSession({
                url: '/cash-sessions/open',
                values: {
                    user_id: userId,
                    opening_amount: parseFloat(openingAmount)
                }
            });
            Swal.close();
            mostrarExito('La sesión de caja se ha abierto correctamente', theme);

            if (response && response.session) {
                try {
                    await db.active_cash_session.clear();
                    await db.active_cash_session.put(response.session);
                    console.log('[CashSession] Sesión guardada en Dexie:', response.session);
                } catch (e) {
                    console.error('[CashSession] Error guardando session en Dexie:', e);
                }
            }

            onClose(true); // Indicar que la sesión se abrió con éxito
        } catch (err) {
            Swal.close();
            const errorMessage = err.response?.data?.error || 'Error al abrir la sesión de caja';
            mostrarError(errorMessage, theme);
            onClose(false); // Indicar que la sesión no se abrió
        }
    };

    const renderOpenCashView = () => (
        <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 1, color: 'info.main' }} />
                    Abrir Nueva Caja
                </Box>
                <IconButton sx={{ color: 'error.main' }} onClick={() => onClose(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Para comenzar a trabajar, ingrese el monto inicial para la nueva sesión de caja.
                </Alert>
                <StyledTextField
                    fullWidth
                    label="Monto Inicial"
                    type="number"
                    name="openingAmount"
                    value={formValues.openingAmount || ''}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton onClick={() => resetForm('openingAmount')}><ClearIcon color="error" /></IconButton>
                                <Typography sx={{ mr: 1 }}>$</Typography>
                            </InputAdornment>
                        )
                    }}
                    inputRef={openingAmountInputRef}
                    required
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    📅 Fecha: {moment().format('DD/MM/YYYY HH:mm')}
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <StyledButton variant='outlined' onClick={() => onClose(false)} color="error">Cancelar</StyledButton>
                <StyledButton
                    onClick={handleOpenSession}
                    variant="contained"
                    disabled={isLoading || !formValues.openingAmount}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <CashRegisterIcon />}
                >
                    {isLoading ? 'Abriendo...' : 'Abrir Caja'}
                </StyledButton>
            </DialogActions>
        </>
    );

    return (
        <StyledDialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
            {activeSession ? null : renderOpenCashView()}
        </StyledDialog>
    );
};

CajaManager.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.number,
    activeSession: PropTypes.object
};
