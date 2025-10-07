import React from 'react';
import { Box } from '@mui/material';
import { CalendarMonth, DateRange, CalendarToday } from '@mui/icons-material';
import SalesStatCard from './SalesStatCard'; // Importar SalesStatCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';

const SalesStatsSection = () => {
  const { tienePermiso } = usePermissions();

  return (
    <>
      {tienePermiso('listar_ventas_historial') && (
        <Box sx={{ flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.5rem, 1vw, 2rem)' }}>
          <Box sx={{ flex: '1 1 48%' }}>
            <SalesStatCard title="Ventas Mes" endpoint="/dashboard/ventas/mes" icon={<CalendarMonth />} color="#8bc34a" periodText="vs mes anterior" />
          </Box>
          <Box sx={{ flex: '1 1 48%' }}>
            <SalesStatCard title="Ventas Semana" endpoint="/dashboard/ventas/semana" icon={<DateRange />} color="#03a9f4" periodText="vs semana anterior" />
          </Box>
          <Box sx={{ flex: '1 1 48%' }}>
            <SalesStatCard title="Ventas Hoy" endpoint="/dashboard/ventas/hoy" icon={<CalendarToday />} color="#ffc107" periodText="vs ayer" />
          </Box>
        </Box>
      )}
    </>
  );
};

export default SalesStatsSection;
