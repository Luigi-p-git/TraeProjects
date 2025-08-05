import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTranslation } from "@/hooks/useTranslation";
import { useTTS, ELEVENLABS_VOICES } from "@/hooks/useTTS";
import { useHistory } from "@/hooks/useHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Play, Pause, Square, Languages, Volume2, Settings, Save, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface MainContentProps {
  className?: string;
  onHistoryLoad?: (item: any) => void;
  activeHistoryId?: string | null;
  historyHook?: ReturnType<typeof useHistory>;
}

type AppMode = 'speech-to-text' | 'text-to-speech';

export const MainContent = forwardRef<any, MainContentProps>(({ className, onHistoryLoad, activeHistoryId, historyHook }, ref) => {
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = useState<string>("ES"); // Default to Spanish for auto-translation
  const [appMode, setAppMode] = useState<AppMode>('speech-to-text');
  const [showSettings, setShowSettings] = useState(false);
  const [textInput, setTextInput] = useState<string>(''); // For text-to-speech mode
  
  // Use shared history hook or fallback to local one
  const localHistoryHook = useHistory();
  const { addHistoryItem } = historyHook || localHistoryHook;
  
  const {
    isListening,
    transcribedText,
    status,
    startListening,
    stopListening,
    clearTranscription,
    isPushToTalkActive,
    enablePushToTalk,
    disablePushToTalk
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
    status: ttsStatus,
    selectedVoice,
    setSelectedVoice,
    speak,
    stopSpeech,
    downloadAudio
  } = useTTS();

  // Automatic Translation: Trigger translation when transcription is finalized
  useEffect(() => {
    // Only auto-translate in speech-to-text mode and when we have transcribed text
    if (appMode === 'speech-to-text' && 
        transcribedText && 
        transcribedText.trim() && 
        !isListening && // Only when not actively listening (transcription is final)
        translationStatus === 'idle') { // Avoid re-triggering during translation
      
      const sourceLanguage = getDeepLSourceCode(transcriptionLanguage);
      
      // Only auto-translate if source and target languages are different
      if (sourceLanguage !== targetLanguage) {
        console.log('AUTO-TRANSLATE: Triggering automatic translation from', sourceLanguage, 'to', targetLanguage);
        translateText(transcribedText, targetLanguage, sourceLanguage);
      }
    }
  }, [transcribedText, isListening, appMode, transcriptionLanguage, targetLanguage, translationStatus, translateText]);

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
    const textToTranslate = appMode === 'text-to-speech' ? textInput : transcribedText;
    if (textToTranslate && textToTranslate.trim()) {
      const sourceLanguage = getDeepLSourceCode(transcriptionLanguage);
      
      // Check if source and target are the same
      if (sourceLanguage === targetLanguage) {
        // Copy text to translated text without API call
        setTranslatedText(textToTranslate);
        return;
      }
      
      translateText(textToTranslate, targetLanguage, sourceLanguage);
    }
  };

  const handlePlayText = async () => {
    if (isPlaying) {
      await stopSpeech();
    } else {
      const textToPlay = appMode === 'text-to-speech' ? textInput : transcribedText;
      if (translatedText.trim()) {
        // Play translated text with target language
        const langCode = targetLanguage === 'EN' ? 'en-US' : 
                        targetLanguage === 'ES' ? 'es-ES' : 
                        targetLanguage === 'FR' ? 'fr-FR' : 'en-US';
        await speak(translatedText, langCode);
      } else if (textToPlay && textToPlay.trim()) {
        // Play text with source language
        await speak(textToPlay, transcriptionLanguage);
      }
    }
  };

  const handleDownloadAudio = async () => {
    try {
      const textToDownload = appMode === 'text-to-speech' ? textInput : transcribedText;
      if (translatedText.trim()) {
        await downloadAudio(translatedText);
      } else if (textToDownload && textToDownload.trim()) {
        await downloadAudio(textToDownload);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // You could add a toast notification here
    }
  };
  
  const handleSaveToHistory = () => {
    console.log('DEBUG: Save button clicked.');
    console.log('SAVE DEBUG: appMode:', appMode);
    console.log('SAVE DEBUG: transcribedText (raw):', transcribedText);
    console.log('SAVE DEBUG: textInput:', textInput);
    const textToSave = appMode === 'text-to-speech' ? textInput : transcribedText;
    console.log('SAVE DEBUG: textToSave (final):', textToSave);
    console.log('SAVE DEBUG: textToSave.trim():', textToSave?.trim());
    console.log('SAVE DEBUG: Boolean check (!textToSave || !textToSave.trim()):', !textToSave || !textToSave.trim());
    console.log('translatedText:', translatedText);
    
    if (textToSave && textToSave.trim()) {
      try {
        const historyItemObject = {
          transcribedText: textToSave.trim(),
          translatedText: translatedText || '',
          targetLang: targetLanguage,
          sourceLang: transcriptionLanguage,
          ttsVoice: selectedVoice,
        };
        console.log('DEBUG: Attempting to save this object:', historyItemObject);
        const savedItem = addHistoryItem(historyItemObject);
        console.log('Item saved successfully:', savedItem);
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    } else {
      console.log('Cannot save: text is empty or undefined');
    }
  };
  
  // Función para resetear la sesión activa
  const resetActiveSession = () => {
    clearTranscription();
    setTargetLanguage('EN');
    setTranscriptionLanguage('en-US');
    setSelectedVoice('deep-male-narrator');
    if (onHistoryLoad) {
      onHistoryLoad(null);
    }
  };
  
  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    loadHistoryItem: (item: any) => {
      // Cargar datos del item del historial
      if (item.transcribedText) {
        // Establecer las configuraciones del item
        setSelectedVoice(item.ttsVoice || 'normal');
        setTranscriptionLanguage(item.sourceLang || 'en-US');
        setTargetLanguage(item.targetLang || 'EN');
        
        // Si hay traducción, también la establecemos
        if (item.translatedText) {
          setTranslatedText(item.translatedText);
        }
        
        // Nota: El texto transcrito se mostraría en la UI pero no podemos modificarlo
        // directamente desde aquí ya que es manejado por el hook useSpeechRecognition
      }
    },
    resetSession: () => {
      resetActiveSession();
    }
  }));
  
  // Efecto para cargar datos del historial cuando se selecciona un item
  useEffect(() => {
    // Este efecto se manejará desde el componente padre (App.tsx)
  }, [activeHistoryId]);

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
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h2 
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                🎤 VoicePal
              </motion.h2>
              <motion.p 
                className="text-sm text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {appMode === 'speech-to-text' 
                  ? 'Start speaking to see your words transcribed in real-time'
                  : 'Enter text to convert it to speech with natural voices'
                }
              </motion.p>
            </div>
            
            {/* Mode Toggle - Pill Shaped */}
            <motion.div 
              className="relative bg-muted/50 p-1 rounded-full border border-border/50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex relative">
                <motion.div
                  className="absolute inset-y-1 bg-primary rounded-full shadow-lg"
                  initial={false}
                  animate={{
                    x: appMode === 'speech-to-text' ? 0 : '100%',
                    width: appMode === 'speech-to-text' ? '50%' : '50%'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setAppMode('speech-to-text')}
                  className={cn(
                    "relative z-10 flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors rounded-full",
                    appMode === 'speech-to-text' 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mic className="w-4 h-4" />
                  Speech to Text
                </button>
                <button
                  onClick={() => setAppMode('text-to-speech')}
                  className={cn(
                    "relative z-10 flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors rounded-full",
                    appMode === 'text-to-speech' 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Volume2 className="w-4 h-4" />
                  Text to Speech
                </button>
              </div>
            </motion.div>
            
            {/* Theme Toggle and Settings */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {appMode === 'speech-to-text' ? (
            <motion.div
              key="speech-to-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Speech Recognition Interface */}
              <div className="flex-1 min-h-[400px]">
                <div className="h-full bg-card border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Live Transcription
                    </h3>
                    <div className="flex items-center space-x-4">
                      <AnimatePresence>
                        {isListening && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-medium"
                          >
                            <motion.div 
                              className="w-2 h-2 bg-red-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            {isPushToTalkActive ? "Recording (Hold SPACEBAR)" : "Listening..."}
                          </motion.div>
                        )}
                        {status === 'Error' && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-medium"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            Error
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Record Button */}
                      <motion.button
                        onClick={toggleTranscription}
                        disabled={isPushToTalkActive}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg",
                          isPushToTalkActive
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isListening
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                        )}
                        whileHover={{ scale: isListening || isPushToTalkActive ? 1 : 1.05 }}
                        whileTap={{ scale: isPushToTalkActive ? 1 : 0.95 }}
                        animate={isListening ? {
                          boxShadow: [
                            "0 0 0 0 rgba(239, 68, 68, 0.7)",
                            "0 0 0 10px rgba(239, 68, 68, 0)",
                            "0 0 0 0 rgba(239, 68, 68, 0)"
                          ]
                        } : {}}
                        transition={{
                          boxShadow: {
                            duration: 1.5,
                            repeat: Infinity
                          }
                        }}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            {isPushToTalkActive ? "Push-to-Talk Active" : "Start Recording"}
                          </>
                        )}
                      </motion.button>
                      
                      {/* Push-to-Talk Toggle - Elegant Minimal Design */}
                       <motion.button
                         onClick={isPushToTalkActive ? disablePushToTalk : enablePushToTalk}
                         className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all duration-300 ${
                           isPushToTalkActive 
                             ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300' 
                             : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                         }`}
                         whileHover={{ scale: 1.01 }}
                         whileTap={{ scale: 0.99 }}
                       >
                         <motion.div
                           className={`w-2 h-2 rounded-full ${
                             isPushToTalkActive ? 'bg-blue-500' : 'bg-gray-400'
                           }`}
                           animate={{
                             scale: isPushToTalkActive ? [1, 1.2, 1] : 1,
                             opacity: isPushToTalkActive ? [0.7, 1, 0.7] : 1
                           }}
                           transition={{
                             duration: 1.5,
                             repeat: isPushToTalkActive ? Infinity : 0,
                             ease: "easeInOut"
                           }}
                         />
                         <span className="text-sm font-medium">
                           Push-to-Talk
                         </span>
                         <motion.div
                           className={`text-xs px-1.5 py-0.5 rounded-md ${
                             isPushToTalkActive 
                               ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                               : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                           }`}
                           animate={{
                             opacity: isPushToTalkActive ? [0.8, 1, 0.8] : 1
                           }}
                           transition={{
                             duration: 2,
                             repeat: isPushToTalkActive ? Infinity : 0,
                             ease: "easeInOut"
                           }}
                         >
                           {isPushToTalkActive ? 'ON' : 'OFF'}
                         </motion.div>
                       </motion.button>
                      
                      {/* Push-to-Talk Instructions - Clean Minimal Design */}
                       <AnimatePresence>
                         {isPushToTalkActive && (
                           <motion.div
                             initial={{ opacity: 0, y: 8 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -8 }}
                             transition={{ duration: 0.2, ease: "easeOut" }}
                             className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                           >
                             <motion.div
                               className="w-1.5 h-1.5 bg-red-500 rounded-full"
                               animate={{
                                 opacity: [0.4, 1, 0.4]
                               }}
                               transition={{
                                 duration: 1.5,
                                 repeat: Infinity,
                                 ease: "easeInOut"
                               }}
                             />
                             <span className="font-medium">Hold</span>
                             <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                               SPACE
                             </kbd>
                             <span>to record</span>
                           </motion.div>
                         )}
                       </AnimatePresence>
                      
                      {/* Play Button */}
                      <motion.button
                        onClick={handlePlayText}
                        disabled={!transcribedText.trim() && !translatedText.trim()}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                          (!transcribedText.trim() && !translatedText.trim())
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isPlaying
                            ? "bg-orange-500/10 text-orange-600 cursor-not-allowed" 
                            : "bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105"
                        )}
                        whileHover={(!transcribedText.trim() && !translatedText.trim()) || isPlaying ? {} : { scale: 1.05 }}
                        whileTap={(!transcribedText.trim() && !translatedText.trim()) || isPlaying ? {} : { scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Play Audio
                          </>
                        )}
                      </motion.button>
                      
                      {/* Save Button */}
                      <motion.button
                        onClick={handleSaveToHistory}
                        disabled={!transcribedText.trim()}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                          !transcribedText.trim()
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:scale-105"
                        )}
                        whileHover={transcribedText.trim() ? { scale: 1.05 } : {}}
                        whileTap={transcribedText.trim() ? { scale: 0.95 } : {}}
                      >
                        <Save className="w-4 h-4" />
                        Save Speech
                      </motion.button>
                    </div>
                  </div>
                  
                  <motion.div 
                    className="h-full min-h-[300px] bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border/50 rounded-xl p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    {status === 'Error' ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-full"
                      >
                        <div className="text-center space-y-2">
                          <div className="text-red-500 text-lg">⚠️</div>
                          <p className="text-sm text-red-600 font-medium">Error</p>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            Speech recognition error. Please try again.
                          </p>
                        </div>
                      </motion.div>
                    ) : transcribedText ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full space-y-6"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Languages className="w-4 h-4" />
                            Original Text
                          </div>
                          <div className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                            {transcribedText}
                            {isListening && (
                              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center space-y-4"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-6xl"
                        >
                          🎤
                        </motion.div>
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-foreground">
                            Ready to listen
                          </p>
                          <p className="text-muted-foreground">
                            Click the record button below to start speaking
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="text-to-speech"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Text-to-Speech Interface */}
              <div className="flex-1 min-h-[400px]">
                <div className="h-full bg-card border border-border rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-5 h-5" />
                        Voice Controls
                      </motion.div>
                    </h3>
                    
                    {/* Remove duplicate controls from header - keep only in text area */}
                  </div>
                  
                  <motion.div 
                    className="h-full min-h-[300px] bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 rounded-xl p-4 backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-4 h-full">
                      <textarea
                        placeholder="Enter text to convert to speech..."
                        className="w-full h-48 p-4 bg-background/50 border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        value={textInput}
                        onChange={(e) => {
                          setTextInput(e.target.value);
                        }}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {textInput?.length || 0} characters
                          </div>
                          
                          {/* Voice Selector for Text-to-Speech */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Voice:</span>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ELEVENLABS_VOICES).map(([key, voice]) => (
                                  <SelectItem key={key} value={key}>
                                    {voice.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            onClick={handlePlayText}
                            disabled={!textInput || isPlaying}
                            className={cn(
                              "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-lg",
                              !textInput || isPlaying
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                            )}
                            whileHover={textInput && !isPlaying ? { scale: 1.05 } : {}}
                            whileTap={textInput && !isPlaying ? { scale: 0.95 } : {}}
                          >
                            {isPlaying ? (
                              <>
                                <Square className="w-4 h-4" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Generate Speech
                              </>
                            )}
                          </motion.button>
                          
                          {/* Download Button */}
                          <motion.button
                            onClick={handleDownloadAudio}
                            disabled={!textInput.trim() || ttsStatus === 'generating'}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                              !textInput.trim() || ttsStatus === 'generating'
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:scale-105"
                            )}
                            whileHover={textInput.trim() && ttsStatus !== 'generating' ? { scale: 1.05 } : {}}
                            whileTap={textInput.trim() && ttsStatus !== 'generating' ? { scale: 0.95 } : {}}
                          >
                            <Download className="w-4 h-4" />
                            {ttsStatus === 'generating' ? 'Generating...' : 'Download'}
                          </motion.button>
                          
                          {/* Save Button */}
                          <motion.button
                            onClick={handleSaveToHistory}
                            disabled={!textInput.trim()}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                              !textInput.trim()
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:scale-105"
                            )}
                            whileHover={textInput.trim() ? { scale: 1.05 } : {}}
                            whileTap={textInput.trim() ? { scale: 0.95 } : {}}
                          >
                            <Save className="w-4 h-4" />
                            Save Text
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Action Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={appMode}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    {appMode === 'speech-to-text' ? (
                      <>
                        <Mic className="w-5 h-5" />
                        Speech Controls
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Voice Controls
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </h3>
              
              {/* Action bar controls removed - using only text area controls */}
            </div>
            
            {/* Settings Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
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
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ELEVENLABS_VOICES).map(([key, voice]) => (
                        <SelectItem key={key} value={key}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Translation Controls */}
                {appMode === 'speech-to-text' && (
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
                          <span>Auto-translating...</span>
                        </div>
                      ) : (
                        'Translate'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

         {/* Settings Panel */}
         <AnimatePresence>
           {showSettings && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               transition={{ duration: 0.3 }}
               className="bg-card border border-border rounded-xl p-6 shadow-sm backdrop-blur-sm overflow-hidden"
             >
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                   <Settings className="w-5 h-5" />
                   Advanced Settings
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {/* Audio Quality */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Audio Quality</label>
                     <Select defaultValue="high">
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="low">Low (8kHz)</SelectItem>
                         <SelectItem value="medium">Medium (16kHz)</SelectItem>
                         <SelectItem value="high">High (44kHz)</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   
                   {/* Speech Speed */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Speech Speed</label>
                     <Select defaultValue="normal">
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="slow">Slow (0.75x)</SelectItem>
                         <SelectItem value="normal">Normal (1x)</SelectItem>
                         <SelectItem value="fast">Fast (1.25x)</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   
                   {/* Auto-translate */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground">Auto-translate</label>
                     <div className="flex items-center space-x-2">
                       <input type="checkbox" id="auto-translate" className="rounded" />
                       <label htmlFor="auto-translate" className="text-sm text-muted-foreground">
                         Automatically translate speech
                       </label>
                     </div>
                   </div>
                 </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Translation Results - Only show in speech-to-text mode */}
        {appMode === 'speech-to-text' && (translatedText || translationStatus === 'error') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600" />
                Translation Result
              </h3>
            </div>
            <motion.div 
              className="min-h-[100px] bg-gradient-to-br from-muted/30 to-muted/10 border border-dashed border-border/50 rounded-xl p-4 backdrop-blur-sm"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              {translationStatus === 'error' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center space-y-2">
                    <div className="text-red-500 text-lg">⚠️</div>
                    <p className="text-sm text-red-600 font-medium">Translation Failed</p>
                    <p className="text-xs text-muted-foreground max-w-xs break-words">
                      {errorMessage || 'Please check your API key configuration and try again.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Languages className="w-4 h-4" />
                      Translation
                    </div>
                    <div className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                      {translatedText || 'No translation available'}
                    </div>
                  </div>
                  {translationStatus === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 text-xs text-green-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Translation completed</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
});