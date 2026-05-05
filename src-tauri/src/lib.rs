use tauri_plugin_log::{Builder as LogBuilder, Target, TargetKind};
use log::LevelFilter;
use tauri_plugin_http::init as http_plugin_init;
use tauri::tray::TrayIconBuilder;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Inicializamos el plugin de logging globalmente
            app.handle().plugin(
                LogBuilder::default()
                    .level(LevelFilter::Debug)
                    .target(Target::new(TargetKind::Stdout))
                    .target(Target::new(TargetKind::Webview))
                    .target(Target::new(TargetKind::LogDir { file_name: Some("app".into()) }))
                    .build(),
            )?;

            // Inicialización de la System Tray
            if let Some(icon) = app.default_window_icon().cloned() {
                let _ = TrayIconBuilder::new()
                    .icon(icon)
                    .tooltip("POS System")
                    .build(app);
            }

            Ok(())
        })
        // Otros plugins
        .plugin(tauri_plugin_process::init())
        .plugin(http_plugin_init())
        // Inicia la app Tauri
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
