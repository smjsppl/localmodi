const express = require('express');
const router = express.Router();
// Using enhanced AI integration service with local NLP + Python AI
const aiIntegrationService = require('../services/aiIntegrationService');
const { validateParseOrder } = require('../middleware/validation');

// Parse order text endpoint
router.post('/parse-order', validateParseOrder, async (req, res, next) => {
  try {
    const { text, category } = req.body;
    
    console.log(`📝 Parsing order: "${text}" for category: ${category}`);
    
    // Use enhanced parsing with preprocessing + local NLP
    const result = await aiIntegrationService.enhancedParseOrder(text, category);
    
    console.log(`✅ Successfully parsed ${result.total_items} items`);
    res.json(result);
    
  } catch (error) {
    console.error('Order parsing error:', error);
    next(error);
  }
});

// Audio transcription endpoint
router.post('/transcribe-audio', async (req, res, next) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({
        error: 'No audio file provided'
      });
    }

    const audioFile = req.files.audio;
    const result = await aiIntegrationService.transcribeAudio(audioFile.data, audioFile.name);
    
    res.json(result);
  } catch (error) {
    console.error('Audio transcription error:', error);
    next(error);
  }
});

// Image OCR endpoint
router.post('/extract-image-text', async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }

    const imageFile = req.files.image;
    const result = await aiIntegrationService.extractTextFromImage(imageFile.data, imageFile.name);
    
    res.json(result);
  } catch (error) {
    console.error('Image OCR error:', error);
    next(error);
  }
});

// AI service health check
router.get('/ai-health', async (req, res) => {
  try {
    const health = await aiIntegrationService.checkAIServiceHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check AI service health'
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'LocalModi Enhanced AI Service is running',
    timestamp: new Date().toISOString(),
    services: {
      local_nlp: 'active',
      python_ai: 'integration_ready'
    }
  });
});

module.exports = router;
