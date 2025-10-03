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

const PaymentMethodSurchargeManagerSkeleton = () => {
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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

            {/* Table Skeleton */}
            <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
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
                                    {[...Array(6)].map((_, cellIndex) => (
                                        <TableCell key={cellIndex}><Skeleton /></TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default PaymentMethodSurchargeManagerSkeleton;
