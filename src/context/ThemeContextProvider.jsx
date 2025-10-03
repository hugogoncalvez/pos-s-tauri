import { createContext, useMemo, useState, useEffect, useContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { esES } from '@mui/material/locale';
import theme from '../theme/theme';
import { AuthContext } from './AuthContext';
import { Api } from '../api/api';
import { UseFetchQuery } from '../hooks/useQuery';
import { Update } from '../hooks/useUpdate';
import { mostrarExito } from '../functions/mostrarExito';
import { Box, CircularProgress } from '@mui/material'; // Asegúrate de que Box y CircularProgress estén importados de aquí

export const ColorModeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const { usuario, updateUserTheme, isLoading: authLoading } = useContext(AuthContext);


  const [mode, setMode] = useState(() => {
    const initialMode = (authLoading === false && usuario?.theme_preference) ? usuario.theme_preference : 'dark';

    return initialMode;
  });

  // 1. Obtener el objeto de temas (que contiene light y dark) desde el backend
  const { data: customPalette, isLoading: isLoadingPalette, refetch: refetchThemeSettings } = UseFetchQuery('themeSettings', '/api/theme');

  // 2. Obtener la función de mutación para actualizar el tema
  const { mutate: updateThemeMutation } = Update(['themeSettings']);

  // Sincronizar el modo (light/dark) con la preferencia del usuario
  useEffect(() => {
    if (!authLoading && usuario?.theme_preference) {
      setMode(usuario.theme_preference);
    } else if (!authLoading && usuario === null) {
      setMode('dark'); // Ensure default if user is not logged in
    }
  }, [usuario, authLoading]);

  // 3. Crear la función que el editor de temas usará para guardar los cambios
  const updatePalette = (newPaletteForMode, modeToUpdate) => {
    updateThemeMutation(
      {
        url: '/api/theme',
        datos: { mode: modeToUpdate, palette: newPaletteForMode } // Enviar el modo y la paleta
      },
      {
        onSuccess: () => {
          refetchThemeSettings();
          const tempTheme = theme(modeToUpdate, newPaletteForMode, esES);
          mostrarExito('Tema guardado y aplicado correctamente.', tempTheme);
        }
      }
    );
  };

  const SetColorMode = useMemo(
    () => ({
      toggleColorMode: async () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        try {
          await Api.put('/users/theme', { theme: newMode });
          setMode(newMode);
          updateUserTheme(newMode);
        } catch (error) {
          console.error("Error al actualizar el modo del tema:", error);
        }
      },
      updatePalette // La función ahora es consciente del modo
    }),
    [mode, updateUserTheme, updateThemeMutation]
  );

  // 4. Fusionar el tema base con la paleta personalizada para el modo actual
  const currentTheme = useMemo(() => {
    const modePalette = customPalette?.[mode] || {};
    return theme(mode, modePalette, esES);
  }, [mode, customPalette]);

  // Esperar a que la autenticación haya cargado para evitar el parpadeo del tema
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ColorModeContext.Provider value={{ SetColorMode, Theme: currentTheme, mode, customPalette }}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};