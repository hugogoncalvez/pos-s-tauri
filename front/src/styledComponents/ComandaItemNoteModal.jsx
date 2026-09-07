import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  TextField
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';

const ComandaItemNoteModal = ({ open, onClose, item, onSaveNote }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item) {
      setNote(item.note || item.observaciones || '');
    } else {
      setNote('');
    }
  }, [item, open]);

  const handleSave = () => {
    if (item) {
      onSaveNote(item, note);
    }
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'background.dialog',
          color: 'text.primary',
          position: 'relative'
        }}
      >
        <RestaurantMenuIcon sx={{ mr: 1, color: 'warning.main' }} />
        Nota para Cocina / Barra
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <ClearIcon color="error" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: 'background.paper', py: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1} color="text.primary">
          {item?.name || item?.nombre || 'Producto'}
        </Typography>

        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          label="Observaciones de preparación"
          placeholder="Ej: Sin cebolla, Salsa aparte, Bien cocido, etc."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <StyledButton variant="outlined" color="inherit" onClick={onClose}>
          Cancelar
        </StyledButton>
        <StyledButton variant="contained" color="warning" onClick={handleSave}>
          Guardar Nota
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ComandaItemNoteModal;
