import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Settings as SettingsIcon, Lightbulb, CheckCircle, Volume2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettings } from '../hooks/useSettings'

interface SettingsProps {
  onClose?: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateSetting, resetSettings } = useSettings()

  return (
    <div className="relative min-h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      
      <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl m-6 p-8 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-75 animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text mb-4">Configuración</h2>
            <p className="text-xl text-white/70 font-medium">
              Personaliza tu experiencia de aprendizaje
            </p>
          </div>

          {/* Settings Cards */}
          <div className="space-y-6">
            {/* Cultural Tips Setting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-sm opacity-75" />
                        <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Consejos Culturales</CardTitle>
                        <CardDescription className="text-white/60">
                          Recibe tips sobre la cultura francesa durante las conversaciones
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.culturalTipsEnabled}
                      onCheckedChange={(checked) => updateSetting('culturalTipsEnabled', checked)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Auto Corrections Setting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full blur-sm opacity-75" />
                        <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Correcciones Automáticas</CardTitle>
                        <CardDescription className="text-white/60">
                          Recibe correcciones automáticas de gramática y vocabulario
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoCorrectionsEnabled}
                      onCheckedChange={(checked) => updateSetting('autoCorrectionsEnabled', checked)}
                      className="data-[state=checked]:bg-red-500"
                    />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Voice Setting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-sm opacity-75" />
                        <div className="relative h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Síntesis de Voz</CardTitle>
                        <CardDescription className="text-white/60">
                          Habilita la reproducción de audio para los mensajes
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={settings.voiceEnabled}
                      onCheckedChange={(checked) => updateSetting('voiceEnabled', checked)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          {/* Reset Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={resetSettings}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer Configuración
            </Button>
          </motion.div>

          {/* Close Button */}
          {onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-center"
            >
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                Cerrar
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}