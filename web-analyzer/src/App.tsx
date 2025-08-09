import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Zap, Code, Palette, Layout, Image as ImageIcon, Link } from 'lucide-react'
import URLInput from './components/URLInput'
import { AnalysisResults } from './components/AnalysisResults'
import { LoadingAnimation } from './components/LoadingAnimation'
import { ServiceStatus } from './components/ServiceStatus'
import { ImageUploadAnalyzer } from './components/ImageUploadAnalyzer'
import { WebAnalyzer } from './services/WebAnalyzer'
import type { AnalysisData } from './types/analysis'
import type { ImageAnalysisResult } from './types/imageAnalysis'

function App() {
  const [activeTab, setActiveTab] = useState<'url' | 'image'>('url')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [imageAnalysisData, setImageAnalysisData] = useState<ImageAnalysisResult | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [progress, setProgress] = useState({ step: 0, total: 7, message: '' })
  const [error, setError] = useState('')

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setCurrentUrl(url)
    setAnalysisData(null)
    setError('')
    setProgress({ step: 0, total: 7, message: 'Starting analysis...' })
    
    try {
      const analyzer = new WebAnalyzer(url)
      
      const analysisData = await analyzer.analyze((step, message) => {
        setProgress({ step, total: 7, message })
      })
      
      if (!analysisData) {
        throw new Error('Analysis completed but no results were generated')
      }
      
      setAnalysisData(analysisData)
      setProgress({ step: 7, total: 7, message: 'Analysis complete!' })
      
    } catch (error) {
      console.error('Analysis error:', error)
      
      let errorMessage = 'An unexpected error occurred during analysis'
      
      if (error instanceof Error && error.message) {
        if (error.message.includes('Service temporarily unavailable')) {
          errorMessage = 'External services are temporarily unavailable. Please try again in a few minutes.'
        } else if (error.message.includes('proxy services failed')) {
          errorMessage = 'Unable to access the website. The site may be blocking external requests or our proxy services are overloaded.'
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = 'The website content could not be processed. It may use advanced protection or an unsupported format.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'The request timed out. The website may be slow to respond or temporarily unavailable.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      setProgress({ step: 0, total: 7, message: 'Analysis failed' })
      
    } finally {
      setIsAnalyzing(false)
      // Keep progress visible for a moment if successful
      setTimeout(() => {
        if (!analysisData) {
          setProgress({ step: 0, total: 7, message: '' })
        }
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Web Analyzer
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>Advanced Website Analysis</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {!analysisData && !imageAnalysisData && !isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Analyze Websites & UI
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                In Seconds
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Extract comprehensive insights from websites or convert UI screenshots into code. 
              Analyze technology stacks, design systems, and generate React/Vue components.
            </p>
            
            {/* Feature Icons */}
            <div className="flex justify-center space-x-8 mb-12">
              {[
                { icon: Code, label: 'Tech Stack' },
                { icon: Palette, label: 'Design System' },
                { icon: Layout, label: 'Components' },
                { icon: ImageIcon, label: 'Image to Code' }
              ].map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setActiveTab('url')
                  setAnalysisData(null)
                  setImageAnalysisData(null)
                  setError('')
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'url'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Link className="w-4 h-4" />
                Website Analysis
              </button>
              <button
                onClick={() => {
                  setActiveTab('image')
                  setAnalysisData(null)
                  setImageAnalysisData(null)
                  setError('')
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'image'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image to Code
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'url' && (
          <>
            {/* URL Input */}
            <URLInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} error={error} />

            {/* Loading Animation */}
            {isAnalyzing && (
              <LoadingAnimation url={currentUrl} progress={progress} />
            )}

            {/* Analysis Results */}
            {analysisData && !isAnalyzing && (
              <AnalysisResults data={analysisData} />
            )}
          </>
        )}

        {activeTab === 'image' && (
          <ImageUploadAnalyzer 
            onAnalysisComplete={(result) => {
              setImageAnalysisData(result)
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-white/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Web Analyzer. Built with React, TypeScript & Tailwind CSS.</p>
          </div>
        </div>
      </footer>
      
      {/* Service Status Indicator */}
      <ServiceStatus isAnalyzing={isAnalyzing} error={error || null} />
    </div>
  )
}

export default App