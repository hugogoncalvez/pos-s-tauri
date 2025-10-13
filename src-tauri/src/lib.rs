use tauri_plugin_log::{Builder as LogBuilder, Target};
use log::LevelFilter;

pub fn run() {
    tauri::Builder::default()
        .plugin(
            LogBuilder::default()
                .level(LevelFilter::Debug)
                .target(Target::File)
                .build(),
        )
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}