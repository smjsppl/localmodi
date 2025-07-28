const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AddressService {
  // Get all addresses for a customer
  async getCustomerAddresses(customerId) {
    try {
      const result = await query(
        `SELECT * FROM customer_addresses 
         WHERE customer_id = $1 
         ORDER BY is_default DESC, updated_at DESC`,
        [customerId]
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw new Error('Failed to fetch addresses');
    }
  }

  // Get a single address by ID
  async getAddressById(addressId, customerId) {
    try {
      const result = await query(
        `SELECT * FROM customer_addresses 
         WHERE id = $1 AND customer_id = $2`,
        [addressId, customerId]
      );
      
      if (result.rows.length === 0) {
        return { success: false, error: 'Address not found' };
      }
      
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching address:', error);
      throw new Error('Failed to fetch address');
    }
  }

  // Add a new address
  async addAddress(customerId, addressData) {
    const client = await transaction();
    
    try {
      // If this is set as default, unset any existing default
      if (addressData.is_default) {
        await client.query(
          `UPDATE customer_addresses 
           SET is_default = false 
           WHERE customer_id = $1 AND is_default = true`,
          [customerId]
        );
      }

      const result = await client.query(
        `INSERT INTO customer_addresses (
          id, customer_id, address_line1, address_line2, 
          landmark, city, state, pincode, 
          address_type, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          uuidv4(),
          customerId,
          addressData.address_line1,
          addressData.address_line2 || null,
          addressData.landmark || null,
          addressData.city,
          addressData.state,
          addressData.pincode,
          addressData.address_type || 'home',
          Boolean(addressData.is_default)
        ]
      );

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding address:', error);
      throw new Error('Failed to add address');
    } finally {
      client.release();
    }
  }

  // Update an existing address
  async updateAddress(addressId, customerId, updateData) {
    const client = await transaction();
    
    try {
      // If this is set as default, unset any existing default
      if (updateData.is_default) {
        await client.query(
          `UPDATE customer_addresses 
           SET is_default = false 
           WHERE customer_id = $1 AND is_default = true AND id != $2`,
          [customerId, addressId]
        );
      }

      const updates = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          updates.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add addressId and customerId to values
      values.push(addressId, customerId);
      
      const queryText = `
        UPDATE customer_addresses 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND customer_id = $${paramIndex}
        RETURNING *`;

      const result = await client.query(queryText, values);

      if (result.rows.length === 0) {
        throw new Error('Address not found or not owned by customer');
      }

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating address:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete an address
  async deleteAddress(addressId, customerId) {
    const client = await transaction();
    
    try {
      // First check if this is the default address
      const checkResult = await client.query(
        `SELECT is_default FROM customer_addresses 
         WHERE id = $1 AND customer_id = $2`,
        [addressId, customerId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error('Address not found or not owned by customer');
      }

      const wasDefault = checkResult.rows[0].is_default;
      
      // Delete the address
      await client.query(
        `DELETE FROM customer_addresses 
         WHERE id = $1 AND customer_id = $2`,
        [addressId, customerId]
      );

      // If it was the default, set a new default (most recently updated)
      if (wasDefault) {
        await client.query(
          `UPDATE customer_addresses 
           SET is_default = true 
           WHERE customer_id = $1 
           AND id = (
             SELECT id FROM customer_addresses 
             WHERE customer_id = $1 
             ORDER BY updated_at DESC 
             LIMIT 1
           )`,
          [customerId]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting address:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Set default address
  async setDefaultAddress(addressId, customerId) {
    const client = await transaction();
    
    try {
      // First unset any existing default
      await client.query(
        `UPDATE customer_addresses 
         SET is_default = false 
         WHERE customer_id = $1 AND is_default = true`,
        [customerId]
      );

      // Set new default
      const result = await client.query(
        `UPDATE customer_addresses 
         SET is_default = true 
         WHERE id = $1 AND customer_id = $2
         RETURNING *`,
        [addressId, customerId]
      );

      if (result.rows.length === 0) {
        throw new Error('Address not found or not owned by customer');
      }

      await client.query('COMMIT');
      return { success: true, data: result.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting default address:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new AddressService();
