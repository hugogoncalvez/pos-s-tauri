import { useState, useEffect } from 'react';
import {
    Autocomplete,
    Box,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledTextField } from './ui/StyledTextField';
import { StyledButton } from './ui/StyledButton';
import { useTheme } from '@mui/material/styles';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from '../hooks/useForm';
import { useSubmit } from '../hooks/useSubmit';
import { UseFetchQuery } from '../hooks/useQuery';
import { mostrarError } from '../functions/MostrarError';
import validator from 'validator';

export const NewProductModal = ({ open, handleClose, onProductAdded, initialName = '' }) => {
    const theme = useTheme();
    const [values, handleInputChange, reset, , setValues] = useForm({ name: initialName });
    const { data: categories } = UseFetchQuery('categories', '/category', true, 2 * 60 * 1000);
    const { data: units } = UseFetchQuery('units', '/units', true, 2 * 60 * 1000);
    const { mutate: newProductStock, status: isStatusStock } = useSubmit('newProductStock');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (open) {
            setValues({ name: initialName, description: '', barcode: '', category_id: '', units_id: '', stock: 0, cost: '', price: '', min_stock: 0 });
        }
    }, [open, initialName, setValues]);

    useEffect(() => {
        setGuardando(isStatusStock === 'pending');
    }, [isStatusStock]);

    const handleSave = () => {
        const { cost, description, name, stock, category_id, units_id, price } = values;

        const camposRequeridos = { cost, description, name, stock, category_id, units_id, price };
        const camposValidos = Object.values(camposRequeridos).every(campo =>
            campo !== undefined && campo !== null && !validator.isEmpty(campo.toString(), { ignore_whitespace: true })
        );

        if (!camposValidos) {
            mostrarError('Por favor, complete todos los campos requeridos.', theme);
            return;
        }

        newProductStock(
            { url: '/stock', values },
            {
                onSuccess: (newProduct) => {
                    onProductAdded(newProduct.data);
                    reset();
                    handleClose();
                },
                onError: (error) => {
                    console.error('Error al guardar el producto:', error);
                    mostrarError('Hubo un error al guardar el producto. Verifique que el nombre no esté repetido.', theme);
                }
            }
        );
    };

    const handleCancel = () => {
        reset();
        handleClose();
    };

    return (
        <StyledDialog fullWidth maxWidth="md" open={open} onClose={handleCancel}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                Agregar Nuevo Producto
                <IconButton onClick={handleCancel}><CloseIcon color="error" /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                <Box sx={{ backgroundColor: 'background.dialog', color: 'text.primary', p: 3 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField autoFocus name="name" label="Nombre del Producto" fullWidth value={values.name || ''} onChange={handleInputChange} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('name')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="description" label="Descripción" fullWidth value={values.description || ''} onChange={handleInputChange} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('description')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="barcode" label="Código de Barras" fullWidth type="number" onInput={(e) => { e.target.value = (e.target.value).toString().slice(0, 13) }} value={values.barcode || ''} onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('barcode')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Autocomplete
                                options={categories || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={categories?.find(option => option.id === values.category_id) || null}
                                onChange={(event, newValue) => handleInputChange({ target: { name: 'category_id', value: newValue ? newValue.id : '' } })}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        label="Categoría"
                                        fullWidth
                                        required
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton onClick={() => handleInputChange({ target: { name: 'category_id', value: '' } })}>
                                                        <ClearIcon color="error" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <Autocomplete
                                options={units || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={units?.find(option => option.id === values.units_id) || null}
                                onChange={(event, newValue) => handleInputChange({ target: { name: 'units_id', value: newValue ? newValue.id : '' } })}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        label="Unidad de Medida"
                                        fullWidth
                                        required
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton onClick={() => handleInputChange({ target: { name: 'units_id', value: '' } })}>
                                                        <ClearIcon color="error" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="stock" label="Stock Inicial" type="number" fullWidth value={values.stock || ''} onChange={handleInputChange} required helperText="Este será el stock inicial."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('stock')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="cost" label="Precio de Costo" type="number" fullWidth value={values.cost || ''} onChange={handleInputChange} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('cost')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="price" label="Precio de Venta" type="number" fullWidth value={values.price || ''} onChange={handleInputChange} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('price')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={4} lg={3}>
                            <StyledTextField name="min_stock" label="Stock Mínimo" type="number" fullWidth value={values.min_stock || ''} onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton onClick={() => reset('min_stock')}>
                                                <ClearIcon color="error" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton onClick={handleCancel} color="error" startIcon={<ClearIcon />}>Cancelar</StyledButton>
                <StyledButton onClick={handleSave} variant="contained" disabled={guardando} startIcon={guardando ? <CircularProgress size={20} /> : <SaveAsIcon />}>Guardar</StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};
