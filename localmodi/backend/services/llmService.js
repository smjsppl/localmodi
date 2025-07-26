const OpenAI = require('openai');

class LLMService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS) || 500;
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE) || 0.1;
  }

  async parseOrderText(text, category) {
    try {
      const prompt = this.buildPrompt(text, category);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      const parsedData = JSON.parse(response);
      
      return this.validateAndFormatResponse(parsedData, category);
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to parse order text');
    }
  }

  getSystemPrompt() {
    return `You are an expert order parser for a hyperlocal ordering platform. Your job is to extract structured product information from natural language text.

CRITICAL RULES:
1. Only extract items that match the specified category
2. Discard any items that don't belong to the given category
3. Return results in the exact JSON format specified
4. If no relevant items found, return empty items array
5. Be accurate with brand names, quantities, and units

CATEGORIES AND THEIR ITEMS:
- beverages: soft drinks, juices, water, tea, coffee, energy drinks, alcohol
- snacks: chips, biscuits, namkeen, nuts, chocolates, candies
- fruits: fresh fruits, vegetables, fruit juices (fresh)
- groceries: rice, dal, oil, spices, flour, sugar, salt
- food: ready-to-eat meals, street food, cooked items
- health: medicines, supplements, personal care items
- household: cleaning supplies, detergents, toiletries
- automotive: car accessories, fuel, oils

FORMAT REQUIREMENTS:
- item: the product name (e.g., "Thums Up", "Lays Chips")
- brand: the brand name (e.g., "Thums Up", "Lays")  
- unit: size/volume with unit (e.g., "1 ltr", "500ml", "50g")
- qty: numerical quantity (e.g., 2, 1, 5)

Always return valid JSON with an "items" array.`;
  }

  buildPrompt(text, category) {
    return `Parse the following order text and extract only items that belong to the "${category}" category.

Order Text: "${text}"
Category: "${category}"

Extract items in this exact JSON format:
{
  "items": [
    {
      "item": "product name",
      "brand": "brand name", 
      "unit": "size with unit",
      "qty": number
    }
  ]
}

Examples:
Input: "i need 1 ltr thumsup 2 bottles", Category: "beverages"
Output: {"items": [{"item": "Thums Up", "brand": "Thums Up", "unit": "1 ltr", "qty": 2}]}

Input: "get me 2 packets lays chips and 1 bottle water", Category: "snacks"  
Output: {"items": [{"item": "Lays Chips", "brand": "Lays", "unit": "1 packet", "qty": 2}]}
(Note: water is excluded because it's beverages, not snacks)

Now parse the given text:`;
  }

  validateAndFormatResponse(parsedData, category) {
    if (!parsedData || !Array.isArray(parsedData.items)) {
      return { items: [] };
    }

    const validatedItems = parsedData.items
      .filter(item => this.isValidItem(item))
      .map(item => this.formatItem(item));

    return {
      success: true,
      category: category,
      total_items: validatedItems.length,
      items: validatedItems
    };
  }

  isValidItem(item) {
    return (
      item &&
      typeof item.item === 'string' &&
      typeof item.brand === 'string' &&
      typeof item.unit === 'string' &&
      typeof item.qty === 'number' &&
      item.item.trim().length > 0 &&
      item.brand.trim().length > 0 &&
      item.qty > 0
    );
  }

  formatItem(item) {
    return {
      item: item.item.trim(),
      brand: item.brand.trim(),
      unit: item.unit.trim(),
      qty: Math.floor(item.qty) // Ensure integer quantity
    };
  }
}

module.exports = new LLMService();
