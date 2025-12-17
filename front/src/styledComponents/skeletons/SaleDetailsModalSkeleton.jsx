import React from 'react';
import { Box, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid';

const SaleDetailsModalSkeleton = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* General Info Skeleton */}
                <Grid xs={12}>
                    <Skeleton variant="text" width="40%" height={40} />
                </Grid>
                <Grid xs={12} sm={6}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                </Grid>
                <Grid xs={12} sm={6}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                </Grid>
                <Grid xs={12} sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={120} />
                </Grid>
                <Grid xs={12} sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={80} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default SaleDetailsModalSkeleton;
