import React, { useMemo } from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { StyledCard } from '../../styledComponents/ui/StyledCard';
import { UseFetchQuery } from '../../hooks/useQuery';
import { useTheme } from '@mui/material/styles';

const SummaryCardSkeleton = () => {
    return (
        <StyledCard sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" sx={{ width: 'clamp(40px, 5vw, 56px)', height: 'clamp(40px, 5vw, 56px)', mr: 'clamp(1rem, 2vw, 2rem)' }} />
            <Box>
                <Skeleton variant="text" width={120} sx={{ mb: 1, fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
                <Skeleton variant="text" width={80} sx={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }} />
            </Box>
        </StyledCard>
    );
};

const SummaryCard = ({ title, endpoint, icon, color }) => {
    const { data, isLoading, isError } = UseFetchQuery(endpoint, endpoint);
    const theme = useTheme();

    const avatarBgColor = useMemo(() => {
        switch (color) {
            case "#9c27b0": return theme.palette.secondary.main;
            case "#00bcd4": return theme.palette.info.main;
            case "#4caf50": return theme.palette.success.main;
            case "#f44336": return theme.palette.error.main;
            default: return theme.palette.primary.main;
        }
    }, [color, theme.palette]);

    if (isLoading) {
        return <SummaryCardSkeleton />;
    }

    return (
        <StyledCard sx={{
            display: 'flex',
            alignItems: 'center',
            '&:hover .MuiAvatar-root': { // Target the Avatar component
                transform: 'rotate(12deg) scale(1.1)',
                transition: 'transform 0.3s ease',
            }
        }}>
            <Avatar sx={{ bgcolor: avatarBgColor, width: 'clamp(40px, 5vw, 56px)', height: 'clamp(40px, 5vw, 56px)', mr: 'clamp(1rem, 2vw, 2rem)' }}>
                {icon}
            </Avatar>
            <Box>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>{title}</Typography>
                <Typography variant="h5" sx={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>{data?.total || 0}</Typography>
                {isError && <Typography color="error" variant="caption" sx={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }}>Error al cargar</Typography>}
            </Box>
        </StyledCard>
    );
};

export default SummaryCard;
