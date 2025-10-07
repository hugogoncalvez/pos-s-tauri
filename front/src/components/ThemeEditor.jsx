import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Stack,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Chip,
  Divider,
  IconButton,
  Switch,
  Tooltip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { MuiColorInput } from 'mui-color-input';
import { createTheme } from '@mui/material/styles';
import { ColorModeContext } from '../context/ThemeContextProvider';
import palette from '../theme/palette';
import { usePermissions } from '../hooks/usePermissions';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import HomeIcon from '@mui/icons-material/Home';

// --- Helpers para no depender de Lodash ---
const get = (obj, path, defaultValue = undefined) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      return defaultValue;
    }
  }
  return result;
};

const set = (obj, path, value) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
};
// --- Fin de Helpers ---

// Componente para mostrar ejemplos contextuales
const ColorPreview = ({ colorPath, colorValue, theme, localPalette }) => {
  const processSinglePaletteValueForDisplay = (value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.type === 'radial' && Array.isArray(value.colors) && value.colors.length >= 2) {
        const shape = value.shape || 'circle';
        const position = value.position ? ` at ${value.position}` : '';
        return `radial-gradient(${shape}${position}, ${value.colors[0]} 0%, ${value.colors[1]} 100%)`;
      } else if (value.type === 'linear' && Array.isArray(value.colors) && value.colors.length >= 2) {
        const direction = value.direction ? `${value.direction}, ` : '';
        return `linear-gradient(${direction}${value.colors[0]}, ${value.colors[1]})`;
      } else if (value.properties && value.color) {
        return value.color;
      }
    } else if (typeof value === 'string') {
      const shadowColorMatch = value.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/);
      if (shadowColorMatch && shadowColorMatch[0]) {
        return shadowColorMatch[0];
      }
    }
    return value;
  };

  const displayColor = processSinglePaletteValueForDisplay(colorValue);

  const renderPreview = () => {
    switch (colorPath) {
      case 'background.appBar':
        return (
          <AppBar position="static" sx={{ backgroundColor: displayColor }}>
            <Toolbar variant="dense">
              <HomeIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Título
              </Typography>
            </Toolbar>
          </AppBar>
        );
      case 'background.tableHeader':
        return (
          <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: displayColor, color: theme.palette.getContrastText(displayColor) }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: displayColor, color: theme.palette.getContrastText(displayColor) }}>Nombre</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        );
      case 'primary.main':
        return (
          <Stack spacing={1} alignItems="center">
            <TextField
              label="Campo de Texto"
              variant="outlined"
              size="small"
              defaultValue="Valor"
              focused
              sx={{
                minWidth: '120px',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: displayColor,
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: displayColor,
                },
              }}
            />
          </Stack>
        );

      case 'secondary.main':
        return (
          <Stack spacing={1} alignItems="center">
            <IconButton size="large" sx={{ color: displayColor }}>
              <HomeIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        );

      case 'button.contained.main':
        return (
          <StyledButton
            variant="contained"
            size="small"
            sx={{ backgroundColor: displayColor, '&:hover': { backgroundColor: displayColor, opacity: 0.9 }, minWidth: '120px' }}
          >
            Contained
          </StyledButton>
        );

      case 'button.outlined.main':
        return (
          <StyledButton
            variant="outlined"
            size="small"
            sx={{ borderColor: displayColor, color: displayColor, '&:hover': { backgroundColor: 'transparent', borderColor: displayColor, opacity: 0.9 }, minWidth: '120px' }}
          >
            Outlined
          </StyledButton>
        );

      case 'background.default':
        return (
          <Box
            sx={{
              width: '100%',
              height: '60px',
              background: displayColor,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">Fondo Principal</Typography>
          </Box>
        );

      case 'background.paper':
        return (
          <Paper
            sx={{
              p: 1,
              background: displayColor,
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">Paper Component</Typography>
          </Paper>
        );

      case 'background.card':
        return (
          <Card sx={{ background: displayColor, minHeight: '60px' }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption">Card Background</Typography>
            </CardContent>
          </Card>
        );

      case 'background.componentHeaderBackground':
        return (
          <Paper
            sx={{
              p: 1,
              background: displayColor,
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.text.primary
            }}
          >
            <Typography variant="caption">Cabecera de Componente</Typography>
          </Paper>
        );

      case 'text.primary':
      case 'text.secondary':
      case 'text.titlePrimary':
      case 'text.titleSecondary':
        return (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: displayColor }}
            >
              Texto de Ejemplo
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: displayColor }}
            >
              Subtítulo
            </Typography>
          </Box>
        );

      case 'info.main':
        return (
          <Alert
            icon={<InfoIcon />}
            severity="info"
            sx={{
              '& .MuiAlert-icon': { color: displayColor },
              fontSize: '0.75rem',
              py: 0.5
            }}
          >
            Información
          </Alert>
        );

      case 'warning.main':
        return (
          <Alert
            icon={<WarningIcon />}
            severity="warning"
            sx={{
              '& .MuiAlert-icon': { color: displayColor },
              fontSize: '0.75rem',
              py: 0.5
            }}
          >
            Advertencia
          </Alert>
        );

      case 'divider':
        return (
          <Stack spacing={1}>
            <Typography variant="caption">Texto</Typography>
            <Divider sx={{ borderColor: displayColor }} />
            <Typography variant="caption">Más texto</Typography>
          </Stack>
        );

      case 'common.backdropOverlay':
        return (
          <Box
            sx={{
              width: '100%',
              height: '60px',
              background: `${displayColor}`,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              Modal Overlay
            </Typography>
          </Box>
        );

      case 'shadows.card':
      case 'shadows.cardHover':
        const shadowValue = typeof colorValue === 'object' && colorValue.properties && colorValue.color
          ? `${colorValue.properties} ${colorValue.color}`
          : colorValue;
        return (
          <Card
            sx={{
              minHeight: '60px',
              boxShadow: shadowValue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption">
              {colorPath.includes('Hover') ? 'Card Hover' : 'Card Shadow'}
            </Typography>
          </Card>
        );

      default:
        return (
          <Box
            sx={{
              width: '100%',
              height: '40px',
              backgroundColor: displayColor,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: theme.palette.getContrastText(displayColor) }}>
              Vista Previa
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderPreview()}
    </Box>
  );
};

const ThemeEditor = () => {
  const { tienePermiso, isLoading: permissionsLoading } = usePermissions();
  const { Theme, customPalette, SetColorMode, mode } = useContext(ColorModeContext);

  const [localPalette, setLocalPalette] = useState({});

  useEffect(() => {
    if (customPalette && customPalette[mode]) {
      setLocalPalette(customPalette[mode]);
    } else {
      setLocalPalette(palette[mode] || {});
    }
  }, [customPalette, mode]);

  const categorizedPalette = {
    'Colores Principales': {
      'Primario': { path: 'primary.main', description: 'Color principal para bordes y etiquetas de campos de texto.' },
      'Secundario': { path: 'secondary.main', description: 'Color para iconos y elementos de menor énfasis.' },
    },
    'Fondos': {
      'Fondo Principal': { path: 'background.default', description: 'El color de fondo general de la aplicación.' },
      'Fondo Paper': { path: 'background.paper', description: 'Usado para superficies elevadas como tarjetas, menús y diálogos.' },
      'Fondo de Diálogo': { path: 'background.dialog', description: 'Color de fondo para los componentes de diálogo y modales.' },
      'Fondo Card (Landing)': { path: 'background.card', description: 'Fondo para las tarjetas de la página principal.' },
      'Fondo de Tarjeta (General)': { path: 'background.styledCard', description: 'Fondo para las tarjetas genéricas usadas en la aplicación.' },
      'Fondo Cabecera de Componente': { path: 'background.componentHeaderBackground', description: 'Fondo para la cabecera de los componentes, como títulos de secciones.' },
    },
    'Texto': {
      'Texto Primario': { path: 'text.primary', description: 'El color principal para la mayoría del texto.' },
      'Texto Secundario': { path: 'text.secondary', description: 'Para texto con menor importancia, como subtítulos o metadatos.' },
      'Título Primario': { path: 'text.titlePrimary', description: 'Color principal para títulos y encabezados.' },
      'Título Secundario': { path: 'text.titleSecondary', description: 'Color secundario para títulos y encabezados de menor énfasis.' },
    },
    'Estados y Alertas': {
      'Info Principal': { path: 'info.main', description: 'Color principal para mensajes informativos.' },
      'Info Oscuro': { path: 'info.dark', description: 'Variante oscura del color informativo.' },
      'Warning Principal': { path: 'warning.main', description: 'Color principal para advertencias.' },
      'Warning Oscuro': { path: 'warning.dark', description: 'Variante oscura del color de advertencia.' },
    },
    'Elementos de Interfaz': {
      'Botón Contained': { path: 'button.contained.main', description: 'Color de fondo para botones principales con variante "contained".' },
      'Botón Outlined': { path: 'button.outlined.main', description: 'Color de borde y texto para botones secundarios con variante "outlined".' },
      'Divisor': { path: 'divider', description: 'Color para líneas divisorias y bordes sutiles.' },
      'Fondo de Barra de Navegación': { path: 'background.appBar', description: 'Color de fondo para la barra de navegación principal (AppBar).' },
      'Fondo Cabecera de Tabla': { path: 'background.tableHeader', description: 'Color de fondo para la cabecera de las tablas principales.' },
      'Overlay de Modal': { path: 'common.backdropOverlay', description: 'Color para el fondo oscuro que aparece detrás de los modales.' },
    },
    'Sombras y Efectos': {
      'Sombra de Card': { path: 'shadows.card', description: 'Define la sombra predeterminada para las tarjetas.' },
      'Sombra Card Hover': { path: 'shadows.cardHover', description: 'Define la sombra para las tarjetas al pasar el ratón por encima.' },
    }
  };

  const handlePaletteChange = (path, newColorOrGradientPart, index = null) => {
    const newLocalPalette = JSON.parse(JSON.stringify(localPalette || {}));

    if (index !== null) { // This block is for gradient colors
      let gradientObj = get(newLocalPalette, path);

      if (!gradientObj && get(palette[mode], path)) {
        set(newLocalPalette, path, JSON.parse(JSON.stringify(get(palette[mode], path))));
        gradientObj = get(newLocalPalette, path);
      }

      if (gradientObj && Array.isArray(gradientObj.colors)) {
        gradientObj.colors[index] = newColorOrGradientPart;
      }
    } else { // This block is for simple colors or complex objects like shadows
      const currentValue = get(newLocalPalette, path);

      if (typeof currentValue === 'object' && currentValue !== null && currentValue.hasOwnProperty('color')) {
        set(newLocalPalette, `${path}.color`, newColorOrGradientPart);
      } else {
        set(newLocalPalette, path, newColorOrGradientPart);
      }
    }
    setLocalPalette(newLocalPalette);
  };

  const handleSave = () => {
    SetColorMode.updatePalette(localPalette, mode);
  };

  const handleRestoreDefaults = () => {
    const defaultModePalette = JSON.parse(JSON.stringify(palette[mode]));
    setLocalPalette(defaultModePalette);
    SetColorMode.updatePalette(defaultModePalette, mode);
  };

  if (permissionsLoading) {
    return <Typography>Cargando permisos...</Typography>;
  }

  if (!tienePermiso('accion_editar_tema')) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Acceso Denegado. No tienes los permisos necesarios para editar el tema.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          mt: 2,
          background: (theme) => theme.palette.background.componentHeaderBackground,
          color: Theme.palette.primary.contrastText
        }}
      >
        <Typography variant="h4" gutterBottom>
          Editor de Tema
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: Theme.palette.text.titlePrimary }}>Paleta de Colores ({mode} mode)</Typography>
          <Stack direction="row" spacing={2}>
            <StyledButton variant="contained" onClick={handleSave}>Guardar</StyledButton>
            <StyledButton sx={{ padding: '2px 12px' }} variant="outlined" onClick={handleRestoreDefaults}>Restaurar</StyledButton>
          </Stack>
        </Box>

        {/* Renderizar cada categoría */}
        {Object.entries(categorizedPalette).map(([categoryName, categoryColors]) => (
          <Box key={categoryName} sx={{ mb: 4 }}>
            {/* Encabezado de categoría */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: Theme.palette.text.titleSecondary,
                borderBottom: `2px solid ${Theme.palette.text.titleSecondary}`,
                pb: 1,
                display: 'inline-block'
              }}
            >
              {categoryName}
            </Typography>

            {/* Grid de colores de la categoría */}
            <Grid container spacing={3}>
              {Object.entries(categoryColors).map(([colorName, { path, description }]) => {
                const currentColorValue = get(localPalette, path) || get(palette[mode], path);
                const isGradientObject = typeof currentColorValue === 'object' && currentColorValue !== null &&
                  (currentColorValue.type === 'radial' || currentColorValue.type === 'linear') &&
                  Array.isArray(currentColorValue.colors);

                return (
                  <Grid item xs={12} sm={6} md={4} key={`${categoryName}-${colorName}`}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {colorName}
                        </Typography>
                        <Tooltip title={description} placement="right">
                          <IconButton size="small" sx={{ ml: 0.5 }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Vista previa contextual */}
                      <ColorPreview
                        colorPath={path}
                        colorValue={currentColorValue}
                        theme={Theme}
                        localPalette={localPalette}
                      />

                      {/* Controls de edición */}                      {isGradientObject ? (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">Colores del Gradiente:</Typography>
                          {currentColorValue.colors.map((color, index) => (
                            <MuiColorInput
                              key={`${path}-${index}`}
                              label={`Color ${index + 1}`}
                              value={color}
                              onChange={(newColor) => handlePaletteChange(path, newColor, index)}
                              format="hex8"
                              fullWidth
                              size="small"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <MuiColorInput
                          label={colorName}
                          value={typeof currentColorValue === 'object' && currentColorValue !== null && currentColorValue.color ? currentColorValue.color : currentColorValue}
                          onChange={(color) => handlePaletteChange(path, color)}
                          format="hex8"
                          fullWidth
                          size="small"
                        />
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default ThemeEditor;