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
    const apiKey = process.env.DEEPL_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        message: 'DeepL API key not found in environment.'
      });
    }

    // Parse request body
    const { text, targetLang, sourceLang } = req.body;

    // Validate input
    if (!text || !targetLang) {
      return res.status(400).json({
        message: 'Missing required fields: text and targetLang'
      });
    }

    // Validate text length (DeepL has limits)
    if (text.length > 5000) {
      return res.status(400).json({
        message: 'Text too long. Maximum 5000 characters allowed.'
      });
    }

    // Prepare DeepL API request
    const deeplUrl = 'https://api-free.deepl.com/v2/translate';
    const params = new URLSearchParams({
      'auth_key': apiKey,
      'text': text,
      'target_lang': targetLang.toUpperCase(),
    });

    // Add source language if provided
    if (sourceLang) {
      params.append('source_lang', sourceLang.toUpperCase());
    }

    // Make request to DeepL API
    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API Error:', response.status, errorText);
      
      if (response.status === 403) {
        return res.status(403).json({
          message: 'Invalid DeepL API key or quota exceeded.'
        });
      }
      
      if (response.status === 456) {
        return res.status(400).json({
          message: 'Quota exceeded. Please check your DeepL usage.'
        });
      }
      
      return res.status(500).json({
        message: `DeepL API error: ${response.status}`
      });
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.translations || !Array.isArray(data.translations) || data.translations.length === 0) {
      return res.status(500).json({
        message: 'Invalid response from DeepL API'
      });
    }

    // Return translated text
    return res.status(200).json({
      translated_text: data.translations[0].text
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Unable to connect to translation service. Please try again later.'
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        message: 'Translation request timed out. Please try again.'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      message: 'Internal server error during translation.'
    });
  }
}