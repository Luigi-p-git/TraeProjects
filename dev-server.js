import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple translation handler without importing TS file
const translateAPI = async (text, targetLang) => {
  const apiKey = process.env.DEEPL_API_KEY;
  
  if (!apiKey || apiKey === 'your_deepl_api_key_here') {
    throw new Error('DeepL API key not configured');
  }

  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.translations[0].text;
};

// API route handler
app.post('/api/translate', async (req, res) => {
  console.log('🔄 Translation request received:', req.body);
  
  try {
    const { text, targetLang, sourceLang } = req.body;
    
    if (!text || !targetLang) {
      console.log('❌ Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters: text and targetLang' });
    }
    
    console.log(`🌐 Translating "${text}" from ${sourceLang || 'auto'} to ${targetLang}`);
    const translatedText = await translateAPI(text, targetLang);
    console.log(`✅ Translation successful: "${translatedText}"`);
    
    res.json({ translated_text: translatedText });
  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.options('/api/translate', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});