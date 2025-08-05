import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use('/api', (req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Import and setup API routes
app.use('/api', async (req, res, next) => {
  try {
    const apiPath = req.path.substring(1); // Remove leading slash
    
    // For development, we'll handle the routes manually
    if (apiPath === 'translate') {
      const { default: handler } = await import('./api/translate.js');
      return handler(req, res);
    } else if (apiPath === 'generate-audio') {
      const { default: handler } = await import('./api/generate-audio.js');
      return handler(req, res);
    }
    
    res.status(404).json({ error: 'API endpoint not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/translate`);
  console.log(`   - POST http://localhost:${PORT}/api/generate-audio`);
}).on('error', (err) => {
  console.error('❌ Failed to start API server:', err);
  process.exit(1);
});