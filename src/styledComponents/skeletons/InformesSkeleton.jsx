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

const InformesSkeleton = () => {
    return (
        <Box sx={{ p: 1 }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2 }}>
                <Typography variant="h4" width="60%"><Skeleton /></Typography>
                <Typography variant="body1" width="40%"><Skeleton /></Typography>
            </Paper>

            {/* Filters Skeleton */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" width={180} sx={{ mb: 2 }}><Skeleton /></Typography>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item sx={{ width: 'clamp(250px, 30%, 400px)' }}>
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} />
                    </Grid>
                    <Grid item sx={{ width: 'clamp(250px, 30%, 400px)' }}>
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={56} />
                    </Grid>
                    <Grid item sx={{ width: 'clamp(200px, 20%, 300px)' }}>
                        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={40} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Report/Table Skeleton */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" width={200}><Skeleton /></Typography>
                        <Skeleton variant="text" width={150} height={40} />
                    </Grid>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[...Array(8)].map((_, index) => (
                                    <TableCell key={index}><Skeleton /></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    {[...Array(8)].map((_, cellIndex) => (
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

export default InformesSkeleton;
