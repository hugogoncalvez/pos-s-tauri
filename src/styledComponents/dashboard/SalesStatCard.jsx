import React, { useMemo } from 'react';
import { Box, Typography, Avatar, LinearProgress, Skeleton } from '@mui/material';
import { StyledCard } from '../../styledComponents/ui/StyledCard';
import { UseFetchQuery } from '../../hooks/useQuery';
import { useTheme } from '@mui/material/styles';
import { ArrowUpward, ArrowDownward, TrendingFlat } from '@mui/icons-material';

const SalesStatCardSkeleton = () => (
    <StyledCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Skeleton variant="text" width={100} sx={{ mb: 1, fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
                <Skeleton variant="text" width={80} sx={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }} />
            </Box>
            <Skeleton variant="rounded" sx={{ width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)', borderRadius: '16px' }} />
        </Box>
        <Skeleton variant="text" sx={{ my: 'clamp(0.5rem, 1vw, 1rem)' }} />
        <Skeleton variant="text" width={120} sx={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }} />
    </StyledCard>
);

const SalesStatCard = ({ title, endpoint, icon, color, periodText }) => {
    const { data, isLoading, isError } = UseFetchQuery(endpoint, endpoint);
    const theme = useTheme();

    const avatarBgColor = useMemo(() => {
        switch (color) {
            case "#8bc34a": return theme.palette.success.main;
            case "#03a9f4": return theme.palette.info.main;
            case "#ffc107": return theme.palette.warning.main;
            default: return theme.palette.primary.main;
        }
    }, [color, theme.palette]);

    if (isLoading) {
        return <SalesStatCardSkeleton />;
    }

    const change = data?.change || 0;
    const isPositive = change > 0;
    const isNegative = change < 0;

    let trendIcon = null;
    let trendColor = 'text.secondary';

    if (isPositive) {
        trendIcon = <ArrowUpward sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', mr: 'clamp(0.25rem, 0.5vw, 0.5rem)' }} />;
        trendColor = 'success.main';
    } else if (isNegative) {
        trendIcon = <ArrowDownward sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', mr: 'clamp(0.25rem, 0.5vw, 0.5rem)' }} />;
        trendColor = 'error.main';
    } else {
        trendIcon = <TrendingFlat sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', mr: 'clamp(0.25rem, 0.5vw, 0.5rem)' }} />;
        trendColor = 'text.secondary';
    }

    return (
        <StyledCard sx={{
            '&:hover .MuiAvatar-root': { // Target the Avatar component
                transform: 'rotate(12deg) scale(1.1)',
            }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="text.secondary" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>{title}</Typography>
                    <Typography variant="h6" sx={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>$ {data?.total || '0.00'}</Typography>
                </Box>
                <Avatar sx={{
                    bgcolor: avatarBgColor,
                    width: 'clamp(32px, 4vw, 40px)',
                    height: 'clamp(32px, 4vw, 40px)',
                    p: 0.5,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                }}>
                    {icon}
                </Avatar>
            </Box>
            <LinearProgress variant="determinate" value={50 + (change / 2)} color={isPositive ? "success" : isNegative ? "error" : "secondary"} sx={{ my: 'clamp(0.5rem, 1vw, 1rem)' }} />
            <Typography
                variant="caption"
                color={trendColor}
                sx={{ display: 'flex', alignItems: 'center', fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)' }}
            >
                {isError ? (
                    <Typography color="error" variant="caption">Error</Typography>
                ) : (
                    <>
                        {trendIcon}
                        {`${change}% ${periodText}`}
                    </>
                )}
            </Typography>
        </StyledCard>
    );
};

export default SalesStatCard;
