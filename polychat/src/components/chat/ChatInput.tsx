import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Send, Loader2, Lightbulb } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  placeholder?: string
  isCulturalTipsEnabled?: boolean
  onToggleCulturalTips?: () => void
  scenario?: string
}

export function ChatInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Écris en français...",
  isCulturalTipsEnabled = false,
  onToggleCulturalTips,
  scenario
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  // Update message when transcript changes
  useEffect(() => {
    if (transcript) {
      setMessage(transcript)
    }
  }, [transcript])

  // Focus input when not listening
  useEffect(() => {
    if (!isListening && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isListening])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
      resetTranscript()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
      setMessage('') // Clear current message when starting to listen
    }
  }

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Escuchando..." : placeholder}
              disabled={isLoading || isListening}
              className="pr-12"
            />
            
            {/* Voice input button */}
            {isSupported && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                disabled={isLoading}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 ${
                  isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div
                      key="listening"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="relative"
                    >
                      <MicOff className="h-4 w-4" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="not-listening"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Mic className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
          
          {/* Cultural Tips Toggle */}
          {onToggleCulturalTips && scenario !== 'teacher' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleCulturalTips}
              disabled={isLoading}
              className={`transition-all duration-200 ${
                isCulturalTipsEnabled
                  ? 'bg-yellow-400/20 text-yellow-500 ring-2 ring-yellow-400/30 hover:bg-yellow-400/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={isCulturalTipsEnabled ? 'Désactiver les conseils culturels' : 'Activer les conseils culturels'}
            >
              <Lightbulb className={`h-4 w-4 ${
                isCulturalTipsEnabled ? 'animate-pulse' : ''
              }`} />
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || isListening}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <p className="text-sm text-red-500">
                Error de reconocimiento de voz: {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Voice recognition status */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse" />
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span>Escuchando... Habla en francés</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}