import React from 'react';
import { CardContent, Typography, Box, Skeleton, Alert, List, ListItem, ListItemText } from '@mui/material';
import { StyledCard } from '../../styledComponents/ui/StyledCard';
import { UseFetchQuery } from '../../hooks/useQuery';
import { useTheme } from '@mui/material/styles';

const LowStockAlertsCard = () => {
  const { data: stockData, isLoading, isError } = UseFetchQuery('stock', '/stock?low_stock=true&unpaginated=true', true);
  const theme = useTheme();

  const formatStock = (stock, unitId) => {
    const number = parseFloat(stock);
    if (unitId === 1) { // 'Unidad'
      return `${number.toFixed(0)} Un.`;
    }
    // Para productos pesables
    return `${number.toFixed(3).replace('.', ',')} Kg.`;
  };

  if (isLoading) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>Alertas de Stock Bajo</Typography>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </CardContent>
      </StyledCard>
    );
  }

  if (isError) {
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>Alertas de Stock Bajo</Typography>
          <Alert severity="error">Error al cargar las alertas de stock.</Alert>
        </CardContent>
      </StyledCard>
    );
  }

  const lowStockProducts = stockData?.products?.filter(p => parseFloat(p.stock) <= parseFloat(p.min_stock)) || [];

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>Productos con Stock Bajo</Typography>
        {isLoading ? (
          <Box>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
          </Box>
        ) : isError ? (
          <Alert severity="error">Error al cargar los productos.</Alert>
        ) : (
          <>
            {lowStockProducts.length > 0 ? (
              <List dense>
                {lowStockProducts.map((product) => (
                  <ListItem key={product.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" color="error" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                          {product.name} (Stock: {formatStock(product.stock, product.units_id)}, Mínimo: {formatStock(product.min_stock, product.units_id)})
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }}>
                          Categoría: {product.categoryName || 'N/A'}, Proveedor: {product.supplierName || 'N/A'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No hay productos con stock bajo.</Alert>
            )}
          </>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default LowStockAlertsCard;
