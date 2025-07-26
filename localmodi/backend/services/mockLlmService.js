// Temporary mock service to test frontend-backend connection
// Use this while debugging OpenAI API issues

class MockLLMService {
  async parseOrderText(text, category) {
    console.log(`🔄 Mock parsing: "${text}" for category: "${category}"`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock parsing based on input
    const mockItems = [];
    const lowerText = text.toLowerCase();
    
    if (category === 'beverages') {
      // Extract quantity information
      const quantityMatch = lowerText.match(/(\d+)\s*(bottles?|cans?|glasses?|pieces?)/);
      const volumeMatch = lowerText.match(/(\d+)\s*(ml|ltr|litre|l)\b/);
      
      const defaultQty = quantityMatch ? parseInt(quantityMatch[1]) : 1;
      const defaultUnit = volumeMatch ? volumeMatch[0] : '500ml';
      
      // Parse different beverages
      if (lowerText.includes('thumsup') || lowerText.includes('thums up')) {
        mockItems.push({
          item: 'Thums Up',
          brand: 'Thums Up',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('limca')) {
        mockItems.push({
          item: 'Limca',
          brand: 'Limca',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('coca cola') || lowerText.includes('coke')) {
        mockItems.push({
          item: 'Coca Cola',
          brand: 'Coca Cola',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('pepsi')) {
        mockItems.push({
          item: 'Pepsi',
          brand: 'Pepsi',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('sprite')) {
        mockItems.push({
          item: 'Sprite',
          brand: 'Sprite',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('water')) {
        mockItems.push({
          item: 'Water',
          brand: 'Aquafina',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('juice')) {
        mockItems.push({
          item: 'Fruit Juice',
          brand: 'Real',
          unit: defaultUnit,
          qty: defaultQty
        });
      }
      
    } else if (category === 'snacks') {
      const quantityMatch = lowerText.match(/(\d+)\s*(packets?|pieces?|bags?)/);
      const defaultQty = quantityMatch ? parseInt(quantityMatch[1]) : 1;
      
      if (lowerText.includes('lays') || lowerText.includes('chips')) {
        mockItems.push({
          item: 'Lays Chips',
          brand: 'Lays',
          unit: '50g',
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('kurkure')) {
        mockItems.push({
          item: 'Kurkure',
          brand: 'Kurkure',
          unit: '100g',
          qty: defaultQty
        });
      }
      
      if (lowerText.includes('biscuit')) {
        mockItems.push({
          item: 'Biscuits',
          brand: 'Parle-G',
          unit: '200g',
          qty: defaultQty
        });
      }
      
    } else if (category === 'groceries') {
      if (lowerText.includes('rice')) {
        mockItems.push({
          item: 'Rice',
          brand: 'Basmati',
          unit: '5kg',
          qty: 1
        });
      }
      
      if (lowerText.includes('dal')) {
        mockItems.push({
          item: 'Dal',
          brand: 'Toor Dal',
          unit: '1kg',
          qty: 1
        });
      }
      
      if (lowerText.includes('oil')) {
        mockItems.push({
          item: 'Cooking Oil',
          brand: 'Fortune',
          unit: '1L',
          qty: 1
        });
      }
    }
    
    // If no specific matches, create a generic item
    if (mockItems.length === 0) {
      mockItems.push({
        item: 'Generic Item',
        brand: 'Unknown',
        unit: '1 piece',
        qty: 1
      });
    }
    
    return {
      success: true,
      category: category,
      total_items: mockItems.length,
      items: mockItems
    };
  }
}

module.exports = new MockLLMService();
