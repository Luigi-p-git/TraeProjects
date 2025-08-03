import { useState } from 'react';

type VoicePreset = 'normal' | 'cinematic';

type TTSStatus = 'idle' | 'speaking' | 'error';

interface TTSHook {
  isPlaying: boolean;
  status: TTSStatus;
  selectedVoice: VoicePreset;
  setSelectedVoice: (voice: VoicePreset) => void;
  speak: (text: string, languageCode?: string) => Promise<void>;
  stopSpeech: () => Promise<void>;
}

export function useTTS(): TTSHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>('normal');

  const speak = async (text: string, languageCode: string = 'en-US') => {
    if (!text.trim()) return;

    try {
      setIsPlaying(true);
      setStatus('speaking');

      // Check if we're in a Tauri environment
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('speak', { text, voicePreset: selectedVoice, languageCode });
      } else {
        // Fallback for web environment using Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Set language
          utterance.lang = languageCode;
          
          // Configure voice based on language and preset
          const voices = speechSynthesis.getVoices();
          let targetVoice;
          
          if (languageCode.startsWith('es')) {
            targetVoice = voices.find(voice => 
              voice.lang.startsWith('es') && 
              (selectedVoice === 'cinematic' ? 
                voice.name.toLowerCase().includes('diego') || voice.name.toLowerCase().includes('male') :
                voice.name.toLowerCase().includes('monica') || voice.name.toLowerCase().includes('female'))
            ) || voices.find(voice => voice.lang.startsWith('es'));
          } else if (languageCode.startsWith('fr')) {
            targetVoice = voices.find(voice => 
              voice.lang.startsWith('fr') && 
              (selectedVoice === 'cinematic' ? 
                voice.name.toLowerCase().includes('thomas') || voice.name.toLowerCase().includes('male') :
                voice.name.toLowerCase().includes('amelie') || voice.name.toLowerCase().includes('female'))
            ) || voices.find(voice => voice.lang.startsWith('fr'));
          } else {
            // English voices
            if (selectedVoice === 'cinematic') {
              targetVoice = voices.find(voice => 
                voice.lang.startsWith('en') && (
                  voice.name.toLowerCase().includes('alex') ||
                  voice.name.toLowerCase().includes('daniel') ||
                  voice.name.toLowerCase().includes('fred')
                )
              );
            } else {
              targetVoice = voices.find(voice => 
                voice.lang.startsWith('en') && (
                  voice.name.toLowerCase().includes('samantha') ||
                  voice.name.toLowerCase().includes('karen') ||
                  voice.default
                )
              );
            }
          }
          
          if (targetVoice) utterance.voice = targetVoice;
          
          // Configure rate and pitch based on preset
          if (selectedVoice === 'cinematic') {
            utterance.rate = 0.8;
            utterance.pitch = 0.8;
          } else {
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
          }

          utterance.onend = () => {
            setIsPlaying(false);
            setStatus('idle');
          };

          utterance.onerror = () => {
            setIsPlaying(false);
            setStatus('error');
          };

          speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported in this browser');
        }
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setStatus('error');
    }
  };

  const stopSpeech = async () => {
    try {
      // Check if we're in a Tauri environment
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('stop_speech');
      } else {
        // Fallback for web environment
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      }
    } catch (error) {
      console.error('Stop speech error:', error);
    } finally {
      setIsPlaying(false);
      setStatus('idle');
    }
  };

  return {
    isPlaying,
    status,
    selectedVoice,
    setSelectedVoice,
    speak,
    stopSpeech
  };
}