import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import palette from './palette';
import componentsOverrides from './componentsOverrides';

// Helper function to process palette values and convert complex objects to CSS strings
const processPaletteValues = (paletteObj) => {
  if (typeof paletteObj !== 'object' || paletteObj === null) {
    return paletteObj;
  }

  // Handle gradient objects that should be converted to strings
  if (paletteObj.type === 'radial' && Array.isArray(paletteObj.colors) && paletteObj.colors.length >= 2) {
    const shape = paletteObj.shape || 'circle';
    const position = paletteObj.position ? ` at ${paletteObj.position}` : '';
    return `radial-gradient(${shape}${position}, ${paletteObj.colors[0]} 0%, ${paletteObj.colors[1]} 100%)`;
  }
  if (paletteObj.type === 'linear' && Array.isArray(paletteObj.colors) && paletteObj.colors.length >= 2) {
    const direction = paletteObj.direction ? `${paletteObj.direction}, ` : '';
    return `linear-gradient(${direction}${paletteObj.colors[0]}, ${paletteObj.colors[1]})`;
  }
  // Handle shadow objects
  if (paletteObj.properties && paletteObj.color) {
    return `${paletteObj.properties} ${paletteObj.color}`;
  }

  // If it's a regular object/array, recursively process its values
  const newObj = Array.isArray(paletteObj) ? [] : {};
  for (const key in paletteObj) {
    if (Object.prototype.hasOwnProperty.call(paletteObj, key)) {
      newObj[key] = processPaletteValues(paletteObj[key]);
    }
  }
  return newObj;
};

const baseTheme = (mode, customPalette = {}, ...args) => {
  const defaultPalette = JSON.parse(JSON.stringify(palette[mode]));

  let mergedPalette = deepmerge(defaultPalette, customPalette);

  // Process the merged palette to convert complex objects to strings
  mergedPalette = processPaletteValues(mergedPalette);

  return createTheme({
    palette: {
      mode,
      ...mergedPalette,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif', // Puedes ajustar la fuente si es necesario
      h1: { fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 600, lineHeight: 1.4 },
      h4: { fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 500, lineHeight: 1.5 },
      h5: { fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 500, lineHeight: 1.6 },
      h6: { fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 500, lineHeight: 1.6 },
      body1: { fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', lineHeight: 1.6 },
      body2: { fontSize: 'clamp(0.8rem, 1.6vw, 1rem)', lineHeight: 1.6 },
      button: { fontSize: 'clamp(0.8rem, 1.8vw, 1rem)', textTransform: 'none' },
      caption: { fontSize: 'clamp(0.7rem, 1.4vw, 0.9rem)', lineHeight: 1.5 },
      overline: { fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)', textTransform: 'uppercase' },
    },
    components: componentsOverrides(mode, mergedPalette),
  }, ...args);
};

export default baseTheme;
