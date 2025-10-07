import React from 'react';
import { Box } from '@mui/material';
import TopProductsTable from './TopProductsTable'; // Importar TopProductsTable desde su nuevo archivo
import LowStockAlertsCard from './LowStockAlertsCard'; // Importar LowStockAlertsCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';

const TablesSection = () => {
  const { tienePermiso } = usePermissions();

  return (
    <Box sx={{ display: 'flex', gap: 'clamp(1rem, 2vw, 3rem)', flexWrap: 'wrap', alignItems: 'flex-start', mb: 'clamp(1rem, 2vw, 4rem)' }}>
      {tienePermiso('ver_informe_productos_mas_vendidos') && (
      <Box sx={{ flex: '1 1 68%' }}>
        <TopProductsTable />
      </Box>
      )}
      {tienePermiso('ver_informe_stock_bajo') && (
      <Box sx={{ flex: '1 1 28%' }}>
        <LowStockAlertsCard />
      </Box>
      )}
    </Box>
  );
};

export default TablesSection;
