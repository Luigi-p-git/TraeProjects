import { useState, useCallback } from 'react';

// Type definitions
type TranslationStatus = 'idle' | 'translating' | 'success' | 'error';

interface TranslationResult {
  translated_text: string;
}

interface TranslationHook {
  translatedText: string;
  translationStatus: TranslationStatus;
  errorMessage: string;
  translateText: (text: string, targetLang: string, sourceLang?: string) => Promise<void>;
  clearTranslation: () => void;
  setTranslatedText: (text: string) => void;
}

// Check if we're running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Type for Tauri invoke function
type InvokeFunction = (command: string, args?: any) => Promise<any>;

export const useTranslation = (): TranslationHook => {
  const [translatedText, setTranslatedText] = useState('');
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const translateText = useCallback(async (text: string, targetLang: string, sourceLang?: string) => {
    if (!text.trim()) {
      return;
    }

    setTranslationStatus('translating');
    setTranslatedText('');

    if (isTauri) {
      try {
        // Dynamic import for Tauri API
        const { invoke } = await import('@tauri-apps/api/core');
        
        const result: TranslationResult = await (invoke as InvokeFunction)('translate', {
          text,
          target_lang: targetLang,
          source_lang: sourceLang
        });
        
        setTranslatedText(result.translated_text);
        setTranslationStatus('success');
      } catch (error: any) {
        console.error('Translation error:', error);
        setTranslationStatus('error');
        
        // Handle different error types and capture error message
        if (error && typeof error === 'object' && 'message' in error) {
          console.error('Translation failed:', error.message);
          setErrorMessage(error.message);
        } else {
          console.error('Translation failed with unknown error');
          setErrorMessage('Translation failed with unknown error');
        }
      }
    } else {
      // Fallback for web environment
      setTranslationStatus('error');
      setErrorMessage('Translation is only available in the desktop application');
      console.error('Translation is only available in the desktop application');
    }
  }, []);

  const clearTranslation = useCallback(() => {
    setTranslatedText('');
    setTranslationStatus('idle');
    setErrorMessage('');
  }, []);

  return {
    translatedText,
    translationStatus,
    errorMessage,
    translateText,
    clearTranslation,
    setTranslatedText
  };
};