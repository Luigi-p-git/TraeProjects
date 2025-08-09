# 🎤 VoicePal

A professional voice-powered assistant application with world-class AI voices, built with Tauri, React, and TypeScript.

## ✨ Features

- **🎯 Speech-to-Text**: Real-time voice transcription with multi-language support
- **🗣️ Text-to-Speech**: Professional AI voices powered by ElevenLabs
- **🌍 Translation**: Instant translation between English, Spanish, and French
- **💾 Audio Download**: Save generated speech as high-quality MP3 files
- **📱 Cross-Platform**: Works on desktop and web
- **🎨 Modern UI**: Beautiful, responsive interface with smooth animations

## 🚀 Tech Stack

- **Framework**: Tauri (Rust + Web)
- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Voices**: ElevenLabs API
- **Translation**: DeepL API
- **Deployment**: Vercel (Serverless Functions)

## 📦 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up ElevenLabs API** (Required for TTS)
   - See [ELEVENLABS_SETUP.md](./ELEVENLABS_SETUP.md) for detailed instructions
   - Create `.env.local` and add your API key:
     ```bash
     ELEVENLABS_API_KEY=your_api_key_here
     ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Opens at: http://localhost:1420

4. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Development

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Project Structure

```
voicepal-app/
├── src/                 # React frontend
├── src-tauri/           # Tauri backend (Rust)
├── public/              # Static assets
└── package.json         # Dependencies
```
