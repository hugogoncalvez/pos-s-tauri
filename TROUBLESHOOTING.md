# Guía de Solución de Problemas (Troubleshooting Guide)

## Error: `TypeError: styled_default is not a function`

Este error ocurre cuando Material-UI (MUI) no puede encontrar o utilizar correctamente su motor de estilos `styled`. En este proyecto, se intentó usar `styled-components` como motor de estilos para MUI, lo cual generó conflictos persistentes con `pnpm` y Vite.

**La solución aplicada fue eliminar `styled-components` y configurar Material-UI para que use su motor de estilos por defecto: Emotion.**

### Pasos para resolver el error si vuelve a aparecer:

Si te encuentras con este error nuevamente (especialmente después de cambiar de rama, actualizar dependencias o si la configuración del proyecto se ha modificado para intentar usar `styled-components`), sigue estos pasos:

1.  **Asegúrate de que Emotion sea el motor de estilos configurado:**
    *   **Verifica `front/package.json`:** Asegúrate de que `styled-components` y `@mui/styled-engine-sc` NO estén listados en las `dependencies`. Si lo están, elimínalos. Las dependencias `@emotion/react` y `@emotion/styled` deben estar presentes.
    *   **Verifica `front/src/context/ThemeContextProvider.jsx`:** Asegúrate de que **NO** se importe ni se use `StyledEngineProvider`. La importación debe ser `import { ThemeProvider } from '@mui/material/styles';` y el envoltorio `StyledEngineProvider` debe ser eliminado.
    *   **Verifica `front/vite.config.js`:** Asegúrate de que el bloque `resolve.alias` **NO** contenga entradas para `@mui/styled-engine` o `styled-components`. También, el bloque `optimizeDeps` **NO** debe incluir `styled-components`.

2.  **Realiza una limpieza exhaustiva y reinstala las dependencias:**
    *   **Limpia la caché global de pnpm:**
        ```bash
        pnpm store prune
        ```
    *   **Elimina todos los directorios `node_modules` del proyecto:**
        ```bash
        rm -rf node_modules back/node_modules front/node_modules
        ```
    *   **Reinstala todas las dependencias del proyecto:**
        ```bash
        pnpm install
        ```
    *   **Instala explícitamente las dependencias del frontend (es crucial para asegurar que `vite` se encuentre):**
        ```bash
        pnpm install --dir front
        ```
    *   **Limpia la caché de compilación de Vite:**
        ```bash
        rm -rf front/node_modules/.vite
        ```

3.  **Reinicia tu servidor de desarrollo:**
    *   Vuelve a ejecutar el comando `pnpm tauri dev`.

Estos pasos fuerzan a Material-UI a usar su motor de estilos por defecto (Emotion) y aseguran una instalación limpia de todas las dependencias, resolviendo los problemas de resolución que causaban el error `styled_default is not a function` y "vite: not found".

## Investigación: ¿Por qué ocurre este error?

La aparición recurrente del error `TypeError: styled_default is not a function`, especialmente en un contexto de `pnpm`, Vite y Material-UI con `styled-components` v6, se debe a una combinación de factores complejos:

1.  **Estricta vinculación de dependencias de `pnpm`:** `pnpm` usa un modelo de `node_modules` basado en *symlinks* (enlaces simbólicos) que es más estricto que `npm` o `yarn`. Esto puede causar problemas con paquetes que esperan una estructura de `node_modules` más plana o que dependen de comportamientos específicos de *hoisting* (elevación de dependencias). Cuando `@mui/styled-engine-sc` intenta importar `styled-components` internamente, la resolución de `pnpm` podría no proporcionar correctamente la exportación `styled` si hay sutiles incompatibilidades de versión o si `styled-components` no se "eleva" (hoisted) al lugar exacto donde `@mui/styled-engine-sc` lo espera.

2.  **Interoperabilidad ESM/CJS y `exports` maps:** Las diferencias entre los módulos de JavaScript modernos (ESM) y CommonJS (CJS) pueden generar problemas complejos de interoperabilidad. `styled-components` v6 y Material-UI v5 utilizan ESM. Los *bundlers* como Vite dependen del mapa `exports` en `package.json` para la resolución de módulos. Cualquier ambigüedad o configuración incorrecta en estos mapas, o la forma en que Vite los interpreta, podría llevar a que `styled_default` sea `undefined`.

3.  **Conflictos de dependencias transitivas:** Aunque las versiones principales de `@mui/material` y `styled-components` v6 sean teóricamente compatibles, una dependencia transitiva (una dependencia de una dependencia) podría estar introduciendo una versión antigua o incompatible de `@emotion/styled` o de alguna otra utilidad de estilos. Esto crearía una función `styled` "sombra" que podría ser seleccionada incorrectamente, causando el error.

4.  **Problemas específicos de `styled-components` v6:** `styled-components` v6 introdujo cambios significativos. Es posible que existan casos límite o errores conocidos relacionados con su integración en ciertos *bundlers* o configuraciones específicas de Material-UI, especialmente cuando se combina con `pnpm`.

**¿Por qué se rompía al cambiar de rama?**
Al cambiar de rama, si la nueva rama tenía un archivo `pnpm-lock.yaml` diferente o versiones de dependencias distintas (incluso si eran cambios menores), `pnpm` podría intentar optimizar o volver a resolver las dependencias. Esto podría llevar a un estado en el que la importación interna de `styled-components` dentro de `@mui/styled-engine-sc` se volviera `undefined`, incluso si había funcionado antes. La limpieza agresiva de la caché y la reinstalación completa fueron necesarias para asegurar un punto de partida limpio, pero el problema fundamental residía en la configuración de `styled-components` en sí misma.

**Conclusión:** La causa más probable fue una combinación de la estricta resolución de `pnpm`, las peculiaridades de `styled-components` v6 con Material-UI v5 en este entorno de *bundling* específico (Vite), y cómo `@mui/styled-engine-sc` fue diseñado para unir estos sistemas. Al volver al motor de estilos por defecto de Material-UI (Emotion), evitamos esta compleja interacción de dependencias y configuraciones del *bundler*.
