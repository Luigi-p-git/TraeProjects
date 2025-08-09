import type { Message } from '../../types'
import { formatTime } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Bot, Volume2, Plus, Lightbulb, Sparkles, Copy, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ClickableText } from '../ClickableText'

interface ChatMessageProps {
  message: Message
  onAddToFlashcards?: (french: string, spanish: string) => void
  onWordClick?: (word: string) => void
  onAddToErrorLog?: (originalText: string, correctedText: string, explanation: string) => void
  culturalTipsEnabled?: boolean
}

export function ChatMessage({ message, onAddToFlashcards, onWordClick, onAddToErrorLog, culturalTipsEnabled = true }: ChatMessageProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAddedToLog, setIsAddedToLog] = useState(false)

  const isUser = message.role === 'user'
  const isTyping = message.isTyping

  const handleWordClick = (word: string) => {
    setSelectedWord(word)
    setShowTranslation(true)
    onWordClick?.(word)
  }

  const handleAddToErrorLog = () => {
    if (message.correction && onAddToErrorLog) {
      onAddToErrorLog(
        message.correction.original,
        message.correction.corrected,
        message.correction.explanation
      )
      setIsAddedToLog(true)
    }
  }

  const getMessageBubbleStyle = () => {
    if (isUser) {
      // User messages: Blue bubble (inspiration approach)
      return 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white border-blue-400/30'
    }
    
    if (message.messageType === 'correction') {
      // Correction messages: Prominent red dialog box
      return 'bg-gradient-to-br from-red-500/90 to-red-600/90 border-red-400/60 text-white shadow-red-500/25'
    }
    
    if (message.messageType === 'cultural-tip') {
      // Cultural tip messages: Blue-tinged bubble with lightbulb (inspiration approach)
      return 'bg-gradient-to-br from-blue-400/15 to-blue-500/15 border-blue-400/40 text-white'
    }
    
    // AI standard reply: White/Dark gray bubble (inspiration approach)
    return 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 text-white border-white/10'
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }



  if (isTyping) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-start space-x-4 mb-6"
      >
        <div className="flex-shrink-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-white/60 text-sm font-medium">PolyPal écrit...</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex items-start space-x-4 mb-6 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0">
        <div className="relative group">
          <div className={`absolute inset-0 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 ${
            isUser 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
          }`} />
          <div className={`relative h-12 w-12 rounded-full flex items-center justify-center shadow-2xl ${
            isUser 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}>
            {isUser ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-lg">
        <motion.div
          className={`backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
            getMessageBubbleStyle()
          } ${isHovered ? 'scale-[1.02] shadow-3xl' : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="relative">
              <div className="text-sm leading-relaxed text-white/90 font-medium">
                {message.messageType === 'correction' ? (
                  // Correction message content
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full blur-sm opacity-75 animate-pulse" />
                        <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-red-100 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          ¡Corrección!
                        </p>
                        <div className="bg-red-500/20 rounded-lg p-4 border border-red-400/30 mb-3">
                          <p className="text-sm text-red-100 font-medium mb-2">
                            <span className="text-red-300">Incorrecto:</span> {message.correction?.original}
                          </p>
                          <p className="text-sm text-white font-semibold">
                            <span className="text-green-300">Correcto:</span> {message.correction?.corrected}
                          </p>
                        </div>
                        {message.correction?.explanation && (
                           <p className="text-xs text-white/90 mb-3 bg-white/10 rounded-lg p-3 border border-white/20 leading-relaxed">
                             <span className="font-semibold text-white">Explicación:</span> {message.correction.explanation}
                           </p>
                         )}
                         <div className="flex space-x-2 mt-3">
                           {onAddToErrorLog && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={handleAddToErrorLog}
                               disabled={isAddedToLog}
                               className={`h-7 px-3 text-xs transition-all duration-200 backdrop-blur-sm ${
                                 isAddedToLog
                                   ? 'bg-green-500/20 border-green-400/30 text-green-200'
                                   : 'bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 hover:border-red-400/50'
                               }`}
                             >
                               {isAddedToLog ? (
                                 <>
                                   <CheckCircle className="h-3 w-3 mr-1" />
                                   Añadido
                                 </>
                               ) : (
                                 <>
                                   <Plus className="h-3 w-3 mr-1" />
                                   Añadir al diario
                                 </>
                               )}
                             </Button>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                ) : message.messageType === 'cultural-tip' ? (
                  // Cultural tip message content
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-sm opacity-75 animate-pulse" />
                        <div className="relative h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-200 mb-2 flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {message.culturalTip?.title || 'Consejo Cultural'}
                        </p>
                        <p className="text-sm text-white/90 font-medium bg-white/5 rounded-lg p-2 border border-white/10">
                          {message.culturalTip?.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isUser ? (
                  <p>{message.content}</p>
                ) : (
                  // Standard AI response with clickable words
                  <ClickableText
                    text={message.content}
                    onWordClick={onAddToFlashcards}
                  />
                )}
              </div>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0 right-0 flex space-x-1"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content)}
                    className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                  >
                    <Copy className="h-3 w-3 text-white/70" />
                  </Button>
                  {!isUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(message.content)}
                      className="h-6 w-6 p-0 hover:bg-white/20 rounded-full"
                    >
                      <Volume2 className="h-3 w-3 text-white/70" />
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
            
            <div className={`flex items-center pt-2 border-t border-white/10 ${
              isUser ? 'justify-end' : 'justify-between'
            }`}>
              <span className="text-xs text-white/50 font-medium">
                {formatTime(message.timestamp)}
              </span>
              {!isUser && !isHovered && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-white/30" />
                  <span className="text-xs text-white/30">PolyPal</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}