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

const FiscalAdminSkeleton = () => {
    return (
        <Box sx={{ p: 1 }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2 }}>
                <Typography variant="h4" width="40%"><Skeleton /></Typography>
            </Paper>

            {/* Tabs Skeleton */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Skeleton variant="rectangular" height={48} />
            </Box>

            {/* Content Skeleton */}
            <Grid container spacing={3}>
                {/* Left Side: Config Form */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" width="80%" sx={{ mb: 2 }}><Skeleton /></Typography>
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Skeleton variant="rectangular" width={120} height={40} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Side: Points of Sale Table */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" width="40%"><Skeleton /></Typography>
                            <Skeleton variant="rectangular" width={150} height={40} />
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {[...Array(4)].map((_, index) => (
                                            <TableCell key={index}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...Array(3)].map((_, index) => (
                                        <TableRow key={index}>
                                            {[...Array(4)].map((_, cellIndex) => (
                                                <TableCell key={cellIndex}><Skeleton /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FiscalAdminSkeleton;
