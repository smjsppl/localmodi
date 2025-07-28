const { query } = require('../config/database');

class CategoryService {
  // Get all categories
  async getAllCategories() {
    try {
      const result = await query(
        'SELECT id, name, display_name, created_at FROM categories ORDER BY display_name'
      );

      return {
        success: true,
        categories: result.rows
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get category by name
  async getCategoryByName(name) {
    try {
      const result = await query(
        'SELECT id, name, display_name FROM categories WHERE name = $1',
        [name]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Category not found'
        };
      }

      return {
        success: true,
        category: result.rows[0]
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  // Validate if category exists
  async validateCategory(categoryName) {
    try {
      const result = await query(
        'SELECT id FROM categories WHERE name = $1',
        [categoryName]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error validating category:', error);
      return false;
    }
  }

  // Get categories for vendor
  async getCategoriesForVendor(vendorId) {
    try {
      const result = await query(
        `SELECT DISTINCT c.id, c.name, c.display_name 
         FROM categories c
         JOIN vendors v ON c.name = ANY(v.categories)
         WHERE v.id = $1
         ORDER BY c.display_name`,
        [vendorId]
      );

      return {
        success: true,
        categories: result.rows
      };
    } catch (error) {
      console.error('Error fetching vendor categories:', error);
      throw new Error('Failed to fetch vendor categories');
    }
  }

  // Get popular categories (based on RFQ count)
  async getPopularCategories(limit = 5) {
    try {
      const result = await query(
        `SELECT c.id, c.name, c.display_name, COUNT(r.id) as rfq_count
         FROM categories c
         LEFT JOIN rfqs r ON c.name = r.category
         GROUP BY c.id, c.name, c.display_name
         ORDER BY rfq_count DESC, c.display_name
         LIMIT $1`,
        [limit]
      );

      return {
        success: true,
        categories: result.rows
      };
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      throw new Error('Failed to fetch popular categories');
    }
  }
}

module.exports = new CategoryService();
