import React, { useContext, useState } from 'react';
import { Box, Paper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { motion } from 'framer-motion';
import { variants } from '../styles/variants';
import SalesHistorySkeleton from '../styledComponents/skeletons/SalesHistorySkeleton';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Componente SalesHistory
 * 
 * Propósito:
 * - Mostrar un historial de todas las ventas realizadas.
 * - Permitir a los usuarios con los permisos adecuados (Administrador, Gerente) ver todas las ventas.
 * - Permitir a los usuarios con roles restringidos (Cajero) ver únicamente sus propias ventas.
 * - Ofrecer herramientas de filtrado, análisis (KPIs, gráficos) y acciones (ver detalle, imprimir, exportar).
 * 
 * scope: 'user' | 'all'
 *  - 'user': Muestra solo las ventas del usuario logueado.
 *  - 'all': Muestra todas las ventas del sistema.
 */
const SalesHistory = ({ scope = 'all' }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { usuario, isLoading: authLoading } = useContext(AuthContext);
    const { tienePermiso } = usePermissions();

    // Determinar el scope real basado en permisos si el scope inicial es 'all'
    // Si el usuario no tiene permiso para ver todas las ventas, se fuerza a 'user'
    const effectiveScope = (scope === 'all' && tienePermiso('ver_ventas_global')) ? 'all' : 'user';

    const viewTitle = effectiveScope === 'all' ? 'Historial de Ventas Global' : 'Mi Historial de Ventas';
    const viewSubtitle = effectiveScope === 'all' ? 'Análisis completo de todas las transacciones' : 'Revisa todas tus transacciones realizadas';

    // Simulación de carga de datos
    const [isLoading, setIsLoading] = useState(true); // Cambiar a true para ver el skeleton

    // En una fase posterior, aquí se usarían los hooks de useQuery para obtener los datos
    // y se actualizaría isLoading en base a esos hooks.
    // Por ahora, un setTimeout para simular la carga.
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Simula 1.5 segundos de carga
        return () => clearTimeout(timer);
    }, []);


    if (authLoading || isLoading) {
        return <SalesHistorySkeleton />;
    }

    return (
        <motion.div initial="hidden" animate="enter" exit="exit" variants={variants} transition={{ duration: 0.8, type: "easeInOut" }}>
            <Box sx={{ p: 1 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 3,
                        mt: 2,
                        background: (theme) => theme.palette.background.componentHeaderBackground,
                        color: theme.palette.primary.contrastText
                    }}
                >
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid>
                            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                                {viewTitle}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {viewSubtitle}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Sección de KPIs */}
                <Grid container spacing={3} mb={4} justifyContent="center">
                    {/* Placeholder para KPI 1 */}
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Venta Total</Typography>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">$0.00</Typography>
                        </Paper>
                    </Grid>
                    {/* Placeholder para KPI 2 */}
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Nº de Transacciones</Typography>
                            <Typography variant="h4" color="success.main" fontWeight="bold">0</Typography>
                        </Paper>
                    </Grid>
                    {/* Placeholder para KPI 3 */}
                    <Grid xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="text.secondary">Ticket Promedio</Typography>
                            <Typography variant="h4" color="info.main" fontWeight="bold">$0.00</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Aquí se mostrarán los filtros, gráficos y el listado de ventas.
                    </Typography>
                </Box>
            </Box>
        </motion.div>
    );
};

export default SalesHistory;
