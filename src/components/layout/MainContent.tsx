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
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Play, Pause, Square, Languages, Volume2, Settings } from "lucide-react";

interface MainContentProps {
  className?: string;
}

type AppMode = 'speech-to-text' | 'text-to-speech';

export function MainContent({ className }: MainContentProps) {
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("en-US");
  const [targetLanguage, setTargetLanguage] = useState<string>("EN");
  const [appMode, setAppMode] = useState<AppMode>('speech-to-text');
  const [showSettings, setShowSettings] = useState(false);
  
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
            
            {/* Settings Button */}
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
                            Listening...
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
                      <Volume2 className="w-5 h-5" />
                      Text to Speech
                    </h3>
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
                        value={transcribedText}
                        onChange={(e) => {
                          // You can add a state for text input here
                        }}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {transcribedText?.length || 0} characters
                        </div>
                        <motion.button
                          onClick={handlePlayText}
                          disabled={!transcribedText || isPlaying}
                          className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all",
                            !transcribedText || isPlaying
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                          )}
                          whileHover={transcribedText && !isPlaying ? { scale: 1.05 } : {}}
                          whileTap={transcribedText && !isPlaying ? { scale: 0.95 } : {}}
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
              </h3>
              
              <div className="flex items-center gap-3">
                {appMode === 'speech-to-text' && (
                  <>
                    {/* Record Button - Large Pill Shape */}
                    <motion.button
                      onClick={toggleTranscription}
                      disabled={status === 'Error'}
                      className={cn(
                        "flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg",
                        isListening
                          ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                          : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground",
                        status === 'Error' && "opacity-50 cursor-not-allowed"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                      transition={isListening ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-6 h-6" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-6 h-6" />
                          Start Recording
                        </>
                      )}
                    </motion.button>
                    
                    {/* Clear Button */}
                    <motion.button
                      onClick={clearTranscription}
                      disabled={!transcribedText}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                        !transcribedText
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-secondary/80 hover:bg-secondary text-secondary-foreground hover:scale-105"
                      )}
                      whileHover={transcribedText ? { scale: 1.05 } : {}}
                      whileTap={transcribedText ? { scale: 0.95 } : {}}
                    >
                      Clear
                    </motion.button>
                    
                    {/* Export Button */}
                    <motion.button
                      disabled={!transcribedText}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                        !transcribedText
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-accent/80 hover:bg-accent text-accent-foreground hover:scale-105"
                      )}
                      whileHover={transcribedText ? { scale: 1.05 } : {}}
                      whileTap={transcribedText ? { scale: 0.95 } : {}}
                    >
                      Export
                    </motion.button>
                  </>
                )}
              </div>
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
                          <span>Translating...</span>
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
}