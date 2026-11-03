import React from 'react';
import { Box } from '@mui/material';
import { ShoppingCart, People, Store } from '@mui/icons-material';
import SummaryCard from './SummaryCard'; // Importar SummaryCard desde su nuevo archivo
import { usePermissions } from '../../hooks/usePermissions';

const SummaryCardsSection = ({ overview, isLoading, error }) => {
  const { tienePermiso } = usePermissions();

  // Si la cantidad visible es impar, la última tarjeta ocupa todo el ancho
  // para no dejar un hueco en la grilla de 2 columnas.
  const cards = [
    tienePermiso('ver_widget_compras_hoy') && {
      key: 'compras',
      title: 'Compras de Hoy',
      value: overview?.summary?.purchasesToday,
      icon: <ShoppingCart />,
      color: '#9c27b0',
    },
    tienePermiso('ver_widget_total_clientes') && {
      key: 'clientes',
      title: 'Clientes',
      value: overview?.summary?.customersTotal,
      icon: <People />,
      color: '#4caf50',
    },
    tienePermiso('ver_widget_total_proveedores') && {
      key: 'proveedores',
      title: 'Proveedores',
      value: overview?.summary?.suppliersTotal,
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
          <SummaryCard title={card.title} value={card.value} icon={card.icon} color={card.color} isLoading={isLoading} isError={error} />
        </Box>
      ))}
    </Box>
  );
};

export default SummaryCardsSection;