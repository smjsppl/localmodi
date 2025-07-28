// AI Integration Service - Connects Node.js backend with Python AI service
const axios = require('axios');
const FormData = require('form-data');

class AIIntegrationService {
  constructor() {
    this.pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:5000';
    this.timeout = 30000; // 30 seconds timeout
  }

  async checkAIServiceHealth() {
    try {
      const response = await axios.get(`${this.pythonAiUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('AI service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  async transcribeAudio(audioBuffer, filename = 'audio.wav') {
    try {
      const formData = new FormData();
      formData.append('audio', audioBuffer, filename);

      const response = await axios.post(`${this.pythonAiUrl}/audio-to-text`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: this.timeout
      });

      return {
        success: true,
        text: response.data.text,
        language: response.data.language,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Audio transcription failed:', error.message);
      return {
        success: false,
        error: 'Failed to transcribe audio',
        details: error.message
      };
    }
  }

  async extractTextFromImage(imageBuffer, filename = 'image.jpg') {
    try {
      const formData = new FormData();
      formData.append('image', imageBuffer, filename);

      const response = await axios.post(`${this.pythonAiUrl}/image-to-text`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: this.timeout
      });

      return {
        success: true,
        text: response.data.full_text,
        detailed_results: response.data.detailed_results,
        total_items: response.data.total_items
      };
    } catch (error) {
      console.error('Image OCR failed:', error.message);
      return {
        success: false,
        error: 'Failed to extract text from image',
        details: error.message
      };
    }
  }

  async preprocessText(text) {
    try {
      const response = await axios.post(`${this.pythonAiUrl}/preprocess-text`, {
        text: text
      }, {
        timeout: 10000
      });

      return {
        success: true,
        original_text: response.data.original_text,
        cleaned_text: response.data.cleaned_text,
        preprocessing_applied: response.data.preprocessing_applied
      };
    } catch (error) {
      console.error('Text preprocessing failed:', error.message);
      return {
        success: false,
        error: 'Failed to preprocess text',
        details: error.message,
        fallback_text: text // Return original text as fallback
      };
    }
  }

  // Enhanced parsing that combines preprocessing with local NLP
  async enhancedParseOrder(text, category) {
    try {
      // Step 1: Preprocess text
      const preprocessResult = await this.preprocessText(text);
      const cleanedText = preprocessResult.success ? 
        preprocessResult.cleaned_text : text;

      // Step 2: Use local NLP service for parsing
      const localNlpService = require('./localNlpService');
      const parseResult = await localNlpService.parseOrderText(cleanedText, category);

      return {
        success: true,
        original_text: text,
        cleaned_text: cleanedText,
        preprocessing_applied: preprocessResult.preprocessing_applied || [],
        ...parseResult
      };
    } catch (error) {
      console.error('Enhanced parsing failed:', error.message);
      throw error;
    }
  }
}

module.exports = new AIIntegrationService();
