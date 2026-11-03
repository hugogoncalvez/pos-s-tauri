import React from 'react';
import { Box } from '@mui/material';
import { CalendarMonth, DateRange, CalendarToday } from '@mui/icons-material';
import SalesStatCard from './SalesStatCard'; // Importar SalesStatCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';

const SalesStatsSection = ({ overview, isLoading, error }) => {
  const { tienePermiso } = usePermissions();

  return (
    <>
      {tienePermiso('listar_ventas_historial') && (
        <Box sx={{ flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.5rem, 1vw, 2rem)' }}>
          <Box sx={{ flex: '1 1 48%' }}>
            <SalesStatCard title="Ventas Mes" data={overview?.sales?.month} isLoading={isLoading} isError={error} icon={<CalendarMonth />} color="#8bc34a" periodText="vs mes anterior" />
          </Box>
          <Box sx={{ flex: '1 1 48%' }}>
            <SalesStatCard title="Ventas Semana" data={overview?.sales?.week} isLoading={isLoading} isError={error} icon={<DateRange />} color="#03a9f4" periodText="vs semana anterior" />
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <SalesStatCard title="Ventas Hoy" data={overview?.sales?.today} isLoading={isLoading} isError={error} icon={<CalendarToday />} color="#ffc107" periodText="vs ayer" />
          </Box>
        </Box>
      )}
    </>
  );
};

export default SalesStatsSection;
