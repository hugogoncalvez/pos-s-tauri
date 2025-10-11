import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { isTauri } from '../hooks/useIsTauri';

let cachedConfig = null;

export async function getBackendUrl() {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (isTauri) {
    try {
      // Leer el archivo config.json que está junto al ejecutable
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
  } else {
    // En un entorno de navegador web, usar localhost
    console.log("Entorno web detectado, usando localhost como URL del backend.");
    cachedConfig = 'http://localhost:8000';
    return cachedConfig;
  }
}
