import React from 'react';
import { Box, Typography, Grid, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocalOffer as LocalOfferIcon, Extension as ExtensionIcon, Category as CategoryIcon, TrendingUp } from '@mui/icons-material';
import { UseFetchQuery } from '../../hooks/useQuery';
import { usePermissions } from '../../hooks/usePermissions';
import DynamicInfoCard from './DynamicInfoCard.jsx';
import { useTheme } from '@mui/material/styles';

const NovedadesSection = () => {
  const { tienePermiso } = usePermissions();
  const navigate = useNavigate();
  const theme = useTheme();

  // --- QUERIES PARA RESÚMENES (IZQUIERDA) ---
  const { data: promotionsData, isLoading: isLoadingPromotions } = UseFetchQuery(
    'promotionsSummary',
    '/promotions/summary',
    tienePermiso('ver_vista_promociones')
  );
  const { data: combosData, isLoading: isLoadingCombos } = UseFetchQuery(
    'combosSummary',
    '/combos/summary',
    tienePermiso('ver_vista_combos')
  );
  const { data: presentationsData, isLoading: isLoadingPresentations } = UseFetchQuery(
    'presentationsSummary',
    '/presentations/summary',
    tienePermiso('listar_presentaciones')
  );

  // --- QUERIES PARA DESTACADOS (DERECHA) ---
  const { data: highlightPromos, isLoading: isLoadingHighlightPromos } = UseFetchQuery(
    'highlightPromos',
    '/promotions?is_active=true&limit=3',
    tienePermiso('ver_vista_promociones')
  );
  const { data: highlightCombos, isLoading: isLoadingHighlightCombos } = UseFetchQuery(
    'highlightCombos',
    '/combos?is_active=true&limit=3',
    tienePermiso('ver_vista_combos')
  );
  const { data: highlightPresentations, isLoading: isLoadingHighlightPresentations } = UseFetchQuery(
    'highlightPresentations',
    '/presentations?mode=dashboard',
    tienePermiso('listar_presentaciones')
  );

  const cards = [
    {
      permission: 'ver_vista_promociones',
      title: 'Promociones',
      icon: <LocalOfferIcon sx={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }} />,
      isLoading: isLoadingPromotions || isLoadingHighlightPromos,
      linkTo: '/promociones',
      summaryData: {
        count: promotionsData?.activeCount,
        countLabel: 'Activas',
        latestLabel: 'Última Creada:',
        latestItemName: promotionsData?.latestPromotion?.name,
      },
      highlightItems: highlightPromos
    },
    {
      permission: 'ver_vista_combos',
      title: 'Combos',
      icon: <ExtensionIcon sx={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }} />,
      isLoading: isLoadingCombos || isLoadingHighlightCombos,
      linkTo: '/combos',
      summaryData: {
        count: combosData?.activeCount,
        countLabel: 'Activos',
        latestLabel: 'Último Creado:',
        latestItemName: combosData?.latestCombo?.name,
      },
      highlightItems: highlightCombos
    },
    {
      permission: 'listar_presentaciones', // Changed from ver_productos
      title: 'Presentaciones',
      icon: <CategoryIcon sx={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }} />,
      isLoading: isLoadingPresentations || isLoadingHighlightPresentations,
      linkTo: '/stock',
      summaryData: {
        count: presentationsData?.totalCount,
        countLabel: 'Totales',
        latestLabel: 'Última Creada:',
        latestItemName: presentationsData?.latestPresentation ? `${presentationsData.latestPresentation.name} (${presentationsData.latestPresentation.productName})` : 'N/A',
      },
      highlightItems: highlightPresentations?.presentations
    }
  ];

  // Filtrar cards basado en permisos
  const visibleCards = cards.filter(card => tienePermiso(card.permission));

  return (
    <Box sx={{ mt: 'clamp(1rem, 2vw, 4rem)', position: 'relative' }}>
      {/* Header modernizado */}
      <Box
        sx={{
          mb: 4,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            border: `1px solid ${theme.palette.primary.main}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp sx={{
            fontSize: '2rem',
            color: theme.palette.primary.main,
          }} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.light})`
                : undefined,
              backgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
              WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : undefined,
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : undefined,
              mb: 0.5,
            }}
          >
            Novedades
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.95rem',
            }}
          >
            Últimas actualizaciones y elementos destacados
          </Typography>
        </Box>

        {/* Decorative line */}
        <Box
          sx={{
            flexGrow: 1,
            height: '2px',
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`
              : `linear-gradient(90deg, transparent, ${theme.palette.divider}, transparent)`,
            borderRadius: '1px',
            ml: 2,
          }}
        />
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={4}>
        {visibleCards.map((card, index) => (
          <Grid item xs={12} key={card.permission}>
            <Fade
              in={true}
              timeout={600 + (index * 200)}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Box>
                <DynamicInfoCard
                  title={card.title}
                  icon={card.icon}
                  summaryData={card.summaryData}
                  highlightItems={card.highlightItems}
                  isLoading={card.isLoading}
                  onClick={() => navigate(card.linkTo)}
                />
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Empty state cuando no hay cards visibles */}
      {visibleCards.length === 0 && (
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: '16px',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(22, 27, 34, 0.9))'
                : 'linear-gradient(135deg, rgba(224, 224, 224, 0.8), rgba(232, 232, 232, 0.9))',
              border: `1px solid ${theme.palette.divider}`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes permisos para ver las novedades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacta con tu administrador para obtener los permisos necesarios
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${theme.palette.primary.main}10, transparent)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}08, transparent)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </Box>
  );
};

export default NovedadesSection;