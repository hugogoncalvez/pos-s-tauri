# Guía de Verificación del Sistema POS (Google Cloud)

Este documento resume los comandos necesarios para monitorear y verificar el estado del backend y la infraestructura en la nube.

## 1. Backend (PM2)
El servidor corre de forma permanente usando PM2.

* **Ver estado general:**
  ```bash
  pm2 status
  ```
* **Ver logs en tiempo real (peticiones y errores):**
  ```bash
  pm2 logs pos-backend
  ```
* **Reiniciar el servidor (si hay cambios en el .env):**
  ```bash
  pm2 restart pos-backend --update-env
  ```

Actualizar el backend: ./deploy.sh

## 2. IP Dinámica (DuckDNS)
El dominio `pos-thay.duckdns.org` siempre debe apuntar a la IP actual de la VM.

* **Probar el actualizador manualmente:**
  ```bash
  ~/duckdns/duck.sh
  ```
* **Ver resultado de la última actualización:**
  ```bash
  cat ~/duckdns/duck.log
  ```
  *(Debe decir "OK")*

## 3. Tareas Programadas (Cron)
El cron job se encarga de ejecutar el script de DuckDNS cada 5 minutos.

* **Verificar que la tarea esté programada:**
  ```bash
  crontab -l
  ```
* **Verificar que el servicio Cron esté activo:**
  ```bash
  sudo systemctl status cron
  ```
* **Verificar última ejecución por fecha del archivo:**
  ```bash
  ls -l ~/duckdns/duck.log
  ```

## 4. Pruebas de Conexión Externa
Puedes probar si el servidor responde desde cualquier navegador usando esta URL:

* **Endpoint de Salud/Auth:**
  [http://pos-thay.duckdns.org:8000/api/auth/check](http://pos-thay.duckdns.org:8000/api/auth/check)

## 5. Configuración del Frontend (Local)
Para que el instalador funcione, estos archivos deben apuntar al dominio:

* **Archivo `.env`:** `VITE_API_URL=http://pos-thay.duckdns.org:8000`
* **Archivo `src/config.js`:** `export const API_BASE_URL = 'http://pos-thay.duckdns.org:8000/api';`

---
**IP de Google Cloud actual (Referencia):** 34.134.225.108
**Dominio:** pos-thay.duckdns.org
