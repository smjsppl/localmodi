# LocalModi Backend API

Backend API for LocalModi hyperlocal ordering platform with OpenAI integration for intelligent order parsing.

## Features

- 🤖 **OpenAI Integration**: Intelligent text parsing for natural language orders
- 📝 **Category-based Filtering**: Only returns items matching specified categories
- 🛡️ **Security**: Rate limiting, CORS, input validation
- 🚀 **RESTful API**: Clean, documented endpoints
- ✅ **Validation**: Comprehensive input validation with Joi

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:8000`

## API Endpoints

### Health Check
```http
GET /health
```

### LLM Test
```http
GET /api/v1/llm/test
```

### Parse Order Text
```http
POST /api/v1/llm/parse-order
Content-Type: application/json

{
  "text": "i need 1 ltr thumsup 2 bottles",
  "category": "beverages"
}
```

**Response:**
```json
{
  "success": true,
  "category": "beverages",
  "total_items": 1,
  "items": [
    {
      "item": "Thums Up",
      "brand": "Thums Up", 
      "unit": "1 ltr",
      "qty": 2
    }
  ]
}
```

## Supported Categories

- `beverages` - Soft drinks, juices, water, tea, coffee
- `snacks` - Chips, biscuits, namkeen, nuts, chocolates
- `fruits` - Fresh fruits, vegetables, fruit juices
- `groceries` - Rice, dal, oil, spices, flour, sugar
- `food` - Ready-to-eat meals, street food, cooked items
- `health` - Medicines, supplements, personal care
- `household` - Cleaning supplies, detergents, toiletries
- `automotive` - Car accessories, fuel, oils

## Testing

### Run Test Suite
```bash
# Make sure server is running first
npm run dev

# In another terminal, run tests
node test/testLLM.js
```

### Manual Testing with cURL
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test LLM parsing
curl -X POST http://localhost:8000/api/v1/llm/parse-order \
  -H "Content-Type: application/json" \
  -d '{
    "text": "i need 1 ltr thumsup 2 bottles",
    "category": "beverages"
  }'
```

## Example Requests

### Beverages
```json
{
  "text": "get me 2 bottles coca cola 500ml and 1 bottle water",
  "category": "beverages"
}
```

### Snacks (with filtering)
```json
{
  "text": "I want 2 packets lays chips and 1 bottle water",
  "category": "snacks"
}
```
*Note: Water will be filtered out as it doesn't belong to snacks category*

### Groceries
```json
{
  "text": "need 5kg rice, 2kg dal, and 1 liter cooking oil",
  "category": "groceries"
}
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Order text is required"
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `LLM_ERROR` - OpenAI API failure
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Configuration

### Environment Variables
- `PORT` - Server port (default: 8000)
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `LLM_MODEL` - OpenAI model (default: gpt-3.5-turbo)
- `LLM_MAX_TOKENS` - Max response tokens (default: 500)
- `LLM_TEMPERATURE` - Model creativity (default: 0.1)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Rate Limiting
- 100 requests per minute per IP
- Configurable via environment variables

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── routes/
│   └── llm.js             # LLM parsing routes
├── services/
│   └── llmService.js      # OpenAI integration
├── middleware/
│   ├── errorHandler.js    # Global error handling
│   └── validation.js      # Input validation
└── test/
    └── testLLM.js         # Test suite
```

### Adding New Categories
1. Update validation in `middleware/validation.js`
2. Add category mapping in `services/llmService.js`
3. Update documentation

## Production Deployment

1. Set `NODE_ENV=production`
2. Use process manager like PM2
3. Set up reverse proxy (nginx)
4. Configure proper CORS origins
5. Set up monitoring and logging

## Troubleshooting

### Common Issues

**OpenAI API Key Error**
```
Error: OPENAI_API_KEY is required
```
Solution: Add your OpenAI API key to `.env` file

**CORS Error**
```
Access to fetch blocked by CORS policy
```
Solution: Update `FRONTEND_URL` in `.env` to match your frontend URL

**Rate Limit Error**
```
Too many requests, please try again later
```
Solution: Wait a minute or increase rate limits in configuration
