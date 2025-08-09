import { NextRequest, NextResponse } from 'next/server';
import { ocrSpace } from 'ocr-space-api-wrapper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Process with OCR.space API
    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY;
    
    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('Using API key:', apiKey ? 'Yes (configured)' : 'No - using free tier');
    
    if (!apiKey) {
      console.warn('⚠️ No API key configured. OCR may fail. Please configure NEXT_PUBLIC_OCR_SPACE_API_KEY in .env.local');
    }
    
    // Enhanced OCR configuration for better PDF processing
    const ocrOptions = {
      apiKey: apiKey || undefined, // Use free tier if no API key
      language: 'eng' as const,
      isOverlayRequired: false,
      detectOrientation: true,
      scale: true,
      isTable: false, // Disable table detection for better text extraction
      OCREngine: 2, // Use OCR Engine 2 for better accuracy
      isSearchablePdfHideTextLayer: true, // For searchable PDFs
      filetype: file.type.includes('pdf') ? 'PDF' : 'Auto'
    };
    
    console.log('OCR Options:', ocrOptions);
    
    let result = await ocrSpace(base64, ocrOptions);

    console.log('OCR Result (first attempt):', JSON.stringify(result, null, 2));

    // If first attempt fails, try with different settings
    if (!result || !result.ParsedResults || result.ParsedResults.length === 0 || 
        (result.ParsedResults[0] && result.ParsedResults[0].ErrorMessage)) {
      
      console.log('First OCR attempt failed, trying alternative configuration...');
      
      const fallbackOptions = {
        apiKey: apiKey || undefined,
        language: 'eng' as const,
        isOverlayRequired: false,
        detectOrientation: false,
        scale: false,
        isTable: true, // Try with table detection
        OCREngine: 1, // Try OCR Engine 1
        filetype: 'Auto'
      };
      
      result = await ocrSpace(base64, fallbackOptions);
      console.log('OCR Result (fallback attempt):', JSON.stringify(result, null, 2));
    }

    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      const parseResult = result.ParsedResults[0];
      
      // Check if there was an error in parsing
      if (parseResult.ErrorMessage) {
        console.error('OCR Parse Error:', parseResult.ErrorMessage);
        return NextResponse.json(
          { 
            error: `OCR Error: ${parseResult.ErrorMessage}`,
            suggestion: 'Try uploading a clearer image or a different file format'
          },
          { status: 400 }
        );
      }
      
      const extractedText = parseResult.ParsedText;
      
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'No text found in the document',
            suggestion: 'Make sure the document contains readable text and try again'
          },
          { status: 400 }
        );
      }
      
      console.log('Extracted text:', extractedText);
      
      // Extract subscription data from text
      const subscriptionData = extractSubscriptionData(extractedText);
      
      return NextResponse.json({
        success: true,
        text: extractedText,
        extractedData: subscriptionData
      });
    } else {
      // Check if there's an error message in the result
      const errorMessage = result?.ErrorMessage || 'Unknown OCR error';
      console.error('OCR processing failed:', errorMessage);
      
      // Provide specific guidance based on error type
      let suggestion = 'Please check your file format and try again. Supported formats: PDF, PNG, JPG, GIF, BMP, TIFF';
      
      if (errorMessage.includes('API key') || errorMessage.includes('invalid')) {
        suggestion = '🔑 API Key Error: Please configure a valid OCR.space API key in .env.local. Visit https://ocr.space/ocrapi to get your free API key.';
      } else if (errorMessage.includes('file size') || errorMessage.includes('too large')) {
        suggestion = '📁 File too large: Please use a file smaller than 1MB or compress your document.';
      } else if (errorMessage.includes('format') || errorMessage.includes('unsupported')) {
        suggestion = '📄 Unsupported format: Please use PDF, PNG, JPG, GIF, BMP, or TIFF format.';
      }
      
      return NextResponse.json(
        { 
          error: `OCR processing failed: ${errorMessage}`,
          suggestion,
          errorType: errorMessage.includes('API key') ? 'api_key' : 'processing'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

function extractSubscriptionData(ocrText: string) {
  try {
    const text = ocrText.toLowerCase();
    console.log('Extracting data from text:', text.substring(0, 200) + '...');
    
    // Enhanced subscription service patterns
    const servicePatterns = {
      spotify: /spotify\s*(premium|plus|family)?/i,
      netflix: /netflix\s*(basic|standard|premium)?/i,
      amazon: /amazon\s*(prime|music|video)?/i,
      apple: /apple\s*(music|tv|icloud|one)?/i,
      google: /google\s*(one|drive|workspace|youtube\s*premium)?/i,
      microsoft: /microsoft\s*(365|office|teams)?/i,
      adobe: /adobe\s*(creative\s*cloud|acrobat|photoshop)?/i,
      dropbox: /dropbox\s*(plus|professional|business)?/i,
      zoom: /zoom\s*(pro|business|enterprise)?/i,
      slack: /slack\s*(pro|business)?/i,
      disney: /disney\s*(plus|\+)?/i,
      hulu: /hulu/i,
      paramount: /paramount\s*(plus|\+)?/i,
      hbo: /hbo\s*(max)?/i,
      twitch: /twitch\s*(prime|turbo)?/i,
      github: /github\s*(pro|team|enterprise)?/i,
      figma: /figma\s*(professional|organization)?/i,
      notion: /notion\s*(personal|team|enterprise)?/i
    };

    // Detect service name
    let serviceName = 'Unknown Service';
    let category = 'Other';
    
    for (const [service, pattern] of Object.entries(servicePatterns)) {
      if (pattern.test(text)) {
        serviceName = service.charAt(0).toUpperCase() + service.slice(1);
        category = getCategoryForService(service);
        break;
      }
    }

    // Enhanced price extraction patterns
    const pricePatterns = [
      // Standard currency symbols
      /\$\s*([0-9]+(?:\.[0-9]{1,2})?)/g,
      /€\s*([0-9]+(?:\.[0-9]{1,2})?)/g,
      /£\s*([0-9]+(?:\.[0-9]{1,2})?)/g,
      // Price with currency words
      /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:usd|dollars?)/gi,
      /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:eur|euros?)/gi,
      /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:gbp|pounds?)/gi,
      // Common pricing contexts
      /(?:price|cost|amount|total|charge)\s*:?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,
      /(?:monthly|annual|yearly)\s*:?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,
      // Invoice/receipt patterns
      /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:per\s*month|monthly|mo)/gi
    ];
    
    let price = 9.99; // Default fallback
    let currency = 'USD';
    
    console.log('Searching for price patterns in text...');
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        price = parseFloat(match[1]);
        if (text.includes('€')) currency = 'EUR';
        else if (text.includes('£')) currency = 'GBP';
        break;
      }
    }

    // Enhanced date extraction patterns
    const datePatterns = [
      // MM/DD/YYYY and DD/MM/YYYY
      /([0-9]{1,2})[\/-]([0-9]{1,2})[\/-]([0-9]{4})/g,
      // YYYY-MM-DD (ISO format)
      /([0-9]{4})[\/-]([0-9]{1,2})[\/-]([0-9]{1,2})/g,
      // Month DD, YYYY
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+([0-9]{1,2}),?\s+([0-9]{4})/gi,
      // DD Month YYYY
      /([0-9]{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+([0-9]{4})/gi,
      // Billing/Invoice date contexts
      /(?:billing|invoice|due|charge)\s*date\s*:?\s*([0-9]{1,2}[\/-][0-9]{1,2}[\/-][0-9]{4})/gi,
      /(?:billing|invoice|due|charge)\s*date\s*:?\s*([0-9]{4}[\/-][0-9]{1,2}[\/-][0-9]{1,2})/gi,
      // Next billing patterns
      /(?:next|upcoming)\s*(?:billing|charge|payment)\s*:?\s*([0-9]{1,2}[\/-][0-9]{1,2}[\/-][0-9]{4})/gi
    ];
    
    let billingDate = new Date().toISOString().split('T')[0];
    
    console.log('Searching for date patterns in text...');
    
    for (const pattern of datePatterns) {
       const matches = Array.from(text.matchAll(pattern));
       for (const match of matches) {
        try {
          let dateStr = match[1] || match[0];
          // Handle contextual matches (where date is in a capture group)
          if (match.length > 2) {
            dateStr = match[0];
          }
          
          const date = new Date(dateStr);
          if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
            billingDate = date.toISOString().split('T')[0];
            console.log('Found billing date:', billingDate);
            break;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
      if (billingDate !== new Date().toISOString().split('T')[0]) break;
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

function getCategoryForService(service: string): string {
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