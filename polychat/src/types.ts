export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  correction?: Correction
  culturalTip?: CulturalTip
  isTyping?: boolean
  messageType?: 'user' | 'response' | 'correction' | 'cultural-tip'
}

export interface Correction {
  original: string
  corrected: string
  explanation: string
  translation?: string
}

export interface FlashCard {
  id: string
  front: string
  back: string
  example?: string
  createdAt: Date
  addedAt: Date
  deck: 'common' | 'personal'
}

export interface ErrorLogEntry {
  id: string
  originalText: string
  correctedText: string
  explanation: string
  timestamp: Date
  isAddedToLog: boolean
}

export interface Scenario {
  id: string
  title: string
  description: string
  icon: string
  greeting: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  culturalTips?: string[]
}

export interface CulturalTip {
  id: string
  title: string
  content: string
  relatedWords?: string[]
}

export type ConversationMode = 'general' | 'scenarios' | 'teacher' | 'flashcards' | 'errors' | 'settings'

// Enhanced structured response interface matching the inspiration
export interface StructuredAIResponse {
  isCorrect: boolean
  response: string
  correction?: {
    original: string
    corrected: string
    explanation: string
  }
  culturalTip?: string
}

export interface AIResponse {
  message: string
  correction?: Correction
  culturalTip?: CulturalTip
  suggestedWords?: string[]
}