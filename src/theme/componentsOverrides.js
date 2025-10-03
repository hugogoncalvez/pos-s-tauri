const componentsOverrides = (mode) => {
  const isLight = mode === 'light';

  return {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        body {
          background: ${theme.palette.background.default};
          min-height: 100vh;
          margin: 0;
        }
      `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.appBar,
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        outlinedPrimary: ({ theme }) => ({
          borderColor: theme.palette.button.outlined.main,
          color: theme.palette.button.outlined.main,
          '&:hover': {
            borderColor: theme.palette.button.outlined.main,
            backgroundColor: `${theme.palette.button.outlined.main}1A`,
          },
        }),
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.button.contained.main,
          color: theme.palette.getContrastText(theme.palette.button.contained.main),
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: theme.palette.augmentColor({ color: { main: theme.palette.button.contained.main } }).dark,
            boxShadow: 'none',
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
      styleOverrides: {
        root: ({
          theme
        }) => ({
          // Puedes añadir estilos específicos aquí si es necesario
        }),
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
      styleOverrides: {
        root: ({
          theme
        }) => ({
          // Puedes añadir estilos específicos aquí si es necesario
        }),
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
        },
        toolbar: {
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '8px',
          '& .MuiTablePagination-spacer': {
            display: 'none',
          },
        },
        // Anula el width: 100% que viene del defaultProp fullWidth en MuiSelect
        selectRoot: {
          width: 'auto',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        backdrop: ({ theme }) => ({
          backgroundColor: theme.palette.common.backdropOverlay, // Fondo oscuro para el modal, usando el token del tema
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    // Añadir más overrides de componentes aquí
  };
};

export default componentsOverrides;
