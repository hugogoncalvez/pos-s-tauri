import React, { useEffect } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    CircularProgress,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveAsIcon from '@mui/icons-material/SaveAs';

import { StyledDialog } from './ui/StyledDialog';
import { StyledTextField } from './ui/StyledTextField';
import { StyledButton } from './ui/StyledButton';
import { StyledAutocomplete } from './ui/StyledAutocomplete';

import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { Update } from '../hooks/useUpdate';
import { mostrarError } from '../functions/MostrarError';
import { useTheme } from '@mui/material/styles';

const emissionTypeOptions = [
    { value: 'CONTROLADOR_FISCAL', label: 'Controlador Fiscal' },
    { value: 'FACTURA_ELECTRONICA', label: 'Factura Electrónica' }
];

const modeOptions = [
    { value: 'SIMULADOR', label: 'Simulador' },
    { value: 'PRODUCCION', label: 'Producción' }
];

const PointOfSaleModal = ({ open, onClose, pointOfSale = null, onSaveSuccess }) => {
    const theme = useTheme();
    const [formValues, handleInputChange, resetForm, , setValues] = useForm({});

    const createMutation = useSubmit('createPointOfSale');
    const updateMutation = Update('updatePointOfSale');

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    useEffect(() => {
        if (open) {
            if (pointOfSale) {
                setValues({
                    id: pointOfSale.id,
                    name: pointOfSale.name,
                    emission_type: pointOfSale.emission_type,
                    mode: pointOfSale.mode,
                    address: pointOfSale.address,
                    is_enabled: pointOfSale.is_enabled
                });
            } else {
                resetForm();
            }
        }
    }, [open, pointOfSale, setValues, resetForm]);

    const handleSave = () => {
        if (!formValues.id || !formValues.name || !formValues.emission_type || !formValues.mode) {
            mostrarError('Por favor, complete todos los campos requeridos.', theme);
            return;
        }

        const payload = {
            ...formValues,
            id: parseInt(formValues.id, 10), // Ensure ID is an integer
            is_enabled: formValues.is_enabled ?? true // Default to true if not set
        };

        if (pointOfSale) {
            updateMutation.mutate(
                { url: `/fiscal/points-of-sale/${pointOfSale.id}`, datos: payload },
                {
                    onSuccess: () => {
                        onSaveSuccess();
                        onClose();
                    },
                    onError: (error) => {
                        mostrarError(error.message || 'Error al actualizar el punto de venta.', theme);
                    }
                }
            );
        } else {
            createMutation.mutate(
                { url: '/fiscal/points-of-sale', values: payload },
                {
                    onSuccess: () => {
                        onSaveSuccess();
                        onClose();
                    },
                    onError: (error) => {
                        mostrarError(error.message || 'Error al crear el punto de venta.', theme);
                    }
                }
            );
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                {pointOfSale ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, backgroundColor: 'background.paper' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="ID Punto de Venta"
                            name="id"
                            type="number"
                            value={formValues.id || ''}
                            onChange={handleInputChange}
                            required
                            disabled={!!pointOfSale} // Disable ID editing for existing points of sale
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Nombre"
                            name="name"
                            value={formValues.name || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledAutocomplete
                            options={emissionTypeOptions}
                            getOptionLabel={(option) => option.label}
                            value={emissionTypeOptions.find(opt => opt.value === formValues.emission_type) || null}
                            onChange={(e, newValue) => handleInputChange({ target: { name: 'emission_type', value: newValue ? newValue.value : '' } })}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <StyledTextField {...params} label="Tipo de Emisión" required />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledAutocomplete
                            options={modeOptions}
                            getOptionLabel={(option) => option.label}
                            value={modeOptions.find(opt => opt.value === formValues.mode) || null}
                            onChange={(e, newValue) => handleInputChange({ target: { name: 'mode', value: newValue ? newValue.value : '' } })}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <StyledTextField {...params} label="Modo (Simulador/Producción)" required />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Dirección (opcional)"
                            name="address"
                            value={formValues.address || ''}
                            onChange={handleInputChange}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledAutocomplete
                            options={[{ value: true, label: 'Habilitado' }, { value: false, label: 'Deshabilitado' }]}
                            getOptionLabel={(option) => option.label}
                            value={[{ value: true, label: 'Habilitado' }, { value: false, label: 'Deshabilitado' }].find(opt => opt.value === formValues.is_enabled) || null}
                            onChange={(e, newValue) => handleInputChange({ target: { name: 'is_enabled', value: newValue ? newValue.value : false } })}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <StyledTextField {...params} label="Estado" required />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={onClose} color="error" startIcon={<CloseIcon />}>Cancelar</StyledButton>
                <StyledButton onClick={handleSave} variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : <SaveAsIcon />}>
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default PointOfSaleModal;
