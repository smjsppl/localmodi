require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API Connection...\n');
  
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API Key found:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('🔄 Making test API call...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, LocalModi!" in JSON format: {"message": "your response"}'
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    console.log('✅ OpenAI API Response:');
    console.log(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API Error:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testOpenAI();
