import React from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Palette, 
  Layout, 
  Download, 
  Copy, 
  CheckCircle,
  Zap
} from 'lucide-react'
import type { ImageAnalysisResult } from '../types/imageAnalysis'

// Demo data to show what the analysis results would look like
const demoAnalysisResult: ImageAnalysisResult = {
  components: [
    {
      id: 'header-1',
      type: 'header',
      name: 'Main Header',
      description: 'Primary navigation header with logo and menu items',
      position: { x: 0, y: 0, width: 1200, height: 80 },
      properties: {
        backgroundColor: '#ffffff',
        color: '#1f2937',
        padding: '16px 24px',
        borderRadius: '0px'
      },
      confidence: 0.95
    },
    {
      id: 'button-1',
      type: 'button',
      name: 'Primary CTA Button',
      description: 'Call-to-action button with gradient background',
      position: { x: 100, y: 200, width: 160, height: 48 },
      properties: {
        text: 'Get Started',
        variant: 'primary',
        size: 'medium',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '12px 24px'
      },
      confidence: 0.92
    },
    {
      id: 'card-1',
      type: 'card',
      name: 'Feature Card',
      description: 'Card component showcasing a feature with icon and text',
      position: { x: 50, y: 300, width: 300, height: 200 },
      properties: {
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '24px',
        margin: '16px'
      },
      confidence: 0.88
    }
  ],
  layout: {
    structure: 'flexbox',
    columns: 3,
    rows: 2,
    gaps: {
      horizontal: '24px',
      vertical: '32px'
    },
    alignment: 'center',
    responsive: true,
    breakpoints: ['768px', '1024px', '1440px']
  },
  styles: {
    colorPalette: {
      primary: ['#3b82f6', '#1d4ed8'],
      secondary: ['#6b7280', '#4b5563'],
      accent: ['#10b981', '#059669'],
      neutral: ['#ffffff', '#f9fafb', '#e5e7eb', '#1f2937']
    },
    typography: {
      headings: {
        fontFamily: 'Inter, sans-serif',
        fontSize: ['32px', '24px', '20px'],
        fontWeight: ['700', '600'],
        lineHeight: '1.2'
      },
      body: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.6'
      }
    },
    spacing: {
      scale: ['4px', '8px', '12px', '16px', '24px', '32px', '48px'],
      unit: 'px'
    },
    borders: {
      radius: ['4px', '8px', '12px', '16px'],
      width: ['1px', '2px'],
      style: ['solid']
    },
    shadows: [
      '0 1px 3px rgba(0,0,0,0.1)',
      '0 4px 6px rgba(0,0,0,0.1)',
      '0 10px 15px rgba(0,0,0,0.1)'
    ],
    effects: ['hover', 'focus', 'active']
  },
  code: {
    html: `<div class="container">
  <header class="header">
    <h1>Main Header</h1>
  </header>
  <main class="main-content">
    <button class="cta-button">Get Started</button>
    <div class="feature-card">
      <h3>Feature Title</h3>
      <p>Feature description</p>
    </div>
  </main>
</div>`,
    css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header {
  background: #ffffff;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.cta-button {
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.feature-card {
  background: #f9fafb;
  padding: 24px;
  border-radius: 12px;
  margin: 16px;
}`,
    react: `import React from 'react'

const Component = () => {
  return (
    <div className="container">
      <header className="header">
        <h1>Main Header</h1>
      </header>
      <main className="main-content">
        <button className="cta-button">
          Get Started
        </button>
        <div className="feature-card">
          <h3>Feature Title</h3>
          <p>Feature description</p>
        </div>
      </main>
    </div>
  )
}

export default Component`,
    vue: `<template>
  <div class="container">
    <header class="header">
      <h1>Main Header</h1>
    </header>
    <main class="main-content">
      <button class="cta-button">
        Get Started
      </button>
      <div class="feature-card">
        <h3>Feature Title</h3>
        <p>Feature description</p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Component'
}
</script>`,
    tailwind: `<div class="max-w-6xl mx-auto px-6">
  <header class="bg-white p-4 border-b border-gray-200">
    <h1 class="text-2xl font-bold text-gray-900">Main Header</h1>
  </header>
  <main class="py-8">
    <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
      Get Started
    </button>
    <div class="bg-gray-50 p-6 rounded-xl m-4">
      <h3 class="text-lg font-semibold mb-2">Feature Title</h3>
      <p class="text-gray-600">Feature description</p>
    </div>
  </main>
</div>`,
    styledComponents: `import styled from 'styled-components'

const Container = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
\`

const Header = styled.header\`
  background: #ffffff;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
\`

const CTAButton = styled.button\`
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
\`

const FeatureCard = styled.div\`
  background: #f9fafb;
  padding: 24px;
  border-radius: 12px;
  margin: 16px;
\``,
    framework: 'react',
    dependencies: ['react', 'styled-components'],
    instructions: 'This is a demo showing the structure of a typical landing page component. Install the dependencies and customize the styling to match your design system.'
  },
  designSystem: {
    detectedSystem: 'tailwind',
    confidence: 0.85,
    suggestedComponents: [
      {
        original: 'Primary CTA Button',
        suggested: 'Button',
        library: 'tailwind',
        props: {
          variant: 'primary',
          size: 'md',
          className: 'bg-blue-600 hover:bg-blue-700'
        }
      },
      {
        original: 'Feature Card',
        suggested: 'Card',
        library: 'tailwind',
        props: {
          className: 'bg-gray-50 p-6 rounded-xl'
        }
      }
    ],
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#1f2937'
      },
      spacing: {
        'spacing-1': '4px',
        'spacing-2': '8px',
        'spacing-3': '12px',
        'spacing-4': '16px',
        'spacing-5': '24px',
        'spacing-6': '32px'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          body: '16px',
          headings: ['32px', '24px', '20px']
        },
        fontWeight: {
          normal: '400',
          bold: '700'
        },
        lineHeight: {
          body: '1.6',
          headings: '1.2'
        }
      }
    }
  }
}

interface ImageAnalysisDemoProps {
  onShowDemo: () => void
}

export const ImageAnalysisDemo: React.FC<ImageAnalysisDemoProps> = ({ onShowDemo }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          Demo Mode
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Image Analysis Results</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This is a demo showing what the AI-powered image analysis would generate. 
          To use the real feature, add your OpenAI API key to the environment variables.
        </p>
        <button
          onClick={onShowDemo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
        >
          Try Image Upload (Demo)
        </button>
      </div>

      {/* Demo Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {/* Results Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-semibold">Analysis Complete</h3>
              <p className="text-blue-100">
                Found {demoAnalysisResult.components.length} components
              </p>
            </div>
          </div>
        </div>

        {/* Demo Content Tabs */}
        <div className="p-6 space-y-8">
          {/* Components Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Detected Components ({demoAnalysisResult.components.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoAnalysisResult.components.map((component, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{component.name}</h5>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {component.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{component.description}</p>
                  <div className="text-xs text-gray-500">
                    Confidence: {Math.round(component.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styles Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Style System
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(demoAnalysisResult.styles.colorPalette).map(([category, colors]) => (
                <div key={category} className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700 capitalize">{category}</h6>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Generated Code
            </h4>
            <div className="space-y-4">
              {[
                { key: 'react', label: 'React', code: demoAnalysisResult.code.react },
                { key: 'tailwind', label: 'Tailwind', code: demoAnalysisResult.code.tailwind }
              ].map(({ key, label, code }) => (
                <div key={key} className="border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                    <h5 className="font-medium text-gray-900">{label}</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={() => downloadCode(code, `demo-component.${key === 'react' ? 'jsx' : key}`)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-sm bg-gray-900 text-gray-100 overflow-x-auto max-h-64">
                    <code>{code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}