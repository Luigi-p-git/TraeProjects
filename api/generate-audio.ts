import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AudioGenerationRequest {
  text: string;
  voice_id: string;
  model_id?: string;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

// Curated list of high-quality ElevenLabs voices
const VOICE_PRESETS: Record<string, ElevenLabsVoice> = {
  'deep-male-narrator': {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - Deep male voice
    name: 'Deep Male Narrator',
    category: 'narrative'
  },
  'calm-female-voice': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - Calm female voice
    name: 'Calm Female Voice',
    category: 'conversational'
  },
  'professional-male': {
    voice_id: 'VR6AewLTigWG4xSOukaG', // Arnold - Professional male
    name: 'Professional Male',
    category: 'business'
  },
  'warm-female': {
    voice_id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - Warm female
    name: 'Warm Female',
    category: 'friendly'
  },
  'cinematic-male': {
    voice_id: 'bVMeCyTHy58xNoL34h3p', // Jeremy - Cinematic male
    name: 'Cinematic Male',
    category: 'dramatic'
  },
  'gentle-female': {
    voice_id: 'AZnzlk1XvdvUeBnXmlld', // Domi - Gentle female
    name: 'Gentle Female',
    category: 'soothing'
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        message: 'ElevenLabs API key not found in environment.'
      });
    }

    const { text, voice_id, model_id = 'eleven_monolingual_v1' }: AudioGenerationRequest = req.body;

    // Validate input
    if (!text || !voice_id) {
      return res.status(400).json({
        message: 'Missing required fields: text and voice_id'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        message: 'Text too long. Maximum 5000 characters allowed.'
      });
    }

    // Validate voice_id exists in our presets
    const voiceExists = Object.values(VOICE_PRESETS).some(preset => preset.voice_id === voice_id);
    if (!voiceExists) {
      return res.status(400).json({
        message: 'Invalid voice_id. Please use one of the available voice presets.'
      });
    }

    console.log(`Generating audio for text: "${text.substring(0, 50)}..." with voice: ${voice_id}`);

    // Call ElevenLabs API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', elevenLabsResponse.status, errorText);
      
      if (elevenLabsResponse.status === 401) {
        return res.status(500).json({
          message: 'Invalid ElevenLabs API key.'
        });
      }
      
      if (elevenLabsResponse.status === 429) {
        return res.status(429).json({
          message: 'Rate limit exceeded. Please try again later.'
        });
      }
      
      return res.status(500).json({
        message: 'Failed to generate audio from ElevenLabs API.'
      });
    }

    // Get the audio data as buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    
    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send the audio data
    res.status(200).send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('Audio generation error:', error);
    return res.status(500).json({
      message: 'Internal server error during audio generation.'
    });
  }
}

// Export voice presets for frontend use
export { VOICE_PRESETS };