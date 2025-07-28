const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

// Test cases for LLM parsing
const testCases = [
  {
    name: 'Beverages - Single Item',
    text: 'i need 1 ltr thumsup 2 bottles',
    category: 'beverages',
    expected: {
      item: 'Thums Up',
      brand: 'Thums Up',
      unit: '1 ltr',
      qty: 2
    }
  },
  {
    name: 'Beverages - Multiple Items',
    text: 'get me 2 bottles coca cola 500ml and 1 bottle water 1 liter',
    category: 'beverages',
    expected: [
      { item: 'Coca Cola', brand: 'Coca Cola', unit: '500ml', qty: 2 },
      { item: 'Water', brand: 'Generic', unit: '1 liter', qty: 1 }
    ]
  },
  {
    name: 'Snacks - Mixed Input',
    text: 'I want 2 packets of lays chips and 1 bottle of water',
    category: 'snacks',
    expected: [
      { item: 'Lays Chips', brand: 'Lays', unit: '1 packet', qty: 2 }
    ]
    // Note: water should be filtered out as it's not in snacks category
  },
  {
    name: 'Groceries - Complex Order',
    text: 'need 5kg rice, 2kg dal, and 1 liter cooking oil',
    category: 'groceries',
    expected: [
      { item: 'Rice', brand: 'Generic', unit: '5kg', qty: 1 },
      { item: 'Dal', brand: 'Generic', unit: '2kg', qty: 1 },
      { item: 'Cooking Oil', brand: 'Generic', unit: '1 liter', qty: 1 }
    ]
  },
  {
    name: 'Category Mismatch',
    text: 'get me pizza and burger',
    category: 'beverages',
    expected: []
    // Should return empty as pizza/burger don't belong to beverages
  }
];

async function runTests() {
  console.log('🧪 Starting LLM Parsing Tests...\n');

  // Test health endpoint first
  try {
    const healthResponse = await axios.get(`${BASE_URL}/llm/test`);
    console.log('✅ Health Check:', healthResponse.data.message);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return;
  }

  // Run test cases
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Category: ${testCase.category}`);

    try {
      const response = await axios.post(`${BASE_URL}/llm/parse-order`, {
        text: testCase.text,
        category: testCase.category
      });

      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log(`📊 Parsed ${response.data.total_items} items`);
      }
    } catch (error) {
      console.error('❌ Test Failed:', error.response?.data || error.message);
    }
  }

  console.log('\n🏁 Tests completed!');
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testCases };
