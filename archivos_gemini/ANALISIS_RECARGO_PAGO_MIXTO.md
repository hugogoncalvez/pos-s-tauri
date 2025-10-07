# Análisis y Solución: Recargo en Pagos Mixtos

Este documento describe el problema detectado en el cálculo de recargos para pagos mixtos y la solución implementada.

## 1. El Problema

Se detectó un bug de lógica financiera complejo con múltiples facetas al utilizar pagos mixtos donde uno o más métodos de pago tienen un recargo asociado.

### Caso 1: El Bucle de Recálculo (La "Cola que se muerde")

- **Comportamiento:** Al pagar una parte de la venta con un método con recargo (ej. Mercado Pago 6%), el sistema calculaba el recargo sobre el monto ingresado. Sin embargo, ese mismo monto debía incluir el recargo, lo que generaba un ciclo de recálculo infinito y confuso para el usuario.
- **Ejemplo:** Para un saldo de $1000, si el usuario ingresaba $1000 en Mercado Pago, el sistema calculaba un recargo de $60 y pedía un total de $1060. Si el usuario corregía a $1060, el sistema recalculaba el recargo sobre $1060, generando una nueva diferencia.

### Caso 2: Dependencia del Orden

- **Comportamiento:** Una primera corrección intentó solucionar esto calculando el recargo sobre el saldo restante después de aplicar pagos sin recargo. Esto funcionaba solo si el usuario seleccionaba primero el método sin recargo (ej. Efectivo) y luego el método con recargo. Si el orden se invertía, el bug persistía.

### Caso 3: Múltiples Métodos con Recargo

- **Comportamiento:** Se planteó el caso de que el usuario pudiera seleccionar dos métodos de pago distintos, ambos con recargos diferentes (ej. Tarjeta de Crédito 10% y Mercado Pago 6%). Esto introduce una gran complejidad y ambigüedad sobre cómo se debe calcular el recargo final.

## 2. La Solución Implementada

Para resolver estos problemas de raíz y garantizar un comportamiento estable, predecible y transparente, se implementó una solución en dos partes:

### Parte A: Lógica de Cálculo Robusta e Independiente del Orden

Se modificó la función `calcularTotal` en `Ventas.jsx` para que el cálculo del recargo siga una regla estricta e inmutable:

1.  Se toma el **Subtotal de la Venta** (después de descuentos).
2.  Se identifica el monto total que el usuario ha ingresado en métodos de pago **SIN recargo**.
3.  Se resta este monto del subtotal para obtener el **"saldo a cubrir"**.
4.  El recargo se calcula **siempre** como un porcentaje de este "saldo a cubrir".

Esto asegura que el cálculo sea siempre el mismo sin importar el orden en que se elijan o se ingresen los montos.

### Parte B: Limitación en la Interfaz de Usuario (UI)

Para resolver la complejidad del Caso 3 (múltiples métodos con recargo), se aplicó una restricción directamente en la interfaz:

- **Regla:** En una misma transacción de pago mixto, se permite como máximo **un solo método de pago que tenga un recargo asociado**.
- **Implementación:** Cuando un usuario selecciona un método de pago en el primer desplegable del pago mixto:
    - Si el método elegido **tiene recargo**, el segundo desplegable se filtra y solo muestra opciones **sin recargo**.
    - Si el método elegido **no tiene recargo**, el segundo desplegable muestra todas las demás opciones disponibles.

## 3. Beneficios de esta Solución

- **Predecible y Transparente:** El cálculo del recargo es fácil de entender tanto para el cajero como para el cliente final.
- **Evita Errores:** Elimina por completo los bucles de recálculo y la ambigüedad matemática.
- **Robusto:** La combinación de una lógica de cálculo sólida y una restricción inteligente en la UI cubre todos los casos límite detectados.
