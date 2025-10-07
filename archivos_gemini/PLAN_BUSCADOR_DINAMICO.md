# Plan de Implementación: Buscador Dinámico de Productos en Ventas

**Objetivo:** Optimizar el rendimiento y la precisión del autocompletado de productos en la vista de Ventas, que actualmente carga más de 8000 registros, causando lentitud y resultados de búsqueda imprecisos.

## Paso 1: Modificación del Backend

-   **Archivo a modificar:** `back/controllers/Controller.js`
-   **Función:** `getStocks` (o la función encargada de `/stock`).
-   **Lógica a implementar:**
    1.  Detectar un nuevo parámetro en la consulta (query param), por ejemplo, `search`.
    2.  Si `search` está presente, modificar la consulta de Sequelize para incluir una cláusula `WHERE` con `[Op.like]` en el campo `name` del producto. La búsqueda será del tipo `'%termino%'`.
    3.  Añadir un `LIMIT` a la consulta (ej. 25 resultados) cuando se use el parámetro `search` para asegurar respuestas rápidas y ligeras.

## Paso 2: Modificación del Frontend

-   **Archivo a modificar:** `front/src/components/Ventas.jsx`
-   **Lógica a implementar:**
    1.  **Importar `debounce`:** Importar la función `debounce` desde `../functions/Debounce.js`.
    2.  **Estado para la búsqueda:** Crear un estado para el valor de entrada del autocompletado: `const [inputValue, setInputValue] = useState('');`.
    3.  **Búsqueda dinámica:**
        *   Reemplazar el hook `UseQueryWithCache` que trae todos los productos por uno nuevo que se active con el `inputValue`.
        *   La URL de la consulta será dinámica: `/stock?unpaginated=true&search=${debouncedSearchTerm}`.
        *   La consulta se deshabilitará si el término de búsqueda está vacío para no hacer peticiones innecesarias.
    4.  **Debounce:** Envolver la función que actualiza el término de búsqueda para la API con la función `debounce` importada, usando un retardo de 300-500ms.
    5.  **Actualizar `StyledAutocomplete`:**
        *   Modificar el prop `options` para que use los datos del nuevo hook de búsqueda dinámica.
        *   Usar el prop `onInputChange` para actualizar el estado `inputValue`.
        *   Añadir `filterOptions={(x) => x}` para indicarle a Material-UI que no aplique su propio filtro, ya que los resultados vienen pre-filtrados del servidor.
        *   Añadir los props `loading` y `loadingText` para mejorar la experiencia de usuario mientras se espera la respuesta del backend.
