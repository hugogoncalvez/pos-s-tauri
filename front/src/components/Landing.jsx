import { useEffect, useState, useContext, useMemo } from 'react';
import { Box, Typography, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { UseFetchQuery } from '../hooks/useQuery';

const Card = ({ el, usuario, screenSize, isCompactMode }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    // Configuración responsiva para cada tamaño de pantalla
    const getResponsiveConfig = () => {
        switch (screenSize) {
            case 'xs':
                return {
                    imageSize: 60,
                    imageHeight: 60,
                    padding: 1.5,
                    gap: 1.5,
                    titleVariant: 'subtitle1',
                    descriptionVariant: 'body2'
                };
            case 'sm':
                return {
                    imageSize: 70,
                    imageHeight: 70,
                    padding: 2,
                    gap: 2,
                    titleVariant: 'h6',
                    descriptionVariant: 'body2'
                };
            case 'md':
                return {
                    imageSize: 80,
                    imageHeight: 80,
                    padding: 2,
                    gap: 2,
                    titleVariant: 'h6',
                    descriptionVariant: 'body2'
                };
            case 'lg':
                return {
                    imageSize: isCompactMode ? 70 : 90,
                    imageHeight: isCompactMode ? 70 : 90,
                    padding: isCompactMode ? 1.5 : 2.5,
                    gap: isCompactMode ? 1.5 : 2,
                    titleVariant: isCompactMode ? 'h6' : 'h5',
                    descriptionVariant: isCompactMode ? 'body2' : 'body1'
                };
            default:
                return {
                    imageSize: 80,
                    imageHeight: 80,
                    padding: 2,
                    gap: 2,
                    titleVariant: 'h6',
                    descriptionVariant: 'body2'
                };
        }
    };

    const config = getResponsiveConfig();

    const cardVariants = {
        hover: {
            scale: screenSize === 'xs' ? 1.02 : 1.05,
        },
    };

    const titleVariants = {
        hover: {
            scale: 1.15,
            transition: { type: 'spring', stiffness: 400, damping: 5, mass: 0.5 }
        }
    };

    const handlePointerUp = () => {
        if (el.nombre === 'Caja') {
            if (usuario?.rol_nombre === 'Administrador' || usuario?.rol_nombre === 'Gerente') {
                navigate('/admin-cajas');
            } else if (usuario?.rol_nombre === 'Cajero') {
                navigate('/mi-caja');
            } else {
                navigate(el.navegar);
            }
        } else {
            navigate(el.navegar);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover="hover"
            variants={cardVariants}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <Box
                onPointerUp={handlePointerUp}
                sx={{
                    borderRadius: 3,
                    background: theme.palette.background.card,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: config.gap,
                    color: theme.palette.text.primary,
                    textDecoration: 'none',
                    transition: 'box-shadow .4s',
                    '&:hover': {
                        boxShadow: theme.palette.shadows.cardHover,
                        // Icon hover effect
                        '& .icon-container': {
                            transform: 'rotate(12deg) scale(1.1)',
                        },
                        // Shine effect
                        '& .shine-effect': {
                            transform: 'translateX(200%)',
                            transition: 'transform 0.6s ease',
                        }
                    },
                    paddingY: config.padding,
                    paddingX: 1,
                    boxShadow: theme.palette.shadows.card,
                    width: '100%',
                    cursor: 'pointer',
                    minHeight: screenSize === 'xs' ? 140 :
                        screenSize === 'sm' ? 160 :
                            screenSize === 'md' ? 160 :
                                isCompactMode ? 140 : 180,
                    position: 'relative', // Needed for absolute positioning of shine effect
                    overflow: 'hidden', // Hide shine effect when it's off-card
                }}
            >
                {/* Shine effect */}
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

                <Box
                    className="icon-container" // Added class for icon effect
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: config.imageHeight,
                        transition: 'all 0.3s ease', // Added transition for icon effect
                    }}
                >
                    <LazyLoadImage
                        alt={el.nombre}
                        src={el.imagen}
                        width={config.imageSize}
                        height={config.imageSize}
                        effect="blur"
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <motion.div variants={titleVariants}>
                    <Typography
                        variant={config.titleVariant}
                        sx={{
                            fontSize: screenSize === 'xs' ? '1.1rem' :
                                isCompactMode ? '1.9rem' : undefined,
                            textAlign: 'center',
                            fontWeight: isCompactMode ? 500 : undefined
                        }}
                    >
                        {el.nombre}
                    </Typography>
                </motion.div>
                <Typography
                    variant={config.descriptionVariant}
                    color="text.secondary"
                    textAlign="center"
                    px={isCompactMode ? 1 : 1}
                    sx={{
                        fontSize: screenSize === 'xs' ? '0.75rem' :
                            isCompactMode ? '0.85rem' : undefined,
                        lineHeight: screenSize === 'xs' ? 1.2 :
                            isCompactMode ? 1.3 : undefined
                    }}
                >
                    {el.descripcion}
                </Typography>
            </Box>
        </motion.div>
    );
};

const CardSkeleton = ({ screenSize, isCompactMode }) => {
    const theme = useTheme();

    const getResponsiveConfig = () => {
        switch (screenSize) {
            case 'xs': return { imageSize: 60, padding: 1.5, gap: 1.5 };
            case 'sm': return { imageSize: 70, padding: 2, gap: 2 };
            case 'md': return { imageSize: 80, padding: 2, gap: 2 };
            case 'lg': return { imageSize: isCompactMode ? 70 : 90, padding: isCompactMode ? 1.5 : 2.5, gap: isCompactMode ? 1.5 : 2 };
            default: return { imageSize: 80, padding: 2, gap: 2 };
        }
    };

    const config = getResponsiveConfig();
    const cardHeight = screenSize === 'xs' ? 140 : screenSize === 'sm' ? 160 : screenSize === 'md' ? 160 : isCompactMode ? 140 : 180;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Box sx={{
                borderRadius: 3,
                background: theme.palette.background.card,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: config.gap,
                paddingY: config.padding,
                paddingX: 1,
                boxShadow: theme.palette.shadows.card,
                width: '100%',
                minHeight: cardHeight,
            }}>
                <Skeleton variant="circular" width={config.imageSize} height={config.imageSize} />
                <Skeleton variant="text" width="80%" sx={{ fontSize: '1.2rem' }} />
                <Skeleton variant="text" width="90%" />
            </Box>
        </motion.div>
    );
};

const Landing = () => {
    const [items, setItems] = useState([]);
    const { usuario, isOnline } = useContext(AuthContext);
    const { tienePermiso, isLoading: permLoading } = usePermissions();
    const { data, isLoading } = UseFetchQuery('Elements', '/elements', !permLoading, Infinity);

    const theme = useTheme();

    // Usar breakpoints personalizados del tema o detectar por ancho de ventana
    const isXs = useMediaQuery('(max-width: 449px)');
    const isSm = useMediaQuery('(min-width: 450px) and (max-width: 639px)');
    const isMd = useMediaQuery('(min-width: 640px) and (max-width: 1365px)');
    const isLg = useMediaQuery('(min-width: 1366px)');

    // Detectar pantallas pequeñas de forma más confiable
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Considerar modo compacto si la altura es menor a 800px
    const isCompactMode = windowHeight < 800;

    // Determinar el tamaño de pantalla actual
    const screenSize = isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : 'lg';

    useEffect(() => {
        // No renderizar si los datos de elementos están cargando, o si estamos online y los permisos aún están cargando.
        if (isLoading || (isOnline && permLoading) || !data) {
            //console.log('[Landing.jsx useEffect] 🛑 Bloqueado por carga. No se renderizan items.');
            setItems([]);
            return;
        }

        // Si estamos offline, la data ya viene filtrada desde useQuery con solo "Ventas".
        // Nos saltamos el filtro de permisos que puede no ser fiable sin conexión.
        if (!isOnline) {
            //console.log('[Landing.jsx useEffect] 🔌 MODO OFFLINE: Seteando items con data recibida.', data);
            setItems(data);
            return;
        }

        // Si estamos ONLINE, aplicamos el filtro de permisos como siempre.
        //console.log('[Landing.jsx useEffect] 🌐 MODO ONLINE: Filtrando y seteando items.');
        const visibles = data
            .filter(el => !el.permiso_requerido || tienePermiso(el.permiso_requerido))
            .sort((a, b) => a.orden - b.orden);

        setItems(visibles);
    }, [data, tienePermiso, isLoading, permLoading, isOnline]);

    // Función mejorada para distribuir items según el tamaño de pantalla
    const chunkArrayResponsive = (arr, screenSize) => {
        const length = arr.length;
        if (length === 0) return [];

        let columnsPerRow;

        // Definir columnas máximas según pantalla
        if (screenSize === 'xs') {
            columnsPerRow = length === 1 ? 1 : 2; // 1 si hay solo 1 item, sino 2
        } else if (screenSize === 'sm') {
            columnsPerRow = length <= 2 ? length : length <= 4 ? 2 : 3;
        } else { // md y superiores
            columnsPerRow = length <= 2 ? length : length <= 4 ? 2 : length <= 6 ? 3 : 4;
        }

        // Si hay pocos elementos, distribuir equitativamente
        if (length <= columnsPerRow) {
            return [arr];
        }

        // Distribuir lo más equitativo posible
        const result = [];
        const itemsPerRow = Math.ceil(length / Math.ceil(length / columnsPerRow));

        for (let i = 0; i < length; i += itemsPerRow) {
            result.push(arr.slice(i, i + itemsPerRow));
        }

        return result;
    };

    // Configuración responsiva para el contenedor
    const getContainerConfig = () => {
        switch (screenSize) {
            case 'xs':
                return {
                    padding: 2,
                    gap: 2,
                    titleVariant: 'h5',
                    maxWidth: '100%'
                };
            case 'sm':
                return {
                    padding: 3,
                    gap: 3,
                    titleVariant: 'h4',
                    maxWidth: '90%'
                };
            case 'md':
                return {
                    padding: 3,
                    gap: 4,
                    titleVariant: 'h4',
                    maxWidth: '85%'
                };
            case 'lg':
                return {
                    padding: isCompactMode ? 2 : 4,
                    gap: isCompactMode ? 2 : 4,
                    titleVariant: isCompactMode ? 'h5' : 'h4',
                    maxWidth: isCompactMode ? '92%' : '85%'
                };
            default:
                return {
                    padding: 3,
                    gap: 4,
                    titleVariant: 'h4',
                    maxWidth: '85%'
                };
        }
    };

    const showSkeleton = isLoading || permLoading;

    const itemsToRender = useMemo(() => {
        if (!showSkeleton) return items;

        const count = data ? data.length : 6;
        return Array.from({ length: count }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }));
    }, [showSkeleton, items, data]);

    const chunkedItems = chunkArrayResponsive(itemsToRender, screenSize);
    const containerConfig = getContainerConfig();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
            <Box sx={{
                p: containerConfig.padding,

                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto' // Permitir scroll solo si el contenido excede la altura
            }}>
                <Box sx={{ width: '100%', maxWidth: containerConfig.maxWidth }}>
                    <Typography
                        variant={containerConfig.titleVariant}
                        color="text.primary"
                        gutterBottom
                        sx={{
                            fontSize: isCompactMode ? '1.8rem' : undefined,
                            marginBottom: isCompactMode ? 1.5 : undefined
                        }}
                    >
                        {showSkeleton ? <Skeleton width="40%" /> : `Bienvenido, ${usuario?.nombre || 'Usuario'}`}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mb={screenSize === 'xs' ? 4 : isCompactMode ? 2.5 : 6}
                        sx={{
                            fontSize: screenSize === 'xs' ? '0.9rem' :
                                isCompactMode ? '0.95rem' : undefined
                        }}
                    >
                        {showSkeleton ? <Skeleton width="60%" /> : 'Seleccioná una opción para comenzar'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: containerConfig.gap }}>
                        {chunkedItems.map((row, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: 'flex',
                                    gap: screenSize === 'xs' ? 1.5 :
                                        isCompactMode ? 3 : 4,
                                    justifyContent: 'center',
                                    flexWrap: 'nowrap'
                                }}
                            >
                                {row.map((el) => (
                                    <Box
                                        key={el.id}
                                        sx={{
                                            flex: 1,
                                            minWidth: 0, // Permite que flex funcione correctamente
                                            maxWidth: screenSize === 'xs' ?
                                                `calc(${100 / row.length}% - ${1.5 * (row.length - 1) / row.length}px)` :
                                                screenSize === 'sm' ?
                                                    `calc(${100 / row.length}% - ${3 * (row.length - 1) / row.length}px)` :
                                                    screenSize === 'md' ?
                                                        `calc(${100 / row.length}% - ${4 * (row.length - 1) / row.length}px)` :
                                                        `calc(${100 / row.length}% - ${4 * (row.length - 1) / row.length}px)`
                                        }}
                                    >
                                        {el.isSkeleton ? (
                                            <CardSkeleton screenSize={screenSize} isCompactMode={isCompactMode} />
                                        ) : (
                                            <Card el={el} usuario={usuario} screenSize={screenSize} isCompactMode={isCompactMode} />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
};

export default Landing;