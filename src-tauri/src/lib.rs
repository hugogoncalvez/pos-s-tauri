use tauri_plugin_log::{Builder as LogBuilder, LogTarget};
use log::LevelFilter;

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.handle().plugin(
                LogBuilder::default()
                    .targets([
                        LogTarget::LogDir,
                        LogTarget::Stdout,
                        LogTarget::Webview,
                    ])
                    .level(LevelFilter::Info)
                    .build(),
            )?;
            Ok(())
        })
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
