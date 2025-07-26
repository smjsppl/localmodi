const authService = require('../services/authService');

class AuthMiddleware {
  // Extract token from request
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  // General authentication middleware
  authenticate(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authentication token is required'
          }
        });
      }

      const decoded = authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
  }

  // Require customer role
  requireCustomer(req, res, next) {
    this.authenticate(req, res, (err) => {
      if (err) return next(err);
      
      if (req.user.role !== 'customer') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Customer access required'
          }
        });
      }
      
      next();
    });
  }

  // Require vendor role
  requireVendor(req, res, next) {
    this.authenticate(req, res, (err) => {
      if (err) return next(err);
      
      if (req.user.role !== 'vendor') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Vendor access required'
          }
        });
      }
      
      next();
    });
  }

  // Optional authentication (doesn't fail if no token)
  optionalAuth(req, res, next) {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // Continue without authentication if token is invalid
      next();
    }
  }
}

module.exports = new AuthMiddleware();
