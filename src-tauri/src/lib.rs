use tauri_plugin_log::{Builder as LogBuilder, Target, TargetKind};
use log::LevelFilter;
use tauri_plugin_http::init as http_plugin_init;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Inicializamos el plugin de logging globalmente
            app.handle().plugin(
                LogBuilder::default()
                    // Nivel de log mínimo a registrar
                    .level(LevelFilter::Debug) // más verboso
                    // Establecemos explícitamente los destinos de los logs
                    .target(Target::new(TargetKind::Stdout))      // consola del terminal
                    .target(Target::new(TargetKind::Webview))     // consola del webview
                    .target(Target::new(TargetKind::LogDir { file_name: Some("app".into()) }))
                    .build(),
            )?;

            Ok(())
        })
        // Otros plugins
        .plugin(tauri_plugin_process::init())
        .plugin(http_plugin_init())
        // Inicia la app Tauri
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
