import React from 'react';
import { Box, Grid } from '@mui/material';
import { ShoppingCart, MonetizationOn, People, Store } from '@mui/icons-material';
import SummaryCard from './SummaryCard'; // Importar SummaryCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';

const SummaryCardsSection = () => {
  const { tienePermiso } = usePermissions();
  const theme = useTheme();

  return (
    <Box sx={{ mt: 'clamp(1rem, 2.5vw, 2.5%)', flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.5rem, 1vw, 2rem)' }}>
      {tienePermiso('ver_widget_compras_hoy') && (
        <Box sx={{ flex: '1 1 48%' }}>
          <SummaryCard title="Compras de Hoy" endpoint="/dashboard/compras/hoy" icon={<ShoppingCart />} color="#9c27b0" />
        </Box>
      )}
      {tienePermiso('listar_ventas_historial') && (
        <Box sx={{ flex: '1 1 48%' }}>
          <SummaryCard title="Ventas de Hoy" endpoint="/dashboard/ventas/hoy" icon={<MonetizationOn />} color="#00bcd4" />
        </Box>
      )}
      {tienePermiso('ver_widget_total_clientes') && (
        <Box sx={{ flex: '1 1 48%' }}>
          <SummaryCard title="Clientes" endpoint="/customers/total" icon={<People />} color="#4caf50" />
        </Box>
      )}
      {tienePermiso('ver_widget_total_proveedores') && (
        <Box sx={{ flex: '1 1 48%' }}>
          <SummaryCard title="Proveedores" endpoint="/suppliers/total" icon={<Store />} color="#f44336" />
        </Box>
      )}
    </Box>
  );
};

export default SummaryCardsSection;