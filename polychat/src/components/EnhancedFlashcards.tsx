import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, RotateCcw, Trash2, BookOpen, Star, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FlashCard } from '../types'
import { useState, useEffect } from 'react'

interface EnhancedFlashcardsProps {
  top300Cards: FlashCard[]
  personalCards: FlashCard[]
  onRemoveCard: (id: string) => void
  onResetCards: () => void
}

export function EnhancedFlashcards({ 
  top300Cards, 
  personalCards, 
  onRemoveCard, 
  onResetCards 
}: EnhancedFlashcardsProps) {
  const [activeTab, setActiveTab] = useState('top300')
  const [currentTop300Index, setCurrentTop300Index] = useState(0)
  const [currentPersonalIndex, setCurrentPersonalIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizMode, setQuizMode] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [isAnswered, setIsAnswered] = useState(false)

  const currentCards = activeTab === 'top300' ? top300Cards : personalCards
  const currentIndex = activeTab === 'top300' ? currentTop300Index : currentPersonalIndex
  const currentCard = currentCards[currentIndex] || null

  // Generate quiz options with 3 wrong answers and 1 correct answer
  const generateQuizOptions = () => {
    if (!currentCard || currentCards.length < 4) {
      setQuizOptions([])
      return
    }

    const correctAnswer = currentCard.back
    const wrongAnswers: string[] = []
    
    // Get 3 random wrong answers from other cards
    const otherCards = currentCards.filter((_, index) => index !== currentIndex)
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
      wrongAnswers.push(shuffledOthers[i].back)
    }
    
    // If we don't have enough cards, add some generic wrong answers
    while (wrongAnswers.length < 3) {
      const genericAnswers = ['palabra', 'respuesta', 'opción', 'texto', 'ejemplo']
      const randomGeneric = genericAnswers[Math.floor(Math.random() * genericAnswers.length)]
      if (!wrongAnswers.includes(randomGeneric) && randomGeneric !== correctAnswer) {
        wrongAnswers.push(randomGeneric)
      }
    }
    
    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...wrongAnswers]
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5)
    setQuizOptions(shuffledOptions)
  }

  const nextCard = () => {
    if (activeTab === 'top300') {
      setCurrentTop300Index(prev => (prev + 1) % top300Cards.length)
    } else {
      setCurrentPersonalIndex(prev => (prev + 1) % personalCards.length)
    }
    setShowAnswer(false)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }

  const previousCard = () => {
    if (activeTab === 'top300') {
      setCurrentTop300Index(prev => prev === 0 ? top300Cards.length - 1 : prev - 1)
    } else {
      setCurrentPersonalIndex(prev => prev === 0 ? personalCards.length - 1 : prev - 1)
    }
    setShowAnswer(false)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return
    
    setSelectedAnswer(answer)
    setIsAnswered(true)
    setShowAnswer(true)
  }

  const handleQuizAnswer = (answer: string) => {
    handleAnswerSelect(answer)
  }

  // Generate quiz options when card changes
  useEffect(() => {
    if (quizMode && currentCard) {
      generateQuizOptions()
    }
  }, [currentCard, quizMode, currentIndex, activeTab])

  const toggleAnswer = () => {
    setShowAnswer(prev => !prev)
  }

  const toggleQuizMode = () => {
    setQuizMode(prev => !prev)
    setShowAnswer(false)
    setSelectedAnswer(null)
    if (!quizMode) {
      generateQuizOptions()
    }
  }

  const resetCurrentDeck = () => {
    if (activeTab === 'top300') {
      setCurrentTop300Index(0)
    } else {
      setCurrentPersonalIndex(0)
    }
    setShowAnswer(false)
    setSelectedAnswer(null)
    onResetCards()
  }

  if (!currentCard) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%139C92AC%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22m56%2066%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="relative z-10 flex items-center justify-center min-h-full p-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {activeTab === 'top300' ? 'Aucune carte Top 300 disponible' : 'Aucune carte personnelle'}
            </h3>
            <p className="text-white/70">
              {activeTab === 'top300' 
                ? 'Les cartes de base seront bientôt disponibles!' 
                : 'Commencez une conversation et cliquez sur les mots français pour créer vos cartes personnalisées!'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%139C92AC%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22m56%2066%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header with Tabs */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Cartes Flash</h2>
              <p className="text-white/70">Révisez votre vocabulaire français</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={toggleQuizMode} 
                variant={quizMode ? "default" : "outline"}
                size="lg" 
                className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20"
              >
                {quizMode ? 'Mode Révision' : 'Mode Quiz'}
              </Button>
              <Button 
                onClick={resetCurrentDeck} 
                variant="outline" 
                size="lg" 
                className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 backdrop-blur-xl bg-white/10 border border-white/20">
              <TabsTrigger 
                value="top300" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Star className="w-4 h-4 mr-2" />
                Top 300 ({top300Cards.length})
              </TabsTrigger>
              <TabsTrigger 
                value="personal" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Mis Palabras ({personalCards.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Card Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${currentIndex}`}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-6 shadow-2xl"
          >
            <div className="text-center space-y-6">
              <div className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Carte {currentIndex + 1} de {currentCards.length}
              </div>
              
              {/* French Word */}
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <h3 className="text-4xl font-bold text-white mb-2">
                  {currentCard.front}
                </h3>
                {currentCard.example && (
                  <p className="text-white/60 italic text-sm">
                    "{currentCard.example}"
                  </p>
                )}
              </div>

              {/* Quiz Mode */}
              {quizMode && !isAnswered && (
                <div className="space-y-4">
                  <p className="text-white/80 text-lg">Choisissez la traduction correcte:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {quizOptions.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuizAnswer(option)}
                        variant="outline"
                        className="h-16 text-lg backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20 text-white transition-all duration-200"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Results */}
              {quizMode && isAnswered && (
                <div className="space-y-4">
                  <p className="text-white/80 text-lg">Résultat:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {quizOptions.map((option, index) => {
                      const isCorrect = option === currentCard.back
                      const isSelected = option === selectedAnswer
                      let buttonClass = "h-16 text-lg backdrop-blur-xl border-2 transition-all duration-300"
                      
                      if (isSelected && isCorrect) {
                        buttonClass += " bg-green-500/30 border-green-400 text-green-200"
                      } else if (isSelected && !isCorrect) {
                        buttonClass += " bg-red-500/30 border-red-400 text-red-200"
                      } else if (!isSelected && isCorrect) {
                        buttonClass += " bg-green-500/20 border-green-400/50 text-green-300"
                      } else {
                        buttonClass += " bg-white/10 border-white/20 text-white/50"
                      }
                      
                      return (
                        <Button
                          key={index}
                          disabled
                          variant="outline"
                          className={buttonClass}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>{option}</span>
                            {isSelected && isCorrect && <Check className="w-5 h-5" />}
                            {isSelected && !isCorrect && <X className="w-5 h-5" />}
                            {!isSelected && isCorrect && <Check className="w-5 h-5 text-green-400" />}
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-semibold ${
                      selectedAnswer === currentCard.back 
                        ? 'text-green-300' 
                        : 'text-red-300'
                    }`}>
                      {selectedAnswer === currentCard.back 
                        ? '¡Correcto! 🎉' 
                        : `Incorrect. La bonne réponse est: ${currentCard.back}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Answer Display - Only for Review Mode */}
              {!quizMode && showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-emerald-400/30"
                >
                  <h4 className="text-2xl font-bold text-emerald-200 mb-2">
                    {currentCard.back}
                  </h4>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={previousCard}
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {!quizMode && (
                  <Button
                    onClick={toggleAnswer}
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {showAnswer ? 'Masquer' : 'Révéler'}
                  </Button>
                )}
                
                <Button
                  onClick={nextCard}
                  variant="outline"
                  size="lg"
                  className="backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                {activeTab === 'personal' && (
                  <Button
                    onClick={() => onRemoveCard(currentCard.id)}
                    variant="outline"
                    size="lg"
                    className="backdrop-blur-xl bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm font-medium">
              Progrès: {currentIndex + 1} / {currentCards.length}
            </span>
            <span className="text-white/70 text-sm">
              {Math.round(((currentIndex + 1) / currentCards.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / currentCards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedFlashcards