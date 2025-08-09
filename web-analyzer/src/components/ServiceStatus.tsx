import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface ServiceStatusProps {
  isAnalyzing?: boolean
  error?: string | null
}

export const ServiceStatus: React.FC<ServiceStatusProps> = ({ isAnalyzing, error }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (error || !isOnline || isAnalyzing) {
      setShowStatus(true)
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [error, isOnline, isAnalyzing])

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        message: 'No internet connection',
        type: 'error' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    }

    if (isAnalyzing) {
      return {
        icon: RefreshCw,
        message: 'Analyzing website... This may take a moment',
        type: 'loading' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    }

    if (error) {
      // Check for specific error types
      if (error.includes('Service temporarily unavailable') || error.includes('proxy services failed')) {
        return {
          icon: AlertCircle,
          message: 'External services temporarily unavailable - Please try again in a few minutes',
          type: 'error' as const,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        }
      }
      
      if (error.includes('Network connection failed')) {
        return {
          icon: WifiOff,
          message: 'Network connection failed - Check your internet connection',
          type: 'error' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      }
      
      if (error.includes('timeout')) {
        return {
          icon: AlertCircle,
          message: 'Request timed out - The website may be slow or unavailable',
          type: 'error' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
      }
      
      const isServiceError = error.includes('proxy services') || error.includes('CORS') || error.includes('unavailable')
      return {
        icon: AlertCircle,
        message: isServiceError ? 'External services temporarily unavailable' : 'Analysis failed - Please try again or check the URL',
        type: 'error' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    }

    return {
      icon: CheckCircle,
      message: 'Ready to analyze websites',
      type: 'success' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  if (!showStatus && !error && isOnline && !isAnalyzing) {
    return null
  }

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 max-w-sm`}
        >
          <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <div className="flex items-center gap-3">
              <Icon 
                className={`w-5 h-5 ${statusInfo.color} ${
                  statusInfo.type === 'loading' ? 'animate-spin' : ''
                }`} 
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.message}
                </p>
                {error && statusInfo.type === 'error' && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">
                      • Try refreshing the page
                    </p>
                    <p className="text-xs text-gray-600">
                      • Check if the website URL is correct
                    </p>
                    <p className="text-xs text-gray-600">
                      • Some websites block external analysis
                    </p>
                  </div>
                )}
              </div>
              {!isAnalyzing && (
                <button
                  onClick={() => setShowStatus(false)}
                  className={`text-xs ${statusInfo.color} hover:opacity-70 transition-opacity`}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}