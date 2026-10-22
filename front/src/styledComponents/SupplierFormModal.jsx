import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    IconButton,
    Grid,
    Typography,
    Divider,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { useTheme } from '@mui/material/styles';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';

const emptySupplier = {
    nombre: '',
    cuit: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto: '',
    condiciones_pago: '',
    notas: '',
    activo: true,
    initial_debt: '',
    initial_debt_notes: '',
    initial_debt_date: ''
};

export const SupplierFormModal = ({ open, onClose, supplier = null, onSaved }) => {
    const theme = useTheme();
    const [formData, handleInputChange, reset, , setFormData] = useForm(emptySupplier);
    const { mutateAsync, isPending } = useSubmit('saveSupplier');

    useEffect(() => {
        if (!open) return;
        if (supplier) {
            setFormData({
                nombre: supplier.nombre || '',
                cuit: supplier.cuit || '',
                telefono: supplier.telefono || '',
                email: supplier.email || '',
                direccion: supplier.direccion || '',
                contacto: supplier.contacto || '',
                condiciones_pago: supplier.condiciones_pago || '',
                notas: supplier.notas || '',
                activo: supplier.activo === true || supplier.activo === 1,
                initial_debt: supplier.initial_debt ?? '',
                initial_debt_notes: supplier.initial_debt_notes || '',
                initial_debt_date: supplier.initial_debt_date || ''
            });
        } else {
            reset(emptySupplier);
        }
    }, [open, supplier, reset, setFormData]);

    const handleSubmit = async () => {
        if (!String(formData.nombre || '').trim()) {
            mostrarError('El nombre del proveedor es obligatorio.', theme);
            return;
        }

        const payload = {
            ...formData,
            initial_debt: formData.initial_debt === '' ? 0 : Number(formData.initial_debt),
            initial_debt_date: formData.initial_debt_date || null
        };

        try {
            const saved = await mutateAsync({
                url: supplier ? `/suppliers/${supplier.id}` : '/suppliers',
                values: payload,
                method: supplier ? 'put' : 'post',
                showSuccessAlert: false
            });
            mostrarExito(supplier ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.', theme);
            onSaved?.(saved);
            onClose?.();
        } catch {
            return;
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                <IconButton onClick={onClose}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                <Box sx={{ backgroundColor: 'background.dialog', p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                            <TextFieldWithClear
                                autoFocus
                                name="nombre"
                                label="Nombre *"
                                fullWidth
                                value={formData.nombre}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'nombre', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        checked={Boolean(formData.activo)}
                                        onChange={(event) => handleInputChange({ target: { name: 'activo', value: event.target.checked } })}
                                    />
                                )}
                                label="Activo"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="cuit"
                                label="CUIT"
                                fullWidth
                                value={formData.cuit}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'cuit', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="telefono"
                                label="Teléfono"
                                fullWidth
                                value={formData.telefono}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'telefono', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="email"
                                label="Email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'email', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="contacto"
                                label="Persona de contacto"
                                fullWidth
                                value={formData.contacto}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'contacto', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldWithClear
                                name="direccion"
                                label="Dirección"
                                fullWidth
                                value={formData.direccion}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'direccion', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="condiciones_pago"
                                label="Condiciones de pago"
                                fullWidth
                                value={formData.condiciones_pago}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'condiciones_pago', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="initial_debt"
                                label="Deuda inicial"
                                type="number"
                                fullWidth
                                value={String(formData.initial_debt ?? '')}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'initial_debt', value: '' } })}
                                inputProps={{ min: 0, step: '0.01' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextFieldWithClear
                                name="initial_debt_date"
                                label="Fecha de deuda inicial"
                                type="date"
                                fullWidth
                                value={formData.initial_debt_date || ''}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                onClear={() => handleInputChange({ target: { name: 'initial_debt_date', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldWithClear
                                name="initial_debt_notes"
                                label="Notas de deuda inicial"
                                fullWidth
                                multiline
                                minRows={2}
                                value={formData.initial_debt_notes}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'initial_debt_notes', value: '' } })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Notas internas
                            </Typography>
                            <TextFieldWithClear
                                name="notas"
                                label="Notas"
                                fullWidth
                                multiline
                                minRows={3}
                                value={formData.notas}
                                onChange={handleInputChange}
                                onClear={() => handleInputChange({ target: { name: 'notas', value: '' } })}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={onClose} variant="outlined" sx={{ padding: '2px 12px' }}>
                    Cancelar
                </StyledButton>
                <StyledButton
                    onClick={handleSubmit}
                    disabled={isPending}
                    variant="contained"
                    startIcon={isPending ? <CircularProgress size={20} /> : <SaveAsIcon />}
                >
                    {isPending ? 'Guardando...' : 'Guardar'}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

SupplierFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    supplier: PropTypes.object,
    onSaved: PropTypes.func
};
