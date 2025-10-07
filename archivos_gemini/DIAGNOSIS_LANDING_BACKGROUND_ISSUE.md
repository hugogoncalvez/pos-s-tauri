
# Diagnóstico del Problema de Fondo Negro en Landing.jsx

Este documento resume el análisis y los intentos de solución para el problema de la franja negra que aparece al final de la página `Landing.jsx`.

## Problema

Al visualizar el componente `Landing.jsx`, si el contenido no llena toda la altura de la pantalla, al hacer scroll hasta el final se revela un área de color negro, en lugar del fondo de gradiente gris claro definido en el tema de la aplicación. Este problema es específico de `Landing.jsx`.

## Historial de Análisis y Acciones

1.  **Hipótesis Inicial:** Se pensó que el problema era global, causado por un `background-color` incorrecto en la etiqueta `<body>`.

2.  **Descubrimiento Clave:** El usuario aclaró que el tema de la aplicación no se carga desde `src/theme/palette.js`, sino desde la configuración guardada en la tabla `ThemeSettings` de la base de datos. Esto invalidó los análisis iniciales de los archivos de paleta locales.

3.  **Análisis del Tema de la BD:** Se revisó el `JSON` del tema extraído del archivo `.sql` y se confirmó que `background.default` era un objeto de gradiente (ej: `{type: 'linear', ...}`).

4.  **Primer Intento de Arreglo (Fallido):** Se detectó que el override de `MuiCssBaseline` en `componentsOverrides.js` intentaba usar este objeto directamente como un string CSS (`background: [object Object]`), lo cual es inválido. Se modificó `MuiCssBaseline` para que una función interna interpretara el objeto y generara el CSS `linear-gradient()` correcto. 
    *   **Resultado:** No funcionó, lo que llevó a la sospecha de que otro componente estaba sobreescribiendo el fondo.

5.  **Segundo Intento de Arreglo (Fallido):** El usuario especificó que el error **solo ocurría en `Landing.jsx`**. El análisis se centró en ese archivo.
    *   Se encontró que `Landing.jsx` tenía un `<Box>` principal con la misma propiedad `background: theme.palette.background.default` que causaba el error en `Dashboard.jsx`.
    *   Se encontró también que el contenedor raíz de `Landing.jsx` usaba `height: '100%'` en lugar de `flexGrow: 1`, lo que podía causar problemas de estiramiento vertical.

6.  **Acciones Realizadas (Estado Actual):**
    *   **En `front/src/theme/componentsOverrides.js`:** Se corrigió el `MuiCssBaseline` para que interprete correctamente el objeto de gradiente del tema y lo aplique al `<body>`.
    *   **En `front/src/components/Landing.jsx`:** 
        1.  Se reemplazó `style={{ height: '100%', ... }}` por `style={{ flexGrow: 1, ... }}` en el `motion.div` principal para asegurar que el componente se estire verticalmente.
        2.  Se eliminó la propiedad `background: theme.palette.background.default,` del `<Box>` interno para evitar que sobreescribiera el fondo global.

## Situación Actual y Próximos Pasos

A pesar de que la lógica parece correcta (fondo global gris claro + contenedor de `Landing` transparente y estirado), el problema persiste. Esto sugiere que la causa es aún más fundamental:

*   **Hipótesis Actual:** Es posible que los estilos de `MuiCssBaseline` no se estén aplicando en absoluto o estén siendo invalidados por alguna otra configuración de estilos a nivel raíz que aún no hemos detectado.

*   **Sugerencia para la tarde:** El próximo paso sería revisar el punto de entrada de la aplicación (`main.jsx`) y el `ThemeContextProvider` para asegurar que el `CssBaseline` y el tema se están inyectando correctamente en el árbol de componentes de React.
