import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTranslation } from "@/hooks/useTranslation";
import { useTTS } from "@/hooks/useTTS";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MainContentProps {
  className?: string;
}

export function MainContent({ className }: MainContentProps) {
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = useState<string>("EN");
  
  const {
    isListening,
    transcribedText,
    status,
    startListening,
    stopListening,
    clearTranscription
  } = useSpeechRecognition();

  const {
    translatedText,
    translationStatus,
    errorMessage,
    translateText,
    setTranslatedText,
  } = useTranslation();

  const {
    isPlaying,
    selectedVoice,
    setSelectedVoice,
    speak,
    stopSpeech
  } = useTTS();

  const toggleTranscription = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(transcriptionLanguage);
    }
  };

  // Helper function to convert speech recognition language codes to DeepL codes
  const getDeepLSourceCode = (speechLangCode: string) => {
    switch (speechLangCode) {
      case 'en-US': return 'EN';
      case 'es-ES': return 'ES';
      case 'fr-FR': return 'FR';
      default: return 'EN';
    }
  };

  const handleTranslate = () => {
    if (transcribedText.trim()) {
      const sourceLanguage = getDeepLSourceCode(transcriptionLanguage);
      
      // Check if source and target are the same
      if (sourceLanguage === targetLanguage) {
        // Copy transcribed text to translated text without API call
        setTranslatedText(transcribedText);
        return;
      }
      
      translateText(transcribedText, targetLanguage, sourceLanguage);
    }
  };

  const handlePlayText = async () => {
    if (isPlaying) {
      await stopSpeech();
    } else {
      if (translatedText.trim()) {
        // Play translated text with target language
        const langCode = targetLanguage === 'EN' ? 'en-US' : 
                        targetLanguage === 'ES' ? 'es-ES' : 
                        targetLanguage === 'FR' ? 'fr-FR' : 'en-US';
        await speak(translatedText, langCode);
      } else if (transcribedText.trim()) {
        // Play transcribed text with source language
        await speak(transcribedText, transcriptionLanguage);
      }
    }
  };

  const getLanguageDisplayName = (langCode: string) => {
    switch (langCode) {
      case 'en-US': return 'English';
      case 'es-ES': return 'Spanish';
      case 'fr-FR': return 'French';
      default: return 'English';
    }
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col h-full bg-background",
      className
    )}>
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-8 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Live Transcription
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Start speaking to see your words transcribed in real-time
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Transcription Area */}
        <div className="flex-1 min-h-[400px]">
          <div className="h-full bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground">
                Transcription
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'Listening' ? "bg-green-500 animate-pulse" :
                    status === 'Error' ? "bg-red-500" :
                    "bg-muted"
                  )}></div>
                  <span className="text-xs text-muted-foreground">
                    {status === 'Listening' ? 'Listening...' : status}
                  </span>
                </div>
                
                {/* Play Button */}
                <button
                  onClick={handlePlayText}
                  disabled={!transcribedText.trim() && !translatedText.trim()}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    (!transcribedText.trim() && !translatedText.trim())
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isPlaying
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  )}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="h-full min-h-[300px] bg-muted/20 border border-dashed border-border/50 rounded-md p-4">
              {status === 'Error' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-600 font-medium">Error</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Speech recognition error. Please try again.
                    </p>
                  </div>
                </div>
              ) : transcribedText ? (
                <div className="h-full">
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {transcribedText}
                    {isListening && (
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click the record button to start transcription
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-base font-medium text-foreground">
                Controls
              </h3>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Language:</span>
                <Select value={transcriptionLanguage} onValueChange={setTranscriptionLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Voice Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Voice:</span>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Translation Controls */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  From: <span className="font-medium text-foreground">{getLanguageDisplayName(transcriptionLanguage)}</span>
                </span>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">To:</span>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN">English</SelectItem>
                      <SelectItem value="ES">Spanish</SelectItem>
                      <SelectItem value="FR">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={handleTranslate}
                  disabled={!transcribedText.trim() || translationStatus === 'translating'}
                  variant="outline"
                  size="sm"
                >
                  {translationStatus === 'translating' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Translating...</span>
                    </div>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleTranscription}
                disabled={status === 'Error'}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground",
                  status === 'Error' && "opacity-50 cursor-not-allowed"
                )}
              >
                {isListening ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z" />
                    <path d="M19 10v1a7 7 0 01-14 0v-1" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={clearTranscription}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent/50 transition-colors"
              >
                Clear
              </button>
              
              <button 
                disabled={!transcribedText}
                className={cn(
                  "px-4 py-2 text-sm font-medium border border-border rounded-md transition-colors",
                  transcribedText 
                    ? "text-muted-foreground hover:text-foreground hover:bg-accent/50" 
                    : "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Translation Results */}
        {(translatedText || translationStatus === 'error') && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translation Result
              </h3>
            </div>
            <div className="min-h-[100px] bg-muted/20 border border-dashed border-border/50 rounded-md p-4">
              {translationStatus === 'error' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-600 font-medium">Translation Failed</p>
                    <p className="text-xs text-muted-foreground max-w-xs break-words">
                      {errorMessage || 'Please check your API key configuration and try again.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {translatedText || 'No translation available'}
                  </div>
                  {translationStatus === 'success' && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Translation completed</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}