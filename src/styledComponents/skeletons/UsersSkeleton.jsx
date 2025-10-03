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

const UsersSkeleton = () => {
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" width="40%"><Skeleton /></Typography>
                        <Typography variant="body1" width="60%"><Skeleton /></Typography>
                    </Grid>
                    <Grid item>
                        <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: '4px' }} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Search & Table Card Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={1}>
                    <Typography variant="h5" width="20%"><Skeleton /></Typography>
                </Box>
                <Grid container justifyContent="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={8} md={6} lg={4}>
                        <Skeleton variant="rectangular" height={56} />
                    </Grid>
                </Grid>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[...Array(5)].map((_, index) => (
                                    <TableCell key={index}><Skeleton /></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {[...Array(5)].map((_, cellIndex) => (
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

export default UsersSkeleton;
