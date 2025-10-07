# Propuesta de Implementación para Migración de Inventario

Este documento detalla la estrategia para migrar los datos de `inventario.csv` al nuevo sistema POS, manejando la diversidad de códigos de barras y la calidad de los datos.

## 1. Análisis de Datos

El análisis de `inventario.csv` revela:
*   **Total de Productos:** 8528
*   **EAN-13 (13 dígitos):** 4431 (Migración directa)
*   **GTIN-14 (14 dígitos):** 2 (Cajas/Bultos)
*   **Códigos Internos/Inválidos:** 389
*   **Sin Código:** 3706

## 2. Estrategia de Implementación

### Paso 1: Modificación de la Base de Datos

Crear una nueva tabla `ProductPackages` para manejar los códigos de cajas/bultos (GTIN-14).

*   **`ProductPackages`:**
    *   `id` (PK)
    *   `stock_id` (FK a `Stocks`)
    *   `barcode` (GTIN-14)
    *   `quantity` (Unidades dentro del paquete)
    *   `description`

### Paso 2: Modificación del Backend (API)

1.  **Nuevo Endpoint para `ProductPackages`:**
    *   Crear rutas CRUD (`/api/product-packages`) para gestionar los paquetes de productos.
2.  **Endpoint de Búsqueda Unificado:**
    *   Modificar el endpoint de búsqueda de productos (`/api/products/search/:barcode`) para que busque tanto en la tabla `Stocks` (EAN-13) como en `ProductPackages` (GTIN-14).
    *   Si se encuentra un GTIN-14, la API devolverá el producto individual asociado y la cantidad del paquete.

### Paso 3: Modificación del Frontend

1.  **`StockManager.jsx`:**
    *   Añadir una nueva sección para crear, editar y eliminar paquetes de productos (`ProductPackages`) asociados a un producto existente.
    *   Permitir generar códigos de barras para paquetes.
2.  **`PurchasesManager.jsx` y `Ventas.jsx`:**
    *   Adaptar la lógica para que al escanear un código de barras, se consulte el nuevo endpoint unificado.
    *   Si se escanea un GTIN-14 en una compra, autocompletar el producto y la cantidad correspondiente al paquete.

### Paso 4: Script de Migración Final

Desarrollar un script (Node.js o similar) que realice lo siguiente:

1.  **Leer `inventario.csv`:** Procesar el archivo línea por línea.
2.  **Validar Código:**
    *   **13 dígitos (EAN-13):** Importar como producto individual en `Stocks`.
    *   **14 dígitos (GTIN-14):**
        *   Importar el producto base en `Stocks` (si no existe).
        *   Crear una entrada en `ProductPackages` ligada al producto, asumiendo una cantidad a definir (ej. 24 para el caso de Pantene).
    *   **Otros/Sin código:** Importar el producto en `Stocks` por su nombre, dejando el campo `barcode` vacío para su posterior asignación manual.
3.  **Manejar Datos Faltantes:**
    *   Asignar "Proveedor Desconocido" a productos sin `Departamento`.
    *   Asignar "Categoría General" por defecto.
    *   Asignar "Unitario" por defecto.
    *   Dejar `cost_price` y `min_stock` en 0 o `null`.

Este plan asegura una migración robusta, manteniendo la integridad de los datos y preparando el sistema para una gestión de inventario más avanzada que incluye tanto unidades individuales como bultos.
