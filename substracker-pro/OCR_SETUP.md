# OCR Configuration Guide

## OCR.space API Setup Guide

### 🚨 IMPORTANTE: Configuración de API Key

Para que el OCR funcione correctamente, **DEBES** configurar una API key válida.

### 1. Obtener tu API Key

1. **Visita** [OCR.space API](https://ocr.space/ocrapi)
2. **Regístrate** para una cuenta gratuita
3. **Verifica tu email** (paso crítico)
4. **Ve a tu dashboard** para obtener tu API key
5. **Copia la API key** completa

### 2. Configurar Variables de Entorno

**Crea** un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_OCR_SPACE_API_KEY=tu_api_key_aqui
```

**⚠️ CRÍTICO:** 
- Reemplaza `tu_api_key_aqui` con tu API key real
- La API key debe estar verificada en OCR.space
- Sin API key válida, el OCR fallará siempre

### 3. Límites del Tier Gratuito

- 25,000 requests por mes
- Tamaño máximo de archivo: 1MB
- Formatos soportados: PDF, PNG, JPG, GIF, BMP, TIFF

### How It Works

1. **Upload**: Users drag and drop invoice files
2. **OCR Processing**: Files are sent to OCR.space API for text extraction
3. **Smart Parsing**: Extracted text is analyzed to identify:
   - Service name (Spotify, Netflix, etc.)
   - Price and currency
   - Billing dates
   - Service category
4. **Auto-Add**: Subscription is automatically added to your dashboard

### Supported Services

The OCR system can automatically detect and categorize:

- **Entertainment**: Spotify, Netflix
- **Technology**: Apple, Google, Microsoft
- **Productivity**: Microsoft Office 365
- **Design**: Adobe Creative Suite
- **Storage**: Dropbox
- **Communication**: Zoom, Slack
- **Shopping**: Amazon Prime

### Fallback Mode

If no API key is provided, the system will:
- Use OCR.space's free tier (limited)
- Still extract basic text from documents
- Apply intelligent parsing for subscription data

### Testing

1. **Start the development server**: `npm run dev`
2. **Upload a test invoice**: Use the "Scan Invoice" button
3. **Check extraction**: Verify that service details are correctly identified

### Troubleshooting

**Common Issues:**

1. **"OCR processing failed"**:
   - Check your API key is correct
   - Ensure file size is under 1MB
   - Verify file format is supported

2. **"No text extracted"**:
   - Try a higher quality image
   - Ensure text is clearly visible
   - Check if document is rotated correctly

3. **Wrong service detected**:
   - The system uses pattern matching
   - Manual editing is available after extraction
   - Consider improving document quality

### API Usage Monitoring

To monitor your API usage:
1. Log into your OCR.space account
2. Check the dashboard for daily usage
3. Upgrade to PRO tier if needed for higher limits

### Security Notes

- API keys are stored in environment variables
- Files are processed securely through OCR.space
- No invoice data is stored permanently
- All processing happens in real-time

---

**Need Help?** Check the [OCR.space documentation](https://ocr.space/ocrapi) for more details.