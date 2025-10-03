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

const ComboManagerSkeleton = () => {
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

            {/* Table Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
                <Box mb={2} p={1}>
                    <Typography variant="h5" width="30%"><Skeleton /></Typography>
                </Box>
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

export default ComboManagerSkeleton;
