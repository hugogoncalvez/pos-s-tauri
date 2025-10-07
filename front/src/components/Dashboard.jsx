import React, { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Skeleton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { UseFetchQuery } from '../hooks/useQuery';
import { useTheme } from '@mui/material/styles'; // Importar useTheme
import SummaryCard from '../styledComponents/dashboard/SummaryCard.jsx'; // Importar el componente extraído
import SummaryCardsSection from '../styledComponents/dashboard/SummaryCardsSection.jsx'; // Importar el componente de sección
import SalesStatsSection from '../styledComponents/dashboard/SalesStatsSection.jsx'; // Importar el componente de sección
import TablesSection from '../styledComponents/dashboard/TablesSection.jsx'; // Importar el componente de sección

// Importar iconos
import { MonetizationOn, ShoppingCart, People, Store, TrendingUp, Home, Assessment, Policy, CalendarMonth, DateRange, CalendarToday, ArrowUpward, ArrowDownward, TrendingFlat, UploadFile, ColorLens as ColorLensIcon, LocalOffer as LocalOfferIcon, Extension as ExtensionIcon, Print as PrintIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import NovedadesSection from '../styledComponents/dashboard/NovedadesSection.jsx';

const drawerWidth = 'clamp(180px, 18vw, 220px)';









// --- Barra Lateral del Dashboard ---
const DashboardSidebar = () => {
  const { tienePermiso } = usePermissions();
  const theme = useTheme(); // Importar y usar useTheme

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: theme.palette.background.paper, borderRight: `1px solid ${theme.palette.divider}` },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding component={RouterLink} to="/" sx={{ color: theme.palette.text.primary }}>
            <ListItemButton sx={{
              '&:hover .MuiListItemIcon-root': {
                transform: 'rotate(12deg) scale(1.1)',
                transition: 'transform 0.3s ease',
              }
            }}>
              <ListItemIcon sx={{
                mr: 1,
                p: 1.5,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                border: `1px solid ${theme.palette.primary.main}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}><Home sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
              <ListItemText primary="Landing" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          {tienePermiso('ver_vista_informes') && (
            <ListItem disablePadding component={RouterLink} to="/informes" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><Assessment sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Informes" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_auditoria') && (
            <ListItem disablePadding component={RouterLink} to="/auditoria" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><Policy sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Auditoría" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_usuarios') && (
            <ListItem disablePadding component={RouterLink} to="/usuarios" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><People sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Usuarios" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('accion_importar_stock') && (
            <ListItem disablePadding component={RouterLink} to="/dashboard/importar-stock" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><UploadFile sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Importar Stock" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_informes') && (
            <ListItem disablePadding component={RouterLink} to="/profit-report" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><Assessment sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Reporte de Ganancias" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_promociones') && (
            <ListItem disablePadding component={RouterLink} to="/promociones" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><LocalOfferIcon sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Promociones" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_combos') && (
            <ListItem disablePadding component={RouterLink} to="/combos" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><ExtensionIcon sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Combos" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_impresion_codigos') && (
            <ListItem disablePadding component={RouterLink} to="/barcode-printer" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><PrintIcon sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Imprimir Códigos de Barras" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_recargos_pagos') && (
            <ListItem disablePadding component={RouterLink} to="/gestion-recargos" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><CreditCardIcon sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Gestión de Recargos" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
          {tienePermiso('ver_vista_editor_tema') && (
            <ListItem disablePadding component={RouterLink} to="/editor-tema" sx={{ color: theme.palette.text.primary }}>
              <ListItemButton sx={{
                '&:hover .MuiListItemIcon-root': {
                  transform: 'rotate(12deg) scale(1.1)',
                  transition: 'transform 0.3s ease',
                }
              }}>
                <ListItemIcon sx={{
                  mr: 1,
                  p: 1.5,
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  border: `1px solid ${theme.palette.primary.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}><ColorLensIcon sx={{ color: theme.palette.text.primary, fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }} /></ListItemIcon>
                <ListItemText primary="Configurar Tema" sx={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};


// --- Componente Principal del Dashboard ---
export default function Dashboard() {
  const theme = useTheme(); // Importar y usar useTheme

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',

      // paddingTop: { xs: '56px', desktop: '80px' } // Añadir padding para compensar el AppBar
    }}>
      <DashboardSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 'clamp(1rem, 2vw, 3rem)', width: `calc(100% - ${drawerWidth}px)` }}>
        {/* <Toolbar sx={{ minHeight: { xs: '56px', desktop: '80px' } }} /> */}
        {/* <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>Dashboard</Typography> */}

        {/* Tarjetas de Resumen */}
        <Box sx={{ display: 'flex', gap: 'clamp(1rem, 2vw, 3rem)', flexWrap: 'wrap', alignItems: 'flex-start', mb: 'clamp(1rem, 2vw, 4rem)' }}>
          <SummaryCardsSection />

          {/* Columna derecha: Ventas Hoy / Semana / Mes */}
          <SalesStatsSection />

        </Box>

        {/* Tabla de Productos y Estadísticas de Ventas */}
        <TablesSection />

        {/* Fila de Tarjetas de Novedades */}
        <NovedadesSection />

      </Box>
    </Box>
  );
}
