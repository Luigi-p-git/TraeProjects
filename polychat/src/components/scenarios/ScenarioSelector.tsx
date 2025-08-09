import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Scenario } from '../../types'
import { motion } from 'framer-motion'
import { Sparkles, Star, Zap } from 'lucide-react'

interface ScenarioSelectorProps {
  scenarios: Scenario[]
  onSelectScenario: (scenarioId: string) => void
  selectedScenario?: string | null
}

export function ScenarioSelector({ scenarios, onSelectScenario, selectedScenario }: ScenarioSelectorProps) {
  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="relative container py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Elige un Escenario
            </h2>
            <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>
          <p className="text-xl text-white/70 font-medium max-w-2xl mx-auto">
            Selecciona una situación para practicar conversaciones específicas en francés
          </p>
        </motion.div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.15, 
                duration: 0.5,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <div 
                className={`relative cursor-pointer backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl transition-all duration-300 overflow-hidden ${
                  selectedScenario === scenario.id 
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/40 shadow-purple-500/25' 
                    : 'bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 hover:border-white/30'
                }`}
                onClick={() => onSelectScenario(scenario.id)}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl" />
                </div>
                
                {/* Selection indicator */}
                {selectedScenario === scenario.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Star className="h-3 w-3 text-white fill-white" />
                  </motion.div>
                )}
                
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <motion.div 
                      className="text-6xl mb-4 filter drop-shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      🎭
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                    <p className="text-sm italic text-white/80 text-center">
                      "¡Empecemos a practicar!"
                    </p>
                  </div>
                  
                  <Button 
                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-200 ${
                      selectedScenario === scenario.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-gradient-to-r from-white/10 to-white/20 hover:from-white/20 hover:to-white/30 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectScenario(scenario.id)
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {selectedScenario === scenario.id ? (
                        <>
                          <Star className="h-4 w-4 fill-white" />
                          <span>Seleccionado</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Seleccionar</span>
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="inline-block backdrop-blur-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-lg opacity-75 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-2xl">💡</span>
                </div>
              </div>
              <div className="text-left max-w-md">
                <h3 className="text-xl font-bold text-amber-200 mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Consejo Pro
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Cada escenario incluye correcciones automáticas, vocabulario contextual y consejos culturales para una experiencia de aprendizaje completa
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}