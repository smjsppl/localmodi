# LocalModi Local AI Stack

A cost-effective, privacy-focused AI stack for LocalModi that runs entirely on your local machine.

## 🎯 **Overview**

This local AI stack replaces expensive cloud-based services (like OpenAI) with local alternatives:

- **Text Parsing**: Local NLP with regex patterns and knowledge base
- **Audio Processing**: Whisper (local speech-to-text)
- **Image Processing**: EasyOCR/Tesseract (local OCR)
- **Text Preprocessing**: spaCy and custom regex
- **Future**: Ollama + LLaMA/Mistral for advanced LLM tasks

## 🏗️ **Architecture**

```
Frontend (React)
    ↓
Node.js Backend
    ↓
AI Integration Service
    ├── Local NLP Service (JavaScript)
    └── Python AI Service (Flask)
        ├── Whisper (Audio → Text)
        ├── EasyOCR (Image → Text)
        └── Text Preprocessing
```

## 🚀 **Quick Start**

### 1. **Backend Setup (Already Done)**
```bash
cd m:\localmodi\backend
npm install
npm run dev  # Server runs on http://localhost:8000
```

### 2. **Python AI Service Setup**
```bash
cd m:\localmodi\python-ai
python setup.py  # This will create venv and install dependencies
```

### 3. **Start Python AI Service**
```bash
cd m:\localmodi\python-ai
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

python app.py  # Service runs on http://localhost:5000
```

### 4. **Test the Stack**
```bash
# Test backend
curl http://localhost:8000/api/llm/test

# Test Python AI service
curl http://localhost:5000/health

# Test AI integration
curl http://localhost:8000/api/llm/ai-health
```

## 📋 **Available Endpoints**

### **Node.js Backend (Port 8000)**
- `POST /api/llm/parse-order` - Parse text orders using local NLP
- `POST /api/llm/transcribe-audio` - Convert audio to text
- `POST /api/llm/extract-image-text` - Extract text from images
- `GET /api/llm/ai-health` - Check Python AI service status
- `GET /api/llm/test` - Backend health check

### **Python AI Service (Port 5000)**
- `GET /health` - Service health check
- `POST /audio-to-text` - Whisper audio transcription
- `POST /image-to-text` - EasyOCR image text extraction
- `POST /preprocess-text` - Clean and normalize text

## 🧪 **Testing Examples**

### **1. Text Parsing (Local NLP)**
```bash
curl -X POST http://localhost:8000/api/llm/parse-order \
  -H "Content-Type: application/json" \
  -d '{"text": "get 3 bottles of limca 500 ml", "category": "beverages"}'
```

Expected Response:
```json
{
  "success": true,
  "category": "beverages",
  "total_items": 1,
  "items": [
    {
      "item": "Limca",
      "brand": "Limca", 
      "unit": "500 ml",
      "qty": 3
    }
  ]
}
```

### **2. Audio Transcription (Whisper)**
```bash
curl -X POST http://localhost:8000/api/llm/transcribe-audio \
  -F "audio=@path/to/audio.wav"
```

### **3. Image OCR (EasyOCR)**
```bash
curl -X POST http://localhost:8000/api/llm/extract-image-text \
  -F "image=@path/to/image.jpg"
```

## 🎛️ **Configuration**

### **Environment Variables (.env)**
```env
# Python AI Service URL
PYTHON_AI_URL=http://localhost:5000

# File upload limits
MAX_FILE_SIZE=50MB

# Other existing variables...
PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 🔧 **Local NLP Features**

### **Supported Categories**
- **Beverages**: Coca Cola, Pepsi, Sprite, Limca, Thums Up, etc.
- **Snacks**: Lays, Kurkure, Haldiram, Parle, etc.
- **Groceries**: Rice, Dal, Oil, Flour, etc.

### **Smart Parsing**
- Quantity extraction: "3 bottles", "2 kg", "500 ml"
- Unit standardization: "ltr" → "L", "gm" → "g"
- Brand recognition: "thumsup" → "Thums Up"
- Fallback handling: Unknown items → Generic items

### **Example Inputs**
```
✅ "get 3 bottles of limca 500 ml" → Limca, 500ml, qty: 3
✅ "2 packets kurkure" → Kurkure, 100g, qty: 2
✅ "rice 5kg and cooking oil" → Rice (5kg) + Cooking Oil (1L)
✅ "thumsup 1 ltr 2 bottles" → Thums Up, 1L, qty: 2
```

## 🚀 **Future Enhancements**

### **Phase 2: Ollama Integration**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama2
ollama pull mistral

# Use for advanced parsing
```

### **Phase 3: RAG System**
- Vector database for product knowledge
- Semantic search for better item matching
- Context-aware parsing

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Python AI Service Not Starting**
   ```bash
   # Check Python version (3.8+ required)
   python --version
   
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

2. **Whisper Model Download Issues**
   ```bash
   # Pre-download models
   python -c "import whisper; whisper.load_model('base')"
   ```

3. **File Upload Errors**
   - Check file size limits (50MB max)
   - Ensure proper Content-Type headers
   - Verify file format support

### **Performance Tips**

1. **Whisper Models**
   - `tiny`: Fastest, less accurate
   - `base`: Good balance (recommended)
   - `small`: Better accuracy, slower
   - `medium/large`: Best accuracy, much slower

2. **OCR Optimization**
   - Preprocess images (contrast, resolution)
   - Use appropriate image formats (JPG, PNG)
   - Consider image size vs. accuracy trade-offs

## 📊 **Cost Comparison**

| Service | Cloud (OpenAI) | Local Stack |
|---------|---------------|-------------|
| Text Parsing | $0.002/1K tokens | Free |
| Audio Transcription | $0.006/minute | Free |
| Image OCR | $0.01/image | Free |
| **Monthly Cost** | $50-200+ | **$0** |

## 🎉 **Benefits**

✅ **Zero ongoing costs** - No API fees  
✅ **Privacy** - All data stays local  
✅ **Offline capability** - Works without internet  
✅ **Customizable** - Add your own knowledge base  
✅ **Scalable** - No rate limits or quotas  
✅ **Fast** - No network latency  

## 📞 **Support**

If you encounter issues:
1. Check service health endpoints
2. Review logs in terminal
3. Verify all dependencies are installed
4. Test individual components separately

---

**Ready to test!** Start both services and try parsing: `"get 3 bottles of limca 500 ml"` 🚀
