import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const HighlightItem = ({ item, type, index = 0 }) => {
    const theme = useTheme();

    let name, description, price, color, gradientColors;

    switch (type) {
        case 'Promociones':
            name = item.name;
            description = item.description || 'Promoción especial';
            price = null;
            color = 'primary';
            gradientColors = [theme.palette.primary.main, theme.palette.primary.light];
            break;
        case 'Combos':
            name = item.name;
            description = item.description || 'Paquete de productos';
            price = item.price;
            color = 'secondary';
            gradientColors = [theme.palette.secondary.main, theme.palette.secondary.light];
            break;
        case 'Presentaciones':
            name = item.name;
            if (item.tipo_venta === 'pesable') {
                description = `De: ${item.productName} (x ${item.unitName})`;
            } else {
                description = `De: ${item.productName} (x${parseInt(item.quantity_in_base_units, 10)})`;
            }
            price = item.price;
            color = 'info';
            gradientColors = [theme.palette.info.main, theme.palette.info.light];
            break;
        default:
            name = item.name;
            description = item.description;
            price = item.price;
            color = 'info';
            gradientColors = [theme.palette.info.main, theme.palette.info.light];
    }

    return (
        <Box
            className="highlight-item"
            sx={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '120px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: 'center',

                // Base styling
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, 
                        rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.15),
                        rgba(${parseInt(gradientColors[1].slice(1, 3), 16)}, ${parseInt(gradientColors[1].slice(3, 5), 16)}, ${parseInt(gradientColors[1].slice(5, 7), 16)}, 0.25))`
                    : `linear-gradient(135deg, 
                        rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.08),
                        rgba(${parseInt(gradientColors[1].slice(1, 3), 16)}, ${parseInt(gradientColors[1].slice(3, 5), 16)}, ${parseInt(gradientColors[1].slice(5, 7), 16)}, 0.15))`,

                border: theme.palette.mode === 'dark'
                    ? `1px solid rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.3)`
                    : `1px solid rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.2)`,

                // Glassmorphism
                backdropFilter: 'blur(10px)',

                '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? `0 12px 24px rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.3)`
                        : `0 12px 24px rgba(${parseInt(gradientColors[0].slice(1, 3), 16)}, ${parseInt(gradientColors[0].slice(3, 5), 16)}, ${parseInt(gradientColors[0].slice(5, 7), 16)}, 0.2)`,

                    '& .highlight-content': {
                        transform: 'translateY(-2px)',
                    },

                    '& .price-chip': {
                        transform: 'scale(1.05)',
                    },

                    '& .shine-effect': {
                        transform: 'translateX(200%)',
                        transition: 'transform 0.6s ease',
                    }
                },
            }}
        >
            {/* Efecto de brillo animado */}
            <Box
                className="shine-effect"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />

            {/* Decorative corner accent */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                    opacity: 0.3,
                }}
            />

            {/* Content */}
            <Box
                className="highlight-content"
                sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'transform 0.3s ease',
                }}
            >
                {/* Title */}
                <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{
                        color: 'text.primary',
                        fontSize: '0.9rem',
                        lineHeight: 1.3,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                    }}
                    title={name}
                >
                    {name}
                </Typography>

                {/* Description */}
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        flexGrow: 1,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        opacity: 0.9,
                    }}
                >
                    {description}
                </Typography>

                {/* Price chip */}
                {price && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Chip
                            className="price-chip"
                            label={`$${parseFloat(price).toFixed(2)}`}
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: '24px',
                                fontWeight: 'bold',
                                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                                color: theme.palette.success.contrastText,
                                border: 'none',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? `0 2px 8px rgba(76, 175, 80, 0.3)`
                                    : `0 2px 8px rgba(76, 175, 80, 0.2)`,
                                transition: 'transform 0.3s ease',
                                '& .MuiChip-label': {
                                    px: 1.5,
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* Bottom gradient accent */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                    opacity: 0.6,
                }}
            />
        </Box>
    );
};

export default HighlightItem;