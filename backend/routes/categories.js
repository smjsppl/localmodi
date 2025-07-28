const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const authMiddleware = require('../middleware/authMiddleware');

// Get all categories (public endpoint)
router.get('/', async (req, res, next) => {
  try {
    console.log('📂 Fetching all categories from database');
    
    const result = await categoryService.getAllCategories();
    
    res.json(result);
  } catch (error) {
    console.error('Get categories error:', error);
    next(error);
  }
});

// Get category by name
router.get('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    
    console.log(`📂 Fetching category: ${name}`);
    
    const result = await categoryService.getCategoryByName(name);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Get category error:', error);
    next(error);
  }
});

// Get popular categories
router.get('/popular/list', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    console.log(`📊 Fetching ${limit} popular categories`);
    
    const result = await categoryService.getPopularCategories(limit);
    
    res.json(result);
  } catch (error) {
    console.error('Get popular categories error:', error);
    next(error);
  }
});

// Get categories for vendor (requires vendor authentication)
router.get('/vendor/my-categories', 
  authMiddleware.requireVendor,
  async (req, res, next) => {
    try {
      const vendorId = req.user.id;
      
      console.log(`🏪 Fetching categories for vendor: ${vendorId}`);
      
      const result = await categoryService.getCategoriesForVendor(vendorId);
      
      res.json(result);
    } catch (error) {
      console.error('Get vendor categories error:', error);
      next(error);
    }
  }
);

// Validate category (utility endpoint)
router.post('/validate', async (req, res, next) => {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CATEGORY',
          message: 'Category name is required'
        }
      });
    }
    
    console.log(`✅ Validating category: ${category}`);
    
    const isValid = await categoryService.validateCategory(category);
    
    res.json({
      success: true,
      valid: isValid,
      category: category
    });
  } catch (error) {
    console.error('Validate category error:', error);
    next(error);
  }
});

module.exports = router;
