interface TranslationResponse {
  word: string;
  translation: string;
  partOfSpeech?: string;
  definition?: string;
  examples?: string[];
}

export class TranslationService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private cache = new Map<string, TranslationResponse>();

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async translateWord(word: string): Promise<TranslationResponse> {
    // Check cache first
    const cacheKey = word.toLowerCase();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `Traduce la palabra francesa "${word}" al español. Responde ÚNICAMENTE con un JSON válido en este formato exacto:

{
  "word": "${word}",
  "translation": "traducción principal en español",
  "partOfSpeech": "sustantivo/verbo/adjetivo/etc",
  "definition": "definición breve en español",
  "examples": ["ejemplo 1 en francés = traducción", "ejemplo 2 en francés = traducción"]
}

Si la palabra no existe o no es francesa, usa "No encontrado" como traducción.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          // Clean the response text to handle markdown-wrapped JSON
          let cleanedText = responseText.trim();
          
          // Remove markdown code blocks if present
          if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsed = JSON.parse(cleanedText) as TranslationResponse;
          
          // Cache the result
          this.cache.set(cacheKey, parsed);
          
          return parsed;
        } catch (parseError) {
          console.error('Failed to parse translation response:', responseText);
          
          // Fallback response
          const fallback: TranslationResponse = {
            word,
            translation: 'Traducción no disponible'
          };
          
          return fallback;
        }
      }
      
      throw new Error('Invalid response from translation API');
    } catch (error) {
      console.error('Translation error:', error);
      
      // Return fallback response
      return {
        word,
        translation: 'Error de traducción'
      };
    }
  }

  async createFlashcard(word: string): Promise<{
    front: string;
    back: string;
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
  }> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `Crea una flashcard para aprender la palabra francesa "${word}". Responde ÚNICAMENTE con un JSON válido en este formato:

{
  "front": "palabra en francés con artículo si aplica",
  "back": "traducción en español + pronunciación [fonética]",
  "hint": "pista útil o mnemotécnica en español",
  "difficulty": "easy/medium/hard",
  "category": "categoría (ej: animales, comida, verbos, etc.)"
}

Haz la flashcard educativa y útil para un estudiante de francés.`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 30,
            topP: 0.9,
            maxOutputTokens: 256,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Flashcard API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          // Clean the response text to extract only the JSON part
          const cleanedText = responseText.replace(/```json\n?|```\n?/g, '').trim();
          return JSON.parse(cleanedText);
        } catch (parseError) {
          console.error('Failed to parse flashcard response:', responseText);
          
          // Fallback flashcard
          return {
            front: word,
            back: 'Traducción no disponible',
            difficulty: 'medium' as const,
            category: 'general'
          };
        }
      }
      
      throw new Error('Invalid response from flashcard API');
    } catch (error) {
      console.error('Flashcard creation error:', error);
      
      // Return fallback flashcard
      return {
        front: word,
        back: 'Error al crear flashcard',
        difficulty: 'medium' as const,
        category: 'general'
      };
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_gemini_api_key_here');
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();