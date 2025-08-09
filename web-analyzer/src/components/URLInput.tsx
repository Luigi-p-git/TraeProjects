import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, AlertCircle } from 'lucide-react'

interface URLInputProps {
  onAnalyze: (url: string) => void
  isAnalyzing: boolean
  error?: string
}

const URLInput: React.FC<URLInputProps> = ({ onAnalyze, isAnalyzing, error: externalError }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const validateUrl = (input: string): boolean => {
    try {
      const urlPattern = /^(https?:\/\/)?(([\da-z\.-]+)\.([a-z\.]{2,6})|localhost)(:[0-9]{1,5})?([\/?#].*)?$/i
      return urlPattern.test(input)
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL')
      return
    }
    
    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }
    
    onAnalyze(formattedUrl)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    if (error) setError('')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-4xl mx-auto mb-12"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="url"
                value={url}
                onChange={handleInputChange}
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300 focus:bg-white'
                }`}
                disabled={isAnalyzing}
              />
              {(error || externalError) && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {(error || externalError) && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                {error || externalError}
              </motion.p>
            )}
          </div>
          
          <motion.button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
            whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
            className={`w-full flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
              isAnalyzing || !url.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Analyzing Website...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-3" />
                Analyze Website
              </>
            )}
          </motion.button>
        </form>
        
        {/* Example URLs */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {['github.com', 'stripe.com', 'vercel.com', 'tailwindcss.com'].map((example) => (
              <button
                key={example}
                onClick={() => setUrl(example)}
                disabled={isAnalyzing}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default URLInput