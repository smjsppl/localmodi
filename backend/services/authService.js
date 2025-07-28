const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../config/database');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'localmodi-secret-key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create or get customer
  async createOrGetCustomer(phoneNumber, name = null) {
    try {
      // Check if customer exists
      const existingCustomer = await query(
        'SELECT * FROM customers WHERE phone_number = $1',
        [phoneNumber]
      );

      if (existingCustomer.rows.length > 0) {
        return existingCustomer.rows[0];
      }

      // Create new customer
      const customerId = uuidv4();
      const result = await query(
        `INSERT INTO customers (id, phone_number, name, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING *`,
        [customerId, phoneNumber, name]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      throw new Error('Failed to process customer');
    }
  }

  // Send OTP (mock implementation - replace with actual SMS service)
  async sendOTP(phoneNumber, otp) {
    try {
      // Store OTP in database
      await query(
        `INSERT INTO otp_verifications (phone_number, otp_code, expires_at, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (phone_number) 
         DO UPDATE SET otp_code = $2, expires_at = $3, created_at = NOW()`,
        [phoneNumber, otp, new Date(Date.now() + this.otpExpiry)]
      );

      // Mock SMS sending (replace with actual SMS service)
      console.log(`📱 Mock SMS: OTP ${otp} sent to ${phoneNumber}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber, otp) {
    try {
      const result = await query(
        `SELECT * FROM otp_verifications 
         WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW()`,
        [phoneNumber, otp]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Delete used OTP
      await query(
        'DELETE FROM otp_verifications WHERE phone_number = $1',
        [phoneNumber]
      );

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('Failed to verify OTP');
    }
  }

  // Vendor login with OTP
  async vendorLogin(phoneNumber) {
    try {
      // Check if vendor exists and is active
      const vendor = await query(
        `SELECT v.*, vi.status as invite_status 
         FROM vendors v 
         JOIN vendor_invites vi ON v.id = vi.vendor_id 
         WHERE v.phone_number = $1 AND vi.status = 'accepted'`,
        [phoneNumber]
      );

      if (vendor.rows.length === 0) {
        return {
          success: false,
          message: 'Vendor not found or not authorized'
        };
      }

      // Generate and send OTP
      const otp = this.generateOTP();
      await this.sendOTP(phoneNumber, otp);

      return {
        success: true,
        message: 'OTP sent to registered vendor',
        vendorId: vendor.rows[0].id
      };
    } catch (error) {
      console.error('Error in vendor login:', error);
      throw new Error('Failed to process vendor login');
    }
  }

  // Complete vendor authentication
  async completeVendorAuth(phoneNumber, otp) {
    try {
      // Verify OTP
      const otpResult = await this.verifyOTP(phoneNumber, otp);
      if (!otpResult.success) {
        return otpResult;
      }

      // Get vendor details
      const vendor = await query(
        `SELECT v.*, vi.status as invite_status 
         FROM vendors v 
         JOIN vendor_invites vi ON v.id = vi.vendor_id 
         WHERE v.phone_number = $1 AND vi.status = 'accepted'`,
        [phoneNumber]
      );

      if (vendor.rows.length === 0) {
        return {
          success: false,
          message: 'Vendor not found'
        };
      }

      const vendorData = vendor.rows[0];

      // Generate JWT token
      const token = this.generateToken({
        id: vendorData.id,
        phone_number: vendorData.phone_number,
        business_name: vendorData.business_name,
        role: 'vendor'
      });

      return {
        success: true,
        message: 'Vendor authenticated successfully',
        token,
        vendor: {
          id: vendorData.id,
          business_name: vendorData.business_name,
          phone_number: vendorData.phone_number,
          address: vendorData.address,
          categories: vendorData.categories
        }
      };
    } catch (error) {
      console.error('Error completing vendor auth:', error);
      throw new Error('Failed to complete vendor authentication');
    }
  }

  // Customer authentication (simplified - no password required)
  async authenticateCustomer(phoneNumber, name = null) {
    try {
      const customer = await this.createOrGetCustomer(phoneNumber, name);

      const token = this.generateToken({
        id: customer.id,
        phone_number: customer.phone_number,
        name: customer.name,
        role: 'customer'
      });

      return {
        success: true,
        message: 'Customer authenticated successfully',
        token,
        customer: {
          id: customer.id,
          phone_number: customer.phone_number,
          name: customer.name
        }
      };
    } catch (error) {
      console.error('Error authenticating customer:', error);
      throw new Error('Failed to authenticate customer');
    }
  }
}

module.exports = new AuthService();
