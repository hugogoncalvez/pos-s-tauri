import React from 'react';
import { Box, Grid } from '@mui/material';
import { ShoppingCart, People, Store } from '@mui/icons-material';
import SummaryCard from './SummaryCard'; // Importar SummaryCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '@mui/material/styles';

const SummaryCardsSection = () => {
  const { tienePermiso } = usePermissions();
  const theme = useTheme();

  // Si la cantidad visible es impar, la última tarjeta ocupa todo el ancho
  // para no dejar un hueco en la grilla de 2 columnas.
  const cards = [
    tienePermiso('ver_widget_compras_hoy') && {
      key: 'compras',
      title: 'Compras de Hoy',
      endpoint: '/dashboard/compras/hoy',
      icon: <ShoppingCart />,
      color: '#9c27b0',
    },
    tienePermiso('ver_widget_total_clientes') && {
      key: 'clientes',
      title: 'Clientes',
      endpoint: '/customers/total',
      icon: <People />,
      color: '#4caf50',
    },
    tienePermiso('ver_widget_total_proveedores') && {
      key: 'proveedores',
      title: 'Proveedores',
      endpoint: '/suppliers/total',
      icon: <Store />,
      color: '#f44336',
    },
  ].filter(Boolean);

  return (
    <Box sx={{ mt: 'clamp(1rem, 2.5vw, 2.5%)', flex: 1, maxWidth: '50%', display: 'flex', flexWrap: 'wrap', gap: 'clamp(0.5rem, 1vw, 2rem)' }}>
      {cards.map((card, i) => (
        <Box
          key={card.key}
          sx={{ flex: cards.length % 2 === 1 && i === cards.length - 1 ? '1 1 100%' : '1 1 48%' }}
        >
          <SummaryCard title={card.title} endpoint={card.endpoint} icon={card.icon} color={card.color} />
        </Box>
      ))}
    </Box>
  );
};

export default SummaryCardsSection;