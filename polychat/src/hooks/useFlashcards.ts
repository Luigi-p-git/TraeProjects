import { useState, useCallback } from 'react'
import type { FlashCard } from '../types'
import { generateId } from '@/lib/utils'

// Pre-loaded common French words
const COMMON_FRENCH_WORDS: Omit<FlashCard, 'id' | 'addedAt' | 'createdAt' | 'deck'>[] = [
  { front: 'bonjour', back: 'hola', example: 'Bonjour ! Comment allez-vous ?' },
  { front: 'merci', back: 'gracias', example: 'Merci beaucoup pour votre aide.' },
  { front: 'au revoir', back: 'adiós', example: 'Au revoir et à bientôt !' },
  { front: 's\'il vous plaît', back: 'por favor', example: 'Pouvez-vous m\'aider, s\'il vous plaît ?' },
  { front: 'excusez-moi', back: 'disculpe', example: 'Excusez-moi, où est la gare ?' },
  { front: 'je voudrais', back: 'quisiera', example: 'Je voudrais un café, s\'il vous plaît.' },
  { front: 'combien', back: 'cuánto', example: 'Combien ça coûte ?' },
  { front: 'où', back: 'dónde', example: 'Où se trouve la pharmacie ?' },
  { front: 'quand', back: 'cuándo', example: 'Quand part le train ?' },
  { front: 'comment', back: 'cómo', example: 'Comment vous appelez-vous ?' },
  { front: 'pourquoi', back: 'por qué', example: 'Pourquoi êtes-vous en retard ?' },
  { front: 'qui', back: 'quién', example: 'Qui est cette personne ?' },
  { front: 'que/quoi', back: 'qué', example: 'Que faites-vous ce soir ?' },
  { front: 'oui', back: 'sí', example: 'Oui, je comprends.' },
  { front: 'non', back: 'no', example: 'Non, je ne peux pas.' },
  { front: 'peut-être', back: 'quizás', example: 'Peut-être demain.' },
  { front: 'aujourd\'hui', back: 'hoy', example: 'Aujourd\'hui, il fait beau.' },
  { front: 'demain', back: 'mañana', example: 'À demain !' },
  { front: 'hier', back: 'ayer', example: 'Hier, j\'ai visité le musée.' },
  { front: 'maintenant', back: 'ahora', example: 'Je dois partir maintenant.' },
  { front: 'bientôt', back: 'pronto', example: 'À bientôt !' },
  { front: 'toujours', back: 'siempre', example: 'Il est toujours en retard.' },
  { front: 'jamais', back: 'nunca', example: 'Je ne fume jamais.' },
  { front: 'souvent', back: 'a menudo', example: 'Je vais souvent au cinéma.' },
  { front: 'parfois', back: 'a veces', example: 'Parfois, je cuisine.' },
  { front: 'beaucoup', back: 'mucho', example: 'J\'aime beaucoup ce livre.' },
  { front: 'un peu', back: 'un poco', example: 'Je parle un peu français.' },
  { front: 'très', back: 'muy', example: 'C\'est très intéressant.' },
  { front: 'assez', back: 'bastante', example: 'C\'est assez difficile.' },
  { front: 'trop', back: 'demasiado', example: 'C\'est trop cher.' }
]

export function useFlashcards() {
  const [userCards, setUserCards] = useState<FlashCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Combine user cards with common words
  const commonCards = COMMON_FRENCH_WORDS.map(card => ({
    ...card,
    id: generateId(),
    addedAt: new Date(),
    createdAt: new Date(),
    deck: 'common' as const
  }))
  
  const allCards = [...commonCards, ...userCards]
  const top300Cards = commonCards
  const personalCards = userCards

  const addCard = useCallback((front: string, back: string, data?: string | { hint?: string; difficulty?: string; category?: string; partOfSpeech?: string; definition?: string; examples?: string[] }) => {
    setUserCards(prev => {
      // Check if card already exists to avoid duplicates
      const existingCard = prev.find(card => 
        card.front.toLowerCase() === front.toLowerCase()
      )
      
      if (existingCard) {
        return prev // Don't add duplicate cards
      }
      
      // Handle both string example and object data
      const example = typeof data === 'string' ? data : (data?.examples?.[0] || undefined);
      
      const newCard: FlashCard = {
        id: generateId(),
        front,
        back,
        example,
        addedAt: new Date(),
        createdAt: new Date(),
        deck: 'personal'
      }
      
      return [newCard, ...prev] // Add to beginning for most recent first
    })
  }, [])

  const removeCard = useCallback((id: string) => {
    setUserCards(prev => prev.filter(card => card.id !== id))
  }, [])

  const nextCard = useCallback(() => {
    setCurrentCardIndex(prev => (prev + 1) % allCards.length)
    setShowAnswer(false)
  }, [allCards.length])

  const previousCard = useCallback(() => {
    setCurrentCardIndex(prev => prev === 0 ? allCards.length - 1 : prev - 1)
    setShowAnswer(false)
  }, [allCards.length])

  const toggleAnswer = useCallback(() => {
    setShowAnswer(prev => !prev)
  }, [])

  const resetCards = useCallback(() => {
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }, [])

  const currentCard = allCards[currentCardIndex] || null

  return {
    allCards,
    userCards,
    top300Cards,
    personalCards,
    currentCard,
    currentCardIndex,
    showAnswer,
    addCard,
    removeCard,
    nextCard,
    previousCard,
    toggleAnswer,
    resetCards
  }
}