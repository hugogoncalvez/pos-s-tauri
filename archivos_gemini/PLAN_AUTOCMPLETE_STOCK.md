# Plan de Optimización: Filtrado del Lado del Servidor para Autocomplete de Productos en Stock

## 1. Objetivo

Implementar un sistema de filtrado eficiente del lado del servidor para los componentes `Autocomplete` que muestran productos en stock. Esto permitirá manejar grandes volúmenes de productos sin cargar todos los datos de antemano, mejorando el rendimiento y la experiencia del usuario.

## 2. Problema Actual

Actualmente, los `Autocomplete` que listan productos en stock (obtenidos del endpoint `/stock`) cargan todos los productos (o un número limitado, como 1000) al inicio. Esto es ineficiente y no escalable para inventarios con muchos productos, ya que:
*   Carga datos innecesarios.
*   Puede causar problemas de rendimiento y memoria en el frontend.
*   No permite al usuario buscar productos más allá del límite de carga inicial.

## 3. Solución Propuesta: Filtrado del Lado del Servidor

La solución consiste en modificar el comportamiento del `Autocomplete` para que, en lugar de cargar todos los productos, envíe la entrada del usuario (el texto que está escribiendo) al backend. El backend (`getStocks`) filtrará los productos basándose en esa entrada y devolverá solo los resultados relevantes.

### 3.1. Pasos Detallados (Frontend)

Se modificarán los componentes `Autocomplete` afectados para que:
*   Utilicen el evento `onInputChange` para capturar el texto que el usuario está escribiendo.
*   Disparen una nueva consulta a la API (`/stock`) incluyendo este texto como un parámetro de búsqueda (ej. `name`).
*   Manejen los estados de carga (`isLoading`) y muestren un indicador visual (ej. `CircularProgress`) mientras se realiza la búsqueda.

**Modificaciones en `UseFetchQuery` (front/src/hooks/useQuery.js):**
La función `UseFetchQuery` necesitará ser lo suficientemente flexible para aceptar parámetros de búsqueda dinámicos. Actualmente, ya acepta un `queryParams` string, por lo que se puede adaptar para incluir el término de búsqueda.

**Modificaciones en los Componentes (front/src/components/):**

#### a) `PromotionsManager.jsx` (Autocomplete "Productos Aplicables")

1.  **Estado para el término de búsqueda:**
    ```jsx
    const [productSearchTerm, setProductSearchTerm] = useState('');
    ```
2.  **Modificar `UseFetchQuery` para productos:**
    ```jsx
    const { data: productsData, isLoading: productsLoading } = UseFetchQuery(
        ['products', productSearchTerm], // La clave de la query debe incluir el término de búsqueda
        `/stock?limit=100&name=${productSearchTerm}`, // Ajustar el límite si es necesario, y añadir el filtro por nombre
        true,
        0,
        { keepPreviousData: true } // Mantener datos anteriores mientras se carga
    );
    // Asegurarse de que 'productsData' contenga el array de productos, ej: productsData?.products
    const products = productsData?.products || [];
    ```
3.  **Configurar el `Autocomplete`:**
    ```jsx
    <Autocomplete
      multiple
      options={products} // Usar los productos filtrados
      getOptionLabel={(option) => option.name}
      value={formValues.products || []}
      onChange={(event, newValue) => {
        setFormValues({ ...formValues, products: newValue });
      }}
      onInputChange={(event, newInputValue) => {
        setProductSearchTerm(newInputValue); // Actualizar el término de búsqueda
      }}
      loading={productsLoading} // Mostrar indicador de carga
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label="Productos Aplicables"
          placeholder="Escribe para buscar productos"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
    ```

#### b) `PurchasesManager.jsx` (Autocomplete "Filtrar por producto contenido" y "Selecciona un producto")

Se aplicará una lógica similar a la de `PromotionsManager.jsx` para ambos `Autocomplete` que interactúan con los productos.

#### c) `Informes.jsx` (Autocomplete "Producto")

Se aplicará una lógica similar a la de `PromotionsManager.jsx` para el `Autocomplete` de "Producto".

### 3.2. Pasos Detallados (Backend)

El endpoint `router.get('/stock', ..., getStocks)` en `back/routes/routes.js` y la función `getStocks` en `back/controllers/Controller.js` ya soportan el filtrado por `name` a través del parámetro de consulta `name`.

**Verificación en `back/controllers/Controller.js` (función `getStocks`):**
Asegurarse de que la cláusula `where` maneje correctamente el parámetro `name`:
```javascript
if (name) {
    whereClause.name = {
        [Op.like]: `%${name}%`
    };
}
```
Esto ya está implementado, por lo que el backend está listo para recibir el término de búsqueda.

### 4. Consideraciones Adicionales

*   **Debounce:** Para evitar un exceso de peticiones al backend mientras el usuario escribe, se recomienda implementar un `debounce` en el `onInputChange` del `Autocomplete`. Esto se puede hacer con un custom hook (ej. `useDebounce`).
*   **Manejo de Errores:** Asegurarse de que los errores de la API se muestren adecuadamente al usuario.
*   **Límites de Paginación:** Ajustar los límites (`limit`) en las consultas del frontend según sea necesario para el rendimiento y la experiencia del usuario.

## 5. Verificación

Una vez implementados los cambios:
1.  Probar cada `Autocomplete` afectado:
    *   Verificar que la búsqueda funciona correctamente.
    *   Asegurarse de que los indicadores de carga se muestren.
    *   Confirmar que no hay errores en la consola.
2.  Navegar por la aplicación para asegurar que no se introdujeron regresiones.
