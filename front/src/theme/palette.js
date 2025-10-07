const palette = {
  light: {
    primary: {
      main: '#546E7A',
    },
    secondary: {
      main: '#C9E9D2',
    },
    button: {
      contained: {
        main: '#546E7A'
      },
      outlined: {
        main: '#546E7A'
      }
    },
    background: {
      default: {
        type: 'linear',
        direction: '135deg',
        colors: ['#ECECEC', '#F0F0F0']
      },
      paper: '#E0E0E0',
      dialog: '#E0E0E0',
      styledCard: '#E0E0E0',
      card: {
        type: 'linear',
        direction: '135deg',
        colors: ['#E0E0E0', '#E8E8E8']
      },
      appBar: '#546E7A',
      tableHeader: '#546E7A',
      componentHeaderBackground: {
        type: 'linear',
        direction: '135deg',
        colors: ['#546E7A', '#C9E9D2']
      },
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      titlePrimary: '#212121',
      titleSecondary: '#757575',
    },
    common: {
      backdropOverlay: 'rgba(0, 0, 0, 0.75)',
    },
    shadows: {
      card: {
        properties: 'inset 0 0 12px',
        color: 'rgba(0, 0, 0, 0.2)',
      },
      cardHover: {
        properties: '0 0 24px',
        color: 'rgba(0, 0, 0, 0.3)',
      },
    },
    info: {
      main: '#2196f3',
      dark: '#1976d2',
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
    },
    divider: '#BDBDBD', // Added divider
  },
  dark: {
    primary: {
      main: '#8C3061',
    },
    secondary: {
      main: '#D95F59',
    },
    button: {
      contained: {
        main: '#8C3061'
      },
      outlined: {
        main: '#8C3061'
      }
    },
    background: {
      default: {
        type: 'linear',
        direction: '135deg',
        colors: ['#020203', '#0e0d17']
      },
      paper: '#1A1A1A',
      dialog: '#1A1A1A',
      styledCard: '#1A1A1A',
      card: {
      type: 'radial',
      shape: 'circle',
      position: 'top left',
      colors: ['#161b22', '#0d1117']
    },
    appBar: '#8C3061',
    tableHeader: '#8C3061',
    componentHeaderBackground: {
      type: 'linear',
      direction: '135deg',
      colors: ['#8C3061', '#D95F59']
    },
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#8b949e',
      titlePrimary: '#c9d1d9',
      titleSecondary: '#8b949e',
    },
    common: {
      backdropOverlay: 'rgba(0, 0, 0, 0.75)',
    },
    shadows: {
      card: {
        properties: 'inset 0 0 12px',
        color: '#00f5ff33',
      },
      cardHover: {
        properties: '0 0 24px',
        color: '#00f5ff88',
      },
    },
    info: {
      main: '#63b3ed',
      dark: '#42a5f5',
    },
    warning: {
      main: '#ffa726',
      dark: '#fb8c00',
    },
    divider: '#424242', // Added divider
  },
};

export default palette;