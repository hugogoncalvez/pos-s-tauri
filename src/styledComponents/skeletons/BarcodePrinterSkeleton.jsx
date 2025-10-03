import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Skeleton,
    Typography,
    FormControlLabel,
    Checkbox
} from '@mui/material';

const BarcodePrinterSkeleton = () => {
    return (
        <Box sx={{ p: 3 }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" width="50%"><Skeleton /></Typography>
                        <Typography variant="body1" width="70%"><Skeleton /></Typography>
                    </Grid>
                    <Grid item>
                        <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: '4px' }} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Selection Card Skeleton */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom width="40%"><Skeleton /></Typography>
                <Grid container spacing={2}>
                    {[...Array(3)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={6} key={index}>
                            <Skeleton variant="rectangular" height={56} />
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={2} sx={{ mt: 3 }}>
                    {/* Presentations List Skeleton */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom width="50%"><Skeleton /></Typography>
                        <Box sx={{ maxHeight: 300, overflowY: 'hidden', border: '1px solid #eee', p: 1 }}>
                            {[...Array(5)].map((_, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={<Checkbox disabled />}
                                    label={<Skeleton variant="text" width="80%" />}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Combos List Skeleton */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom width="50%"><Skeleton /></Typography>
                        <Box sx={{ maxHeight: 300, overflowY: 'hidden', border: '1px solid #eee', p: 1 }}>
                            {[...Array(5)].map((_, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={<Checkbox disabled />}
                                    label={<Skeleton variant="text" width="80%" />}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Selected Barcodes Skeleton */}
            <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom width="60%"><Skeleton /></Typography>
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc' }}>
                    <Skeleton variant="rectangular" height={200} width="100%" />
                </Box>
            </Paper>
        </Box>
    );
};

export default BarcodePrinterSkeleton;
