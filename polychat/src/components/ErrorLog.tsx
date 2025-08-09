import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, AlertCircle, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ErrorLogEntry } from '../types'
import { formatTime } from '@/lib/utils'

interface ErrorLogProps {
  errors: ErrorLogEntry[]
  onRemoveError: (id: string) => void
  onClearErrors: () => void
}

export function ErrorLog({ errors, onRemoveError, onClearErrors }: ErrorLogProps) {
  if (errors.length === 0) {
    return (
      <div className="relative min-h-full bg-gradient-to-br from-red-900/20 via-pink-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22m56%2066%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="relative z-10 flex items-center justify-center min-h-full p-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Journal des erreurs vide</h3>
            <p className="text-white/70 max-w-md">
              Commencez une conversation et ajoutez vos corrections au journal pour créer votre guide d'apprentissage personnalisé!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-full bg-gradient-to-br from-red-900/20 via-pink-900/20 to-purple-900/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%139C92AC%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22m56%2066%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204zm-12%200%204-4-4-4-4%204%204%204z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                <AlertCircle className="w-8 h-8 mr-3 text-red-400" />
                Journal des erreurs
              </h2>
              <p className="text-white/70">
                Vos erreurs personnalisées pour un apprentissage ciblé ({errors.length} entrées)
              </p>
            </div>
            {errors.length > 0 && (
              <Button 
                onClick={onClearErrors} 
                variant="outline" 
                size="lg" 
                className="backdrop-blur-xl bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 hover:border-red-400/50"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Vider le journal
              </Button>
            )}
          </div>
        </div>

        {/* Error Log Table */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-white/80 font-semibold">Votre texte</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Correction</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Explication</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Date</th>
                  <th className="text-center p-4 text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {errors.map((error, index) => (
                    <motion.tr
                      key={error.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                          <p className="text-white/90 text-sm font-medium">
                            {error.originalText}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                          <p className="text-white/90 text-sm font-medium">
                            {error.correctedText}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                          <p className="text-white/80 text-xs">
                            {error.explanation}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white/60 text-xs">
                          {formatTime(error.timestamp)}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          onClick={() => onRemoveError(error.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300 text-white/60"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{errors.length}</p>
                <p className="text-white/70 text-sm">Erreurs enregistrées</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {errors.filter(e => e.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-white/70 text-sm">Cette semaine</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {errors.filter(e => e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-white/70 text-sm">Aujourd'hui</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}