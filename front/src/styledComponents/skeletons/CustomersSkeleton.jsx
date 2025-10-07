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

const CustomersSkeleton = () => {
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" width={300}><Skeleton /></Typography>
                        <Typography variant="body1" width={400}><Skeleton /></Typography>
                    </Box>
                    <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: '4px' }} />
                </Box>
            </Paper>

            {/* Filters Skeleton */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" width={180} sx={{ mb: 2 }}><Skeleton /></Typography>
                <Grid container spacing={2} justifyContent="center">
                    {[...Array(3)].map((_, index) => (
                        <Grid item sx={{ width: 'clamp(250px, 30%, 350px)' }} key={index}>
                            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }}/>
                            <Skeleton variant="rectangular" height={56} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Table Skeleton */}
            <Paper elevation={1} sx={{ p: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {[...Array(6)].map((_, index) => (
                                    <TableCell key={index}><Skeleton /></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...Array(5)].map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton /></TableCell>
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <Skeleton width={200} height={30} />
                </Box>
            </Paper>
        </Box>
    );
};

export default CustomersSkeleton;
