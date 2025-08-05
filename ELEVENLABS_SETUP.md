# ElevenLabs Integration Setup

## Overview

VoicePal now uses ElevenLabs' world-class AI voices for text-to-speech generation, providing professional-quality audio output and download capabilities.

## Setup Instructions

### 1. Get Your ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io/) and create an account
2. Navigate to your profile settings
3. Generate an API key from the API section
4. Copy your API key (it starts with `sk-`)

### 2. Environment Configuration

#### For Local Development
Create a `.env.local` file in the project root:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

#### For Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - **Name**: `ELEVENLABS_API_KEY`
   - **Value**: Your ElevenLabs API key
   - **Environments**: Production, Preview, Development

### 3. Available Voices

The application includes 6 curated high-quality voices:

- **Deep Male Narrator** - Perfect for storytelling and narration
- **Calm Female Voice** - Ideal for conversational content
- **Professional Male** - Great for business and formal content
- **Warm Female** - Friendly and approachable tone
- **Cinematic Male** - Dramatic and engaging delivery
- **Gentle Female** - Soothing and calming voice

### 4. Features

#### Text-to-Speech Generation
- Select any of the 6 premium voices
- Generate high-quality audio from text input
- Real-time playback with professional audio quality

#### Audio Download
- Download generated audio as high-quality MP3 files
- Automatic filename generation with timestamp and voice name
- Files saved as: `voicepal-{voice-name}-{timestamp}.mp3`

#### Usage Limits
- Text input limited to 5,000 characters per request
- API usage depends on your ElevenLabs subscription plan
- Free tier includes 10,000 characters per month

### 5. Troubleshooting

#### "ElevenLabs API key not found" Error
- Ensure your API key is correctly set in environment variables
- Restart your development server after adding the API key
- Verify the API key is valid and active in your ElevenLabs account

#### "Rate limit exceeded" Error
- You've reached your monthly character limit
- Upgrade your ElevenLabs plan or wait for the next billing cycle

#### Audio Generation Fails
- Check your internet connection
- Verify your ElevenLabs account is in good standing
- Ensure the text input is not empty and under 5,000 characters

### 6. API Costs

ElevenLabs pricing is based on characters processed:
- **Free**: 10,000 characters/month
- **Starter**: $5/month for 30,000 characters
- **Creator**: $22/month for 100,000 characters
- **Pro**: $99/month for 500,000 characters

For current pricing, visit [ElevenLabs Pricing](https://elevenlabs.io/pricing)

### 7. Security Notes

- Never commit your API key to version control
- Use environment variables for all deployments
- The serverless function at `/api/generate-audio.ts` securely handles API calls
- Your API key is never exposed to the frontend

---

**Note**: Without a valid ElevenLabs API key, the text-to-speech functionality will not work. The application will show error messages when attempting to generate or download audio.