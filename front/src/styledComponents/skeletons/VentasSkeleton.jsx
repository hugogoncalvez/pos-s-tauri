import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const VentasSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, height: 'calc(100vh - 64px)' }}>
      {/* Columna Principal (Izquierda) */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Controles Superiores */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Venta */}
        <TableContainer component={Paper} elevation={3} sx={{ flexGrow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                {[...Array(5)].map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(8)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Columna Secundaria (Derecha) */}
      <Box sx={{ width: 'clamp(280px, 30vw, 320px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Información del Cliente */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">
            <Skeleton width="60%" />
          </Typography>
          <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
          <Box sx={{ mt: 2 }}>
            <Skeleton width="80%" />
            <Skeleton width="90%" />
            <Skeleton width="70%" />
          </Box>
        </Paper>

        {/* Totales y Acciones */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton variant="text" width="40%" sx={{ fontSize: '1.2rem' }} />
            <Skeleton variant="text" width="30%" sx={{ fontSize: '1.2rem' }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='h5' width="40%"><Skeleton /></Typography>
            <Typography variant='h5' width="30%"><Skeleton /></Typography>
          </Box>
          <Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={36} />
        </Paper>
      </Box>
    </Box>
  );
};

export default VentasSkeleton;
