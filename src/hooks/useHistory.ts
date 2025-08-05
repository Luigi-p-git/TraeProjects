import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  transcribedText: string;
  translatedText: string;
  targetLang: string;
  sourceLang: string;
  ttsVoice: string;
  createdAt: string;
}

const STORAGE_KEY = 'voicepal-history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Cargar historial desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
    }
  }, []);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    try {
      console.log('DEBUG: New history state prepared. Attempting to save to localStorage.');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [history]);

  // Añadir nuevo item al historial
  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    console.log('DEBUG: addHistoryItem function in hook was called with:', item);
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    console.log('Created new item:', newItem);

    setHistory(prev => {
      console.log('Previous history:', prev);
      const newHistory = [newItem, ...prev];
      console.log('New history:', newHistory);
      return newHistory;
    });
    return newItem;
  }, []);

  // Eliminar item del historial
  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // Cargar item del historial (retorna el item para que el componente padre lo use)
  const loadHistoryItem = useCallback((id: string) => {
    const item = history.find(item => item.id === id);
    return item || null;
  }, [history]);

  // Limpiar todo el historial
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Obtener item más reciente
  const getLatestItem = useCallback(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  return {
    history,
    addHistoryItem,
    deleteHistoryItem,
    loadHistoryItem,
    clearHistory,
    getLatestItem,
  };
}