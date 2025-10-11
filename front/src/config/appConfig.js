import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { isTauri } from '@tauri-apps/api/core';

let cachedConfig = null;
let cachedIsTauri = null;

export async function getBackendUrl() {
  // Cachear la verificación de Tauri
  if (cachedIsTauri === null) {
    cachedIsTauri = await isTauri();
  }

  // Si no es Tauri, retornar localhost
  if (!cachedIsTauri) {
    console.log("Entorno web detectado, usando localhost como URL del backend.");
    return 'http://localhost:8000';
  }

  // Si ya tenemos la config cacheada, retornarla
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Leer el archivo config.json
    const configContent = await readTextFile('config.json', {
      dir: BaseDirectory.Resource
    });
    const config = JSON.parse(configContent);
    cachedConfig = config.backend_url;
    console.log("URL del backend cargada desde config.json:", cachedConfig);
    return cachedConfig;
  } catch (error) {
    console.error('Error leyendo config.json, usando fallback a localhost:', error);
    // Fallback a localhost si el archivo no existe o falla la lectura
    cachedConfig = 'http://localhost:8000';
    return cachedConfig;
  }
}