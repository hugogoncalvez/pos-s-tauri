import React, { useEffect, useCallback } from 'react';
import {
  Grid,
  InputAdornment,
  Box,
  Typography,
  Chip,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Person as PersonIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { StyledButton } from './ui/StyledButton';
import { StyledCard } from './ui/StyledCard';
import { useForm } from '../hooks/useForm';

const CustomerModalContent = ({
  customer,
  onSaveCustomer,
  onCancel,
  dialogMode,
  isLoadingSingleCustomer,
  dniExistsError,
  emailExistsError,
  checkDuplicate
}) => {
  const theme = useTheme();
  const [formData, handleInputChange, resetForm, _resetArray, setFormDataLocal] = useForm({});

  useEffect(() => {
    if (customer && (dialogMode === 'edit' || dialogMode === 'view')) {
      setFormDataLocal({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        dni: customer.dni || '',
        discount_percentage: customer.discount_percentage || 0,
        credit_limit: customer.credit_limit || 0,
        debt: customer.debt || 0
      });
    } else if (dialogMode === 'create') {
      setFormDataLocal({
        name: '',
        email: '',
        phone: '',
        address: '',
        dni: '',
        discount_percentage: 0,
        credit_limit: 0,
        debt: 0
      });
    }
  }, [customer, dialogMode, setFormDataLocal]);

  const handleSave = useCallback(() => {
    onSaveCustomer(formData, resetForm);
  }, [formData, onSaveCustomer, resetForm]);

  if (isLoadingSingleCustomer) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Cargando detalles del cliente...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.dialog', padding: 2 }}>
      {(dialogMode === 'create' || dialogMode === 'edit') ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={2} sx={{ backgroundColor: 'background.dialog', maxWidth: '900px' }}>
                          <Grid item xs={12} sm={6}>
                          <TextFieldWithClear
                            fullWidth
                            label="Nombre *"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            required
                            autoFocus
                            onClear={() => handleInputChange({ target: { name: 'name', value: '' } })}
                            inputProps={{ minLength: 2 }}
                            error={String(formData.name || '').trim().length > 0 && String(formData.name || '').trim().length < 2}
                            helperText={String(formData.name || '').trim().length > 0 && String(formData.name || '').trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : ''}
                          />
                        </Grid>            <Grid item xs={12} sm={6}>
              <TextFieldWithClear
                fullWidth
                label="DNI"
                name="dni"
                value={formData.dni || ''}
                onChange={(e) => {
                  handleInputChange(e);
                  checkDuplicate('dni', e.target.value, customer?.id);
                }}
                error={!!dniExistsError || (String(formData.dni || '').trim().length > 0 && (String(formData.dni || '').trim().length < 6 || String(formData.dni || '').trim().length > 9))}
                helperText={dniExistsError || (String(formData.dni || '').trim().length > 0 && (String(formData.dni || '').trim().length < 6 || String(formData.dni || '').trim().length > 9) ? 'El DNI debe tener entre 6 y 9 caracteres' : '')}
                onClear={() => handleInputChange({ target: { name: 'dni', value: '' } })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextFieldWithClear
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                onClear={() => handleInputChange({ target: { name: 'phone', value: '' } })}
                error={String(formData.phone || '').trim().length > 0 && (String(formData.phone || '').trim().length < 8 || String(formData.phone || '').trim().length > 20)}
                helperText={String(formData.phone || '').trim().length > 0 && (String(formData.phone || '').trim().length < 8 || String(formData.phone || '').trim().length > 20) ? 'El teléfono debe tener entre 8 y 20 caracteres' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextFieldWithClear
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  handleInputChange(e);
                  checkDuplicate('email', e.target.value, customer?.id);
                }}
                error={!!emailExistsError || (String(formData.email || '').trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))}
                helperText={emailExistsError || (String(formData.email || '').trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Formato de email no válido' : '')}
                onClear={() => handleInputChange({ target: { name: 'email', value: '' } })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldWithClear
                fullWidth
                label="Dirección"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                onClear={() => handleInputChange({ target: { name: 'address', value: '' } })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextFieldWithClear
                fullWidth
                label="Límite de Crédito"
                name="credit_limit"
                type="number"
                value={String(formData.credit_limit || '')}
                onChange={(e) => handleInputChange({ target: { name: 'credit_limit', value: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                onClear={() => handleInputChange({ target: { name: 'credit_limit', value: 0 } })}
                error={parseFloat(formData.credit_limit || 0) < 0}
                helperText={parseFloat(formData.credit_limit || 0) < 0 ? 'El límite de crédito no puede ser negativo' : ''}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextFieldWithClear
                fullWidth
                label={dialogMode === 'create' ? "Deuda Inicial" : "Deuda Actual"}
                name="debt"
                type="number"
                value={String(formData.debt || '')}
                onChange={(e) => handleInputChange({ target: { name: 'debt', value: e.target.value === '' ? 0 : parseFloat(e.target.value) } })}
                onClear={() => handleInputChange({ target: { name: 'debt', value: 0 } })}
                error={parseFloat(formData.debt || 0) < 0}
                helperText={parseFloat(formData.debt || 0) < 0 ? 'La deuda no puede ser negativa' : ''}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </Box>
      ) : customer ? (
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3} padding={2} >
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Información Personal
              </Typography>
              <Typography variant="body2"><Typography component="span" fontWeight="bold">Nombre:</Typography> {customer.name}</Typography>
              <Typography variant="body2"><Typography component="span" fontWeight="bold">DNI:</Typography> {customer.dni || 'No especificado'}</Typography>
              <Typography variant="body2"><Typography component="span" fontWeight="bold">Teléfono:</Typography> {customer.phone || 'No especificado'}</Typography>
              <Typography variant="body2"><Typography component="span" fontWeight="bold">Email:</Typography> {customer.email || 'No especificado'}</Typography>
              <Typography variant="body2"><Typography component="span" fontWeight="bold">Dirección:</Typography> {customer.address || 'No especificada'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Información Financiera
              </Typography>
              {customer.discount_percentage > 0 && (
                <Typography variant="body2"><Typography component="span" fontWeight="bold">Descuento:</Typography> {customer.discount_percentage}%</Typography>
              )}
              <Typography variant="body2"><Typography component="span" fontWeight="bold">Límite de Crédito:</Typography> ${customer.credit_limit}</Typography>
              <Box>
                <Typography component="span" variant="body2" fontWeight="bold">Crédito Disponible:</Typography>
                <Chip
                  label={`$ ${(parseFloat(customer.credit_limit || 0) - parseFloat(customer.debt || 0)).toFixed(2)}`}
                  color={(parseFloat(customer.credit_limit || 0) - parseFloat(customer.debt || 0)) >= 0 ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              <Box>
                <Typography component="span" variant="body2" fontWeight="bold">Deuda Actual:</Typography>
                <Chip
                  label={`$ ${customer.debt}`}
                  color={parseFloat(customer.debt || 0) > 0 ? 'error' : 'success'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
            </Grid>

          </Grid>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography color="error">Error al cargar los detalles del cliente.</Typography>
        </Box>
      )}
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ p: 2, backgroundColor: 'background.dialog', color: 'text.primary', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <StyledButton variant='outlined' color="secondary" sx={{ padding: '2px 12px' }} onClick={onCancel}>
          Cancelar
        </StyledButton>
        {(dialogMode === 'create' || dialogMode === 'edit') && (
          <StyledButton
            onClick={handleSave}
            variant="contained"
            disabled={
              isLoadingSingleCustomer ||
              !String(formData.name || '').trim() ||
              (String(formData.name || '').trim().length > 0 && String(formData.name || '').trim().length < 2) ||
              !!dniExistsError ||
              (String(formData.dni || '').trim().length > 0 && (String(formData.dni || '').trim().length < 6 || String(formData.dni || '').trim().length > 9)) ||
              (String(formData.phone || '').trim().length > 0 && (String(formData.phone || '').trim().length < 8 || String(formData.phone || '').trim().length > 20)) ||
              !!emailExistsError ||
              (String(formData.email || '').trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ||
              parseFloat(formData.credit_limit || 0) < 0 ||
              parseFloat(formData.debt || 0) < 0
            }
          >
            {dialogMode === 'create' ? 'Crear' : 'Actualizar'}
          </StyledButton>
        )}
      </Box>
    </Box>
  );
};

export default CustomerModalContent;
