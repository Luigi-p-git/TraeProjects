import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Palette, 
  Layout, 
  Search, 
  Zap, 
  Camera, 
  Download,
  ExternalLink,
  Copy,
  CheckCircle,
  Eye,
  FileCode,
  Play,
  Image,
  Layers,
  Globe,
  Monitor,
  Smartphone,
  FileText,
  Settings,
  Grid,
  Cpu
} from 'lucide-react'
import { AnalysisData } from '../types/analysis'
import { ScreenshotOptions } from './ScreenshotOptions'

interface AnalysisResultsProps {
  data: AnalysisData
  screenshot?: string
  recreation?: string
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, screenshot: initialScreenshot, recreation }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState(initialScreenshot)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    if (type === 'color') {
      setCopiedColor(text)
      setTimeout(() => setCopiedColor(null), 2000)
    }
  }

  const downloadRecreationCode = (type: 'components' | 'design' | 'config') => {
    if (!data.recreation) {
      alert('Recreation data not available')
      return
    }

    let content = ''
    let filename = ''
    let mimeType = 'text/plain'

    switch (type) {
      case 'components':
        content = `// Generated React Components\n\n${data.recreation.html}\n\n// JavaScript Code\n${data.recreation.javascript}`
        filename = 'components.jsx'
        mimeType = 'text/javascript'
        break
      case 'design':
        content = `/* Generated CSS Design Tokens */\n\n${data.recreation.css}`
        filename = 'design-tokens.css'
        mimeType = 'text/css'
        break
      case 'config':
        content = `# Setup Instructions\n\n${data.recreation.instructions}\n\n# Dependencies\n${data.recreation.dependencies.map(dep => `- ${dep}`).join('\n')}`
        filename = 'setup-guide.md'
        mimeType = 'text/markdown'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Camera },
    { id: 'tech', label: 'Tech Stack', icon: Code },
    { id: 'design', label: 'Design System', icon: Palette },
    { id: 'components', label: 'Components', icon: Layout },
    { id: 'visual', label: 'Visual Elements', icon: Eye },
    { id: 'code', label: 'Code & Data', icon: FileCode },
    { id: 'recreation', label: 'Website Recreation', icon: Globe },
    { id: 'seo', label: 'SEO Analysis', icon: Search },
    { id: 'performance', label: 'Performance', icon: Zap }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Website Screenshot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
            <div className="flex space-x-2">
              <ScreenshotOptions url={data.url} currentScreenshot={screenshot} onScreenshotUpdate={setScreenshot} />
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {screenshot ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img 
                src={screenshot} 
                alt="Website Screenshot" 
                className="w-full h-auto max-h-96 object-contain"
                style={{ minHeight: '200px' }}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Screenshot will appear here</p>
                <p className="text-sm text-gray-400 mt-1">{data.url}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Load Time', value: `${data.performance.loadTime}s`, color: 'blue' },
          { label: 'Page Size', value: `${data.performance.sizeKB}KB`, color: 'green' },
          { label: 'Requests', value: data.performance.requests.toString(), color: 'purple' },
          { label: 'Performance Score', value: `${data.performance.score}/100`, color: 'orange' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderTechStack = () => (
    <div className="space-y-6">
      {Object.entries(data.techStack).map(([category, technologies]) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech: string, index: number) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderDesignSystem = () => (
    <div className="space-y-6">
      {/* Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.design.colors.map((color, index) => (
            <motion.div
              key={color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => copyToClipboard(color, 'color')}
            >
              <div
                className="w-full h-20 rounded-lg shadow-md"
                style={{ backgroundColor: color }}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-mono text-gray-700">{color}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedColor === color ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400 mx-auto" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Typography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
        <div className="space-y-3">
          {data.design.fonts.map((font) => (
            <div key={font} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium" style={{ fontFamily: font }}>
                {font}
              </span>
              <span className="text-sm text-gray-500">Font Family</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Spacing & Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout System</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Spacing System</span>
            <span className="text-sm text-gray-600">{data.design.spacing}</span>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Breakpoints:</p>
            {data.design.breakpoints.map((breakpoint, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-mono">{breakpoint}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderComponents = () => (
    <div className="space-y-4">
      {data.components.map((component, index) => (
        <motion.div
          key={component.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  component.complexity === 'complex' ? 'bg-red-100 text-red-800' :
                  component.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {component.complexity}
                </span>
              </div>
              <p className="text-sm text-gray-600 capitalize mb-2">{component.type}</p>
              {component.description && (
                <p className="text-sm text-gray-700 mb-3">{component.description}</p>
              )}
              {component.props && component.props.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {component.props.map((prop, propIndex) => (
                    <span key={propIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {prop}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-medium text-gray-700">{component.size}</p>
              <p className="text-xs text-gray-500">Size</p>
              {component.children !== undefined && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">{component.children}</p>
                  <p className="text-xs text-gray-500">Children</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderVisualElements = () => (
    <div className="space-y-6">
      {/* Background Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Image className="h-5 w-5 mr-2" />
          Background & Graphics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Background Types</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.background.map((bg: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                 {bg}
               </span>
             ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Graphics Elements</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.graphics.map((graphic: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                 {graphic}
               </span>
             ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Animations & Effects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Play className="h-5 w-5 mr-2" />
          Animations & Visual Effects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Animation Types</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.animations.map((animation: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                 {animation}
               </span>
             ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Visual Effects</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.effects.map((effect: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                 {effect}
               </span>
             ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Layout & Color Scheme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Layout & Color Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Layout Types</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.layout.map((layout: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                 {layout}
               </span>
             ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Color Schemes</h4>
            <div className="flex flex-wrap gap-2">
              {data.visualAnalysis.colorScheme.map((scheme: string, index: number) => (
               <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                 {scheme}
               </span>
             ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderCodeExtraction = () => (
    <div className="space-y-6">
      {/* JSON Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileCode className="h-5 w-5 mr-2" />
          Extracted JSON Data
        </h3>
        {data.codeExtraction.jsonData.length > 0 ? (
          <div className="space-y-3">
            {data.codeExtraction.jsonData.map((json: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">JSON Object {index + 1}</span>
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(json, null, 2), 'json')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="text-xs text-gray-600 overflow-x-auto max-h-32">
                  {JSON.stringify(json, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No JSON data found</p>
        )}
      </motion.div>

      {/* Components & Libraries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Components & Libraries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Detected Components</h4>
            <div className="flex flex-wrap gap-2">
              {data.codeExtraction.components.map((component: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {component}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">External Libraries</h4>
            <div className="flex flex-wrap gap-2">
              {data.codeExtraction.externalLibraries.map((lib: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {lib}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Endpoints & Config Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API & Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">API Endpoints</h4>
            {data.codeExtraction.apiEndpoints.length > 0 ? (
              <div className="space-y-2">
                {data.codeExtraction.apiEndpoints.map((endpoint: string, index: number) => (
                  <div key={index} className="bg-gray-50 rounded p-2">
                    <code className="text-xs text-gray-700">{endpoint}</code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No API endpoints detected</p>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Configuration Files</h4>
            <div className="flex flex-wrap gap-2">
              {data.codeExtraction.configFiles.map((config: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {config}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderWebsiteRecreation = () => (
    <div className="space-y-6">
      {/* Recreation Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          Website Recreation Guide
        </h3>
        <p className="text-gray-600 mb-4">
          Based on our analysis, here's a comprehensive guide to recreate this website with modern technologies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <Monitor className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-blue-900">Desktop First</h4>
            <p className="text-sm text-blue-700">Optimized for desktop viewing</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <Smartphone className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-green-900">Mobile Ready</h4>
            <p className="text-sm text-green-700">Responsive design included</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <Code className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-purple-900">Modern Stack</h4>
            <p className="text-sm text-purple-700">Latest technologies used</p>
          </div>
        </div>
      </motion.div>

      {/* Tech Stack Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cpu className="h-5 w-5 mr-2" />
          Recommended Tech Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Frontend</h4>
            <div className="space-y-2">
              {['React 18', 'TypeScript', 'Tailwind CSS', 'Framer Motion'].map((tech, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{tech}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Backend & Tools</h4>
            <div className="space-y-2">
              {['Next.js', 'Node.js', 'Vercel', 'ESLint'].map((tech, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Component Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Grid className="h-5 w-5 mr-2" />
          Component Architecture
        </h3>
        <div className="space-y-3">
          {data.components.slice(0, 5).map((component, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{component.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{component.type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    component.complexity === 'complex' ? 'bg-red-100 text-red-800' :
                    component.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {component.complexity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Implementation Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Implementation Steps
        </h3>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Setup Project', desc: 'Initialize React project with TypeScript and Tailwind CSS' },
            { step: 2, title: 'Design System', desc: 'Implement color palette, typography, and spacing system' },
            { step: 3, title: 'Components', desc: 'Build reusable components based on analysis' },
            { step: 4, title: 'Layout', desc: 'Create responsive layout structure' },
            { step: 5, title: 'Styling', desc: 'Apply visual effects and animations' },
            { step: 6, title: 'Optimization', desc: 'Performance optimization and SEO implementation' }
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {item.step}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Download Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <button 
             onClick={() => downloadRecreationCode('components')}
             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
           >
             <FileCode className="h-8 w-8 text-gray-400 mx-auto mb-2" />
             <p className="font-medium text-gray-700">Component Code</p>
             <p className="text-sm text-gray-500">React components</p>
           </button>
           <button 
             onClick={() => downloadRecreationCode('design')}
             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
           >
             <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
             <p className="font-medium text-gray-700">Design Tokens</p>
             <p className="text-sm text-gray-500">CSS variables</p>
           </button>
           <button 
             onClick={() => downloadRecreationCode('config')}
             className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
           >
             <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
             <p className="font-medium text-gray-700">Config Files</p>
             <p className="text-sm text-gray-500">Setup configs</p>
           </button>
         </div>
      </motion.div>
    </div>
  )

  const renderSEO = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <p className="text-gray-900 mt-1">{data.seo.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900 mt-1">{data.seo.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Keywords</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.seo.keywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Meta Tags Count</label>
            <p className="text-2xl font-bold text-green-600 mt-1">{data.seo.metaTags}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Load Time', value: `${data.performance.loadTime}s`, max: 3, color: 'blue' },
            { label: 'Page Size', value: `${data.performance.sizeKB}KB`, max: 1000, color: 'green' },
            { label: 'HTTP Requests', value: data.performance.requests.toString(), max: 50, color: 'purple' },
            { label: 'Performance Score', value: `${data.performance.score}/100`, max: 100, color: 'orange' }
          ].map((metric, index) => {
            const percentage = metric.label === 'Performance Score' 
              ? data.performance.score 
              : metric.label === 'Load Time'
              ? (data.performance.loadTime / 3) * 100
              : metric.label === 'Page Size'
              ? (data.performance.sizeKB / 1000) * 100
              : (data.performance.requests / 50) * 100

            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className={`text-lg font-bold text-${metric.color}-600`}>{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`bg-${metric.color}-600 h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'tech': return renderTechStack()
      case 'design': return renderDesignSystem()
      case 'components': return renderComponents()
      case 'visual': return renderVisualElements()
      case 'code': return renderCodeExtraction()
      case 'recreation': return renderWebsiteRecreation()
      case 'seo': return renderSEO()
      case 'performance': return renderPerformance()
      default: return renderOverview()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
            <p className="text-gray-600 break-all">{data.url}</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2 inline" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </motion.div>
  )
}