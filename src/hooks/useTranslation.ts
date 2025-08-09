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

// Interface for translation request
interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

// Interface for translation error
interface TranslationError {
  message: string;
}

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
    setErrorMessage('');

    try {
      // Prepare request body
      const requestBody: TranslationRequest = {
        text,
        targetLang,
        ...(sourceLang && { sourceLang })
      };

      // Make request to API endpoint (works for both dev and production)
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: TranslationError = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: TranslationResult = await response.json();
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