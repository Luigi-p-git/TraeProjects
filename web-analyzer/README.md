# Web Analyzer 🔍

A sophisticated web analysis tool that extracts comprehensive insights about websites and converts UI screenshots into code. Analyze technology stacks, design systems, and generate React/Vue components with AI-powered image analysis.

## ✨ Features

### Website Analysis
- **🎯 URL Analysis**: Simply input any website URL for instant analysis
- **📸 Visual Capture**: Takes screenshots to analyze visual components
- **⚡ Tech Stack Detection**: Identifies frameworks, libraries, and technologies
- **🎨 Design System Extraction**: Analyzes colors, fonts, spacing, and layout systems
- **🧩 Component Mapping**: Identifies and categorizes UI components
- **🔍 SEO Analysis**: Examines meta tags, titles, and SEO optimization
- **📊 Performance Metrics**: Measures load times, page size, and optimization scores

### Image to Code Analysis (NEW! 🆕)
- **🖼️ Image Upload**: Upload UI screenshots for component analysis
- **🤖 AI-Powered Detection**: Uses GPT-4 Vision to identify UI components
- **⚛️ Code Generation**: Generates React, Vue, HTML, CSS, and Tailwind code
- **🎨 Style Extraction**: Extracts color palettes, typography, and spacing systems
- **📐 Layout Analysis**: Identifies grid systems, flexbox layouts, and responsive design
- **🧩 Design System Matching**: Detects Material-UI, Ant Design, Bootstrap patterns
- **📋 Export Options**: Copy code or download as files

### General
- **✨ Beautiful UI**: Modern, animated interface with smooth transitions
- **🔄 Dual Mode**: Switch between website analysis and image analysis

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Website Analysis**: Cheerio, Puppeteer, html2canvas
- **AI Analysis**: OpenAI GPT-4 Vision API
- **UI Components**: Radix UI primitives

## 📦 Installation

1. **Clone the repository**:
   ```bash
   cd web-analyzer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (for Image Analysis feature):
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key (choose one):
   
   **Option A: Gemini API (Recommended - More Cost-Effective)**
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Get your Gemini API key from: https://makersuite.google.com/app/apikey
   
   **Option B: OpenAI API**
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   Get your OpenAI API key from: https://platform.openai.com/api-keys
   
   > **Note**: The Image Analysis feature requires either a Gemini or OpenAI API key. Website analysis works without an API key.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3001`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 How to Use

1. **Enter a URL**: Type any website URL in the input field
2. **Start Analysis**: Click "Analyze Website" to begin the process
3. **Watch Progress**: Follow the real-time analysis steps
4. **Explore Results**: Navigate through different analysis sections:
   - **Overview**: Screenshot and quick stats
   - **Tech Stack**: Detected technologies and frameworks
   - **Design System**: Colors, fonts, and layout information
   - **Components**: Identified UI components and their properties
   - **SEO Analysis**: Meta tags, titles, and SEO metrics
   - **Performance**: Load times, page size, and performance scores

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── URLInput.tsx    # URL input interface
│   ├── LoadingAnimation.tsx  # Analysis progress animation
│   └── AnalysisResults.tsx   # Results display
├── types/              # TypeScript type definitions
│   └── analysis.ts     # Analysis data types
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Design Features

- **Glassmorphism Effects**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Works perfectly on all device sizes
- **Dark Mode Ready**: CSS variables for easy theme switching
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Customization

### Adding New Analysis Features

1. **Update Types**: Add new properties to `AnalysisData` in `src/types/analysis.ts`
2. **Extend UI**: Add new tab and rendering logic in `AnalysisResults.tsx`
3. **Update Loading**: Add new steps to the loading animation

### Styling Customization

- **Colors**: Modify CSS variables in `src/index.css`
- **Components**: Update Tailwind classes in component files
- **Animations**: Customize Framer Motion animations

## 🚀 Future Enhancements

- [ ] Real website scraping integration
- [ ] AI-powered design analysis
- [ ] Accessibility audit features
- [ ] Performance optimization suggestions
- [ ] Export analysis reports (PDF/JSON)
- [ ] Comparison between multiple websites
- [ ] Historical analysis tracking
- [ ] API integration for automated analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Styled with Tailwind CSS
- Animated with Framer Motion
- Icons by Lucide React
- UI components by Radix UI

---

**Made with ❤️ for the web development community**