# PolyChat - AI-Powered French Learning Assistant

🇫🇷 **PolyPal** is an intelligent French learning chatbot that helps you practice French conversation, provides real-time corrections, and offers cultural insights.

## ✨ Features

- **🤖 AI-Powered Conversations**: Real-time chat with Gemini AI in French
- **📝 Grammar Corrections**: Automatic error detection and explanations
- **🎭 Scenario-Based Learning**: Practice French in different contexts
- **🗣️ Voice Recognition**: Speak in French using voice input
- **📚 Flashcards**: Save and review vocabulary
- **🎨 Beautiful UI**: Modern, animated interface with glassmorphism design

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd polychat

# Install dependencies
npm install
```

### 2. AI Configuration (Recommended)

To enable intelligent AI responses, you'll need a Gemini API key:

1. **Get your free Gemini API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Configure the environment**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API key
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

### 3. Without AI (Fallback Mode)

The app works without an API key but will show simulated responses:

```bash
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **AI**: Google Gemini API
- **Voice**: Web Speech API
- **Build**: Vite
- **UI Components**: Radix UI + shadcn/ui

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
