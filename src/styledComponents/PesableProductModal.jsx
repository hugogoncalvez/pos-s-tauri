import React, { useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  InputAdornment,
  useTheme,
  Box,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddchartIcon from '@mui/icons-material/Addchart';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import InfoIcon from '@mui/icons-material/Info';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { StyledTextField } from './ui/StyledTextField';

const PesableProductModal = ({
  isPesableModalOpen,
  onClose, // Changed from setIsPesableModalOpen
  productToWeigh,
  weight,
  setWeight,
  weightInputRef,
  handleAddPesableProduct,
}) => {
  const theme = useTheme();

  // The handleClose logic is now passed via the onClose prop.

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger the add product function only if the button is not disabled
      if (weight && parseFloat(weight) > 0) {
        handleAddPesableProduct();
      }
    }
  };

  const numericWeight = parseFloat(weight);
  const grams = !isNaN(numericWeight) ? (numericWeight * 1000).toLocaleString('es-AR') : 0;
  const isHighValue = !isNaN(numericWeight) && numericWeight > 20;

  const helperText = weight ? (
    <Typography
      component="span"
      variant="caption"
      color={isHighValue ? 'warning.main' : 'text.secondary'}
    >
      Equivale a: {grams} gramos {isHighValue && '(¡Valor muy alto!)'}
    </Typography>
  ) : 'Ej: 0.500 para 500 gramos.';


  return (
    <StyledDialog
      open={isPesableModalOpen}
      onClose={onClose} // Use the passed onClose prop
      aria-labelledby="pesable-product-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        id="pesable-product-dialog-title"
        sx={{
          backgroundColor: 'background.dialog',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AddchartIcon sx={{ mr: 1, color: 'info.main' }} />
          Ingresar Peso
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose} // Use the passed onClose prop
          sx={{ color: 'inherit' }}
        >
          <ClearIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: 'background.dialog', color: 'text.primary' }}>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Producto: <Typography component="span" variant="body1" fontWeight="bold">{productToWeigh?.name}</Typography>
          {productToWeigh?.stock_id && (
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              ({productToWeigh.quantity_in_base_units} unidades base)
            </Typography>
          )}
        </Typography>

        <StyledTextField
          label="Peso"
          type="number"
          name="weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={weightInputRef}
          fullWidth
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={() => setWeight('')}>
                  <ClearIcon color="error" />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
          }}
          autoComplete="off"
          helperText={helperText}
          sx={{ mb: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog', color: 'text.primary', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <StyledButton
          variant="outlined"
          color="error"
          onClick={onClose} // Use the passed onClose prop
          startIcon={<ClearIcon />}
          sx={{ padding: '2px 12px', flex: 1 }}
        >
          Cancelar
        </StyledButton>
        <StyledButton
          variant="contained"
          onClick={handleAddPesableProduct}
          startIcon={<SaveAsIcon />}
          disabled={!weight || parseFloat(weight) <= 0}
          sx={{ flex: 1 }}
        >
          Agregar
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default PesableProductModal;
