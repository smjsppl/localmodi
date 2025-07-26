const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePhoneNumber = [
  body('phone_number')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number')
];

const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
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

// Customer authentication (simplified - no OTP required for now)
router.post('/customer/login', validatePhoneNumber, handleValidationErrors, async (req, res, next) => {
  try {
    const { phone_number, name } = req.body;
    
    console.log(`👤 Customer login attempt: ${phone_number}`);
    
    const result = await authService.authenticateCustomer(phone_number, name);
    
    res.json(result);
  } catch (error) {
    console.error('Customer login error:', error);
    next(error);
  }
});

// Vendor login - Step 1: Request OTP
router.post('/vendor/request-otp', validatePhoneNumber, handleValidationErrors, async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    
    console.log(`🏪 Vendor OTP request: ${phone_number}`);
    
    const result = await authService.vendorLogin(phone_number);
    
    res.json(result);
  } catch (error) {
    console.error('Vendor OTP request error:', error);
    next(error);
  }
});

// Vendor login - Step 2: Verify OTP and authenticate
router.post('/vendor/verify-otp', 
  [...validatePhoneNumber, ...validateOTP], 
  handleValidationErrors, 
  async (req, res, next) => {
    try {
      const { phone_number, otp } = req.body;
      
      console.log(`🔐 Vendor OTP verification: ${phone_number}`);
      
      const result = await authService.completeVendorAuth(phone_number, otp);
      
      res.json(result);
    } catch (error) {
      console.error('Vendor OTP verification error:', error);
      next(error);
    }
  }
);

// Send OTP (generic endpoint for testing)
router.post('/send-otp', validatePhoneNumber, handleValidationErrors, async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    
    const otp = authService.generateOTP();
    const result = await authService.sendOTP(phone_number, otp);
    
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    next(error);
  }
});

// Verify OTP (generic endpoint for testing)
router.post('/verify-otp', 
  [...validatePhoneNumber, ...validateOTP], 
  handleValidationErrors, 
  async (req, res, next) => {
    try {
      const { phone_number, otp } = req.body;
      
      const result = await authService.verifyOTP(phone_number, otp);
      
      res.json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      next(error);
    }
  }
);

// Verify JWT token
router.post('/verify-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Token is required'
        }
      });
    }
    
    const decoded = authService.verifyToken(token);
    
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error.message
      }
    });
  }
});

module.exports = router;
