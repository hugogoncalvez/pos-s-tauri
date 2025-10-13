use tauri_plugin_log::Builder as LogBuilder;
use log::LevelFilter;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Inicializamos el plugin de logging globalmente
            app.handle().plugin(
                LogBuilder::default()
                    // Nivel de log mínimo a registrar
                    .level(LevelFilter::Info)
                    // Guarda los logs en el directorio por defecto de la app
                    .build(),
            )?;

            Ok(())
        })
        // Otros plugins
        .plugin(tauri_plugin_process::init())
        // Inicia la app Tauri
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
