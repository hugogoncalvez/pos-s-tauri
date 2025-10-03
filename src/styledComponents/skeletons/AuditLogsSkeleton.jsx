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

const AuditLogsSkeleton = () => {
    return (
        <Box sx={{ p: 1 }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2 }}>
                <Typography variant="h4" width="40%"><Skeleton /></Typography>
                <Typography variant="body1" width="60%"><Skeleton /></Typography>
            </Paper>

            {/* Stats and Filters Skeleton */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Stats Card Skeleton */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" width="80%" sx={{ mb: 2 }}><Skeleton /></Typography>
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="85%" />
                    </Paper>
                </Grid>

                {/* Filters Card Skeleton */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" width="30%" sx={{ mb: 2 }}><Skeleton /></Typography>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item sx={{ flexGrow: 1 }}>
                                <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" height={56} />
                            </Grid>
                            <Grid item sx={{ flexGrow: 1 }}>
                                <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" height={56} />
                            </Grid>
                            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Skeleton variant="rectangular" width={120} height={40} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Table Skeleton */}
            <Paper elevation={1} sx={{ p: 2 }}>
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

export default AuditLogsSkeleton;
