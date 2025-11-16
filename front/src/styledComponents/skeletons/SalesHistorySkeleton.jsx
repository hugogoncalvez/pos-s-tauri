import React from 'react';
import { Box, Paper, Skeleton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

const SalesHistorySkeleton = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ p: 1 }}>
            {/* Header Skeleton */}
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
                        <Skeleton variant="text" width={isMobile ? 150 : 250} height={isMobile ? 30 : 40} sx={{ bgcolor: 'grey.700' }} />
                        <Skeleton variant="text" width={isMobile ? 200 : 350} height={20} sx={{ bgcolor: 'grey.600' }} />
                    </Grid>
                </Grid>
            </Paper>

            {/* KPI Cards Skeleton */}
            <Grid container spacing={3} mb={4} justifyContent="center">
                {[...Array(3)].map((_, index) => (
                    <Grid xs={12} sm={4} key={index}>
                        <Paper elevation={2} sx={{ p: 2, height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Skeleton variant="text" width="60%" height={25} sx={{ bgcolor: 'grey.500' }} />
                            <Skeleton variant="text" width="80%" height={40} sx={{ bgcolor: 'grey.600' }} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Filters Section Skeleton */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Skeleton variant="text" width="30%" height={30} sx={{ bgcolor: 'grey.500' }} />
                <Grid container spacing={2} mt={1}>
                    {[...Array(4)].map((_, index) => (
                        <Grid xs={12} sm={6} md={3} key={index}>
                            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, bgcolor: 'grey.400' }} />
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1, bgcolor: 'grey.400' }} />
                </Box>
            </Paper>

            {/* Table Skeleton */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ bgcolor: 'grey.500' }} />
                <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: 1, bgcolor: 'grey.400' }} />
            </Paper>
        </Box>
    );
};

export default SalesHistorySkeleton;
