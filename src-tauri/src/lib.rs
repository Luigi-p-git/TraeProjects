use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};
use std::env;
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct TranscriptionResult {
    text: String,
    is_final: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct TranscriptionError {
    message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct TranslationResult {
    translated_text: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct TranslationError {
    message: String,
}

#[derive(Debug, Deserialize)]
struct DeepLResponse {
    translations: Vec<DeepLTranslation>,
}

#[derive(Debug, Deserialize)]
struct DeepLTranslation {
    text: String,
}

// Global state to track if transcription is active
static TRANSCRIPTION_ACTIVE: Mutex<bool> = Mutex::new(false);

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn translate(text: String, target_lang: String, source_lang: Option<String>) -> Result<TranslationResult, TranslationError> {
    // Load API key from environment
    let api_key = env::var("DEEPL_API_KEY")
        .map_err(|_| TranslationError {
            message: "DeepL API key not found in environment.".to_string(),
        })?;

    if api_key.is_empty() || api_key == "your_deepl_api_key_here" {
        return Err(TranslationError {
            message: "API key is empty or is a placeholder. Please check your .env file.".to_string(),
        });
    }

    // Create HTTP client
    let client = Client::new();
    
    // Prepare request body
    let mut params = vec![
        ("text", text.as_str()),
        ("target_lang", target_lang.as_str()),
    ];
    
    if let Some(ref source) = source_lang {
        params.push(("source_lang", source.as_str()));
    }

    // Make request to DeepL API
    let response = client
        .post("https://api-free.deepl.com/v2/translate")
        .header("Authorization", format!("DeepL-Auth-Key {}", api_key))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&params)
        .send()
        .await
        .map_err(|e| TranslationError {
            message: format!("Failed to connect to DeepL API: {}", e),
        })?;

    // THIS IS THE NEW, IMPROVED ERROR HANDLING BLOCK
    if !response.status().is_success() {
        let status = response.status();
        // Get the full error body from DeepL's response
        let error_body = response.text().await.unwrap_or_else(|_| "Could not retrieve error body.".to_string());
        // Create the detailed error message
        let detailed_error_message = format!("DeepL API Error (Status: {}): {}", status, error_body);

        // THIS IS THE NEW DEBUG LINE FOR YOUR TERMINAL
        println!("TRANSLATION DEBUG: {}", detailed_error_message);

        // Return the detailed error to the frontend
        return Err(TranslationError {
            message: detailed_error_message,
        });
    }

    // Parse successful response
    let deepl_response: DeepLResponse = response
        .json()
        .await
        .map_err(|e| TranslationError {
            message: format!("Failed to parse DeepL response: {}", e),
        })?;

    // Extract translated text
    let translated_text = deepl_response
        .translations
        .first()
        .map(|t| t.text.clone())
        .ok_or_else(|| TranslationError {
            message: "No translation found in DeepL response.".to_string(),
        })?;

    Ok(TranslationResult { translated_text })
}

#[cfg(target_os = "macos")]
fn check_microphone_permission() -> Result<(), String> {
    // For now, just return Ok since we're using simulated speech recognition
    // In a real implementation, this would check AVAudioSession.recordPermission
    println!("TRANSCRIPTION DEBUG: Checking microphone permissions (simulated)");
    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn check_microphone_permission() -> Result<(), String> {
    Err("Microphone permission check not supported on this platform".to_string())
}

#[tauri::command]
async fn start_transcription(app_handle: AppHandle, language: Option<String>) -> Result<(), String> {
    println!("TRANSCRIPTION DEBUG: Starting transcription with language: {:?}", language);
    
    // Check microphone permissions first
    if let Err(e) = check_microphone_permission() {
        let error_msg = format!("Microphone permission denied: {}", e);
        println!("TRANSCRIPTION DEBUG: {}", error_msg);
        let _ = app_handle.emit("transcription-error", TranscriptionError {
            message: error_msg.clone(),
        });
        return Err(error_msg);
    }
    
    let mut active = TRANSCRIPTION_ACTIVE.lock().map_err(|e| {
        let error_msg = format!("Failed to acquire transcription lock: {}", e);
        println!("TRANSCRIPTION DEBUG: {}", error_msg);
        error_msg
    })?;
    
    if *active {
        let error_msg = "Transcription already active".to_string();
        println!("TRANSCRIPTION DEBUG: {}", error_msg);
        return Err(error_msg);
    }
    
    *active = true;
    drop(active);
    
    println!("TRANSCRIPTION DEBUG: Transcription state set to active");
    
    // Continue with speech recognition setup
    #[cfg(target_os = "macos")]
    {
        let lang = language.unwrap_or_else(|| "en-US".to_string());
        println!("TRANSCRIPTION DEBUG: Using language: {}", lang);
        
        let app_handle_clone = app_handle.clone();
        tokio::spawn(async move {
            println!("TRANSCRIPTION DEBUG: Starting macOS speech recognition task");
            
            // Use simpler error handling
            match start_macos_speech_recognition(app_handle_clone.clone(), lang).await {
                Ok(()) => {
                    println!("TRANSCRIPTION DEBUG: Speech recognition completed successfully");
                },
                Err(e) => {
                    println!("TRANSCRIPTION DEBUG: Speech recognition failed with error: {}", e);
                    let _ = app_handle_clone.emit("transcription-error", TranscriptionError {
                        message: e,
                    });
                }
            }
        });
    }

    #[cfg(not(target_os = "macos"))]
    {
        return Err("Speech recognition is only supported on macOS".to_string());
    }

    Ok(())
}

#[tauri::command]
async fn stop_transcription() -> Result<(), String> {
    let mut active = TRANSCRIPTION_ACTIVE.lock().map_err(|e| e.to_string())?;
    *active = false;
    Ok(())
}

#[tauri::command]
#[cfg(target_os = "macos")]
async fn speak(text: String, voice_preset: String, language_code: String) -> Result<(), String> {
    use std::process::Command;
    
    // Configure voice settings based on language and preset
    let voice = match language_code.as_str() {
        "es-ES" => match voice_preset.as_str() {
            "cinematic" => "Diego",    // Spanish male voice
            _ => "Mónica",              // Spanish female voice
        },
        "fr-FR" => match voice_preset.as_str() {
            "cinematic" => "Thomas",   // French male voice
            _ => "Amélie",             // French female voice
        },
        "en-US" | _ => match voice_preset.as_str() {
            "cinematic" => "Alex",     // English male voice
            _ => "Samantha",           // English female voice
        }
    };
    
    // Configure rate based on preset
    let rate = match voice_preset.as_str() {
        "cinematic" => "150",  // Slower rate for cinematic effect
        _ => "200",             // Normal rate
    };
    
    // Use macOS `say` command with voice configuration
    let output = Command::new("say")
        .arg("-v")
        .arg(voice)
        .arg("-r")
        .arg(rate)
        .arg(&text)
        .output()
        .map_err(|e| format!("Failed to execute speech command: {}", e))?;
    
    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Speech synthesis failed: {}", error));
    }
    
    Ok(())
}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
async fn speak(text: String, voice_preset: String, language_code: String) -> Result<(), String> {
    // For non-macOS platforms, return an error or implement alternative TTS
    Err("Text-to-speech is currently only supported on macOS".to_string())
}

#[tauri::command]
#[cfg(target_os = "macos")]
async fn stop_speech() -> Result<(), String> {
    use std::process::Command;
    
    // Stop any ongoing speech synthesis
    let _output = Command::new("killall")
        .arg("say")
        .output()
        .map_err(|e| format!("Failed to stop speech: {}", e))?;
    
    // Don't treat "no matching processes" as an error
    Ok(())
}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
async fn stop_speech() -> Result<(), String> {
    // For non-macOS platforms
    Err("Speech control is currently only supported on macOS".to_string())
}

#[cfg(target_os = "macos")]
async fn start_macos_speech_recognition(app_handle: AppHandle, language: String) -> Result<(), String> {
    use std::time::Duration;
    
    println!("TRANSCRIPTION DEBUG: start_macos_speech_recognition called with language: {}", language);
    
    // Simulate speech recognition for now - in a real implementation,
    // this would use SFSpeechRecognizer through Objective-C bindings
    let mut counter = 0;
    
    println!("TRANSCRIPTION DEBUG: Starting speech recognition simulation loop");
    
    while *TRANSCRIPTION_ACTIVE.lock().map_err(|e| e.to_string())? {
        tokio::time::sleep(Duration::from_millis(500)).await;
        
        counter += 1;
        let text = match language.as_str() {
            "es-ES" => match counter {
                1 => "Hola",
                2 => "Hola mundo",
                3 => "Hola mundo, esta",
                4 => "Hola mundo, esta es",
                5 => "Hola mundo, esta es una",
                6 => "Hola mundo, esta es una prueba",
                7 => "Hola mundo, esta es una prueba de",
                8 => "Hola mundo, esta es una prueba de reconocimiento",
                9 => "Hola mundo, esta es una prueba de reconocimiento de voz",
                _ => {
                    let _ = app_handle.emit("transcription-result", TranscriptionResult {
                        text: "Hola mundo, esta es una prueba de reconocimiento de voz.".to_string(),
                        is_final: true,
                    });
                    break;
                }
            },
            "fr-FR" => match counter {
                1 => "Bonjour",
                2 => "Bonjour le monde",
                3 => "Bonjour le monde, ceci",
                4 => "Bonjour le monde, ceci est",
                5 => "Bonjour le monde, ceci est un",
                6 => "Bonjour le monde, ceci est un test",
                7 => "Bonjour le monde, ceci est un test de",
                8 => "Bonjour le monde, ceci est un test de reconnaissance",
                9 => "Bonjour le monde, ceci est un test de reconnaissance vocale",
                _ => {
                    let _ = app_handle.emit("transcription-result", TranscriptionResult {
                        text: "Bonjour le monde, ceci est un test de reconnaissance vocale.".to_string(),
                        is_final: true,
                    });
                    break;
                }
            },
            _ => match counter {
                1 => "Hello",
                2 => "Hello world",
                3 => "Hello world, this",
                4 => "Hello world, this is",
                5 => "Hello world, this is a",
                6 => "Hello world, this is a test",
                7 => "Hello world, this is a test of",
                8 => "Hello world, this is a test of speech",
                9 => "Hello world, this is a test of speech recognition",
                _ => {
                    let _ = app_handle.emit("transcription-result", TranscriptionResult {
                        text: "Hello world, this is a test of speech recognition.".to_string(),
                        is_final: true,
                    });
                    break;
                }
            }
        };
        
        let _ = app_handle.emit("transcription-result", TranscriptionResult {
            text: text.to_string(),
            is_final: false,
        });
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load environment variables
    dotenv::dotenv().ok();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            start_transcription,
            stop_transcription,
            translate,
            speak,
            stop_speech
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
