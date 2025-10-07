# Instrucciones para Crear un Acceso Directo de Producción

Aquí se detallan los pasos para crear un acceso directo que lance la aplicación en modo de pantalla completa, ideal para un entorno de producción.

---

## Para Windows (Usuarios Finales)

Este es el método recomendado para las computadoras de los usuarios finales que utilizan Windows.

1.  Haz clic derecho en el Escritorio (o en una carpeta) y selecciona **`Nuevo`** > **`Acceso directo`**.

2.  Aparecerá una ventana pidiendo la "ubicación del elemento". En ese campo, pega la siguiente línea:

    ```
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --start-fullscreen "http://URL_DE_TU_APP"
    ```

    **Notas Importantes:**
    *   **Ruta de Chrome:** La ruta `"C:\Program Files\..."` es la estándar. Si Chrome está instalado en otro lugar (como `Program Files (x86)`), deberá ajustarse. Las comillas son **obligatorias**.
    *   **URL de la App:** Reemplaza `http://URL_DE_TU_APP` por la dirección donde se servirá la aplicación en producción (ej. `http://localhost:80` o un dominio real).

3.  Haz clic en **`Siguiente`**.

4.  Asígnale un nombre al acceso directo, por ejemplo, `Sistema POS`, y haz clic en **`Finalizar`**.

### Alternativa: Modo Quiosco (Más Restrictivo)

Para una experiencia de "Punto de Venta" más pura (sin barras de herramientas, etc.), puedes usar el modo quiosco. Simplemente reemplaza `--start-fullscreen` por `--kiosk`:

```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk "http://URL_DE_TU_APP"
```

---

## Para Linux (Desarrollo)

Este método es para crear un lanzador de escritorio en sistemas Linux.

1.  Crea un archivo de texto en tu Escritorio o en `~/.local/share/applications/`. Nómbralo `Sistema-POS.desktop`.

2.  Abre el archivo y pega el siguiente contenido:

    ```ini
    [Desktop Entry]
    Version=1.0
    Name=Sistema POS
    Comment=Acceso al Punto de Venta
    Exec=google-chrome-stable --start-fullscreen http://URL_DE_TU_APP
    Icon=/ruta/absoluta/a/tu/logo.png
    Terminal=false
    Type=Application
    Categories=Office;Finance;
    ```

3.  **Modifica las líneas `Exec` e `Icon`** según sea necesario, apuntando a tu ejecutable de Chrome, la URL de producción y la ruta absoluta del ícono.

4.  Finalmente, dale permisos de ejecución al archivo desde la terminal:
    ```bash
    chmod +x Sistema-POS.desktop
    ```
