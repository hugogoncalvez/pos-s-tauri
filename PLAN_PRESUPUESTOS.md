# Plan de implementación — Módulo de Presupuestos

- **Estado:** borrador de planificación. No implementar hasta cerrar el relevamiento con el negocio.
- **Fecha:** 2026-10-20
- **Objetivo:** definir el alcance real de Presupuestos antes de crear tablas, endpoints o pantallas.
- **Documento vivo:** actualizar este archivo con las respuestas del cliente y congelar el alcance antes de estimar/implementar.

---

## 1. Resumen ejecutivo

Presupuestos debe ser un **módulo propio**, no una pantalla dentro de Informes ni una opción de configuración.

La primera decisión no es técnica sino de alcance:

1. ¿Solo se necesita **crear un presupuesto, imprimirlo o guardarlo como PDF**?
2. ¿También tiene que **seleccionar cliente y productos del stock**, con precios del catálogo?
3. ¿Tiene que **convertirse en venta** y mantener historial por cliente?
4. ¿Tiene que funcionar **sin conexión**, reservar stock, enviarse por WhatsApp/email o gestionar alquileres con contrato?

Según esas respuestas cambia bastante el diseño. Este documento propone tres niveles y deja marcadas las preguntas que bloquean la implementación.

**Recomendación inicial:** implementar el nivel B (presupuesto comercial con cliente, catálogo, impresión/PDF y conversión a venta), salvo que el cliente solo quiera imprimir un documento simple; en ese caso alcanza con el nivel A.

---

## 2. Punto de partida técnico

- Hoy **no existe** ningún módulo, tabla, ruta ni componente de presupuestos/cotizaciones.
- El Inicio (`Landing`) es **dirigido por base de datos**: las tarjetas salen de `landing_elementos` y se cruzan con `landing_permisos`. No conviene hardcodear una tarjeta nueva en el front.
- `Ventas` exige una **sesión de caja activa** y bloquea la pantalla si no hay caja abierta (`front/src/components/Ventas.jsx:1955`). Por eso no se puede reutilizar Ventas tal cual para crear presupuestos sin caja.
- La impresión actual se resuelve con un iframe oculto y `window.print()` en `front/src/functions/printUtils.jsx`. No hay librería de PDF instalada.
- Los permisos se declaran en `back/config/modulePermissions.js` y se aplican con `ProtectedRoute` en `front/src/router/index.jsx`.
- La venta manual ya permite líneas libres con `product_name` y costo opcional; ese mismo concepto sirve para presupuestos de alquiler, mano de obra o servicios.
- El listado de la Landing se obtiene en `getAllElements` (`back/controllers/Controller.js:1273`).

---

## 3. Ubicación en la aplicación

**Decisión propuesta:** tarjeta **“Presupuestos”** en el Inicio, con ruta propia `/presupuestos`.

- Va cerca de Ventas/Clientes según el orden comercial que defina el negocio.
- Permiso de vista nuevo: `ver_vista_presupuestos`.
- En **Informes** no va el alta. Como mucho, más adelante, un reporte de presupuestos emitidos/convertidos.
- En **Opciones** no va el módulo. Opciones hoy es solo cierre de sesión; si se agrega configuración, sería para numeración, validez por defecto o condiciones, no para operar presupuestos.
- No hace falta un acceso adicional en el AppBar en la primera versión. Se puede evaluar un acceso rápido “Presupuestar” desde Ventas más adelante.

---

## 4. Relevamiento pendiente con el negocio

> Importante: “cliente” en este documento es el cliente comercial del presupuesto. “Usuario” es el usuario del sistema.

### 4.1 Cliente del presupuesto

- [ ] ¿El presupuesto lleva cliente identificado o puede quedar como “Consumidor Final”?
- [ ] ¿Se debe **dar de alta el cliente** en el módulo Clientes o alcanza con **cargar nombre/teléfono manualmente** en el presupuesto?
- [ ] Si se carga manualmente, ¿qué datos mínimos se imprimen? Nombre, teléfono, DNI/CUIT, dirección, email.
- [ ] ¿Se necesita buscar presupuestos por cliente y ver su historial?
- [ ] Si el presupuesto se convierte en venta, ¿el cliente manual debe pasar a ser un cliente real?
- [ ] ¿Un vendedor puede ver todos los presupuestos o solo los propios?

**Opciones:**

| Opción | Ventaja | Consecuencia |
|---|---|---|
| A. Solo nombre manual | Rápido, no depende de Clientes | No hay historial por cliente; la conversión a venta queda con “Consumidor Final” o hay que crear el cliente después |
| B. Cliente existente + alta rápida | Historial y conversión limpia | Más pantalla y permisos; hay que reutilizar el alta de Clientes |
| C. Solo cliente existente | Datos consistentes | Obliga a crear el cliente antes de presupuestar |

**Recomendación:** B para el nivel comercial. Si el cliente solo quiere imprimir presupuestos, A es suficiente.

### 4.2 Contenido del presupuesto

- [ ] ¿Los ítems salen del **stock/catálogo** o se cargan manualmente?
- [ ] ¿Se usan **presentaciones** (bolsa, barra, metro, etc.)?
- [ ] ¿Se incluyen **combos/promociones**?
- [ ] ¿Se permiten **cantidades decimales**?
- [ ] ¿El precio se toma del catálogo o se puede **editar** en el presupuesto?
- [ ] ¿El descuento es por línea, general, o ambos?
- [ ] ¿Se presupuestan **servicios, alquiler de máquinas o mano de obra**?
- [ ] Si es alquiler, ¿hace falta indicar fecha/horas, depósito o contrato?
- [ ] ¿Se muestra disponibilidad de stock? ¿Se reserva stock?
- [ ] ¿Se agregan observaciones por ítem y observaciones generales?

**Recomendación:** productos, presentaciones y líneas manuales; precio editable; descuento general; sin reserva de stock en la primera versión.

### 4.3 Documento, impresión y PDF

- [ ] ¿Formato A4, térmico 80 mm, o ambos?
- [ ] ¿“PDF” significa elegir “Guardar como PDF” en el diálogo de impresión, o generar un archivo PDF directo con un botón?
- [ ] ¿Qué datos del negocio deben salir? Logo, nombre, CUIT, dirección, teléfono, condición fiscal.
- [ ] ¿El precio incluye IVA? ¿Se discrimina IVA?
- [ ] ¿Qué validez por defecto tiene un presupuesto? 7, 15, 30 días.
- [ ] ¿Qué numeración se usa? `PRES-000001`, `PRES-2026-0001`, otra.
- [ ] ¿Se imprimen condiciones, forma de pago, plazo de entrega y firma de aceptación?
- [ ] ¿Debe decir “Documento no válido como factura”?

**Recomendación:** A4 vertical, impresión/“Guardar como PDF” con el diálogo del sistema en la primera versión. Si se exige PDF directo sin diálogo, evaluar `jsPDF`/`html2pdf` como dependencia nueva.

### 4.4 Flujo y estados

- [ ] ¿Qué estados necesita? Borrador, emitido, aceptado, rechazado, vencido, convertido, anulado.
- [ ] ¿Se puede editar un presupuesto después de imprimirlo/emitirlo?
- [ ] ¿Qué pasa cuando vence? ¿Se bloquea la conversión o solo se avisa?
- [ ] ¿La conversión a venta es total o parcial?
- [ ] ¿Convertir a venta debe crear la venta automáticamente o cargar los ítems en Ventas para que el cajero cobre?
- [ ] ¿Se respetan los precios del presupuesto o se recalculan con el precio actual?
- [ ] ¿Quién puede anular un presupuesto?
- [ ] ¿Se necesita duplicar un presupuesto para hacer una revisión?
- [ ] ¿Se registra historial de cambios/auditoría?

**Recomendación:** estados simples (`borrador`, `emitido`, `convertido`, `anulado`; vencido calculado por fecha), edición solo en borrador, conversión total cargando ítems en Ventas y respetando precios del presupuesto con posibilidad de edición.

### 4.5 Operación y alcance

- [ ] ¿Tiene que funcionar **sin conexión**?
- [ ] ¿Quién crea, imprime, convierte y anula? Administrador, gerente, vendedor, cajero.
- [ ] ¿Se necesita un reporte de presupuestos emitidos/convertidos?
- [ ] ¿Se necesita enviar por email o WhatsApp?
- [ ] ¿Se necesita seguimiento comercial (llamados, recordatorios, aceptación)?
- [ ] ¿Se necesita depósito/seña para alquileres?
- [ ] ¿Se conservan presupuestos anulados/vencidos?
- [ ] ¿Se requiere aprobación de un superior para descuentos?

**Recomendación:** primera versión online, sin envío automático ni reserva de stock. Si el negocio necesita presupuestar con internet caído, agregar Dexie y numeración provisional en una segunda fase.

---

## 5. Niveles de alcance

| Nivel | Incluye | No incluye | Complejidad |
|---|---|---|---|
| **A. Presupuesto simple** | Nombre manual, líneas manuales, total, listado básico, imprimir/PDF | Cliente real, catálogo, stock, conversión a venta, estados avanzados | Baja |
| **B. Presupuesto comercial (recomendado)** | Cliente existente o alta rápida, productos/presentaciones/líneas manuales, precio editable, validez, estados, imprimir/PDF, conversión a venta | Reserva de stock, offline, email/WhatsApp, versiones, conversión parcial | Media |
| **C. Comercial completo** | Todo B + offline, reserva de stock, seguimiento, envío, versiones, reportes, alquiler con contrato/depósito | — | Alta |

No conviene arrancar por C. La conversación con el cliente debería terminar eligiendo A o B; C queda como roadmap.

---

## 6. Propuesta técnica (sujeta a las respuestas)

### 6.1 Modelo de datos

Tablas separadas. **No** reutilizar `sales` con un estado “presupuesto”: eso obliga a excluir presupuestos de caja, stock, historial de ventas y reportes, y aumenta el riesgo de errores.

#### `quotes`

- `id` PK autoincremental.
- `quote_number` único; recomendación `PRES-000001` generado a partir del ID.
- `customer_id` nullable (si se elige cliente existente).
- Snapshots para que el documento impreso no cambie si luego se edita el cliente:
  - `customer_name`
  - `customer_document`
  - `customer_phone`
  - `customer_address`
  - `customer_email`
- `user_id` del vendedor.
- `quote_date`.
- `valid_until`.
- `status`: `borrador`, `emitido`, `convertido`, `anulado`. “Vencido” se calcula por fecha.
- `subtotal`, `discount`, `total` (calculados en backend).
- `notes` y `terms` (condiciones/forma de pago).
- `converted_sale_id` nullable.
- `createdAt`, `updatedAt`.

#### `quote_details`

- `id` PK.
- `quote_id` FK.
- `stock_id` nullable (nulo para líneas manuales).
- `presentation_id` nullable.
- `product_name` (snapshot del nombre).
- `unit_name` (unidad, bolsa, barra, hora, etc.).
- `quantity` DECIMAL(12,3).
- `unit_price`.
- `line_total`.
- `cost` nullable (solo uso interno; no se imprime).
- `notes` nullable.

Si más adelante se incluyen combos/promociones, definir si se guarda el combo como snapshot JSON o como detalle expandido. No incluirlo en la primera versión sin respuesta del cliente.

### 6.2 Backend

Archivos tentativos:

- `back/Models/QuoteModel.js`
- `back/Models/QuoteDetailModel.js`
- `back/database/associations.js` (asociaciones con Cliente, Usuario y Venta).
- `back/controllers/quoteController.js` o funciones dentro de `Controller.js` si se mantiene el patrón actual.
- `back/routes/routes.js`
- `back/config/modulePermissions.js`
- Migración SQL nueva.

Endpoints tentativos:

- `GET /quotes` con filtros por número, cliente, fecha, estado.
- `GET /quotes/:id`
- `POST /quotes`
- `PUT /quotes/:id`
- `PUT /quotes/:id/status`
- `DELETE /quotes/:id` (anulación lógica, no borrado físico).
- `PUT /quotes/:id/convert` o actualización de estado desde el front al confirmar la venta.

Reglas:

- El backend valida y recalcula subtotal/descuento/total; no confía en los totales del front.
- El presupuesto **no mueve stock, no abre caja, no registra movimientos de caja y no aparece en reportes de venta**.
- El número se genera en una transacción y tiene restricción única.
- Auditar creación, emisión, conversión y anulación con el usuario que la ejecutó.
- Si el presupuesto tiene cliente manual, `customer_id` queda nulo y se conservan los snapshots.

### 6.3 Frontend

Archivos tentativos:

- `front/src/components/QuotesManager.jsx`: listado, filtros, acciones.
- `front/src/styledComponents/QuoteFormModal.jsx`: alta/edición.
- `front/src/styledComponents/QuoteDetailsModal.jsx`: detalle, impresión y conversión.
- `front/src/functions/printQuote.js` o una función nueva en `printUtils.jsx`.
- `front/src/router/index.jsx`: ruta protegida.
- `front/src/db/offlineDB.js` y `syncService.js` solo si se aprueba offline.

La pantalla de alta no debería reutilizar `Ventas` directamente porque Ventas exige caja y contiene lógica de pagos, tickets y stock. Se puede reutilizar la estética, el buscador de productos y los modales de presentación, pero la lógica de presupuesto debe ser independiente.

Listado mínimo:

- Número, fecha, cliente, validez, estado, total.
- Acciones: ver, editar (borrador), imprimir/PDF, duplicar, convertir en venta, anular.
- Filtros por número, cliente, rango de fechas y estado.
- Indicador visual de vencido.

### 6.4 Impresión y PDF

- A4 vertical con logo y datos del negocio.
- Título “PRESUPUESTO”, número, fecha, validez y vendedor.
- Datos del cliente.
- Tabla de ítems: código/descripción, cantidad, unidad, precio unitario, total.
- Subtotal, descuento y total.
- Condiciones, forma de pago y observaciones.
- Leyenda “Documento no válido como factura”.
- Línea de aceptación/firma si el cliente lo pide.

Primera versión: reutilizar el patrón de `printUtils` con iframe + `window.print()`; el usuario elige impresora o “Guardar como PDF”. Si se exige un archivo PDF generado con un clic, agregar una librería y un diálogo de guardado de Tauri; eso se estima aparte.

### 6.5 Conversión a venta

Flujo recomendado:

1. El presupuesto está `emitido`.
2. El usuario presiona “Convertir en venta”.
3. Se abre Ventas con los ítems del presupuesto cargados en el carrito.
4. Si no hay caja abierta, se pide abrir caja.
5. El cajero revisa stock, precios y pagos.
6. Recién cuando la venta se confirma con éxito, el presupuesto pasa a `convertido` y se guarda `converted_sale_id`.
7. Si la venta se cancela, el presupuesto sigue `emitido`.

Decisiones pendientes:

- ¿Se respetan los precios del presupuesto o se recalculan? Recomendación: respetarlos y permitir edición manual.
- ¿Qué pasa si un producto ya no existe o no hay stock? Mostrar advertencia; el cajero decide.
- ¿Se permite conversión parcial? Recomendación: no en la primera versión.
- ¿Un presupuesto vencido se puede convertir? Recomendación: permitir con advertencia, salvo que el negocio indique lo contrario.
- Si el presupuesto tiene una línea manual con costo, trasladar `product_name` y `purchase_cost` a la venta manual.

### 6.6 Permisos

Módulo nuevo en `back/config/modulePermissions.js`:

- `ver_vista_presupuestos`
- `accion_crear_presupuesto`
- `accion_editar_presupuesto`
- `accion_anular_presupuesto`
- `accion_convertir_presupuesto`
- `accion_imprimir_presupuesto`

Reutilizar permisos existentes para listar clientes, stock y presentaciones. Si se permite alta rápida de cliente, reutilizar `accion_crear_cliente`.

Agregar la tarjeta a `landing_elementos` y su relación en `landing_permisos`; asignar el permiso a los roles que correspondan. Si los vendedores solo deben ver sus propios presupuestos, eso se define en la consulta del backend, no solo en el front.

### 6.7 Offline

Si se aprueba:

- Guardar borradores/emitidos en Dexie.
- Usar un número provisional local y asignar el definitivo al sincronizar.
- Resolver conflictos por edición concurrente.
- No convertir a venta offline sin definir antes la relación con la venta offline y la caja.

Recomendación: no incluir offline en la primera versión salvo que sea un requisito explícito.

### 6.8 Reportes

- Los presupuestos no suman a ventas, caja, stock ni margen.
- Un reporte posterior puede mostrar: emitidos, convertidos, tasa de conversión, monto presupuestado y vencidos.
- Si se agrega, va en Informes como reporte de lectura, no como pantalla de alta.

---

## 7. Flujo funcional propuesto

1. Usuario entra a **Presupuestos** desde el Inicio.
2. Presiona **Nuevo presupuesto**.
3. Selecciona cliente existente, crea uno rápido o carga nombre manual (según decisión).
4. Agrega productos/presentaciones y/o líneas manuales.
5. Ajusta cantidades, precios, descuento, validez y observaciones.
6. Guarda como borrador o emite.
7. Imprime o guarda como PDF.
8. Si el cliente acepta, presiona **Convertir en venta**.
9. Ventas carga los ítems; el cajero cobra.
10. La venta descuenta stock y registra caja; el presupuesto queda convertido.

Estados propuestos:

| Estado | Significado |
|---|---|
| `borrador` | Editable, no emitido |
| `emitido` | Guardado/impreso/enviado; pendiente de aceptación |
| `convertido` | Ya generó una venta |
| `anulado` | Cancelado por el usuario |
| `vencido` | Calculado cuando `valid_until` es anterior a hoy; no es un estado almacenado |

---

## 8. Plan de implementación (después de aprobar alcance)

### Fase 0 — Relevamiento y cierre de alcance

- Completar las preguntas de la sección 4.
- Elegir nivel A/B/C.
- Confirmar cliente, conversión, PDF, offline y permisos.
- Actualizar este documento y recién ahí estimar.

### Fase 1 — Base de datos y backend

- Migración `quotes`/`quote_details`.
- Modelos y asociaciones.
- Controller, rutas, validaciones, numeración y auditoría.
- Permisos en `modulePermissions.js`.

### Fase 2 — Frontend: listado y alta

- Ruta `/presupuestos` y tarjeta en Landing.
- Listado, filtros y acciones.
- Formulario de alta/edición.
- Cliente existente/alta rápida/manual según decisión.
- Productos, presentaciones y líneas manuales.

### Fase 3 — Impresión/PDF

- Función de impresión A4.
- Vista previa.
- “Guardar como PDF” por diálogo del sistema.
- Si se aprueba PDF directo, agregar librería y guardado.

### Fase 4 — Conversión a venta

- Cargar ítems en Ventas.
- Validar caja abierta y stock.
- Marcar presupuesto convertido solo con venta exitosa.
- Probar cancelación y venta fallida.

### Fase 5 — Permisos y despliegue

- Asignar permisos a roles.
- Agregar tarjeta al Landing.
- Probar con usuarios de cada rol.
- Build, migración y despliegue controlado.

### Fase 6 — Pruebas y ajustes

- Pruebas funcionales y de regresión.
- Ajustes de impresión y textos.
- Documentación breve para el usuario.

---

## 9. Plan de pruebas

- Crear presupuesto con cliente existente.
- Crear presupuesto con nombre manual.
- Crear cliente rápido desde el presupuesto (si se aprueba).
- Agregar producto de stock, presentación y línea manual.
- Verificar cantidades decimales y redondeo.
- Verificar subtotal, descuento y total calculados en backend.
- Editar borrador y verificar que no se pueda editar uno convertido/anulado.
- Imprimir y guardar como PDF.
- Verificar que el presupuesto no modifique stock ni caja.
- Convertir a venta y verificar que la venta sí modifique stock/caja.
- Cancelar la venta y verificar que el presupuesto siga emitido.
- Probar presupuesto vencido.
- Probar permisos: usuario sin vista, sin creación, sin anulación, sin conversión.
- Probar numeración consecutiva y unicidad.
- Probar con cliente eliminado/modificado.
- Probar build de front y backend.
- Regresión: ventas, caja, historial, Informes y margen siguen funcionando.

---

## 10. Riesgos y decisiones críticas

| Riesgo / decisión | Impacto | Recomendación |
|---|---|---|
| Reutilizar `sales` para presupuestos | Contamina caja, stock y reportes | Tablas separadas |
| Nombre manual sin cliente real | No hay historial; la conversión a venta queda ambigua | Alta rápida de cliente o definir que la venta use “Consumidor Final” |
| Precio del presupuesto vs precio actual | Diferencias al convertir | Respetar el precio presupuestado y permitir edición |
| Reserva de stock | Bloquea stock y requiere vencimiento | No incluir en la primera versión |
| Offline | Numeración y sincronización complejas | Fase 2, solo si es requisito |
| PDF directo | Dependencia y manejo de archivos | Primera versión con diálogo de impresión |
| Combos/promociones | Snapshot y conversión más complejos | Fase 2 |
| Alquiler con contrato/depósito | No es un presupuesto simple | Módulo aparte o alcance específico |
| IVA/discriminación | Cambia el documento y los totales | Confirmar con el negocio |
| Permisos por vendedor | Un vendedor podría ver presupuestos ajenos | Definir alcance de la consulta |

---

## 11. Checklist para cerrar el relevamiento

Marcar antes de implementar:

- [ ] Nivel de alcance elegido: A / B / C.
- [ ] Cliente: manual / existente / alta rápida.
- [ ] Datos mínimos del cliente.
- [ ] ¿Los vendedores ven todos los presupuestos o solo los propios?
- [ ] Ítems: stock / presentaciones / manuales / combos.
- [ ] Precio editable y política de descuento.
- [ ] ¿Se presupuestan servicios o alquileres?
- [ ] ¿Se reserva stock? (recomendado: no)
- [ ] Formato: A4 / térmico.
- [ ] PDF: diálogo del sistema / archivo directo.
- [ ] Datos del negocio, IVA y leyendas.
- [ ] Validez por defecto.
- [ ] Numeración.
- [ ] Estados y edición después de emitir.
- [ ] Conversión total/parcial y política de precios.
- [ ] ¿Se permite convertir vencidos?
- [ ] Permisos por rol.
- [ ] ¿Offline?
- [ ] ¿Email/WhatsApp?
- [ ] ¿Reporte de presupuestos?
- [ ] ¿Depósito/seña para alquileres?

Con este checklist completo se congela el alcance, se actualiza la propuesta técnica y se puede implementar sin retrabajos.

---

## 12. Próximo paso

1. Reunión con el negocio para responder la sección 4.
2. Marcar el nivel A/B/C y actualizar este documento.
3. Confirmar el alcance con el cliente.
4. Recién entonces crear migraciones, modelos y pantallas.

**No crear tablas ni código de Presupuestos hasta cerrar las preguntas de cliente, conversión, PDF y offline.**
