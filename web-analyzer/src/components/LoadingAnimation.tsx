import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Code, Palette, Layout, Search, Camera, Zap } from 'lucide-react'

interface LoadingAnimationProps {
  url: string
  progress: { step: number; total: number; message: string }
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ url, progress }) => {

  const steps = [
    { icon: Globe, label: 'Fetching website', description: 'Establishing connection...' },
    { icon: Code, label: 'Detecting technologies', description: 'Analyzing tech stack...' },
    { icon: Palette, label: 'Extracting design system', description: 'Analyzing colors, fonts, and spacing...' },
    { icon: Layout, label: 'Mapping components', description: 'Identifying UI components...' },
    { icon: Search, label: 'Analyzing SEO', description: 'Checking meta tags and structure...' },
    { icon: Zap, label: 'Measuring performance', description: 'Analyzing load times and optimization...' },
    { icon: Code, label: 'Generating recreation', description: 'Creating website recreation...' },
    { icon: Camera, label: 'Capturing screenshot', description: 'Taking visual snapshot...' }
  ]

  const currentStep = Math.max(0, progress.step - 1)
  const progressPercentage = progress.total > 0 ? (progress.step / progress.total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4"
          >
            <Globe className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Website</h3>
          <p className="text-gray-600 break-all">{url}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            // const isPending = index > currentStep // Removed unused variable

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : isCompleted 
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    isActive 
                      ? 'text-blue-900' 
                      : isCompleted 
                      ? 'text-green-900'
                      : 'text-gray-600'
                  }`}>
                    {step.label}
                  </h4>
                  <p className={`text-sm ${
                    isActive 
                      ? 'text-blue-700' 
                      : isCompleted 
                      ? 'text-green-700'
                      : 'text-gray-500'
                  }`}>
                    {isActive && progress.message ? progress.message : step.description}
                  </p>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isActive 
                    ? 'border-blue-600 bg-blue-600' 
                    : isCompleted 
                    ? 'border-green-600 bg-green-600'
                    : 'border-gray-300'
                }`}>
                  {isCompleted && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
        >
          <p className="text-sm text-blue-800 text-center">
            💡 <strong>Did you know?</strong> Our analyzer can detect over 1,000 different technologies and frameworks!
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}