import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { MessageCircle, BookOpen, AlertCircle, GraduationCap, Sparkles, Trash2 } from 'lucide-react'
import type { ConversationMode } from '../../types'

interface HeaderProps {
  mode: ConversationMode
  onModeChange: (mode: ConversationMode) => void
  onClearConversation: () => void
}

export function Header({ mode, onModeChange, onClearConversation }: HeaderProps) {
  const getModeIcon = (modeType: ConversationMode) => {
    switch (modeType) {
      case 'general':
        return <MessageCircle className="h-4 w-4" />
      case 'scenarios':
        return <BookOpen className="h-4 w-4" />
      case 'teacher':
        return <GraduationCap className="h-4 w-4" />
      case 'flashcards':
        return <Sparkles className="h-4 w-4" />
      case 'errors':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getModeLabel = (modeType: ConversationMode) => {
    switch (modeType) {
      case 'general':
        return 'Chat Libre'
      case 'scenarios':
        return 'Scénarios'
      case 'teacher':
        return 'Professeur'
      case 'flashcards':
        return 'Cartes Flash'
      case 'errors':
        return 'Erreurs'
      default:
        return 'Chat'
    }
  }

  const modes: ConversationMode[] = ['general', 'scenarios', 'teacher', 'flashcards', 'errors']

  return (
    <header className="relative z-30">
      {/* Glassmorphism Header */}
      <div className="backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 animate-fade-in-up">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg animate-float">🇫🇷</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold gradient-text tracking-tight">
                  PolyPal
                </h1>
                <p className="text-xs text-white/60 font-medium">
                  Votre assistant français IA
                </p>
              </div>
            </div>

            {/* Navigation Pills */}
            <nav className="flex items-center space-x-2 animate-slide-in-right">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 shadow-xl">
                <div className="flex items-center space-x-1">
                  {modes.map((modeType) => {
                    const isActive = mode === modeType || 
                      (modeType === 'general' && (mode === 'general' || mode === 'scenarios' || mode === 'teacher'))
                    
                    return (
                      <Button
                        key={modeType}
                        variant="ghost"
                        size="sm"
                        onClick={() => onModeChange(modeType)}
                        className={`
                          relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover-lift
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-lg backdrop-blur-xl border border-white/20'
                              : 'text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                          }
                        `}
                      >
                        <div className={`transition-transform duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}>
                          {getModeIcon(modeType)}
                        </div>
                        <span className="hidden md:inline font-medium text-sm">
                          {getModeLabel(modeType)}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl animate-pulse" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 animate-fade-in-up">
              <Button
                onClick={onClearConversation}
                variant="ghost"
                size="sm"
                className="backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white/80 hover:text-white rounded-xl px-4 py-2 transition-all duration-300 hover-lift hover-glow"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Effacer</span>
              </Button>
              
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </header>
  )
}