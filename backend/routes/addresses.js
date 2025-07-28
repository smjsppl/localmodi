const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const addressService = require('../services/addressService');

// Validation middleware
const validateRequest = (req, res, next) => {
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

// Address validation rules
const addressValidationRules = [
  body('address_line1')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Address line 1 must be between 5 and 255 characters'),
  body('address_line2')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address line 2 must be less than 255 characters'),
  body('landmark')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Landmark must be less than 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('pincode')
    .trim()
    .isPostalCode('IN')
    .withMessage('Please enter a valid Indian pincode'),
  body('address_type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Invalid address type'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean')
];

// Apply auth middleware to all routes
router.use(authMiddleware.authenticateCustomer);

// Get all addresses for the authenticated customer
router.get('/', async (req, res, next) => {
  try {
    const result = await addressService.getCustomerAddresses(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get a single address
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid address ID')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await addressService.getAddressById(
        req.params.id,
        req.user.id
      );
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Add a new address
router.post(
  '/',
  addressValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await addressService.addAddress(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Update an address
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid address ID'),
    ...addressValidationRules
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await addressService.updateAddress(
        req.params.id,
        req.user.id,
        req.body
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Delete an address
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid address ID')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      await addressService.deleteAddress(req.params.id, req.user.id);
      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Set default address
router.post(
  '/:id/set-default',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid address ID')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await addressService.setDefaultAddress(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
