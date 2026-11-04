# Informe de rendimiento — Caja, Dashboard e Informes

**Fecha:** 2026-11-03
**Alcance:** frontend (`front/`), backend (`back/`), esquema TiDB (`corralon`)
**Rama:** `el-corralon`
**Síntoma reportado:** la aplicación se congela al cerrar el modal de detalle de caja y volver al Dashboard; también puede ocurrir al generar el informe de producto.
**Pantalla confirmada:** `/admin-cajas` (`CashAdmin.jsx`).
**Estado (actualizado 2026-11-04):** se aplicó la optimización de `b451c1c9` (auditoría, caja, dashboard, sesiones e informe) y los índices de `20261103_performance_indexes.sql` en producción. Quedan pendientes los puntos marcados abajo. Las mediciones finales en la PC afectada siguen pendientes.

---

## 1. Resumen ejecutivo

El síntoma no parece un error funcional determinista. Es un problema de **rendimiento acumulativo** que combina:

1. Consultas N+1 y payloads completos en el módulo de caja.
2. Renderizado de miles de filas aunque la sección esté colapsada.
3. Hasta 14 consultas al volver al Dashboard, varias de ellas costosas.
4. Reintentos que multiplican las consultas lentas.
5. Store de sesiones contra la base remota: lectura y `UPDATE` de expiración por request.

Con pocos datos el costo es invisible. Con una sesión de caja de cientos o miles de ventas, y un historial de decenas de miles, el tiempo se multiplica y el WebView de Tauri queda bloqueado.

**Veredicto:** el orden de ataque debe ser: (a) eliminar el `UPDATE` de sesión por request, (b) caja (historial + detalle + render condicional), (c) Dashboard (agregados + caché) y (d) informe completo. La captura TiDB pone al `UPDATE` de sesión como el 46,5 % del tiempo SQL visible, pero un freeze de varios segundos requiere además el componente de DOM.

### Estado de aplicación

**Aplicado**
- Optimización de `b451c1c9`: auditoría fuera de transacciones críticas, agregados de caja/dashboard/novedades, límites de top productos e informe, throttle de sesión y sincronización.
- Los tres índices de `20261103_performance_indexes.sql` fueron creados en producción (jobs TiDB 1633, 1634 y 1635, 2026-11-04).
- `useQuery` ya usa `retry: 1`, `AbortSignal` y `refetchOnWindowFocus: false`; Dashboard tiene `staleTime` de 60 s.
- El detalle de caja carga ventas solo al expandir la sección; el resumen ya no incluye ventas por defecto.
- Las respuestas de sesiones de caja incluyen `closed_at` como alias de `verified_at`/`closed_at_user`, sin cambiar el front ni la base.

**Pendiente**
- Medir el resultado real en la PC afectada; las capturas son previas a estos cambios.
- Validar los índices con `EXPLAIN` y medir el impacto en escrituras.
- Virtualizar tablas grandes, reemplazar el skeleton que desmonta la vista y limpiar el cache de `sessionDetails` al cerrar el modal.
- Resolver el doble conteo de `surcharge_amount` (§3.10), que sigue presente en `getSessionAggregates`/`getCashSessionSummary`.
- Corregir los hallazgos incidentales restantes de §7 (`verified_at` duplicado y componente muerto); `closed_at` ya tiene alias en el backend.

### Causas principales

| # | Causa | Dónde | Confianza |
|---|---|---|---|
| 1 | Historial de caja N+1 y ejecutado dos veces | `CashAdmin.jsx:150,161`; `Controller.js:3509` | Alta |
| 2 | Summary completo por cada caja abierta | `CashAdmin.jsx:194`; `Controller.js:3820` | Alta |
| 3 | Todas las ventas del detalle se renderizan aunque estén colapsadas | `CashAdmin.jsx:810-833` | Alta |
| 4 | Dashboard dispara hasta 14 consultas, con `staleTime: 0` | `Dashboard.jsx:332-343`; secciones de dashboard | Alta |
| 5 | Top productos agrega todo el historial sin filtro de fecha | `Controller.js:6479` | Alta |
| 6 | Falta índice sobre `sales.createdAt` (riesgo futuro; bajo impacto con el volumen actual) | DDL de respaldo | Media |
| 7 | Reintentos ×4 con timeout de 20 s y sin cancelación | `useQuery.js:141`; `api.js:12` | Alta |
| 8 | Store de sesión remoto: lectura + UPDATE de expiración por request | `app.js:110-156`; `sessionPool.js:206`; captura TiDB | Alta |
| 9 | Informe completo sin límite y armado de HTML en el hilo principal | `Informes.jsx:125-323`; `Controller.js:663` | Media/Alta |
| 10 | Resincronización completa de Dexie al recuperar conexión | `AuthContext.jsx:167-202`; `syncService.js:22-105` | Media |

---

## 2. Flujo del síntoma

```
[Admin] abre /admin-cajas
   -> GET /api/cash-sessions/history?status=abierta,pendiente_cierre   (historial N+1)
   -> GET /api/cash-sessions/history?page=1&limit=5...                  (historial N+1, otra vez)
   -> por cada caja abierta: GET /api/cash-sessions/:id/summary         (summary completo)

[Admin] click "Ver Detalles"
   -> GET /api/cash-sessions/:id/summary
      -> sesión + movimientos + TODAS las ventas + pagos + detalles + stock/proveedor
   -> se renderizan todas las ventas y todos los ítems, aunque la sección esté cerrada

[Admin] cierra el modal
   -> se desmontan miles de filas y celdas de una sola vez

[Admin] vuelve a /dashboard
   -> 3 tarjetas de resumen + 3 tarjetas de ventas + top productos + stock bajo + 6 novedades
   -> hasta 14 GET, casi todos con staleTime 0
   -> cada GET pasa por el store de sesión remoto (lectura + UPDATE de expiración) y compite por los pools de 10 conexiones
```

El bloqueo puede ocurrir en dos momentos distintos:

- **Al cerrar el modal:** por el desmontaje masivo de DOM.
- **Al volver al Dashboard:** por la ráfaga de consultas y el trabajo del backend/DB.

---

## 3. Hallazgos detallados

### 3.1 Caja: historial N+1 y doble carga

**Dónde**

- `front/src/components/CashAdmin.jsx:150` — consulta de cajas abiertas/pendientes.
- `front/src/components/CashAdmin.jsx:161-163` — consulta del historial paginado.
- `back/controllers/Controller.js:3509` — `getCashSessionHistory`.
- `back/routes/routes.js:176` — ruta del historial.

**Qué pasa**

`getCashSessionHistory` hace:

1. Un `findAndCountAll` de sesiones (2 consultas: count + filas).
2. Por cada sesión de la página:
   - `SaleModel.findAll` con `sale_payments → payment`.
   - `CashSessionMovementModel.findAll`.

Con el límite por defecto de 10 sesiones, son aproximadamente **22 consultas por llamada**. `CashAdmin` ejecuta dos historiales al montar:

- cajas abiertas/pendientes: límite por defecto 10 → ~22 consultas;
- historial paginado: `rowsPerPage` inicial 5 → ~12 consultas.

Total: **~34 consultas** solo para historiales, antes de los summaries. Si el usuario amplía el paginado a 25 o 50, el costo crece linealmente.

Además, aunque el endpoint solo devuelve totales por sesión, **trae todas las ventas de cada sesión con sus pagos**. Es trabajo descartado.

**Por qué explica el síntoma**

- Suma latencia de red/DB por cada consulta.
- Ocupa conexiones de los pools.
- Al volver al Dashboard, las 14 consultas nuevas encuentran la cola ocupada.
- Si una consulta tarda más de 20 s, Axios la aborta y React Query la reintenta hasta 3 veces.

**Corrección propuesta**

- Reemplazar el cálculo por sesión por **consultas agregadas por página**:
  - una consulta de ventas agrupada por `cash_session_id`;
  - una consulta de movimientos agrupada por `cash_session_id`;
  - si la tabla necesita desglose por método de pago, una tercera consulta agregada por página.
- Evitar la doble llamada: usar un endpoint liviano para las tarjetas de cajas activas y otro para la tabla paginada.
- No recalcular ventas de sesiones cerradas en cada carga; usar los totales persistidos (`total_sales_at_close`) cuando corresponda.
- Cachear el historial unos segundos en el cliente.

**Criterio de aceptación**

- Abrir `/admin-cajas` con 10 sesiones no debe superar ~5 consultas SQL.
- El tiempo de carga no debe crecer linealmente con la cantidad de ventas de cada sesión.

---

### 3.2 Caja: summary completo y DOM masivo

**Dónde**

- `back/controllers/Controller.js:3820` — `getCashSessionSummary`.
- `front/src/components/CashAdmin.jsx:194` — summaries por caja abierta.
- `front/src/components/CashAdmin.jsx:713` — diálogo de detalle.
- `front/src/components/CashAdmin.jsx:810` — caja de ventas con `height: 0` cuando está colapsada.
- `front/src/components/CashAdmin.jsx:824` — `sessionDetails.sales.map(...)`.
- `front/src/components/CashAdmin.jsx:833` — `sale.sale_details.map(...)`.

**Qué pasa**

`getCashSessionSummary` devuelve:

- la sesión;
- todos los movimientos;
- **todas las ventas**;
- por cada venta: cliente, pagos, detalles, stock, proveedor y combo.

En `CashAdmin`, la sección de ventas se renderiza dentro de un `Box` con `height: 0` cuando está colapsada, pero **los hijos siguen montados**. Cada venta genera una fila y cada detalle se recorre para construir el texto de ítems/proveedor.

Al cerrar el diálogo se desmontan todos esos nodos. Con una sesión de 1.000 ventas y 3-5 ítems por venta, son miles de nodos y decenas de miles de celdas/valores.

**Por qué explica el síntoma**

- El costo de renderizado y de recolección de basura ocurre en el hilo principal.
- MUI Table + `stickyHeader` + cientos de filas agrava el layout.
- El freeze se percibe justo al cerrar, porque es cuando se desmonta todo.
- El cache de React Query mantiene `detailsData` durante 5 minutos, pero eso no evita el costo de DOM.

**Corrección propuesta**

- `getCashSessionSummary` con `includeSales=false` por defecto. Devolver solo totales, movimientos y metadatos.
- Cargar ventas solo al expandir la sección, con un endpoint paginado:
  `GET /cash-sessions/:id/sales?page=1&limit=50`.
- Renderizar condicionalmente:
  `openSalesSectionInDetails && <SalesTable ... />`.
- Virtualizar la tabla si se necesita mostrar muchas ventas.
- Limpiar el cache de `sessionDetails` al cerrar el modal (`queryClient.removeQueries`).
- No pedir el summary completo para las tarjetas de cajas abiertas: usar un endpoint de totales.

**Criterio de aceptación**

- Abrir y cerrar el detalle de una sesión con 1.000 ventas no debe generar un long task mayor a 200-300 ms.
- El payload del summary para tarjetas no debe incluir ventas.

---

### 3.3 Dashboard: hasta 14 consultas al montar

**Dónde**

- `front/src/components/Dashboard.jsx:332-343` monta las secciones.
- `front/src/styledComponents/dashboard/SummaryCardsSection.jsx`
- `front/src/styledComponents/dashboard/SalesStatsSection.jsx`
- `front/src/styledComponents/dashboard/TopProductsTable.jsx`
- `front/src/styledComponents/dashboard/LowStockAlertsCard.jsx`
- `front/src/styledComponents/dashboard/NovedadesSection.jsx`

**Consultas**

| Sección | Endpoint | Cantidad | `staleTime` |
|---|---|---|---|
| Tarjetas de resumen | `/dashboard/compras/hoy`, `/customers/total`, `/suppliers/total` | 3 | 0 |
| Ventas | `/dashboard/ventas/mes`, `/semana`, `/hoy` | 3 | 0 |
| Top productos | `/dashboard/top-productos` | 1 | 2 min |
| Stock bajo | `/stock?low_stock=true&unpaginated=true` | 1 | 0 |
| Novedades (resúmenes) | `/promotions/summary`, `/combos/summary`, `/presentations/summary` | 3 | 0 |
| Novedades (destacados) | `/promotions?is_active=true&limit=3`, `/combos?is_active=true&limit=3`, `/presentations?mode=dashboard` | 3 | 0 |
| **Total** | | **14** | |

Además, el layout consulta `/theme` y `/business-config`.

`SummaryCard` y `SalesStatCard` usan `UseFetchQuery(endpoint, endpoint)` sin `staleTime`, por lo que heredan 0. `LowStockAlertsCard` también usa 0. El `QueryClient` global no define `staleTime` ni desactiva `refetchOnWindowFocus`, así que al volver a la ventana se pueden repetir todas.

**Costo del backend**

- `getSalesToday`, `getSalesWeek` y `getSalesMonth` hacen **dos sumas cada uno** (`Controller.js:5986,6009,6036`): 6 consultas de rango.
- `getTopSellingProducts` (`Controller.js:6479`) agrupa **toda** la tabla `sales_details`, sin filtro de fecha, limitado a 5 resultados pero recorriendo todo el historial.
- `getStocks` con `low_stock=true&unpaginated=true` usa `findAndCountAll` con joins y sin límite.
- Las 14 consultas pasan por el store de sesión remoto (lectura + UPDATE de expiración) antes de llegar al controlador.

**Por qué explica el síntoma**

- Es la ráfaga que recibe el backend justo cuando el usuario vuelve al Dashboard.
- Si el historial de caja dejó los pools ocupados, estas consultas esperan.
- Los reintentos convierten una consulta lenta en hasta 4 ejecuciones.
- `refetchOnWindowFocus` puede repetir la ráfaga al cambiar de ventana.

**Corrección propuesta**

- Definir en `UseFetchQuery` un `staleTime` por defecto de 60 s para datos de dashboard.
- Desactivar `refetchOnWindowFocus` para el Dashboard o aumentarlo a varios minutos.
- Unificar las métricas en un solo endpoint agregado:
  - ventas hoy/semana/mes en una consulta con agregación condicional;
  - top productos limitado a los últimos 30/90 días;
  - stock bajo con límite y sin `count` si no se usa.
- Cachear top productos 5-10 minutos.

**Criterio de aceptación**

- Volver al Dashboard no debe disparar más de 3-5 requests.
- El tiempo de carga debe ser estable aunque el historial tenga decenas de miles de ventas.

---

### 3.4 Índices y volumen

**Esquema observado en el respaldo**

- `sales`: índices por `customer_id`, `user_id`, `cash_session_id` y `fiscal_invoice_id`. **No hay índice por `createdAt`**.
- `sales_details`: índices separados por `sales_Id` y `stock_id`; además hay un `idx_stock_id` duplicado.
- `cash_sessions`: índice `idx_cash_sessions_user_status` por `(user_id, status)`.

**Impacto**

- Las sumas por rango (`getSalesToday/Week/Month`) no tienen un índice que acote por fecha.
- `getTopSellingProducts` agrupa todo `sales_details`; el índice por `stock_id` ayuda parcialmente, pero no evita recorrer todo el historial.
- El historial y el summary filtran por `cash_session_id`, que sí tiene índice; el problema ahí es la cantidad de consultas y el tamaño del payload, no el filtro.
- El respaldo muestra `AUTO_INCREMENT=60005` en `sales` pero solo 2 filas: el dump está filtrado y no sirve para estimar el volumen actual. Hay que medirlo en producción.

**Índices candidatos**

```sql
CREATE INDEX idx_sales_created_at ON sales (createdAt);
CREATE INDEX idx_sales_cash_session_created ON sales (cash_session_id, createdAt);
CREATE INDEX idx_sales_details_sale_stock ON sales_details (sales_Id, stock_id);
```

Validar cada uno con `EXPLAIN` antes y después. En TiDB, crear índices sobre tablas grandes consume recursos; hacerlo en horario de baja actividad y sobre una copia primero. No eliminar el `idx_stock_id` duplicado sin verificar que ningún plan lo esté usando.

---

### 3.5 Reintentos, timeout y cancelación

**Dónde**

- `front/src/api/api.js:12` — `timeout: 20000`.
- `front/src/hooks/useQuery.js:141` — `retry: isOnline ? 3 : 0`.
- `front/src/main.jsx:16` — `new QueryClient()` sin defaults.

**Qué pasa**

- Una consulta que tarda más de 20 s se aborta en el cliente.
- React Query la reintenta hasta 3 veces: **hasta 4 intentos y 80 s** por consulta.
- El `queryFn` no recibe ni pasa `AbortSignal`; al desmontar el componente, Axios no cancela el request y el backend sigue ejecutando la consulta.
- En una ráfaga de 14 consultas, el peor caso teórico es 56 requests. Aunque se ejecuten en paralelo, cada uno puede retener una conexión hasta 20 s y volver a ejecutar la consulta en el servidor.

**Corrección propuesta**

- `retry: 0` o 1 para consultas pesadas de lectura.
- Pasar la señal de React Query a Axios:

```js
queryFn: ({ signal }) => Api.get(url, { signal })
```

- Timeout diferenciado: 10-15 s para dashboard/caja, más largo solo para informes.
- Mostrar error parcial en la tarjeta en lugar de bloquear toda la vista.

---

### 3.6 Store de sesión remoto y pools

**Dónde**

- `back/app.js:110-156` — `/api/health` antes del middleware de sesión; el resto de `/api` después.
- `back/database/db.js:203` — pool Sequelize `max: 10`.
- `back/database/sessionPool.js:206` — pool de sesiones `connectionLimit: 10`.

**Qué pasa**

Cada request `/api` (excepto `/health`) pasa por `express-session` con `MySQLStore`. Aunque `resave` y `saveUninitialized` estén en `false`, el store **lee la sesión de la base remota en cada request y, en requests no modificados, ejecuta `touch` para extender `expires`**. Son dos pools separados: hasta 20 conexiones si ambos se llenan.

**Impacto**

- 14 consultas del Dashboard = 14 lecturas + 14 `UPDATE` de expiración + 14 consultas de datos.
- La captura TiDB muestra ~100 lecturas y 98 `UPDATE` de sesión: el `UPDATE` promedio (8,6 ms) es ~10× la lectura (0,88 ms).
- Como el backend corre en la PC del cliente, `/api/health` sigue respondiendo aunque TiDB no esté accesible. Además, el estado se cachea y se actualiza cada 2 min (`app.js:182`), y cuando la DB está `unhealthy` el endpoint devuelve `overall: 'warning'` (`healthMonitor.js:20`), que `AuthContext` acepta como OK (`AuthContext.jsx:84`). Por eso `isOnline` no detecta el microcorte y la app no entra en modo offline: los requests quedan colgados hasta el timeout y los reintentos.
- El historial de caja agrega decenas de consultas.
- Si la base remota tiene latencia o micro-cortes, la cola crece y los timeouts del cliente se multiplican.

**Corrección propuesta**

- Reducir el `touch`: no-op con expiración larga (24 h) o throttle (por ejemplo, 5 min), para que no haya un `UPDATE` por request.
- Evaluar un store de sesión local (Redis o memoria) o una cookie firmada/JWT para evitar la lectura remota por request.
- Si se mantiene MySQLStore, cachear la sesión en memoria con TTL corto y invalidación explícita.
- Separar claramente el pool de sesiones del pool de datos y monitorear su uso.

**Nota:** el `/api/health` ya está bien ubicado antes del middleware de sesión; no hay que moverlo.

#### 3.6.1 Evidencia de TiDB (statements)

La captura de TiDB muestra 40 plantillas. Los números cuadran con la interpretación **total / promedio / ejecuciones**: `UPDATE sessions` marca 845,1 ms / 8,6 ms / 98 (8,6 × 98 ≈ 843) y `SELECT data FROM sessions` marca 88,1 ms / 0,881 ms / 100. La suma de los tiempos totales visibles es ≈ 1,82 s; no es tiempo de pared porque las consultas pueden solaparse, pero sirve para comparar peso relativo.

| Plantilla | Total | Promedio | Ejec. | Peso |
|---|---:|---:|---:|---:|
| `UPDATE sessions SET expires = ? WHERE session_id = ?` | 845,1 ms | 8,6 ms | 98 | 46,5 % |
| `SELECT sale...` (historial) | 111,5 ms | 13,9 ms | 8 | 6,1 % |
| `SELECT data ... FROM sessions WHERE session_id = ?` | 88,1 ms | 0,88 ms | 100 | 4,8 % |
| `SELECT sale...` (segunda variante) | 82,4 ms | 20,6 ms | 4 | 4,5 % |
| `SELECT count(stock.id) ...` | 47,1 ms | 15,7 ms | 3 | 2,6 % |
| `SELECT sum(total_neto) ... BETWEEN ? AND ?` | 41,5 ms | 1,7 ms | 24 | 2,3 % |
| `SELECT stock...` | 38,3 ms | 9,6 ms | 4 | 2,1 % |
| `SELECT stock.*, supplier...` | 35,1 ms | 11,7 ms | 3 | 1,9 % |
| `SELECT count(stock.id) ...` (segunda) | 32,2 ms | 8,1 ms | 4 | 1,8 % |
| `SELECT promotion...` | 32,2 ms | 7,9 ms | 4 | 1,8 % |

**Lectura**

- **El mayor costo no son las consultas de negocio, sino el `touch` de sesión.** `express-session` llama `store.touch` en requests no modificados y `express-mysql-session` lo implementa con ese `UPDATE`. Son 98 escrituras por ~100 requests: un peaje fijo de ~8,6 ms por request, ~10× la lectura. La captura muestra un pico de 419,36 ms (la tabla no trae encabezados; si es el máximo, una sola escritura se quedó ~0,4 s). Esto entra directo al P0.
- **El historial/summary sigue apareciendo:** 8 ejecuciones de la consulta de ventas a 13,9 ms y 4 a 20,6 ms. No es un monolito de 5 s, pero se repite y trae payload.
- **Los `count` de stock son caros:** 15,7 ms promedio y 9 ejecuciones; confirma que `findAndCountAll` no debe usarse cuando la lista es `unpaginated`.
- **Las sumas del Dashboard no explican el freeze actual:** 24 ejecuciones (4 cargas × 6 sumas) a 1,7 ms promedio. La falta de índice `sales(createdAt)` es preventiva/futura, no el cuello principal con este volumen.
- **El total SQL visible (~1,8 s) es menor que un freeze de varios segundos.** Esto refuerza que el DOM/render del detalle y el desmontaje son una parte central; la base suma latencia y cola, pero no alcanza sola.
- **`USE corralon` 41 veces** indica creación/rotación de conexiones; revisar `idle`/`evict` de los pools. El costo de TLS/auth no está incluido en el statement.
- **`SELECT ? + ? AS result` 59 veces** es ruido de round-trips; no es el cuello, pero conviene identificar si es health check o una consulta del ORM.
- **`businessconfigs` 9 veces:** cachear tema/configuración; barato pero repetido.

**Prioridad revisada (captura A):** 1) `touch` de sesión; 2) DOM/render del detalle; 3) historial/summary; 4) `count` de stock; 5) índices y sumas del Dashboard como mejora preventiva.

#### 3.6.2 Captura de 15 minutos: auditoría

Una segunda captura, de 15 minutos, cambia el foco: la suma de tiempos totales visibles es ≈ 15,07 s y **`INSERT INTO audit_logs` concentra 14,0 s (92,9 %)**.

| Plantilla | Total | Prom. | Ejec. | Peso |
|---|---:|---:|---:|---:|
| `INSERT INTO audit_logs ...` | 14,0 s | 250,1 ms | 56 | 92,9 % |
| `SELECT stock...` | 463,1 ms | 1,0 ms | 450 | 3,1 % |
| `INSERT INTO sessions ... ON DUPLICATE KEY UPDATE` | 165,1 ms | 7,5 ms | 22 | 1,1 % |
| `SELECT stock.*, supplier...` | 41,1 ms | 10,3 ms | 4 | 0,3 % |
| `SELECT count(stock.id) ...` | 40,1 ms | 10,0 ms | 4 | 0,3 % |
| `SELECT purchase...` | 36,0 ms | 18,0 ms | 2 | 0,2 % |

**Lectura**

- La plantilla lenta **no incluye `ip_address`, `user_agent` ni `session_id`**. Eso coincide con `checkLowStockAndLog` (`Controller.js:2382-2395`), que llama `logAudit(..., null, transaction)` dentro de la transacción.
- `updateStock` (`Controller.js:1609-1658`) y `deleteStock` (`:1667-1690`) esperan la auditoría antes del `commit`; `createSale` hace `bulkCreate` de auditoría dentro de la transacción (`:2697`, `:2710`); `initiateClosure` y `finalizeClosure` también (`:3342`, `:3413`).
- Si una edición de stock genera N alertas, se hacen **N inserts secuenciales de ~250 ms dentro de la misma transacción**: 20 alertas ≈ 5 s. Es un candidato directo al freeze.
- `audit_logs` tiene ~300.000 filas, PK autoincremental clustered, solo índice `user_id` y FK a `usuarios`; los JSON/TEXT pueden ser grandes. Verificar hotspot y tamaño de payload.
- Los 450 `SELECT stock` a 1 ms no son el problema; las escrituras de sesión ahora promedian 7,5 ms.
- Esta captura **no prueba** que sea el freeze: hay que cruzar timestamps y acciones. Pero muestra un cuello nuevo y coherente con “reiniciar la PC lo arregla”: si una transacción queda colgada por un microcorte, mantiene locks y las auditorías siguientes esperan.

**Prioridad revisada (captura B):** 1) auditoría fuera de la transacción/ruta crítica; 2) DOM/render del detalle; 3) historial/summary; 4) `touch` de sesión; 5) `count` de stock e índices preventivos.

---

### 3.7 Informe completo: sin límite y armado en el hilo principal

**Dónde**

- `front/src/components/Informes.jsx:125` — `handlePrint`.
- `front/src/components/Informes.jsx:129` — `GET /reports/full-data`.
- `back/controllers/Controller.js:663` — `getFullReport`.
- `front/src/components/Informes.jsx:271-323` — concatenación de HTML, `document.write` y iframe.

**Qué pasa**

La vista normal está paginada de a 5, así que no debería congelar. El problema aparece al imprimir:

1. Se pide `/reports/full-data` sin `page` ni `limit`.
2. El backend devuelve todas las filas del rango, con ventas, stock y proveedor.
3. El frontend arma un string HTML gigante con `+=` dentro de un bucle.
4. `document.write` parsea todo el HTML de una vez en el iframe.
5. El iframe se elimina después de 1 s.

Con un producto o un período con mucho movimiento, el string puede ser de varios MB y el parseo bloquea el hilo principal. Si además el resumen (`/reports/summary`) tarda, el usuario ve la pantalla congelada.

**Corrección propuesta**

- Limitar el informe completo a un máximo de filas (por ejemplo, 5.000) y avisar si se truncó.
- O generar el PDF/HTML en el backend con streaming.
- O construir el HTML con un array y `join('')`, y renderizar por lotes.
- Reutilizar `getReportSummary` para los totales y no recalcularlos en el cliente.
- Si se mantiene el iframe, no escribirlo todo de una vez: insertar por bloques o usar un Web Worker.

**Criterio de aceptación**

- Imprimir un informe de 5.000 filas no debe bloquear la UI más de 1-2 s.
- El backend no debe devolver respuestas de decenas de MB.

---

### 3.8 Resincronización por conectividad

**Dónde**

- `front/src/context/AuthContext.jsx:167` — ping cada 15 s.
- `front/src/context/AuthContext.jsx:181-226` — `verificarSesion`, con 3 reintentos y 2 s de espera.
- `front/src/context/AuthContext.jsx:202` — `loadReferenceData` al verificar sesión.
- `front/src/services/syncService.js:36-49` — 10 GETs, incluido `/stock?limit=10000`.
- `front/src/services/syncService.js:59-105` — limpieza y `bulkPut` en una transacción Dexie.

**Qué pasa**

- El ping de salud corre cada 15 s; hay un período de gracia de 30 s al inicio.
- Un primer fallo pasa a `degraded`; dos confirmaciones fallidas con 3 s de espera pasan a `offline`.
- Al recuperarse, `isOnline` cambia, `verificarSesion` cambia de identidad y el efecto vuelve a ejecutarse.
- Si la sesión está activa, se llama `loadReferenceData`, que descarga stock (hasta 10.000), categorías, clientes, promociones, combos, pagos, caja activa, elementos, tema y unidades.
- Luego limpia y reescribe las tablas de Dexie en una sola transacción.

**Por qué puede amplificar el síntoma**

Si el event loop del backend está ocupado serializando respuestas grandes, o si la base está saturada, el ping puede demorar. Un falso `offline` seguido de `online` dispara una resincronización completa, que genera otros 10 requests y trabajo de IndexedDB justo cuando el usuario intenta volver al Dashboard.

**Corrección propuesta**

- No llamar `loadReferenceData` en cada transición de conectividad. Hacerlo solo:
  - al iniciar sesión;
  - manualmente desde “Sincronizar”;
  - si pasó un tiempo mínimo desde la última sincronización (por ejemplo, 30 minutos).
- Guardar `lastSyncTime` y comparar antes de descargar.
- Hacer la sincronización incremental o por tablas, no un `clear + bulkPut` completo.
- Aumentar el timeout del ping de salud solo si el backend puede responder rápido; no depender de él para bloquear la UI.

---

### 3.9 Transiciones y skeletons

**Dónde**

- `front/src/components/Informes.jsx:409` — `return <InformesSkeleton />`.
- `front/src/components/Informes.jsx:417` — transición de 1,5 s.
- `front/src/components/CajeroView.jsx` — transición de 0,8 s.
- `front/src/App.jsx` — `AnimatePresence mode="wait"`.

**Qué pasa**

`Informes` considera `isLoading` a `productsLoading || suppliersLoading || isFetching || isFetchingSummary`. Mientras cualquiera esté activo, desmonta toda la vista y muestra el skeleton. Al cambiar filtros o volver a la pantalla, se pierde el estado y se vuelve a montar.

La animación de salida de 1,5 s hace que la navegación se sienta más lenta, sobre todo si el usuario ya percibe que la app está pesada.

**Corrección propuesta**

- Mostrar un indicador de carga sin desmontar la vista (por ejemplo, overlay o skeleton solo en la tabla).
- Reducir la animación de salida a 0,3-0,5 s.
- Evitar `AnimatePresence mode="wait"` para rutas pesadas; usar transiciones más cortas.

---

### 3.10 Posible doble conteo de `surcharge_amount`

**Qué pasa**

En el flujo de venta, `Ventas.jsx:438` calcula `totalFinal = subtotalConDescuento + surchargeAmount + impuesto` y `Ventas.jsx:537` lo envía como `total_neto`. El backend guarda ese valor tal cual (`Controller.js:2482`), y el comentario del modelo (`SalesModel.js:26`) confirma que `total_neto` es el total final a pagar. Es decir, **`total_neto` ya incluye el recargo**.

Sin embargo, algunos cálculos vuelven a sumar `surcharge_amount`:

- `getActiveCashSession` (`Controller.js:3524`): `SUM(total_neto + surcharge_amount)`.
- `getSessionAggregates` (`Controller.js:3567`): `total_sales_with_surcharge`.
- `getCashSessionSummary` (`Controller.js:4056`): usa `total_sales_with_surcharge`.
- `applySessionSurcharges` (`Controller.js:3606`) vuelve a sumar el recargo a los métodos de pago, aunque en pago simple el `amount` ya lo incluye.

**Ejemplo**

Venta con subtotal 100, recargo 10 y `total_neto` 110:

- Total correcto: **110**.
- Cálculo actual del summary: 110 + 10 = **120**.
- Métodos de pago: el pago simple ya manda 110; el summary le suma otros 10 → **120**.

**Qué queda afectado**

- `total_sales` del summary y del detalle de caja.
- `payment_methods` del summary.
- `current_cash` de cajas abiertas y el “Monto en Cajas”.
- El reporte impreso de caja, que usa esos valores.

**Qué no queda afectado**

- `getSalesToday/Week/Month` usan `total_neto` solo.
- `total_sales_at_close` del historial usa `total_neto` solo.
- `getSummaryForClose` usa `total_neto` solo.
- El cobro real: el cliente paga `total_neto` una vez.

**Cómo confirmarlo**

```sql
SELECT s.id, s.total_neto, s.surcharge_amount, SUM(sp.amount) AS pagos
FROM sales s
JOIN sale_payments sp ON sp.sale_id = s.id
WHERE s.surcharge_amount > 0
GROUP BY s.id, s.total_neto, s.surcharge_amount
LIMIT 20;
```

Si `pagos = total_neto`, el pago ya incluye el recargo. También se puede comparar:

```sql
SELECT SUM(total_neto) FROM sales WHERE cash_session_id = ?;
-- contra el total_sales que devuelve /cash-sessions/:id/summary
```

**Corrección propuesta**

- Tratar `total_neto` como el único total final y no volver a sumar `surcharge_amount`.
- Usar `surcharge_amount` solo como desglose informativo.
- Revisar pagos mixtos: el frontend envía montos base, no `amountWithSurcharge`; eso puede hacer que `payment_methods` y `expected_cash` no coincidan.
- Agregar un test con una venta que tenga recargo.

---

## 4. Por qué solo se reproduce en la PC del usuario

1. **Volumen de datos:** una sesión con muchas ventas y un historial de decenas de miles de filas multiplican el N+1, el payload y el DOM. En desarrollo se prueba con sesiones pequeñas.
2. **Hardware y WebView:** el renderizado de miles de nodos y el parseo de HTML son sensibles a CPU/RAM. Tauri usa WebView2 en Windows o WebKitGTK en Linux; ambos pueden bloquearse con DOM grande.
3. **Latencia de red/DB:** el backend y/o TiDB están remotos. Cada consulta adicional cuesta milisegundos o segundos; 34-50 consultas se notan.
4. **Concurrencia:** varias terminales o cajeros usando caja al mismo tiempo agotan los pools de 10 conexiones.
5. **Configuración de build:** `front/.env` define `VITE_API_URL=http://localhost:8000` y el `dist` compilado apunta a localhost. Si la PC del usuario corre el backend localmente contra TiDB remoto, el CPU del backend y la red local también influyen.
6. **Reconexiones:** una red inestable puede disparar la resincronización completa de Dexie.

---

## 5. Cómo validar antes de cambiar código

### 5.1 Medir volúmenes

```sql
SELECT COUNT(*) AS total_sales FROM sales;
SELECT COUNT(*) AS total_details FROM sales_details;
SELECT COUNT(*) AS total_sessions FROM cash_sessions;

SELECT cash_session_id, COUNT(*) AS ventas, SUM(total_neto) AS total
FROM sales
GROUP BY cash_session_id
ORDER BY ventas DESC
LIMIT 10;
```

### 5.2 Medir tiempos

- En la PC afectada, abrir DevTools → Network, filtrar `/api` y registrar:
  - `/cash-sessions/history?status=abierta,pendiente_cierre`
  - `/cash-sessions/history?page=1&limit=5...`
  - `/cash-sessions/:id/summary`
  - `/dashboard/top-productos`
  - `/dashboard/ventas/hoy|semana|mes`
  - `/stock?low_stock=true&unpaginated=true`
- Ordenar por “Time” y revisar cuáles superan 1 s.
- En Performance, grabar mientras se abre y cierra el modal; buscar long tasks > 200 ms.
- En React Query Devtools, ver cuántas queries están en `fetching` y cuánto tardan.

### 5.3 Medir el backend

- Agregar un middleware temporal que loguee método, URL, duración y tamaño de respuesta.
- Durante el freeze, ejecutar `SHOW FULL PROCESSLIST` en TiDB para ver consultas activas.
- Revisar el slow query log de TiDB.
- En TiDB Dashboard → SQL Statements, ordenar por latencia total y confirmar el peso de `UPDATE sessions` frente a las consultas de negocio; verificar si el pico de 419 ms coincide con el freeze.
- Ejecutar `EXPLAIN` de:

```sql
EXPLAIN SELECT stock_id, SUM(quantity), SUM(quantity * price)
FROM sales_details
GROUP BY stock_id
ORDER BY SUM(quantity) DESC
LIMIT 5;

EXPLAIN SELECT SUM(total_neto)
FROM sales
WHERE createdAt BETWEEN '2026-11-01 00:00:00' AND '2026-11-03 23:59:59';
```

### 5.4 Confirmar el disparador

- ¿El freeze ocurre al abrir el modal, al cerrarlo o al llegar al Dashboard?
- ¿Ocurre con una sesión de pocas ventas?
- ¿Aparece el diálogo de impresión antes del freeze?
- ¿Hay errores/timeouts en la consola o en el backend?
- ¿El ping de `/api/health` falla durante el freeze? Ojo: con backend local puede seguir OK aunque TiDB no responda.
- ¿Se ejecuta `loadReferenceData` justo después?
- Antes de reiniciar la PC, anotar la hora exacta y probar el puerto de TiDB: `Test-NetConnection <DB_IP> -Port 4000` en Windows o `nc -vz <DB_IP> 4000` en Linux. Si falla, el problema es red/DB, no la app.
- Si cerrar y reabrir solo la app (y el backend local) lo resuelve, el problema está en el proceso/WebView; si solo se resuelve reiniciando la PC, sospechar acumulación de recursos o estado del sistema.

### 5.5 Reproducir latencia y microcortes

Asumido: backend local en la PC y TiDB remoto. Si el backend está en otra máquina, aplicar la emulación en esa máquina o en el firewall de red, no en el cliente.

**Descubrir IP e interfaz (Linux):**

```bash
DB_HOST=...   # valor de back/.env
DB_PORT=4000  # valor de back/.env
DB_IP=$(getent ahostsv4 "$DB_HOST" | awk 'NR==1{print $1}')
IFACE=$(ip route get "$DB_IP" | awk '{for(i=1;i<=NF;i++) if($i=="dev"){print $(i+1); exit}}')
echo "$DB_IP $IFACE"
```

**Latencia + pérdida (Linux, requiere sudo):**

```bash
sudo tc qdisc add dev "$IFACE" root handle 1: prio
sudo tc qdisc add dev "$IFACE" parent 1:3 handle 30: netem delay 300ms 100ms loss 5%
sudo tc filter add dev "$IFACE" protocol ip parent 1:0 prio 1 u32 match ip dst "$DB_IP"/32 flowid 1:3
# limpiar:
sudo tc qdisc del dev "$IFACE" root
```

**Microcut selectivo a TiDB (DROP 5 s):**

```bash
sudo iptables -I OUTPUT -d "$DB_IP" -p tcp --dport "$DB_PORT" -j DROP
sleep 5
sudo iptables -D OUTPUT -d "$DB_IP" -p tcp --dport "$DB_PORT" -j DROP
```

Usar `REJECT --reject-with tcp-reset` en lugar de `DROP` para simular un corte con reset. No dejar la regla puesta.

**Corte total / reconexión:** desconectar Wi-Fi/Ethernet 5-10 s (`nmcli networking off/on` o `rfkill block/unblock wifi`) y volver a habilitar. Esto prueba el camino `isOnline` → `verificarSesion` → `loadReferenceData` + Dexie.

**Windows cliente:** `clumsy` con filtro por IP/puerto de TiDB (Lag 300 ms, Drop 5 %) o regla de firewall temporal:

```powershell
$rule = "TiDB-block-test"
New-NetFirewallRule -DisplayName $rule -Direction Outbound -RemoteAddress "<DB_IP>" -RemotePort 4000 -Protocol TCP -Action Block
Start-Sleep -Seconds 5
Remove-NetFirewallRule -DisplayName $rule
```

**Secuencia de prueba:**

1. Línea base: abrir/cerrar una sesión con muchas ventas y volver al Dashboard; medir.
2. Repetir con 300 ms + 5 % de pérdida.
3. Repetir con microcut de 5 s durante el cierre/navegación.
4. Repetir con corte total de 10 s y reconexión.
5. Repetir con CPU throttling 6×/20× en DevTools si el freeze no aparece con red.

**Seguridad:** usar solo pantallas de lectura; no cerrar cajas ni generar informes completos en horario pico; limpiar `tc`/`iptables` con `trap` o una segunda terminal.

---

## 6. Plan de corrección priorizado

### P0 — bajo riesgo, alto impacto

- [x] **Auditoría:** sacar `logAudit` y las alertas de stock de la transacción y de la ruta crítica; escribir después del `commit`. Aplicado en ventas, stock y cierres; el recorte de `old_values`/`new_values` y una cola global siguen pendientes.
- [x] **Alertas de stock:** no llamar `checkLowStockAndLog` por ítem dentro de la transacción; las alertas de venta se agrupan y persisten después del `commit`.
- [x] **Sesiones:** `touch` throttleado cada 5 minutos (`sessionTouch.js`).
- [x] **Historial de caja:** reemplazado el N+1 por agregados por página (`getSessionAggregates`).
- [x] **Doble carga:** separado el endpoint de cajas activas (`active-list`) del historial paginado.
- [x] **Summaries de tarjetas:** `getActiveCashSessions` devuelve totales sin ventas.
- [x] **Detalle de caja:** `includeSales=false` por defecto; ventas paginadas al expandir.
- [x] **Render condicional:** la tabla de ventas solo se monta si la sección está abierta.
- [x] **Dashboard:** endpoint `overview` agregado, `staleTime` 60 s y `refetchOnWindowFocus: false`.
- [x] **Top productos:** limitado a los últimos 90 días.
- [x] **Reintentos:** `retry: 1` y `AbortSignal` en `useQuery`.
- [x] **Informe completo:** límite de 5.000 filas con aviso de truncado; la medición de freeze en la PC afectada queda pendiente.

### P1 — estructural

- [x] Índice `sales(createdAt)`.
- [x] Índice `sales(cash_session_id, createdAt)`.
- [x] Índice `sales_details(sales_Id, stock_id)`.
- [ ] Validar índices con `EXPLAIN` y medir el impacto en escrituras.
- [x] Unificar métricas del Dashboard en un endpoint agregado.
- [x] Evitar la resincronización completa de Dexie en cada reconexión (TTL de 30 min).
- [ ] Evaluar cache de sesión o JWT para no leer la DB en cada request. La solución B extendió la sesión a 1 año, pero el store remoto se sigue consultando por request.

### P2 — experiencia

- [ ] Reemplazar el skeleton que desmonta toda la vista por un overlay.
- [x] Reducir la animación de salida de Informes a 0,4 s (revisar el resto de las vistas).
- [ ] Virtualizar tablas grandes.
- [ ] Limpiar el cache de `sessionDetails` al cerrar el modal; actualmente solo se limpia `sessionSales`.
- [x] Quitar `console.log(detailedSessions)` de producción.

### Riesgos y cuidados

- Los índices en TiDB sobre tablas grandes consumen recursos; probar en copia y en horario de baja actividad.
- Cambiar `retry`/timeout puede hacer visibles errores antes; agregar mensajes claros.
- `includeSales=false` debe conservar los totales que usan las tarjetas y el diálogo de cierre.
- La resincronización de Dexie es crítica para el modo offline; cualquier cambio debe probarse sin conexión.
- Un límite en el informe completo puede truncar información legal o contable; confirmar con el negocio.

---

## 7. Hallazgos incidentales

- [ ] `front/src/styledComponents/CashSessionDetails.jsx` referencia `InputAdornment`, `ClearIcon`, `handleCloseSession` y `loading` sin definirlos, pero el componente **no se importa en ningún lado**. Es código muerto; conviene eliminarlo o corregirlo aparte. **Pendiente.**
- [ ] `back/controllers/Controller.js` tiene `verified_at` duplicado en el objeto de actualización de cierre. No rompe, pero es señal de código a limpiar. **Pendiente.**
- [x] `CashAdmin.jsx:743` y `CajeroView.jsx:592` calculaban la duración con `sessionDetails.closed_at`, pero el modelo `CashSessionsModel` no expone `closed_at`. El backend ahora devuelve `closed_at` como alias de `verified_at`/`closed_at_user` en las respuestas de caja. **Resuelto en backend; el front no se modificó.**
- [x] `front/src/components/Informes.jsx` calculaba `avgAmount = summaryData.total / totalItems` y podía dar `Infinity`; ahora usa `totalItems > 0 ? ... : 0`. **Resuelto.**

---

## 8. Preguntas abiertas

1. ¿Cuántas ventas tiene, en promedio, una sesión de caja en la PC afectada? ¿Y cuántas en la sesión más grande?
2. ¿Cuántos usuarios/cajeros usan el sistema simultáneamente?
3. ¿El backend corre en la misma PC que el frontend o en otro equipo?
4. ¿El freeze ocurre solo al cerrar el detalle o también al abrirlo?
5. ¿Aparece el diálogo de impresión antes de que la app se congele?
6. ¿Se ve algún mensaje de timeout o error de red?
7. ¿La PC afectada es Windows o Linux? ¿Qué hardware tiene?

---

## 9. Conclusión

El camino más probable es:

1. En la captura de 15 min, `INSERT audit_logs` concentra el 92,9 % del tiempo SQL visible: las alertas de stock se escriben una por una dentro de transacciones. Con un microcorte, una transacción colgada retiene locks y las auditorías siguientes esperan.
2. El store de sesión hace un `UPDATE` de expiración por request (46,5 % en la captura A); es un peaje fijo que compite con las consultas de negocio.
3. El historial de caja multiplica consultas y payload; el summary del detalle trae todas las ventas aunque estén ocultas.
4. Al cerrar el modal, el desmontaje masivo bloquea el hilo principal; la base sola no explica un freeze de varios segundos.
5. Al volver al Dashboard, la ráfaga de 14 consultas encuentra el backend ocupado y los reintentos multiplican la espera.

Las capturas A (40 plantillas) y B (15 min) son ventanas distintas y no se contradicen: muestran cargas distintas. La auditoría es el nuevo P0; el DOM sigue siendo el sospechoso principal del freeze. La solución no es un único cambio: hay que sacar la auditoría de la ruta crítica, eliminar el `touch` por request, reducir consultas y payloads, evitar renderizar lo que no se ve y dejar de reintentar consultas pesadas.
