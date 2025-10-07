# Plan de Implementación de Indicadores de Carga

## Objetivo
Mejorar la experiencia de usuario (UX) mostrando feedback visual durante las operaciones que puedan tener latencia debido a la comunicación con la base de datos en la nube.

## Estrategia General
Estandarizar y aplicar un patrón de indicadores de carga en toda la aplicación, basándonos en el que ya existe en el modal de "Resumen de Venta".

## Plan de Acción

### 1. Identificar Acciones Críticas
Se implementarán indicadores de carga en las siguientes áreas prioritarias:

- **Módulo de Ventas:**
  - [ ] Guardar un ticket pendiente.
  - [ ] Cargar un ticket pendiente.
  - [ ] Eliminar un ticket pendiente.
- **Gestión de Entidades:**
  - [ ] Crear, actualizar y eliminar Productos (Gestor de Stock).
  - [ ] Crear, actualizar y eliminar Clientes.
  - [ ] Crear, actualizar y eliminar Proveedores.
  - [ ] Crear, actualizar y eliminar Promociones y Combos.
- **Módulo de Caja:**
  - [ ] Abrir sesión de caja.
  - [ ] Cerrar sesión de caja (iniciar y finalizar).
  - [ ] Registrar movimientos de caja (ingresos/egresos).
- **Reportes:**
  - [ ] Generar cualquier reporte que implique una consulta a la base de datos.

### 2. Patrón de Implementación
Para cada acción, se utilizará el estado `isPending` (o `isLoading`) que proporcionan los hooks `useSubmit` y `useDelete` de `react-query`.

- **En Botones:**
  - Se deshabilitará el botón para evitar clics duplicados.
  - Se mostrará un `CircularProgress` dentro del botón junto a un texto (ej: "Guardando...").
  - **Ejemplo:** `<StyledButton disabled={isPending}>{isPending ? <CircularProgress size={24} /> : 'Guardar'}</StyledButton>`

- **En Modales o Vistas Completas:**
  - Para acciones que bloquean la interacción con un modal (como guardar una venta), se usará una superposición (overlay) con un `CircularProgress` y un mensaje.
  - El código ya presente en `SummarySaleModal.jsx` se tomará como referencia.

- **Para Carga de Datos:**
  - Al cargar listas de datos (ej: tabla de productos), se utilizarán componentes `Skeleton` de Material-UI para simular la estructura del contenido que está por aparecer.
