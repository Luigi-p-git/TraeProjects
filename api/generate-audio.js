// Curated list of high-quality ElevenLabs voices
const VOICE_PRESETS = {
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

export default async function handler(req, res) {
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

    // Parse request body
    const { text, voice_id, model_id = 'eleven_monolingual_v1' } = req.body;

    // Validate input
    if (!text || !voice_id) {
      return res.status(400).json({
        message: 'Missing required fields: text and voice_id'
      });
    }

    // Validate text length (ElevenLabs has limits)
    if (text.length > 5000) {
      return res.status(400).json({
        message: 'Text too long. Maximum 5000 characters allowed.'
      });
    }

    // Find voice by voice_id (either preset key or actual ElevenLabs voice ID)
    let selectedVoice;
    
    // First check if it's a preset key
    if (VOICE_PRESETS[voice_id]) {
      selectedVoice = VOICE_PRESETS[voice_id];
    } else {
      // Check if it's an actual ElevenLabs voice ID
      const presetEntry = Object.entries(VOICE_PRESETS).find(([key, preset]) => preset.voice_id === voice_id);
      if (presetEntry) {
        selectedVoice = presetEntry[1];
      }
    }
    
    if (!selectedVoice) {
      return res.status(400).json({
        message: 'Invalid voice_id. Must be one of: ' + Object.keys(VOICE_PRESETS).join(', ') + ' or a valid ElevenLabs voice ID'
      });
    }

    // Prepare ElevenLabs API request
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.voice_id}`;
    
    const requestBody = {
      text: text,
      model_id: model_id,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    // Make request to ElevenLabs API
    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(401).json({
          message: 'Invalid ElevenLabs API key.'
        });
      }
      
      if (response.status === 402) {
        return res.status(402).json({
          message: 'ElevenLabs quota exceeded. Please check your subscription.'
        });
      }
      
      if (response.status === 422) {
        return res.status(400).json({
          message: 'Invalid request parameters for ElevenLabs API.'
        });
      }
      
      return res.status(500).json({
        message: `ElevenLabs API error: ${response.status}`
      });
    }

    // Get audio data as buffer
    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return res.status(500).json({
        message: 'No audio data received from ElevenLabs API'
      });
    }

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Add custom headers for voice info
    res.setHeader('X-Voice-Name', selectedVoice.name);
    res.setHeader('X-Voice-Category', selectedVoice.category);

    // Return audio data
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Audio generation error:', error);
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Unable to connect to ElevenLabs service. Please try again later.'
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        message: 'Audio generation request timed out. Please try again.'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      message: 'Internal server error during audio generation.'
    });
  }
}

export { VOICE_PRESETS };