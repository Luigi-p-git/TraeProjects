interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
  }>;
}

interface StructuredResponse {
  isCorrect: boolean;
  response: string;
  correction?: {
    original: string;
    corrected: string;
    explanation: string;
  };
  culturalTip?: string;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateResponse(message: string, context?: string, culturalTipsEnabled: boolean = true): Promise<StructuredResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    let systemPrompt = `Tu es PolyPal, un tuteur IA patient et encourageant spécialisé dans l'apprentissage du français. Tu parles comme une personne réelle, avec naturel et spontanéité. Ton objectif est de créer une expérience d'apprentissage intuitive et instructive.

Tu dois TOUJOURS répondre avec un JSON structuré contenant exactement ces champs:

1. "isCorrect" (boolean): true si le message de l'utilisateur est grammaticalement correct, false sinon
2. "response" (string): Ta réponse conversationnelle naturelle en français qui continue le dialogue
3. "correction" (objet optionnel): Seulement si isCorrect est false, inclus:
   - "original": Le texte original avec l'erreur
   - "corrected": La version corrigée
   - "explanation": Explication complète et claire de l'erreur en espagnol (minimum 2 phrases)
4. "culturalTip" (string optionnel): ${culturalTipsEnabled ? 'Conseil culturel pertinent SEULEMENT si vraiment approprié au contexte' : 'Toujours laisser vide ("") car les conseils culturels sont désactivés'}

${context ? `Contexte: ${context}` : ''}

Règles importantes:
- ${culturalTipsEnabled ? 'Inclus un "culturalTip" utile et intéressant quand c\'est approprié (contexte culturel, usage social, expressions idiomatiques, etc.)' : 'TOUJOURS laisser "culturalTip" vide ("") car cette fonctionnalité est désactivée'}
- L'explication des corrections doit être complète et détaillée en espagnol (minimum 2 phrases explicatives)
- Ta réponse doit être naturelle, comme si tu parlais à un ami
- Utilise des expressions françaises authentiques et variées
- Évite les réponses qui se terminent abruptement
- Sois encourageant et patient, jamais critique
- Assure-toi que tes réponses sont complètes et bien formées

Exemple de réponse avec correction:
{
  "isCorrect": false,
  "response": "Ah, je comprends parfaitement! Moi aussi, j'adore la musique. C'est quelque chose qui nous unit tous, n'est-ce pas? Dites-moi, quel genre de musique vous fait vibrer le plus?",
  "correction": {
    "original": "J'aime la musique beaucoup",
    "corrected": "J'aime beaucoup la musique",
    "explanation": "En francés, el adverbio 'beaucoup' se coloca generalmente después del verbo y antes del complemento directo. La estructura correcta es 'verbo + beaucoup + complemento', no al final de la frase como en español."
  },
  "culturalTip": "En France, la musique est très importante dans la culture. Les Français aiment particulièrement la chanson française et organisent souvent la 'Fête de la Musique' le 21 juin."
}

Exemple de réponse sans correction:
{
  "isCorrect": true,
  "response": "C'est absolument formidable! Vos projets m'intriguent beaucoup. J'aimerais vraiment en savoir davantage - de quoi s'agit-il exactement? Vous devez être très passionné par ce que vous faites!",
  "culturalTip": "En français professionnel, utiliser 'formidable' montre un enthousiasme positif. C'est plus chaleureux que 'bien' ou 'bon'."
}

IMPORTANT: 
- Réponds UNIQUEMENT avec un JSON valide, sans texte supplémentaire
- N'utilise JAMAIS de barres obliques (/) à la fin des phrases
- Assure-toi que toutes les chaînes de caractères sont correctement échappées
- Termine toujours tes réponses de manière naturelle et complète
- Vérifie que ton JSON est bien formé avant de répondre`;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nMessage de l'utilisateur: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const candidate = data.candidates[0];
        
        if (candidate.finishReason === 'SAFETY') {
          return {
            isCorrect: true,
            response: 'Désolé, je ne peux pas répondre à ce message pour des raisons de sécurité. Pouvez-vous reformuler votre question?'
          };
        }
        
        if (candidate.content.parts && candidate.content.parts[0]) {
          const responseText = candidate.content.parts[0].text;
          
          console.log('Raw API response:', responseText);
          
          try {
            // Clean the response text to handle markdown-wrapped JSON
            let cleanedText = responseText.trim();
            
            // Remove markdown code blocks if present
            if (cleanedText.startsWith('```json')) {
              cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedText.startsWith('```')) {
              cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Try to parse as JSON
            const parsed = JSON.parse(cleanedText) as StructuredResponse;
            console.log('Parsed response:', parsed);
            
            const cleanText = (text: string) => {
              return text
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\$/g, '')
                .replace(/\s*\\\s*$/g, '')
                .trim();
            };
            
            const result: StructuredResponse = {
              isCorrect: parsed.isCorrect ?? true,
              response: parsed.response ? cleanText(parsed.response) : 'Réponse non disponible'
            };
            
            if (parsed.correction) {
              result.correction = {
                original: cleanText(parsed.correction.original),
                corrected: cleanText(parsed.correction.corrected),
                explanation: cleanText(parsed.correction.explanation)
              };
            }
            
            if (parsed.culturalTip) {
              result.culturalTip = cleanText(parsed.culturalTip);
            }
            
            return result;
          } catch (parseError) {
            console.error('Failed to parse JSON response:', responseText);
            console.error('Parse error:', parseError);
            
            // If the response looks like JSON but failed to parse, extract fields manually
            if (responseText.includes('"response"')) {
              const responseMatch = responseText.match(/"response"\s*:\s*"([^"]*)"/); 
              const isCorrectMatch = responseText.match(/"isCorrect"\s*:\s*(true|false)/);
              const correctionMatch = responseText.match(/"correction"\s*:\s*\{[^}]*"original"\s*:\s*"([^"]*)"/); 
              const correctedMatch = responseText.match(/"corrected"\s*:\s*"([^"]*)"/); 
              const explanationMatch = responseText.match(/"explanation"\s*:\s*"([^"]*)"/); 
              const culturalTipMatch = responseText.match(/"culturalTip"\s*:\s*"([^"]*)"/); 
              
              const cleanText = (text: string) => {
                return text
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\$/g, '')
                  .replace(/\s*\\\s*$/g, '')
                  .trim();
              };
              
              const result: StructuredResponse = {
                isCorrect: isCorrectMatch ? isCorrectMatch[1] === 'true' : true,
                response: responseMatch ? cleanText(responseMatch[1]) : 'Réponse non disponible'
              };
              
              // Add correction if detected
              if (correctionMatch && correctedMatch && explanationMatch) {
                result.correction = {
                  original: cleanText(correctionMatch[1]),
                  corrected: cleanText(correctedMatch[1]),
                  explanation: cleanText(explanationMatch[1])
                };
              }
              
              // Add cultural tip if detected
              if (culturalTipMatch && culturalTipMatch[1]) {
                result.culturalTip = cleanText(culturalTipMatch[1]);
              }
              
              return result;
            }
            
            // Fallback to plain text response
            return {
              isCorrect: true,
              response: responseText
            };
          }
        }
      }
      
      throw new Error('Réponse inattendue de l\'API Gemini');
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de communication avec l\'API Gemini');
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_gemini_api_key_here');
  }
}

export const geminiService = new GeminiService();