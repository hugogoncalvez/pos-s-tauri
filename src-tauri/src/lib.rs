use tauri_plugin_log::{Builder as LogBuilder, TargetKind};
use log::LevelFilter;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Inicializamos el plugin de logging globalmente
            app.handle().plugin(
                LogBuilder::default()
                    // Nivel de log mínimo a registrar
                    .level(LevelFilter::Debug) // más verboso
                    // Establecemos explícitamente los destinos de los logs
                    .targets([
                        Target::new(TargetKind::Stdout),          // consola del terminal
                        Target::new(TargetKind::Webview),         // consola del webview
                        Target::new(TargetKind::LogDir {         // archivo de log
                            file_name: Some("app.log".into()),
                        }),
                    ])
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
