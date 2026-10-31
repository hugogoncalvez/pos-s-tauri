# Plan de testing del flujo de ventas

## Contexto

Se detectó un error 400 al registrar una venta con descuento:

- Cliente: `JULIAN - YEZA` (id 30005).
- Método de pago: Mercado Pago.
- Subtotal: $85.000.
- Descuento: $10.000.
- Total neto: $75.000.

El backend comparaba el total pagado contra `total_amount` (subtotal bruto, antes del descuento) en lugar de contra el neto. Como el front envía como pago el total final ($75.000), la validación fallaba con:

```text
Monto insuficiente: 75000.00 < 85000.00
```

La venta hacía rollback y no quedaba registrada. Mercado Pago no tenía recargo activo, por lo que el descuento no se compensaba con ningún recargo.

### Corrección aplicada

- `back/utils/paymentValidation.js`: calcula el monto esperado como `total_amount - promotion_discount + surcharge_amount`.
- `back/controllers/Controller.js`: usa esa función en `createSale`.
- `back/tests/paymentValidation.test.js`: tests unitarios del caso con descuento, sin descuento, con recargo, pago mixto, pago insuficiente y tolerancia de centavos.
- `back/package.json`: `npm test` ejecuta `node --test`.

Los tests unitarios no se conectan a ninguna base de datos.

## Objetivo

Detectar errores como el anterior antes de que lleguen a producción, cubriendo los caminos críticos de una venta sin intentar probar todas las combinaciones posibles, que son combinatorialmente inviables.

La estrategia es en capas:

1. Tests unitarios puros para cálculos y validaciones.
2. Tests de integración de `createSale` contra una base de test descartable.
3. Tests de contrato de la API para códigos de estado y permisos.
4. Tests del flujo offline.
5. Tests de frontend para cálculos y UI.
6. CI para ejecutar todo en cada PR.

## Prioridad 1: matriz de ventas

Armar una tabla de casos con estas dimensiones:

| Dimensión | Casos representativos |
|---|---|
| Método de pago | Efectivo, Mercado Pago, Tarjeta, Crédito, Cuenta corriente |
| Forma de pago | Simple y mixta (Efectivo+MP, Efectivo+Crédito, MP+Crédito) |
| Descuento | 0, $10.000, igual al subtotal, mayor al subtotal |
| Recargo | Inactivo, activo 5%, activo 0% |
| IVA | Apagado y encendido |
| Cliente | Consumidor Final (id 1) y cliente real |
| Ítems | Producto base, cantidad decimal, presentación, combo, producto manual |
| Stock | Suficiente, insuficiente y venta forzada |
| Pago | Exacto, $0,01 menos, $1 menos, con vuelto |
| Presupuesto | Sin presupuesto, presupuesto emitido, presupuesto ya convertido |

Cada caso debe verificar no solo el código HTTP, sino también los efectos:

- Registro en `sale_payments`.
- `customers.debt`.
- Stock descontado.
- Totales de la sesión de caja.
- Estado del presupuesto, si corresponde.

## Prioridad 2: tests de integración de `createSale`

Con una base de test descartable, probar:

- Venta con Mercado Pago y descuento: debe dar 200 y no modificar `debt`.
- Venta con Crédito: debe aumentar `debt` por el monto del crédito.
- Pago mixto Mercado Pago + Crédito: solo debe aumentar la parte de crédito.
- Consumidor Final con Crédito: debe rechazarse y no generar deuda.
- Venta fallida por stock o pago insuficiente: no debe dejar deuda ni venta parcial.
- Conversión de presupuesto: debe marcar el presupuesto como convertido y no duplicar deuda.
- Venta con descuento y recargo: el pago con recargo debe cubrir el neto.
- Venta con IVA activo: el total neto debe incluir el IVA y el pago debe cubrirlo.
- Pago con vuelto: debe aceptarse sin generar deuda.
- Venta con presentaciones, combos y productos manuales: deben calcularse bien los totales y el stock.

## Prioridad 3: tests de contrato de la API

Probar los códigos y mensajes principales:

- 200: venta registrada.
- 400: pago insuficiente, datos inválidos, stock insuficiente.
- 401: sin sesión.
- 403: sin permiso `accion_crear_venta` o sin sesión de caja activa.
- 404: presupuesto inexistente.
- 409: presupuesto ya convertido.

Verificar que el front pueda mostrar `error.response.data.error` y no solo el mensaje genérico de Axios.

## Prioridad 4: flujo offline

- Venta guardada en Dexie cuando no hay conexión.
- Sincronización posterior con `POST /sales`.
- Reintentos sin duplicar ventas.
- Venta rechazada por el backend: no debe quedar reintentando indefinidamente sin aviso.
- Recuperación de la sesión de caja activa.

## Prioridad 5: tests de frontend

Extraer y probar funciones puras:

- `calcularTotal`.
- `calcularTotalConRecargoDirecto`.
- Aplicación de promociones.
- Selección de método de pago y autocompletado del monto recibido.
- Habilitación del botón Confirmar.
- Visualización del mensaje de error del backend.

## Cómo montar el entorno de test sin tocar producción

- Usar un `.env.test` con una base local o Docker, por ejemplo `corralon_test`.
- Agregar un guard en `back/database/db.js`: si `NODE_ENV=test` y el nombre de la base no termina en `_test`, abortar. Hoy `db.js` intenta conectar al importarse.
- Sembrar datos mínimos:
  - Métodos de pago: Efectivo, Mercado Pago, Tarjeta, Crédito.
  - Consumidor Final (id 1).
  - Un cliente de prueba.
  - Productos con stock.
  - Una sesión de caja abierta.
- Ejecutar cada test dentro de una transacción y hacer rollback, o truncar tablas entre tests.
- Usar identificadores únicos para evitar colisiones.
- Nunca usar credenciales de producción en los tests.

## Herramientas sugeridas

- `node:test` y `node:assert/strict` para tests unitarios y de integración.
- Supertest para la capa HTTP.
- MySQL local o Docker para la base de test.
- Opcional: `fast-check` para property-based testing de importes.
- Opcional: Vitest + React Testing Library para el frontend.

## Plan por fases

1. **Fase 1 (rápida):** ampliar los tests puros de `paymentValidation` con una matriz table-driven y valores límite. Agregar el guard para que los tests nunca apunten a producción.
2. **Fase 2:** montar la base de test y los tests de integración de `createSale`, incluyendo deuda y stock.
3. **Fase 3:** tests de contrato de la API y del flujo offline.
4. **Fase 4:** tests de frontend para cálculos y mensajes de error.
5. **Fase 5:** CI para ejecutar todo en cada PR y exigir cobertura en los módulos críticos, no en todo el proyecto.

## Criterios de aceptación

- Una venta con descuento y pago simple se registra correctamente.
- Una venta con Mercado Pago no modifica `customers.debt`.
- Una venta con Crédito incrementa `debt` solo por la parte de crédito.
- Un pago insuficiente se rechaza con 400 y no deja datos parciales.
- Una venta fallida no deja deuda, stock descontado ni movimientos de caja.
- Los tests corren sin apuntar a la base de producción.

## Próximo paso

Empezar por la Fase 1 y la Fase 2. La Fase 1 es de bajo costo y ya cubre el bug del descuento; la Fase 2 es la que detecta errores de deuda, stock y transacciones.
