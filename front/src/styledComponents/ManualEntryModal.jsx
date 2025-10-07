import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  InputAdornment,
  Box,
  useTheme
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { TextFieldWithClear } from './ui/TextFieldWithClear';
import { StyledAutocomplete } from './ui/StyledAutocomplete';
import { StyledCard } from './ui/StyledCard';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { StyledTextField } from './ui/StyledTextField';


const ManualEntryModal = ({
  showManualEntryModal,
  handleCloseManualEntryModal,
  editingItem,
  formValues,
  handleInputChange,
  manualProductNameRef,
  handleManualEntrySubmit
}) => {
  const theme = useTheme();
  return (
    <StyledDialog
      open={showManualEntryModal}
      onClose={handleCloseManualEntryModal}
      aria-labelledby="manual-entry-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        id="manual-entry-dialog-title"
        sx={{
          backgroundColor: 'background.dialog',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          position: 'relative' // Posicionamiento relativo para el botón
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {editingItem ? (
            <EditIcon sx={{ mr: 1, color: 'info.main' }} />
          ) : (
            <PlaylistAddIcon sx={{ mr: 1, color: 'info.main' }} />
          )}
          {editingItem ? 'Editar Producto' : 'Agregar Producto Manual'}
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleCloseManualEntryModal}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <ClearIcon color="error" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: 'background.dialog', color: 'text.primary' }}>
        <Grid sx={{ pt: 1 }} container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <TextFieldWithClear
              fullWidth
              size="small"
              label="Nombre del Producto *"
              name="name"
              value={formValues.name || ''}
              onChange={handleInputChange}
              autoFocus
              required
              inputRef={manualProductNameRef}
              autoComplete="new-password"
              disabled={!!editingItem?.stock_id} // Deshabilitado si es un producto de stock
              onClear={() => handleInputChange({ target: { name: 'name', value: '' } })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextFieldWithClear
              fullWidth
              size="small"
              label="Precio Unitario *"
              name="price"
              type="number"
              value={formValues.price || ''}
              onChange={handleInputChange}
              onClear={() => handleInputChange({ target: { name: 'price', value: '' } })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$
                  </InputAdornment>
                ),
              }}
              required
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextFieldWithClear
              fullWidth
              size="small"
              label="Cantidad *"
              name="quantityPerUnits"
              type="number"
              value={formValues.quantityPerUnits || ''}
              onChange={handleInputChange}
              onClear={() => handleInputChange({ target: { name: 'quantityPerUnits', value: '' } })}
              required
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12}>
            <TextFieldWithClear
              fullWidth
              size="small"
              label="Descripción"
              name="description"
              value={formValues.description || ''}
              onChange={handleInputChange}
              onClear={() => handleInputChange({ target: { name: 'description', value: '' } })}
              multiline
              rows={2}
              autoComplete="off"
              disabled={!!editingItem?.stock_id} // Deshabilitado si es un producto de stock
            />
          </Grid>

          {formValues.price && formValues.quantityPerUnits && (
            <Grid item xs={12}>
              <StyledCard sx={{ p: 2, boxShadow: theme.shadows[3] }}>
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  💰 Total: ${((parseFloat(formValues.price) || 0) * (parseFloat(formValues.quantityPerUnits) || 0)).toFixed(2)}
                </Typography>
              </StyledCard>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog', color: 'text.primary' }}>
        <StyledButton
          variant="outlined"
          onClick={handleCloseManualEntryModal}
          startIcon={<ClearIcon />}
          sx={{ padding: '2px 12px' }}
        >
          Cancelar
        </StyledButton>
        <StyledButton
          variant="contained"
          onClick={handleManualEntrySubmit}
          startIcon={<SaveAsIcon />}
          disabled={!formValues.name || !formValues.price || !formValues.quantityPerUnits}
        >
          {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ManualEntryModal;
