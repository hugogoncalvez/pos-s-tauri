import React from 'react';
import {
    Box,
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

const ProfitReportSkeleton = () => {
    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }} width="40%"><Skeleton /></Typography>
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
            <Box sx={{ mt: 3, p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="h6" width="30%"><Skeleton /></Typography>
            </Box>
        </Paper>
    );
};

export default ProfitReportSkeleton;
