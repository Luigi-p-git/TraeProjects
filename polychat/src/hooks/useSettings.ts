import { useState, useCallback } from 'react'

export interface AppSettings {
  culturalTipsEnabled: boolean
  autoCorrectionsEnabled: boolean
  voiceEnabled: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  culturalTipsEnabled: true,
  autoCorrectionsEnabled: true,
  voiceEnabled: true
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('polypal-settings')
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })

  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem('polypal-settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.setItem('polypal-settings', JSON.stringify(DEFAULT_SETTINGS))
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings
  }
}