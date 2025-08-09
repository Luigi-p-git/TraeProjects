import { ocrSpace } from 'ocr-space-api-wrapper';

export interface OCRResult {
  success: boolean;
  text: string;
  error?: string;
}

export interface ExtractedSubscriptionData {
  serviceName: string;
  price: number;
  billingDate: string;
  nextChargeDate: string;
  category: string;
  currency: string;
}

class OCRService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY || '';
  }

  async processDocument(file: File): Promise<OCRResult> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      // Use OCR.space API
      const result = await ocrSpace(base64, {
        apiKey: this.apiKey || undefined, // Use free tier if no API key
        language: 'eng',
        isOverlayRequired: false,
        detectOrientation: true,
        scale: true,
        isTable: true
      });

      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        return {
          success: true,
          text: extractedText
        };
      } else {
        return {
          success: false,
          text: '',
          error: 'No text could be extracted from the document'
        };
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  extractSubscriptionData(ocrText: string): ExtractedSubscriptionData | null {
    try {
      const text = ocrText.toLowerCase();
      
      // Common subscription service patterns
      const servicePatterns = {
        spotify: /spotify/i,
        netflix: /netflix/i,
        amazon: /amazon|prime/i,
        apple: /apple|icloud/i,
        google: /google|youtube/i,
        microsoft: /microsoft|office|365/i,
        adobe: /adobe/i,
        dropbox: /dropbox/i,
        zoom: /zoom/i,
        slack: /slack/i
      };

      // Detect service name
      let serviceName = 'Unknown Service';
      let category = 'Other';
      
      for (const [service, pattern] of Object.entries(servicePatterns)) {
        if (pattern.test(text)) {
          serviceName = service.charAt(0).toUpperCase() + service.slice(1);
          category = this.getCategoryForService(service);
          break;
        }
      }

      // Extract price (look for currency symbols and amounts)
      const pricePatterns = [
        /\$([0-9]+\.?[0-9]*)/,
        /€([0-9]+\.?[0-9]*)/,
        /£([0-9]+\.?[0-9]*)/,
        /([0-9]+\.?[0-9]*)\s*(?:usd|eur|gbp|dollars?|euros?|pounds?)/i
      ];
      
      let price = 9.99; // Default fallback
      let currency = 'USD';
      
      for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
          price = parseFloat(match[1]);
          if (text.includes('€')) currency = 'EUR';
          else if (text.includes('£')) currency = 'GBP';
          break;
        }
      }

      // Extract dates (look for common date patterns)
      const datePatterns = [
        /([0-9]{1,2})[\/-]([0-9]{1,2})[\/-]([0-9]{4})/,
        /([0-9]{4})[\/-]([0-9]{1,2})[\/-]([0-9]{1,2})/,
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+([0-9]{1,2}),?\s+([0-9]{4})/i
      ];
      
      let billingDate = new Date().toISOString().split('T')[0];
      
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          try {
            const date = new Date(match[0]);
            if (!isNaN(date.getTime())) {
              billingDate = date.toISOString().split('T')[0];
              break;
            }
          } catch (e) {
            // Continue to next pattern
          }
        }
      }

      // Calculate next charge date (assume monthly billing)
      const nextCharge = new Date(billingDate);
      nextCharge.setMonth(nextCharge.getMonth() + 1);
      const nextChargeDate = nextCharge.toISOString().split('T')[0];

      return {
        serviceName,
        price,
        billingDate,
        nextChargeDate,
        category,
        currency
      };
    } catch (error) {
      console.error('Error extracting subscription data:', error);
      return null;
    }
  }

  private getCategoryForService(service: string): string {
    const categoryMap: { [key: string]: string } = {
      spotify: 'Entertainment',
      netflix: 'Entertainment',
      amazon: 'Shopping',
      apple: 'Technology',
      google: 'Technology',
      microsoft: 'Productivity',
      adobe: 'Design',
      dropbox: 'Storage',
      zoom: 'Communication',
      slack: 'Communication'
    };
    
    return categoryMap[service] || 'Other';
  }
}

export const ocrService = new OCRService();