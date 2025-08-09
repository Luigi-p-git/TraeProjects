import { useState, useCallback } from 'react'
import type { Message, AIResponse, ConversationMode } from '../types'
import { generateId } from '@/lib/utils'
import { geminiService } from '../services/geminiService'
import { useSettings } from './useSettings'

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<ConversationMode>('general')
  const [currentScenario, setCurrentScenario] = useState<string | null>(null)
  const { settings } = useSettings()

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    }

    addMessage(userMessage)
    setIsLoading(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing-' + Date.now(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isTyping: true
    }
    addMessage(typingMessage)

    try {
      let aiMessage: Message;
      
      if (geminiService.isConfigured()) {
        // Use Gemini API for real AI responses
        const context = mode === 'scenarios' && currentScenario 
          ? `Scénario: ${currentScenario}` 
          : mode === 'teacher' 
          ? 'Mode professeur - Focus sur les corrections et explications'
          : 'Conversation générale';
        
        const structuredResponse = await geminiService.generateResponse(content, context, settings.culturalTipsEnabled);
        
        // Remove typing indicator first
        setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
        
        // Create multiple messages based on structured response (inspiration approach)
        const newMessages: Message[] = [];
        
        // 1. Add correction message first if needed (red dialog box)
        if (!structuredResponse.isCorrect && structuredResponse.correction) {
          const correctionMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: '', // Content will be in correction object
            role: 'assistant',
            timestamp: new Date(),
            messageType: 'correction',
            correction: {
              original: structuredResponse.correction.original,
              corrected: structuredResponse.correction.corrected,
              explanation: structuredResponse.correction.explanation
            }
          };
          newMessages.push(correctionMessage);
        }
        
        // 2. Then add the main conversational response (second box to continue conversation)
        const mainResponse: Message = {
          id: (Date.now() + 2).toString(),
          content: structuredResponse.response,
          role: 'assistant',
          timestamp: new Date(),
          messageType: 'response'
        };
        newMessages.push(mainResponse);
        
        // 3. Add cultural tip if provided and enabled (blue bubble with lightbulb)
        if (settings.culturalTipsEnabled && structuredResponse.culturalTip && structuredResponse.culturalTip.trim() !== '') {
          const culturalTipMessage: Message = {
            id: (Date.now() + 3).toString(),
            content: '', // Content will be in culturalTip object
            role: 'assistant',
            timestamp: new Date(),
            messageType: 'cultural-tip',
            culturalTip: {
              id: (Date.now() + 3).toString(),
              title: 'Consejo Cultural',
              content: structuredResponse.culturalTip
            }
          };
          newMessages.push(culturalTipMessage);
        }
        
        // Add all messages to the conversation
        setMessages(prev => [...prev, ...newMessages]);
        return; // Exit early since we've handled message addition
      } else {
        // Fallback to simulated response if API key not configured
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
        
        aiMessage = {
          id: (Date.now() + 1).toString(),
          content: `Réponse simulée pour: "${content}". Pour activer l'IA Gemini, ajoutez votre clé API dans le fichier .env`,
          role: 'assistant',
          timestamp: new Date(),
          messageType: 'response'
        };
        
        addMessage(aiMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== typingMessage.id));
      
      // Add error message
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        content: error instanceof Error 
          ? `Erreur: ${error.message}` 
          : 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
        role: 'assistant',
        timestamp: new Date()
      }
      addMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: ConversationMode, scenarioId?: string) => {
    setMode(newMode)
    if (newMode === 'scenarios' && scenarioId) {
      setCurrentScenario(scenarioId)
    } else if (newMode !== 'scenarios') {
      setCurrentScenario(null)
    }
  }

  const clearConversation = () => {
    setMessages([])
  }

  return {
    messages,
    isLoading,
    mode,
    currentScenario,
    sendMessage,
    switchMode,
    clearConversation
  }
}