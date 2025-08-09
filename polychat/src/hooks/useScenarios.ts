import { useState, useCallback } from 'react'
import type { Scenario } from '../types'

const PREDEFINED_SCENARIOS: Scenario[] = [
  {
    id: 'cafe',
    title: 'En el Café',
    description: 'Practica pidiendo comida y bebidas en un café francés',
    icon: '☕',
    greeting: 'Bonjour ! Bienvenue dans notre café. Que puis-je vous servir aujourd\'hui ?'
  },
  {
    id: 'directions',
    title: 'Pidiendo Direcciones',
    description: 'Aprende a preguntar y dar direcciones en francés',
    icon: '🗺️',
    greeting: 'Bonjour ! Vous semblez perdu. Puis-je vous aider à trouver votre chemin ?'
  },
  {
    id: 'shopping',
    title: 'De Compras',
    description: 'Practica comprando en tiendas y mercados franceses',
    icon: '🛍️',
    greeting: 'Bonjour ! Bienvenue dans notre magasin. Cherchez-vous quelque chose en particulier ?'
  },
  {
    id: 'restaurant',
    title: 'En el Restaurante',
    description: 'Ordena comida y conversa con el mesero en francés',
    icon: '🍽️',
    greeting: 'Bonsoir ! Avez-vous une réservation ? Combien de personnes êtes-vous ?'
  },
  {
    id: 'hotel',
    title: 'En el Hotel',
    description: 'Practica el check-in y solicita servicios del hotel',
    icon: '🏨',
    greeting: 'Bonjour ! Bienvenue à l\'Hôtel Paris. Comment puis-je vous aider ?'
  },
  {
    id: 'transport',
    title: 'Transporte Público',
    description: 'Aprende a usar el transporte público en Francia',
    icon: '🚇',
    greeting: 'Bonjour ! Vous avez besoin d\'aide pour acheter un ticket ou trouver votre ligne ?'
  },
  {
    id: 'pharmacy',
    title: 'En la Farmacia',
    description: 'Solicita medicamentos y productos de salud',
    icon: '💊',
    greeting: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ? Avez-vous une ordonnance ?'
  },
  {
    id: 'bank',
    title: 'En el Banco',
    description: 'Realiza transacciones bancarias básicas en francés',
    icon: '🏦',
    greeting: 'Bonjour ! Bienvenue à la banque. Que puis-je faire pour vous aujourd\'hui ?'
  },
  {
    id: 'doctor',
    title: 'En el Médico',
    description: 'Describe síntomas y habla con profesionales de la salud',
    icon: '👩‍⚕️',
    greeting: 'Bonjour ! Je suis le docteur Martin. Qu\'est-ce qui vous amène aujourd\'hui ?'
  },
  {
    id: 'social',
    title: 'Conversación Social',
    description: 'Practica conversaciones casuales y presentaciones',
    icon: '👥',
    greeting: 'Salut ! Je m\'appelle Marie. Et vous, comment vous appelez-vous ?'
  }
]

export function useScenarios() {
  const [scenarios] = useState<Scenario[]>(PREDEFINED_SCENARIOS)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)

  const selectScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    setCurrentScenario(scenario || null)
    return scenario
  }, [scenarios])

  const clearScenario = useCallback(() => {
    setCurrentScenario(null)
  }, [])

  const getScenarioById = useCallback((id: string) => {
    return scenarios.find(s => s.id === id)
  }, [scenarios])

  return {
    scenarios,
    currentScenario,
    selectScenario,
    clearScenario,
    getScenarioById
  }
}