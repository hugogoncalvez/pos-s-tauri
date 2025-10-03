import React from 'react';
import { InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { StyledTextField } from './StyledTextField';

/**
 * Un componente wrapper sobre StyledTextField que añade un botón de limpieza opcional.
 * @param {function} onClear - La función a ejecutar cuando se hace clic en el botón de limpieza.
 * @param {object} InputProps - Props que se pasan al input, se mergean con el startAdornment.
 * @param {any} other - Otras props que se pasan directamente a StyledTextField.
 */
export const TextFieldWithClear = ({ onClear, InputProps, ...other }) => {
  const startAdornment = onClear ? (
    <InputAdornment position="start">
      <IconButton tabIndex={-1} onClick={onClear} size="small">
        <ClearIcon color="error" />
      </IconButton>
      {/* Mantener cualquier otro startAdornment que se haya pasado */}
      {InputProps?.startAdornment}
    </InputAdornment>
  ) : InputProps?.startAdornment;

  return (
    <StyledTextField
      {...other}
      InputProps={{
        ...InputProps,
        startAdornment,
      }}
    />
  );
};
