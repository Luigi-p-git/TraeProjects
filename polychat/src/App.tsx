import { ThemeProvider } from './components/theme-provider'
import { Header } from './components/layout/Header'
import { ChatMessage } from './components/chat/ChatMessage'
import { ChatInput } from './components/chat/ChatInput'
import { ScenarioSelector } from './components/scenarios/ScenarioSelector'
import { EnhancedFlashcards } from './components/EnhancedFlashcards'
import { ErrorLog } from './components/ErrorLog'
import { Settings } from './components/Settings'
import { useConversation } from './hooks/useConversation'
import { useScenarios } from './hooks/useScenarios'
import { useSettings } from './hooks/useSettings'
import type { ConversationMode } from './types'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { useFlashcards } from './hooks/useFlashcards'
import { useErrorLog } from './hooks/useErrorLog'
import { ChevronLeft, ChevronRight, RotateCcw, Trash2 } from 'lucide-react'

function App() {
  const {
    messages,
    isLoading,
    mode,
    currentScenario,
    sendMessage,
    clearConversation,
    switchMode
  } = useConversation()

  const { scenarios, selectScenario, clearScenario } = useScenarios()
  const { settings, updateSetting } = useSettings()
  const {
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
  } = useFlashcards()
  const { errors, addError, clearErrors, removeError } = useErrorLog()

  const handleModeChange = (newMode: ConversationMode) => {
    switchMode(newMode)
    if (newMode !== 'scenarios') {
      clearScenario()
    }
  }

  const renderChatContent = () => {
    if (mode === 'scenarios' && !currentScenario) {
      return (
        <div className="relative min-h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl m-6 p-8 shadow-2xl">
            <ScenarioSelector
              scenarios={scenarios}
              onSelectScenario={selectScenario}
              selectedScenario={currentScenario}
            />
          </div>
        </div>
      )
    }

    return (
      <div className="relative h-full bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Messages Area with Glassmorphism */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-3xl">💬</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {mode === 'general' && 'Commencez une conversation en français!'}
                      {mode === 'scenarios' && currentScenario && `Scénario: ${scenarios.find(s => s.id === currentScenario)?.title}`}
                      {mode === 'teacher' && 'Mode Professeur - Je vais corriger vos erreurs!'}
                    </h3>
                    <p className="text-white/70 text-lg">
                      Tapez votre message ou utilisez le microphone pour parler.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ChatMessage 
                      message={message} 
                      onAddToFlashcards={addCard}
                      onAddToErrorLog={addError}
                      culturalTipsEnabled={settings.culturalTipsEnabled}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Input Area with Enhanced Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative backdrop-blur-2xl bg-white/5 border-t border-white/10">
              <div className="max-w-4xl mx-auto p-6">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
                  <ChatInput
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    placeholder={
                      mode === 'scenarios' && currentScenario
                        ? `Parlez dans le contexte: ${scenarios.find(s => s.id === currentScenario)?.title}`
                        : 'Écrivez votre message en français...'
                    }
                    isCulturalTipsEnabled={settings.culturalTipsEnabled}
                    onToggleCulturalTips={() => updateSetting('culturalTipsEnabled', !settings.culturalTipsEnabled)}
                    scenario={mode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderFlashcards = () => {
    return (
      <EnhancedFlashcards
        top300Cards={top300Cards}
        personalCards={personalCards}
        onRemoveCard={removeCard}
        onResetCards={resetCards}
      />
    )
  }

  const renderErrorLog = () => {
    return (
      <ErrorLog
        errors={errors}
        onRemoveError={removeError}
        onClearErrors={clearErrors}
      />
    )
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="polypal-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Header with Glassmorphism */}
        <div className="relative z-20">
          <Header
            mode={mode}
            onModeChange={handleModeChange}
            onClearConversation={clearConversation}
          />
        </div>
        
        {/* Main Content */}
        <main className="relative z-10 h-[calc(100vh-4rem)]">
          <Tabs value={mode === 'general' || mode === 'scenarios' || mode === 'teacher' ? 'chat' : mode} className="h-full">
            <TabsContent value="chat" className="h-full m-0">
              {renderChatContent()}
            </TabsContent>
            <TabsContent value="flashcards" className="h-full m-0 overflow-y-auto">
              {renderFlashcards()}
            </TabsContent>
            <TabsContent value="errors" className="h-full m-0 overflow-y-auto">
              {renderErrorLog()}
            </TabsContent>
            <TabsContent value="settings" className="h-full m-0 overflow-y-auto">
              <Settings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
