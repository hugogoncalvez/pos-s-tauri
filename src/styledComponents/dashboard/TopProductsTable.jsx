import React from 'react';
import { CardContent, Typography, Box, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Alert } from '@mui/material';
import { StyledCard } from '../../styledComponents/ui/StyledCard';
import { UseFetchQuery } from '../../hooks/useQuery';
import { useTheme } from '@mui/material/styles';

const TopProductsTable = () => {
  const { data: products, isLoading, isError } = UseFetchQuery('top-productos', '/dashboard/top-productos', true, 2 * 60 * 1000);
  const theme = useTheme();
  const renderSkeletons = () => (
    Array.from(new Array(5)).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>Artículos más vendidos</Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: theme.palette.background.default }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Artículo</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Stock</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Estado</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Cantidad</TableCell>
                <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Ventas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? renderSkeletons() :
                isError ? <TableRow><TableCell colSpan={5} align="center"><Alert severity="error">No se pudieron cargar los productos.</Alert></TableCell></TableRow> :
                  Array.isArray(products) && products.map((product) => (
                    <TableRow key={product.id} sx={{ minHeight: 'clamp(48px, 6vw, 64px)' }}>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {product.nombre.charAt(0).toUpperCase() + product.nombre.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{product.stock}</TableCell>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Box sx={{ width: '100%', mr: 'clamp(0.5rem, 1vw, 1rem)' }}>
                            {(() => {
                              const stockPercentage = (product.stock / product.maxStock) * 100;
                              let progressColor = "success";

                              if (stockPercentage < 20) {
                                progressColor = "error";
                              } else if (stockPercentage < 50) {
                                progressColor = "warning";
                              }

                              return (
                                <LinearProgress variant="determinate" value={stockPercentage} color={progressColor} sx={{ height: 'clamp(6px, 1vw, 8px)' }} />
                              );
                            })()}
                          </Box>
                          <Box sx={{ minWidth: 'clamp(30px, 4vw, 35px)' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }}>{`${Math.round((product.stock / product.maxStock) * 100)}%`}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>{product.cantidadVendida}</TableCell>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>$ {product.totalVendido}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </StyledCard>
  );
};

export default TopProductsTable;
