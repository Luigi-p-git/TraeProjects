import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Download, RefreshCw, Monitor, Smartphone } from 'lucide-react'
import { browserScreenshotService } from '../services/BrowserScreenshotService'

interface ScreenshotOptionsProps {
  url: string
  currentScreenshot?: string
  onScreenshotUpdate: (screenshot: string) => void
}

export const ScreenshotOptions: React.FC<ScreenshotOptionsProps> = ({
  url,
  currentScreenshot,
  onScreenshotUpdate
}) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureType, setCaptureType] = useState<string | null>(null)

  const captureScreenshot = async (type: 'desktop' | 'mobile' | 'current') => {
    setIsCapturing(true)
    setCaptureType(type)
    
    try {
      let screenshot: string
      
      switch (type) {
        case 'current':
          screenshot = await browserScreenshotService.captureCurrentPage()
          break
        case 'mobile':
        case 'desktop':
        default:
          screenshot = await browserScreenshotService.captureScreenshot(url)
          break
      }
      
      onScreenshotUpdate(screenshot)
    } catch (error) {
      console.error('Screenshot capture failed:', error)
    } finally {
      setIsCapturing(false)
      setCaptureType(null)
    }
  }

  const downloadScreenshot = () => {
    if (!currentScreenshot) return
    
    const link = document.createElement('a')
    link.href = currentScreenshot
    link.download = `screenshot-${new URL(url).hostname}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Screenshot Options</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => captureScreenshot('desktop')}
          disabled={isCapturing}
          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Monitor className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isCapturing && captureType === 'desktop' ? 'Capturing...' : 'Desktop View'}
          </span>
          {isCapturing && captureType === 'desktop' && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => captureScreenshot('mobile')}
          disabled={isCapturing}
          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isCapturing && captureType === 'mobile' ? 'Capturing...' : 'Mobile View'}
          </span>
          {isCapturing && captureType === 'mobile' && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => captureScreenshot('current')}
          disabled={isCapturing}
          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isCapturing && captureType === 'current' ? 'Capturing...' : 'Current Page'}
          </span>
          {isCapturing && captureType === 'current' && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </motion.button>
      </div>
      
      {currentScreenshot && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={downloadScreenshot}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download Screenshot</span>
        </motion.button>
      )}
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• <strong>Desktop View:</strong> Captures the website as it appears on desktop</p>
        <p>• <strong>Mobile View:</strong> Captures the website's mobile responsive version</p>
        <p>• <strong>Current Page:</strong> Captures this analysis page</p>
        {(url.includes('trae.ai') || url.includes('stripe.com') || url.includes('github.com')) && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
            <p className="text-xs"><strong>Note:</strong> This website may block external screenshot services for security. If screenshots fail, a visual representation will be generated instead.</p>
          </div>
        )}
      </div>
    </div>
  )
}