import { useState, useCallback } from 'react'
import type { ErrorLogEntry } from '../types'
import { generateId } from '@/lib/utils'

export function useErrorLog() {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([])

  const addError = useCallback((originalText: string, correctedText: string, explanation: string) => {
    // Check if this error already exists to avoid duplicates
    const existingError = errors.find(error => 
      error.originalText === originalText && error.correctedText === correctedText
    )
    
    if (existingError) {
      return // Don't add duplicate errors
    }
    
    const newError: ErrorLogEntry = {
      id: generateId(),
      originalText,
      correctedText,
      explanation,
      timestamp: new Date(),
      isAddedToLog: true
    }
    setErrors(prev => [newError, ...prev]) // Add to beginning for most recent first
  }, [errors])

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getRecentErrors = useCallback((limit: number = 10) => {
    return errors.slice(0, limit)
  }, [errors])

  const getErrorCount = useCallback(() => {
    return errors.length
  }, [errors])

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    getRecentErrors,
    getErrorCount
  }
}