// Local NLP Service for LocalModi
// Uses regex patterns and knowledge base for parsing orders

class LocalNLPService {
  constructor() {
    // Initialize category-specific knowledge base
    this.categoryKnowledge = {
      beverages: {
        brands: ['coca cola', 'coke', 'pepsi', 'sprite', 'fanta', 'thumsup', 'thums up', 'limca', 'maaza', 'frooti', 'real', 'tropicana', 'minute maid', 'aquafina', 'bisleri', 'kinley'],
        items: ['cola', 'soda', 'juice', 'water', 'drink', 'beverage', 'soft drink'],
        units: ['ml', 'ltr', 'litre', 'l', 'bottle', 'can', 'glass', 'pack'],
        containers: ['bottle', 'can', 'glass', 'pack', 'carton', 'tetrapack']
      },
      snacks: {
        brands: ['lays', 'kurkure', 'haldiram', 'bikaji', 'parle', 'britannia', 'monaco', 'good day', 'oreo', 'hide & seek'],
        items: ['chips', 'namkeen', 'biscuit', 'cookies', 'crackers', 'wafers', 'mixture', 'bhujia'],
        units: ['g', 'gm', 'gram', 'kg', 'packet', 'pack', 'piece'],
        containers: ['packet', 'pack', 'box', 'tin', 'jar']
      },
      groceries: {
        brands: ['tata', 'fortune', 'saffola', 'sundrop', 'aashirvaad', 'pillsbury', 'india gate', 'kohinoor', 'dawat'],
        items: ['rice', 'wheat', 'flour', 'dal', 'oil', 'ghee', 'sugar', 'salt', 'spices', 'masala', 'atta'],
        units: ['kg', 'g', 'gm', 'gram', 'ltr', 'litre', 'l', 'ml', 'packet', 'bag'],
        containers: ['bag', 'packet', 'bottle', 'jar', 'tin', 'box']
      }
    };

    // Common quantity patterns
    this.quantityPatterns = [
      /(\d+)\s*(bottles?|cans?|glasses?|pieces?|packets?|bags?|boxes?|tins?|jars?)/gi,
      /(\d+)\s*(kg|kgs?|grams?|g|gm|ltr|litres?|l|ml)/gi,
      /(\d+)\s*x\s*(\d+)\s*(ml|g|gm|kg|ltr|l)/gi
    ];

    // Unit standardization
    this.unitMapping = {
      'ltr': 'L', 'litre': 'L', 'litres': 'L',
      'gm': 'g', 'gram': 'g', 'grams': 'g',
      'kg': 'kg', 'kgs': 'kg',
      'ml': 'ml',
      'bottle': 'bottle', 'bottles': 'bottle',
      'packet': 'packet', 'packets': 'packet',
      'piece': 'piece', 'pieces': 'piece'
    };
  }

  async parseOrderText(text, category) {
    console.log(`🔄 Local NLP parsing: "${text}" for category: "${category}"`);
    
    try {
      const items = this.extractItems(text, category);
      
      return {
        success: true,
        category: category,
        total_items: items.length,
        items: items
      };
    } catch (error) {
      console.error('Local NLP parsing error:', error);
      throw new Error('Failed to parse order text');
    }
  }

  extractItems(text, category) {
    const lowerText = text.toLowerCase();
    const items = [];
    const knowledge = this.categoryKnowledge[category] || {};

    // Extract quantities and units first
    const quantities = this.extractQuantities(lowerText);
    
    // Find brand and item matches
    const brandMatches = this.findBrandMatches(lowerText, knowledge.brands || []);
    const itemMatches = this.findItemMatches(lowerText, knowledge.items || []);

    // If we have specific brand matches, create items for them
    if (brandMatches.length > 0) {
      brandMatches.forEach((brand, index) => {
        const qty = quantities[index] || { quantity: 1, unit: this.getDefaultUnit(category) };
        items.push({
          item: this.capitalizeWords(brand),
          brand: this.capitalizeWords(brand),
          unit: qty.unit,
          qty: qty.quantity
        });
      });
    }
    // If we have item matches but no brands, create generic items
    else if (itemMatches.length > 0) {
      itemMatches.forEach((item, index) => {
        const qty = quantities[index] || { quantity: 1, unit: this.getDefaultUnit(category) };
        items.push({
          item: this.capitalizeWords(item),
          brand: 'Generic',
          unit: qty.unit,
          qty: qty.quantity
        });
      });
    }
    // Fallback: create a generic item if nothing specific found
    else {
      const qty = quantities[0] || { quantity: 1, unit: this.getDefaultUnit(category) };
      items.push({
        item: `${this.capitalizeWords(category.slice(0, -1))} Item`,
        brand: 'Generic',
        unit: qty.unit,
        qty: qty.quantity
      });
    }

    return items;
  }

  extractQuantities(text) {
    const quantities = [];
    
    for (const pattern of this.quantityPatterns) {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const quantity = parseInt(match[1]);
        const rawUnit = match[2].toLowerCase();
        const unit = this.standardizeUnit(rawUnit);
        
        quantities.push({ quantity, unit });
      });
    }

    return quantities;
  }

  findBrandMatches(text, brands) {
    const matches = [];
    brands.forEach(brand => {
      if (text.includes(brand.toLowerCase())) {
        matches.push(brand);
      }
    });
    return matches;
  }

  findItemMatches(text, items) {
    const matches = [];
    items.forEach(item => {
      if (text.includes(item.toLowerCase())) {
        matches.push(item);
      }
    });
    return matches;
  }

  standardizeUnit(unit) {
    return this.unitMapping[unit.toLowerCase()] || unit;
  }

  getDefaultUnit(category) {
    const defaults = {
      beverages: '500ml',
      snacks: '100g',
      groceries: '1kg'
    };
    return defaults[category] || '1 piece';
  }

  capitalizeWords(str) {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Method to add new items to knowledge base dynamically
  addToKnowledgeBase(category, type, items) {
    if (!this.categoryKnowledge[category]) {
      this.categoryKnowledge[category] = { brands: [], items: [], units: [], containers: [] };
    }
    
    if (this.categoryKnowledge[category][type]) {
      this.categoryKnowledge[category][type].push(...items);
    }
  }

  // Method to get category suggestions based on text
  suggestCategory(text) {
    const lowerText = text.toLowerCase();
    const scores = {};

    Object.keys(this.categoryKnowledge).forEach(category => {
      let score = 0;
      const knowledge = this.categoryKnowledge[category];
      
      // Check brand matches
      knowledge.brands?.forEach(brand => {
        if (lowerText.includes(brand.toLowerCase())) score += 3;
      });
      
      // Check item matches
      knowledge.items?.forEach(item => {
        if (lowerText.includes(item.toLowerCase())) score += 2;
      });
      
      scores[category] = score;
    });

    // Return category with highest score
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  }
}

module.exports = new LocalNLPService();
