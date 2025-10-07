# 01_Plan de Migración: MySQL a Supabase (Esquema y Datos)

Este documento detalla los pasos para migrar la base de datos MySQL a PostgreSQL en Supabase, utilizando un enfoque híbrido manual/automático debido a problemas de compatibilidad con herramientas directas.

---

## Paso 1: Exportar el Esquema de MySQL (solo estructura)

Vamos a usar `mysqldump` para obtener solo la estructura de tu base de datos MySQL.

```bash
mysqldump -u pguser -p --no-data PosSystem > mysql_schema.sql
```
*   **Ejecuta este comando en tu terminal.** Te pedirá la contraseña del usuario `pguser`.
*   Esto creará un archivo llamado `mysql_schema.sql` en el directorio donde ejecutes el comando, que contendrá todas las sentencias `CREATE TABLE` de tu base de datos.

---

## Paso 2: Convertir el Esquema a PostgreSQL

Este es el paso más manual, pero es crucial.

1.  **Abre el archivo `mysql_schema.sql`** que acabas de crear con un editor de texto.
2.  Necesitarás adaptar las sentencias SQL de MySQL a la sintaxis de PostgreSQL. Las diferencias clave son:
    *   `AUTO_INCREMENT` en MySQL se convierte en `SERIAL` o `BIGSERIAL` en PostgreSQL.
    *   `INT(11)` en MySQL suele ser `INTEGER` en PostgreSQL.
    *   `DATETIME` en MySQL suele ser `TIMESTAMP` en PostgreSQL.
    *   Las comillas para nombres de tablas y columnas: MySQL usa comillas invertidas (``` `campo` ```), PostgreSQL usa comillas dobles (`"campo"`).
    *   Algunos tipos de datos específicos de MySQL (como `TINYINT(1)` para booleanos) deben cambiarse a `BOOLEAN`.
3.  Puedes usar herramientas online como [SQLines](http://www.sqlines.com/online) o [pgloader](https://pgloader.io/howto/mysql.html) (aunque no lo usemos para la migración directa, su documentación tiene guías de conversión) para ayudarte con la sintaxis.

---

## Paso 3: Crear y Aplicar la Migración en Supabase

Una vez que tengas el SQL de PostgreSQL listo:

1.  **Asegúrate de estar en la raíz de tu proyecto** (donde está tu `back` y `front`).
2.  **Crea un nuevo archivo de migración en Supabase:**
    ```bash
supabase migration new initial_schema
    ```
    Esto creará un archivo SQL vacío en `supabase/migrations/` con un nombre como `20250924123456_initial_schema.sql`.
3.  **Abre ese archivo** y **pega el SQL de PostgreSQL convertido** dentro.
4.  **Aplica la migración a tu proyecto Supabase:**
    ```bash
supabase db push
    ```
    Esto creará todas tus tablas en Supabase.

---

## Paso 4: Exportar los Datos de MySQL a CSV

Ahora que el esquema está en Supabase, exportaremos los datos de cada tabla de MySQL a archivos CSV.

```bash
mysql -u pguser -p PosSystem -e "SELECT * FROM nombre_de_tu_tabla INTO OUTFILE '/tmp/nombre_de_tu_tabla.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';"
```
*   **Repite este comando para CADA TABLA** que contenga datos que quieras migrar.
*   Asegúrate de reemplazar `nombre_de_tu_tabla` por el nombre real de cada tabla.
*   El archivo CSV se creará en `/tmp/`.

---

## Paso 5: Importar los Datos a Supabase

1.  Ve a tu dashboard de Supabase.
2.  En el menú de la izquierda, haz clic en **"Table Editor"**.
3.  Selecciona una de tus tablas.
4.  Haz clic en el botón **"Insert"** (o similar) y busca la opción **"Import data from CSV"**.
5.  Sube el archivo CSV correspondiente a esa tabla.
6.  **Repite este paso para CADA ARCHIVO CSV.**

---

**Siguiente Paso:** Empezar con el Paso 1: Exportar el Esquema de MySQL.
