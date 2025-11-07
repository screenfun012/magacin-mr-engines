// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::Write;
use std::process::Command;

#[tauri::command]
fn save_temp_file(data: Vec<u8>, filename: String) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let file_path = temp_dir.join(filename);
    
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;
    
    file.write_all(&data)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn run_installer(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("msiexec")
            .arg("/i")
            .arg(&path)
            .arg("/passive")
            .spawn()
            .map_err(|e| format!("Failed to run installer: {}", e))?;
        
        // Exit application after starting installer
        std::process::exit(0);
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        return Err("Update is only supported on Windows".to_string());
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_temp_file, run_installer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

