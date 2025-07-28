const axios = require('axios');

async function testLLMEndpoint() {
  console.log('🧪 Testing LLM Parsing Endpoint...\n');

  try {
    const response = await axios.post('http://localhost:8000/api/v1/llm/parse-order', {
      text: 'i need 1 ltr thumsup 2 bottles',
      category: 'beverages'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    const response = await axios.get('http://localhost:8000/health');
    console.log('✅ Backend Health Check:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Backend not responding:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting LocalModi Backend Tests\n');
  
  // Test health first
  const isHealthy = await testHealth();
  if (!isHealthy) {
    console.log('\n💡 Make sure backend server is running: npm run dev');
    return;
  }
  
  console.log('');
  
  // Test LLM endpoint
  await testLLMEndpoint();
}

runTests();
