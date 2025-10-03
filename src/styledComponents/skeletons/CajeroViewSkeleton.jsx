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

const CajeroViewSkeleton = () => {
    return (
        <Box sx={{ p: 1 }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" width={150}><Skeleton /></Typography>
                        <Typography variant="body1" width={300}><Skeleton /></Typography>
                    </Grid>
                    <Grid item>
                        <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: '4px' }} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Summary Cards Skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
                {[...Array(3)].map((_, index) => (
                    <Grid item xs={4} key={index}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1.5 }} />
                                <Typography variant="h6" width="70%"><Skeleton /></Typography>
                            </Box>
                            <Typography variant="h4" width="50%"><Skeleton /></Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Active Session Skeleton */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom width={200}><Skeleton /></Typography>
                <Grid container justifyContent="center">
                    <Grid item xs={12} sm={8} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="h6" width="60%"><Skeleton /></Typography>
                                <Skeleton variant="rectangular" width={80} height={24} />
                            </Box>
                            <Typography variant="body2" width="80%"><Skeleton /></Typography>
                            <Typography variant="body2" width="60%"><Skeleton /></Typography>
                            <Typography variant="body1" sx={{ mt: 1.5 }} width="70%"><Skeleton /></Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Skeleton variant="rectangular" width={120} height={32} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* History Table Skeleton */}
            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom width={250}><Skeleton /></Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[...Array(7)].map((_, index) => (
                                    <TableCell key={index}><Skeleton /></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {[...Array(7)].map((_, cellIndex) => (
                                        <TableCell key={cellIndex}><Skeleton /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <Skeleton width={200} height={30} />
                </Box>
            </Paper>
        </Box>
    );
};

export default CajeroViewSkeleton;
