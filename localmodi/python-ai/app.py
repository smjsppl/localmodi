#!/usr/bin/env python3
"""
LocalModi Python AI Service
Handles audio-to-text (Whisper) and image-to-text (OCR) processing
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import easyocr
import cv2
import numpy as np
from PIL import Image
import io
import os
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for models (loaded once)
whisper_model = None
ocr_reader = None

def load_models():
    """Load AI models on startup"""
    global whisper_model, ocr_reader
    
    try:
        logger.info("Loading Whisper model...")
        whisper_model = whisper.load_model("base")
        logger.info("Whisper model loaded successfully")
        
        logger.info("Loading EasyOCR reader...")
        ocr_reader = easyocr.Reader(['en'])
        logger.info("EasyOCR reader loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "LocalModi Python AI Service",
        "models": {
            "whisper": whisper_model is not None,
            "ocr": ocr_reader is not None
        }
    })

@app.route('/audio-to-text', methods=['POST'])
def audio_to_text():
    """Convert audio to text using Whisper"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
            
            # Transcribe using Whisper
            logger.info("Transcribing audio...")
            result = whisper_model.transcribe(temp_audio.name)
            
            # Clean up temp file
            os.unlink(temp_audio.name)
            
            return jsonify({
                "success": True,
                "text": result["text"].strip(),
                "language": result.get("language", "en"),
                "confidence": 1.0  # Whisper doesn't provide confidence scores
            })
            
    except Exception as e:
        logger.error(f"Audio transcription error: {e}")
        return jsonify({"error": "Failed to transcribe audio"}), 500

@app.route('/image-to-text', methods=['POST'])
def image_to_text():
    """Extract text from image using OCR"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        
        # Read image
        image_bytes = image_file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL image to numpy array for EasyOCR
        image_np = np.array(image)
        
        # Extract text using EasyOCR
        logger.info("Extracting text from image...")
        results = ocr_reader.readtext(image_np)
        
        # Process results
        extracted_texts = []
        full_text = ""
        
        for (bbox, text, confidence) in results:
            if confidence > 0.5:  # Filter low-confidence results
                extracted_texts.append({
                    "text": text,
                    "confidence": confidence,
                    "bbox": bbox
                })
                full_text += text + " "
        
        return jsonify({
            "success": True,
            "full_text": full_text.strip(),
            "detailed_results": extracted_texts,
            "total_items": len(extracted_texts)
        })
        
    except Exception as e:
        logger.error(f"Image OCR error: {e}")
        return jsonify({"error": "Failed to extract text from image"}), 500

@app.route('/preprocess-text', methods=['POST'])
def preprocess_text():
    """Preprocess and clean text for better parsing"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        # Basic text preprocessing
        # Remove extra whitespace
        cleaned_text = ' '.join(text.split())
        
        # Convert common speech patterns
        replacements = {
            'two': '2', 'three': '3', 'four': '4', 'five': '5',
            'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
            'one': '1', 'a': '1', 'an': '1',
            'dozen': '12', 'half dozen': '6',
            'litre': 'ltr', 'liter': 'ltr', 'litres': 'ltr', 'liters': 'ltr',
            'gram': 'g', 'grams': 'g', 'kilogram': 'kg', 'kilograms': 'kg',
            'millilitre': 'ml', 'milliliter': 'ml', 'millilitres': 'ml', 'milliliters': 'ml'
        }
        
        for old, new in replacements.items():
            cleaned_text = cleaned_text.replace(old, new)
        
        return jsonify({
            "success": True,
            "original_text": text,
            "cleaned_text": cleaned_text,
            "preprocessing_applied": list(replacements.keys())
        })
        
    except Exception as e:
        logger.error(f"Text preprocessing error: {e}")
        return jsonify({"error": "Failed to preprocess text"}), 500

if __name__ == '__main__':
    # Load models on startup
    load_models()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
