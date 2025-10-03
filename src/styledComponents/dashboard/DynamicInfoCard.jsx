import React from 'react';
import { Box, Typography, Skeleton, Grid, Divider, Fade, Grow } from '@mui/material';
import { StyledCard } from '../ui/StyledCard.jsx';
import HighlightItem from './HighlightItem.jsx';
import { useTheme } from '@mui/material/styles';

const DynamicInfoCardSkeleton = () => {
    const theme = useTheme();
    return (
        <StyledCard
            sx={{
                p: 0,
                overflow: 'hidden',
                position: 'relative',
                backdropFilter: theme.palette.mode === 'dark' ? 'blur(20px)' : 'blur(10px)',
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(22, 27, 34, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(224, 224, 224, 0.8) 0%, rgba(232, 232, 232, 0.9) 100%)',
                border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box sx={{ p: 4 }}>
                <Grid container spacing={3} sx={{ height: '100%', minHeight: '200px' }}>
                    {/* Columna Izquierda: Resumen */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Skeleton variant="rounded" sx={{ p: 1.5, borderRadius: '16px', width: '57px', height: '57px' }} />
                                <Skeleton variant="text" width="60%" sx={{ ml: 2, fontSize: '1.5rem' }} />
                            </Box>
                            {/* Estadísticas */}
                            <Box>
                                <Skeleton variant="text" width="80%" height={60} sx={{ borderRadius: '8px' }} />
                                <Skeleton variant="text" width="60%" height={30} sx={{ mt: 1, borderRadius: '8px' }} />
                            </Box>
                        </Box>
                    </Grid>

                    <Divider orientation="vertical" flexItem sx={{ mt: "10px", mr: "-1px", background: `linear-gradient(to bottom, transparent, ${theme.palette.divider}, transparent)`, width: '2px', borderRadius: '1px' }} />

                    {/* Columna Derecha: Destacados */}
                    <Grid item xs={12} md>
                        <Box sx={{ pl: 2, height: '100%' }}>
                            <Skeleton variant="text" width={100} sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {[...Array(3)].map((_, i) => (
                                    <Grid item xs={12} sm={4} key={i}>
                                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </StyledCard>
    );
};


const DynamicInfoCard = ({
    title,
    icon,
    summaryData,
    highlightItems,
    isLoading,
    onClick
}) => {
    const theme = useTheme();

    if (isLoading) {
        return <DynamicInfoCardSkeleton />;
    }

    return (
        <StyledCard
            onClick={onClick}
            sx={{
                textDecoration: 'none',
                height: '100%',
                cursor: 'pointer',
                p: 0,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0, 245, 255, 0.3), 0 0 0 1px rgba(0, 245, 255, 0.2)'
                        : '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(84, 110, 122, 0.2)',
                    '& .icon-container': {
                        transform: 'rotate(12deg) scale(1.1)',
                    },
                    '& .title-text': {
                        color: theme.palette.primary.main,
                    },
                    '& .count-number': {
                        transform: 'scale(1.05)',
                    },
                    '& .highlight-section': {
                        '& .highlight-item': {
                            transform: 'translateY(-2px)',
                        }
                    }
                },
                // Glassmorphism effect
                backdropFilter: theme.palette.mode === 'dark' ? 'blur(20px)' : 'blur(10px)',
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(22, 27, 34, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(224, 224, 224, 0.8) 0%, rgba(232, 232, 232, 0.9) 100%)',
                border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Decorative gradient overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    opacity: 0.8,
                }}
            />

            <Box sx={{ p: 4 }}>
                <Grid container spacing={3} sx={{ height: '100%', minHeight: '200px' }}>
                    {/* Columna Izquierda: Resumen */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            justifyContent: 'space-between'
                        }}>
                            {/* Header con icono y título */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box
                                    className="icon-container"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                                        border: `1px solid ${theme.palette.primary.main}30`,
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {React.cloneElement(icon, {
                                        sx: {
                                            ...icon.props.sx,
                                            fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                                        }
                                    })}
                                </Box>
                                <Typography
                                    variant="h5"
                                    className="title-text"
                                    sx={{
                                        color: 'text.primary',
                                        ml: 2,
                                        fontWeight: 600,
                                        transition: 'color 0.3s ease',
                                        background: theme.palette.mode === 'dark'
                                            ? `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.light})`
                                            : undefined,
                                        backgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
                                        WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
                                        WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : undefined,
                                    }}
                                >
                                    {title}
                                </Typography>
                            </Box>

                            {/* Estadísticas */}
                            <Box>
                                <Fade in={true} timeout={800}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                                            <Typography
                                                variant="h2"
                                                component="p"
                                                className="count-number"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'text.primary',
                                                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                                                    lineHeight: 1,
                                                    transition: 'transform 0.3s ease',
                                                    background: theme.palette.mode === 'dark'
                                                        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                                        : undefined,
                                                    backgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
                                                    WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
                                                    WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : undefined,
                                                }}
                                            >
                                                {summaryData?.count ?? 0}
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    color: 'text.secondary',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {summaryData?.countLabel}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: '12px',
                                                background: theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(135deg, rgba(140, 48, 97, 0.1), rgba(217, 95, 89, 0.1))'
                                                    : 'linear-gradient(135deg, rgba(84, 110, 122, 0.1), rgba(201, 233, 210, 0.1))',
                                                border: `1px solid ${theme.palette.divider}`,
                                                minHeight: '50px',
                                                maxWidth: '90%',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontWeight: 500,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {summaryData?.latestLabel}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    display: 'block',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {summaryData?.latestItemName || 'No hay datos'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Fade>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Divisor Vertical Moderno */}
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mt: "10px",
                            mr: "-1px",
                            background: theme.palette.mode === 'dark'
                                ? `linear-gradient(to bottom, transparent, ${theme.palette.primary.main}50, transparent)`
                                : `linear-gradient(to bottom, transparent, ${theme.palette.divider}, transparent)`,
                            width: '2px',
                            borderRadius: '1px',
                        }}
                    />

                    {/* Columna Derecha: Destacados */}
                    <Grid item xs={12} md>
                        <Box className="highlight-section" sx={{ pl: 2, height: '100%' }}>
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    mb: 2,
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: 0,
                                        width: '40px',
                                        height: '2px',
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        borderRadius: '1px',
                                    }
                                }}
                            >
                                Destacados
                            </Typography>

                            <Grid container spacing={2}>
                                {highlightItems?.slice(0, 3).map((item, index) => (
                                    <Grow
                                        key={item.id || index}
                                        in={true}
                                        timeout={800 + (index * 200)}
                                    >
                                        <Grid item xs={12} sm={4}>
                                            <HighlightItem
                                                item={item}
                                                type={title}
                                                index={index}
                                            />
                                        </Grid>
                                    </Grow>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </StyledCard>
    );
};

export default DynamicInfoCard;