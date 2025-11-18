import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';

const SalesChart = ({ data }) => {
    const theme = useTheme();

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Ventas por Día
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill={theme.palette.primary.main} name="Total Vendido" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default SalesChart;