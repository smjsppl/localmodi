const express = require('express');
const router = express.Router();
const rfqService = require('../services/rfqService');
const categoryService = require('../services/categoryService');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Validation middleware
const validateRFQCreation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item').notEmpty().withMessage('Item name is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('location.lat').isFloat().withMessage('Valid latitude is required'),
  body('location.lng').isFloat().withMessage('Valid longitude is required'),
  body('location.address').notEmpty().withMessage('Address is required')
];

const validateQuoteSubmission = [
  body('total_price').isFloat({ min: 0 }).withMessage('Valid total price is required'),
  body('notes').optional().isString()
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

// Create RFQ (Customer)
router.post('/create', 
  authMiddleware.requireCustomer,
  validateRFQCreation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { category, items, location } = req.body;
      const customerId = req.user.id;
      
      console.log(`📝 Creating RFQ for customer ${customerId}, category: ${category}`);
      
      // Validate category exists in database
      const isValidCategory = await categoryService.validateCategory(category);
      if (!isValidCategory) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CATEGORY',
            message: `Category '${category}' is not supported`
          }
        });
      }
      
      const result = await rfqService.createRFQ(customerId, { category, items }, location);
      
      res.json(result);
    } catch (error) {
      console.error('RFQ creation error:', error);
      next(error);
    }
  }
);

// Get customer RFQs
router.get('/customer/my-rfqs', 
  authMiddleware.requireCustomer,
  async (req, res, next) => {
    try {
      const customerId = req.user.id;
      
      const result = await rfqService.getCustomerRFQs(customerId);
      
      res.json(result);
    } catch (error) {
      console.error('Get customer RFQs error:', error);
      next(error);
    }
  }
);

// Get quotes for customer RFQ
router.get('/customer/:rfqId/quotes', 
  authMiddleware.requireCustomer,
  async (req, res, next) => {
    try {
      const { rfqId } = req.params;
      const customerId = req.user.id;
      
      const result = await rfqService.getCustomerRFQQuotes(rfqId, customerId);
      
      res.json(result);
    } catch (error) {
      console.error('Get RFQ quotes error:', error);
      next(error);
    }
  }
);

// Accept vendor quote (Customer)
router.post('/customer/:rfqId/accept-quote', 
  authMiddleware.requireCustomer,
  body('vendor_id').notEmpty().withMessage('Vendor ID is required'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { rfqId } = req.params;
      const { vendor_id } = req.body;
      const customerId = req.user.id;
      
      console.log(`✅ Customer ${customerId} accepting quote from vendor ${vendor_id} for RFQ ${rfqId}`);
      
      const result = await rfqService.acceptVendorQuote(rfqId, vendor_id, customerId);
      
      res.json(result);
    } catch (error) {
      console.error('Accept quote error:', error);
      next(error);
    }
  }
);

// Get vendor RFQs
router.get('/vendor/my-rfqs', 
  authMiddleware.requireVendor,
  async (req, res, next) => {
    try {
      const vendorId = req.user.id;
      const { status } = req.query;
      
      const result = await rfqService.getVendorRFQs(vendorId, status);
      
      res.json(result);
    } catch (error) {
      console.error('Get vendor RFQs error:', error);
      next(error);
    }
  }
);

// Get RFQ details for vendor
router.get('/vendor/:rfqId/details', 
  authMiddleware.requireVendor,
  async (req, res, next) => {
    try {
      const { rfqId } = req.params;
      const vendorId = req.user.id;
      
      const result = await rfqService.getRFQDetails(rfqId, vendorId);
      
      res.json(result);
    } catch (error) {
      console.error('Get RFQ details error:', error);
      next(error);
    }
  }
);

// Submit vendor quote
router.post('/vendor/:rfqId/submit-quote', 
  authMiddleware.requireVendor,
  validateQuoteSubmission,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { rfqId } = req.params;
      const vendorId = req.user.id;
      const quoteData = req.body;
      
      console.log(`💰 Vendor ${vendorId} submitting quote for RFQ ${rfqId}`);
      
      const result = await rfqService.submitVendorQuote(rfqId, vendorId, quoteData);
      
      res.json(result);
    } catch (error) {
      console.error('Submit quote error:', error);
      next(error);
    }
  }
);

// Get RFQ details (general - for testing)
router.get('/:rfqId/details', async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    
    const result = await rfqService.getRFQDetails(rfqId);
    
    res.json(result);
  } catch (error) {
    console.error('Get RFQ details error:', error);
    next(error);
  }
});

module.exports = router;
