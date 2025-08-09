import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Code, 
  Palette, 
  Layout, 
  Download, 
  Copy, 
  Eye,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react'
import { ImageAnalysisService } from '../services/ImageAnalysisService'
import { ImageAnalysisDemo } from './ImageAnalysisDemo'
import type { 
  ImageAnalysisResult, 
  ImageAnalysisOptions, 
  ImageAnalysisProgress 
} from '../types/imageAnalysis'

interface ImageUploadAnalyzerProps {
  onAnalysisComplete?: (result: ImageAnalysisResult) => void
}

export const ImageUploadAnalyzer: React.FC<ImageUploadAnalyzerProps> = ({ 
  onAnalysisComplete 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null)
  const [progress, setProgress] = useState<ImageAnalysisProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ImageAnalysisOptions>({
    framework: 'react',
    styleFramework: 'tailwind',
    responsive: true,
    includeInteractions: true,
    outputFormat: 'both'
  })
  const [activeTab, setActiveTab] = useState<'components' | 'layout' | 'styles' | 'code'>('components')
  const [showOptions, setShowOptions] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  const hasOpenAIKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY)
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
  const hasApiKey = hasOpenAIKey || hasGeminiKey
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>(
    hasGeminiKey ? 'gemini' : 'openai'
  )

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image file size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      setSelectedFile(imageFile)
      const url = URL.createObjectURL(imageFile)
      setPreviewUrl(url)
      setError(null)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleAnalyze = async () => {
    if (!selectedFile) return
    
    if (!hasApiKey) {
      setError('API key is required for image analysis. Please add either VITE_GEMINI_API_KEY (recommended) or VITE_OPENAI_API_KEY to your environment variables.')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    
    try {
      const service = new ImageAnalysisService(undefined, selectedProvider)
      const result = await service.analyzeImage(
        selectedFile,
        options,
        (progress) => setProgress(progress)
      )
      
      setAnalysisResult(result)
      onAnalysisComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
      setProgress(null)
    }
  }

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

  // Show demo if requested or if no API key and no file selected
  if (showDemo || (!hasApiKey && !selectedFile && !analysisResult)) {
    return (
      <ImageAnalysisDemo 
        onShowDemo={() => setShowDemo(false)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Image to Component Analyzer</h2>
        <p className="text-gray-600">
          Upload a UI screenshot and get React/Vue components with code generation
        </p>
        {!hasApiKey && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
            <Key className="w-4 h-4" />
            API key required for live analysis. <button onClick={() => setShowDemo(true)} className="underline font-medium">View demo</button>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Upload Image</h3>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Options
          </button>
        </div>

        {/* Options Panel */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
            >
              {hasOpenAIKey && hasGeminiKey && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as 'openai' | 'gemini')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="gemini">Gemini (Recommended - More Cost-Effective)</option>
                    <option value="openai">OpenAI GPT-4 Vision</option>
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Framework
                  </label>
                  <select
                    value={options.framework}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      framework: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="react">React</option>
                    <option value="vue">Vue</option>
                    <option value="angular">Angular</option>
                    <option value="svelte">Svelte</option>
                    <option value="vanilla">Vanilla JS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Styling
                  </label>
                  <select
                    value={options.styleFramework}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      styleFramework: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="css">Plain CSS</option>
                    <option value="styled-components">Styled Components</option>
                    <option value="emotion">Emotion</option>
                    <option value="sass">SASS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design System
                  </label>
                  <select
                    value={options.designSystem || ''}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      designSystem: e.target.value as any || undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Auto-detect</option>
                    <option value="material-ui">Material-UI</option>
                    <option value="ant-design">Ant Design</option>
                    <option value="chakra-ui">Chakra UI</option>
                    <option value="bootstrap">Bootstrap</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.responsive}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      responsive: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Responsive Design</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeInteractions}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      includeInteractions: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Interactions</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        >
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)}KB)
                </span>
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setAnalysisResult(null)
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your UI screenshot here</p>
                <p className="text-sm text-gray-500">or click to browse files</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Choose Image
              </label>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {selectedFile && (
          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Zap className="w-5 h-5" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      <AnimatePresence>
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analysis Progress</h3>
                <span className="text-sm text-gray-500">
                  {progress.step}/{progress.total}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.step / progress.total) * 100}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-600">{progress.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysisResult && (
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
                    Found {analysisResult.components.length} components
                  </p>
                </div>
              </div>
            </div>

            {/* Results Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'components', label: 'Components', icon: Layout },
                  { id: 'layout', label: 'Layout', icon: Layout },
                  { id: 'styles', label: 'Styles', icon: Palette },
                  { id: 'code', label: 'Code', icon: Code }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Results Content */}
            <div className="p-6">
              {activeTab === 'components' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Detected Components ({analysisResult.components.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.components.map((component, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">{component.name}</h5>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {component.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{component.description}</p>
                        <div className="text-xs text-gray-500">
                          Position: {component.position.x}, {component.position.y}
                        </div>
                        <div className="text-xs text-gray-500">
                          Size: {component.position.width} × {component.position.height}
                        </div>
                        <div className="text-xs text-gray-500">
                          Confidence: {Math.round(component.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Layout Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Structure:</span>
                        <span className="font-medium">{analysisResult.layout.structure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Columns:</span>
                        <span className="font-medium">{analysisResult.layout.columns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rows:</span>
                        <span className="font-medium">{analysisResult.layout.rows}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alignment:</span>
                        <span className="font-medium">{analysisResult.layout.alignment}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Horizontal Gap:</span>
                        <span className="font-medium">{analysisResult.layout.gaps.horizontal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vertical Gap:</span>
                        <span className="font-medium">{analysisResult.layout.gaps.vertical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Responsive:</span>
                        <span className="font-medium">
                          {analysisResult.layout.responsive ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'styles' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Style System</h4>
                  
                  {/* Color Palette */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Color Palette</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(analysisResult.styles.colorPalette).map(([category, colors]) => (
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

                  {/* Typography */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Typography</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-gray-700">Headings</h6>
                        <div className="text-sm text-gray-600">
                          <div>Font: {analysisResult.styles.typography.headings.fontFamily}</div>
                          <div>Sizes: {analysisResult.styles.typography.headings.fontSize.join(', ')}</div>
                          <div>Weights: {analysisResult.styles.typography.headings.fontWeight.join(', ')}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-gray-700">Body</h6>
                        <div className="text-sm text-gray-600">
                          <div>Font: {analysisResult.styles.typography.body.fontFamily}</div>
                          <div>Size: {analysisResult.styles.typography.body.fontSize}</div>
                          <div>Weight: {analysisResult.styles.typography.body.fontWeight}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Generated Code</h4>
                  
                  {/* Code Tabs */}
                  <div className="space-y-4">
                    {[
                      { key: 'react', label: 'React', code: analysisResult.code.react },
                      { key: 'html', label: 'HTML', code: analysisResult.code.html },
                      { key: 'css', label: 'CSS', code: analysisResult.code.css },
                      { key: 'tailwind', label: 'Tailwind', code: analysisResult.code.tailwind }
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
                              onClick={() => downloadCode(code, `component.${key === 'react' ? 'jsx' : key}`)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </div>
                        <pre className="p-4 text-sm bg-gray-900 text-gray-100 overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Implementation Instructions</h5>
                    <p className="text-sm text-blue-800">{analysisResult.code.instructions}</p>
                    
                    {analysisResult.code.dependencies.length > 0 && (
                      <div className="mt-3">
                        <h6 className="font-medium text-blue-900 mb-1">Dependencies:</h6>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.code.dependencies.map((dep, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}