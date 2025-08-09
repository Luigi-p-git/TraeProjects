import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TranslationRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

interface DeepLResponse {
  translations: Array<{
    text: string;
  }>;
}

interface TranslationResult {
  translated_text: string;
}

interface TranslationError {
  message: string;
}

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
    const apiKey = process.env.DEEPL_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        message: 'DeepL API key not found in environment.'
      } as TranslationError);
    }

    if (apiKey === 'your_deepl_api_key_here') {
      return res.status(500).json({
        message: 'API key is a placeholder. Please set a valid DeepL API key.'
      } as TranslationError);
    }

    // Parse request body
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
    
    const { text, targetLang, sourceLang }: TranslationRequest = body;

    if (!text || !targetLang) {
      return res.status(400).json({
        message: 'Missing required fields: text and targetLang'
      } as TranslationError);
    }

    // Prepare request body for DeepL API (JSON format)
    const requestBody: any = {
      text: [text], // DeepL expects text as an array
      target_lang: targetLang,
    };

    if (sourceLang) {
      requestBody.source_lang = sourceLang;
    }

    // Make request to DeepL API
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`DeepL API Error (Status: ${response.status}): ${errorBody}`);
      
      return res.status(response.status).json({
        message: `DeepL API Error (Status: ${response.status}): ${errorBody}`
      } as TranslationError);
    }

    // Parse successful response
    const deepLResponse: DeepLResponse = await response.json();

    // Extract translated text
    const translatedText = deepLResponse.translations?.[0]?.text;
    
    if (!translatedText) {
      return res.status(500).json({
        message: 'No translation found in DeepL response.'
      } as TranslationError);
    }

    // Return successful translation
    return res.status(200).json({
      translated_text: translatedText
    } as TranslationResult);

  } catch (error) {
    console.error('Translation error:', error);
    
    return res.status(500).json({
      message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as TranslationError);
  }
}