const palette = {
  dark: {
    info: { dark: '#379defff', main: '#63b3ed' },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
      titlePrimary: '#c9d1d9',
      titleSecondary: '#8b949e',
    },
    button: {
      outlined: { main: '#d0217dff' },
      contained: { main: '#a4326fff' },
    },
    common: { backdropOverlay: '#1e1d1dff' },
    divider: '#424242',
    primary: { main: '#822454ff' },
    shadows: {
      card: { color: '#00f5ff33', properties: 'inset 0 0 12px' },
      cardHover: { color: '#00f5ff88', properties: '0 0 24px' },
    },
    warning: { dark: '#d77902ff', main: '#ff9903ff' },
    secondary: { main: '#cb609dff' },
    background: {
      card: {
        type: 'radial',
        shape: 'circle',
        colors: ['#141a23ff', '#19212dff'],
        position: 'top left',
      },
      paper: '#1a1a1aff',
      appBar: '#00787dff',
      dialog: '#1A1A1A',
      default: {
        type: 'linear',
        colors: ['#0d1117ff', '#0d1117ff'],
        direction: '135deg',
      },
      styledCard: '#1a1a1aff',
      tableHeader: '#b50345ff',
      componentHeaderBackground: {
        type: 'linear',
        colors: ['#023133ff', '#06686cff'],
        direction: '135deg',
      },
    },
  },
  light: {
    info: { dark: '#1565c0', main: '#1976d2' },
    text: {
      primary: '#2d2d2d',
      secondary: '#5a5a5a',
      titlePrimary: '#1a1a1a',
      titleSecondary: '#4a4a4a',
    },
    button: {
      outlined: { main: '#b53f78ff' },
      contained: { main: '#8d2e5f' },
    },
    common: { backdropOverlay: 'rgba(0, 0, 0, 0.6)' },
    divider: '#9e9e9e',
    primary: { main: '#6d1e47' },
    shadows: {
      card: { color: '#00000038', properties: 'inset 0 0 12px' },
      cardHover: { color: '#0000004a', properties: '0 0 24px' },
    },
    warning: { dark: '#e65100', main: '#f57c00' },
    secondary: { main: '#b85886' },
    background: {
      card: {
        type: 'linear',
        colors: ['#b8b8b8', '#c5c5c5'],
        direction: '135deg',
      },
      paper: '#e1e1e1ff',
      appBar: '#8d2e5fff',
      dialog: '#d9d9d9ff',
      default: {
        type: 'linear',
        colors: ['#d9d9d9ff', '#e1e1e1ff'],
        direction: '135deg',
      },
      styledCard: '#cfceceff',
      tableHeader: '#b53f78ff',
      componentHeaderBackground: {
        type: 'linear',
        colors: ['#8d2e5fff', '#f4c8ddff'],
        direction: '135deg',
      },
    },
  },
};

export default palette;
