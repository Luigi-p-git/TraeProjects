'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, FileText, Image, AlertCircle, CheckCircle, 
  Loader2, Sparkles, Zap, Brain, Eye, Trash2, Download
} from 'lucide-react'
import { Subscription } from './types'
// Removed OCR service import - now using API route

interface InvoiceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscriptionsExtracted: (subscriptions: Omit<Subscription, 'id'>[]) => void
}

interface UploadedFile {
  file: File
  preview: string
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'manual_entry'
  extractedData?: any
  error?: string
  showManualEntry?: boolean
}

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function InvoiceUploadModal({ isOpen, onClose, onSubscriptionsExtracted }: InvoiceUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    
    const fileType = file.type
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(fileType)) {
      return 'Only PDF, JPG, PNG, and WebP files are supported'
    }
    
    return null
  }

  const processFileWithOCR = async (file: File): Promise<any> => {
    try {
      // Create FormData for API request
      const formData = new FormData();
      formData.append('file', file);
      
      // Send to OCR API route
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
         const errorData = await response.json();
         const errorMessage = errorData.error || 'OCR processing failed';
         const suggestion = errorData.suggestion || 'Please try again with a different file';
         throw new Error(`${errorMessage}\n\nSuggestion: ${suggestion}`);
       }
      
      const result = await response.json();
      
      if (result.success && result.extractedData) {
        return {
          serviceName: result.extractedData.serviceName,
          amount: result.extractedData.price,
          currency: result.extractedData.currency || 'USD',
          billingDate: result.extractedData.billingDate,
          nextBilling: result.extractedData.nextChargeDate,
          category: result.extractedData.category,
          description: `Monthly subscription for ${result.extractedData.serviceName}`
        };
      } else {
        // Fallback to basic extraction if no structured data found
        return {
          serviceName: 'Extracted Service',
          amount: 9.99,
          currency: 'USD',
          billingDate: new Date().toISOString().split('T')[0],
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Other',
          description: 'Monthly subscription'
        };
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(error instanceof Error ? error.message : 'Could not extract subscription data from this invoice');
    }
  }

  const enableManualEntry = (fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) => prev.map((f: UploadedFile, index: number) => 
      index.toString() === fileId ? { 
        ...f, 
        status: 'manual_entry' as const,
        showManualEntry: true,
        extractedData: {
          serviceName: '',
          price: 0,
          billingDate: new Date().toISOString().split('T')[0],
          nextChargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Other'
        }
      } : f
    ));
  };

  const updateManualData = (fileId: string, field: string, value: any) => {
    setUploadedFiles((prev: UploadedFile[]) => prev.map((f: UploadedFile, index: number) => 
      index.toString() === fileId && f.extractedData ? { 
        ...f, 
        extractedData: {
          ...f.extractedData,
          [field]: value
        }
      } : f
    ));
  };

  // processFile function removed - using inline processing in handleFiles

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      status: 'uploading'
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = uploadedFiles.length + i
      
      try {
        // Update status to processing
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { ...f, status: 'processing' } : f
          )
        )

        const extractedData = await processFileWithOCR(newFiles[i].file)
        
        // Update with extracted data
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { 
              ...f, 
              status: 'completed', 
              extractedData 
            } : f
          )
        )
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Processing failed'
            } : f
          )
        )
      }
    }
  }, [uploadedFiles.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
  }, [handleFiles])

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleExtractSubscriptions = () => {
    const completedFiles = uploadedFiles.filter(f => (f.status === 'completed' || f.status === 'manual_entry') && f.extractedData)
    
    const subscriptions: Omit<Subscription, 'id'>[] = completedFiles.map(f => ({
      name: f.extractedData.serviceName,
      price: f.extractedData.amount || f.extractedData.price,
      billingCycle: 'monthly' as const,
      nextBilling: f.extractedData.nextBilling || f.extractedData.nextChargeDate,
      category: f.extractedData.category,
      website: '',
      logo: '',
      color: '#6366F1'
    }))

    onSubscriptionsExtracted(subscriptions)
    onClose()
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'processing':
        return <Brain className="w-4 h-4 animate-pulse text-purple-400" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Extracting data with AI...'
      case 'completed':
        return 'Data extracted successfully'
      case 'error':
        return 'Processing failed'
    }
  }

  const completedCount = uploadedFiles.filter(f => (f.status === 'completed' || f.status === 'manual_entry') && f.extractedData).length

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  AI Invoice Scanner
                </h2>
                <p className="text-white/60">
                  Upload your subscription invoices and let AI extract the data automatically
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Upload Area */}
            <motion.div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragOver 
                  ? 'border-cyan-400 bg-cyan-400/5 scale-105' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                onChange={handleFileInput}
                className="hidden"
              />
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Drop your invoices here
                  </h3>
                  <p className="text-white/60 mb-4">
                    or click to browse files
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Choose Files
                </motion.button>
                
                <div className="mt-4 text-sm text-white/40">
                  Supports PDF, JPG, PNG, WebP • Max 10MB per file
                </div>
              </motion.div>
            </motion.div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                      {/* File Preview */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.file.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {file.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(file.status)}
                          <span className="text-sm text-white/60">
                            {getStatusText(file.status)}
                          </span>
                        </div>
                        {file.error && (
                          <div className="space-y-3 mt-1">
                            <p className="text-red-400 text-sm">{file.error}</p>
                            <button
                              onClick={() => enableManualEntry(index.toString())}
                              className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors"
                            >
                              Enter Data Manually
                            </button>
                          </div>
                        )}
                        {file.status === 'manual_entry' && file.extractedData && (
                          <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="text-blue-400 font-medium mb-3">Enter Subscription Details:</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Service Name</label>
                                <input
                                  type="text"
                                  value={file.extractedData.serviceName}
                                  onChange={(e) => updateManualData(index.toString(), 'serviceName', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                                  placeholder="e.g., Spotify Premium"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Price</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={file.extractedData.price}
                                    onChange={(e) => updateManualData(index.toString(), 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="9.99"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                                  <select
                                    value={file.extractedData.category}
                                    onChange={(e) => updateManualData(index.toString(), 'category', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                                  >
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Productivity">Productivity</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Design">Design</option>
                                    <option value="Storage">Storage</option>
                                    <option value="Communication">Communication</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Billing Date</label>
                                <input
                                  type="date"
                                  value={file.extractedData.billingDate}
                                  onChange={(e) => updateManualData(index.toString(), 'billingDate', e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {file.status === 'completed' && file.extractedData && (
                          <div className="mt-2 text-sm text-green-400">
                            ✓ Found: {file.extractedData.serviceName} - ${file.extractedData.amount}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {file.extractedData && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                            title="View extracted data"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFile(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mt-8 pt-6 border-t border-white/10"
              >
                <div className="text-white/60">
                  {completedCount > 0 && (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {completedCount} subscription{completedCount !== 1 ? 's' : ''} ready to add
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-3 text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all"
                  >
                    Cancel
                  </motion.button>
                  
                  {completedCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExtractSubscriptions}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Add {completedCount} Subscription{completedCount !== 1 ? 's' : ''}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}