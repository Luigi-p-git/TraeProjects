import { useState, useRef } from 'react';

// ElevenLabs voice presets
export const ELEVENLABS_VOICES = {
  'deep-male-narrator': {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Deep Male Narrator',
    category: 'narrative'
  },
  'calm-female-voice': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Calm Female Voice',
    category: 'conversational'
  },
  'professional-male': {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Professional Male',
    category: 'business'
  },
  'warm-female': {
    voice_id: 'ThT5KcBeYPX3keUQqHPh',
    name: 'Warm Female',
    category: 'friendly'
  },
  'cinematic-male': {
    voice_id: 'bVMeCyTHy58xNoL34h3p',
    name: 'Cinematic Male',
    category: 'dramatic'
  },
  'gentle-female': {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Gentle Female',
    category: 'soothing'
  }
} as const;

type ElevenLabsVoiceKey = keyof typeof ELEVENLABS_VOICES;

type TTSStatus = 'idle' | 'generating' | 'speaking' | 'error';

interface TTSHook {
  isPlaying: boolean;
  status: TTSStatus;
  selectedVoice: ElevenLabsVoiceKey;
  setSelectedVoice: (voice: ElevenLabsVoiceKey) => void;
  speak: (text: string) => Promise<void>;
  stopSpeech: () => Promise<void>;
  downloadAudio: (text: string, filename?: string) => Promise<void>;
  lastGeneratedAudio: string | null;
}

export function useTTS(): TTSHook {
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoiceKey>('calm-female-voice');
  const [lastGeneratedAudio, setLastGeneratedAudio] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);

  const generateAudio = async (text: string): Promise<string> => {
    if (!text.trim()) {
      throw new Error('No text provided for audio generation');
    }

    setStatus('generating');

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: ELEVENLABS_VOICES[selectedVoice].voice_id,
          model_id: 'eleven_monolingual_v1'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      
      // Create object URL for the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio URL
      if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
      }
      
      currentAudioUrl.current = audioUrl;
      setLastGeneratedAudio(audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      setStatus('error');
      throw error;
    }
  };

  const speak = async (text: string) => {
    if (!text.trim()) return;

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Generate new audio
      const audioUrl = await generateAudio(text);
      
      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set up event listeners
      audio.onloadstart = () => {
        setStatus('speaking');
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setStatus('idle');
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setStatus('error');
        console.error('Audio playback error');
      };
      
      // Start playback
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setStatus('error');
    }
  };

  const stopSpeech = async () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error('Stop speech error:', error);
    } finally {
      setIsPlaying(false);
      setStatus('idle');
    }
  };

  const downloadAudio = async (text: string, filename?: string) => {
    if (!text.trim()) {
      throw new Error('No text provided for download');
    }

    try {
      setStatus('generating');
      
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: ELEVENLABS_VOICES[selectedVoice].voice_id,
          model_id: 'eleven_monolingual_v1'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const voiceName = ELEVENLABS_VOICES[selectedVoice].name.replace(/\s+/g, '-').toLowerCase();
      const defaultFilename = `voicepal-${voiceName}-${timestamp}.mp3`;
      
      link.download = filename || defaultFilename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      
      setStatus('idle');
      
    } catch (error) {
      console.error('Download error:', error);
      setStatus('error');
      throw error;
    }
  };

  return {
    isPlaying,
    status,
    selectedVoice,
    setSelectedVoice,
    speak,
    stopSpeech,
    downloadAudio,
    lastGeneratedAudio
  };
}