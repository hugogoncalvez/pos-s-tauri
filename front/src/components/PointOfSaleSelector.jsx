// front/src/components/PointOfSaleSelector.jsx

import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { UseFetchQuery } from '../hooks/useQuery';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '@mui/material/styles';

const PointOfSaleSelector = () => {
    const theme = useTheme();
    const { selectedPointOfSale, setSelectedPointOfSale } = useAuth();

    const { data: pointsOfSale, isLoading, isError, error } = UseFetchQuery(
        'pointsOfSaleList',
        '/fiscal/points-of-sale',
        true, // enabled
        0,    // staleTime
        {
            onSuccess: (data) => {
                // If there's only one point of sale, select it automatically
                if (data && data.length === 1 && !selectedPointOfSale) {
                    setSelectedPointOfSale(data[0]);
                }
            }
        }
    );

    useEffect(() => {
        // If selectedPointOfSale is set but no longer in the list (e.g., deleted), clear it
        if (selectedPointOfSale && pointsOfSale && !pointsOfSale.some(pos => pos.id === selectedPointOfSale.id)) {
            setSelectedPointOfSale(null);
        }
    }, [pointsOfSale, selectedPointOfSale, setSelectedPointOfSale]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>Cargando Puntos de Venta...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">Error al cargar los puntos de venta: {error.message}</Alert>
        );
    }

    if (!pointsOfSale || pointsOfSale.length === 0) {
        return (
            <Alert severity="warning">No hay puntos de venta configurados. Por favor, configure uno en Administración Fiscal.</Alert>
        );
    }

    return (
        <Box sx={{ mb: 2, width: '100%', maxWidth: '400px', mx: 'auto' }}>
            <StyledAutocomplete
                options={pointsOfSale}
                getOptionLabel={(option) => option.name || ''}
                value={selectedPointOfSale}
                onChange={(event, newValue) => {
                    setSelectedPointOfSale(newValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <StyledTextField
                        {...params}
                        label="Seleccionar Punto de Venta"
                        variant="outlined"
                        fullWidth
                    />
                )}
            />
            {!selectedPointOfSale && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Debe seleccionar un Punto de Venta para operar.
                </Typography>
            )}
        </Box>
    );
};

export default PointOfSaleSelector;
