const { v4: uuidv4 } = require('uuid');
const { query, transaction } = require('../config/database');

class RFQService {
  constructor() {
    this.rfqStatuses = ['pending', 'active', 'quoted', 'accepted', 'completed', 'cancelled'];
    this.responseStatuses = ['pending', 'submitted', 'accepted', 'rejected'];
  }

  // Create RFQ from customer order
  async createRFQ(customerId, orderData, location) {
    try {
      return await transaction(async (client) => {
        // Create RFQ
        const rfqId = uuidv4();
        const rfqResult = await client.query(
          `INSERT INTO rfqs (id, customer_id, category, location_lat, location_lng, 
                            location_address, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
           RETURNING *`,
          [rfqId, customerId, orderData.category, location.lat, location.lng, location.address]
        );

        const rfq = rfqResult.rows[0];

        // Add RFQ items
        const rfqItems = [];
        for (const item of orderData.items) {
          const itemId = uuidv4();
          const itemResult = await client.query(
            `INSERT INTO rfq_items (id, rfq_id, item_name, brand, unit, quantity, 
                                   created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
            [itemId, rfqId, item.item, item.brand, item.unit, item.qty]
          );
          rfqItems.push(itemResult.rows[0]);
        }

        // Find nearby vendors for this category
        const nearbyVendors = await this.findNearbyVendors(
          location.lat, 
          location.lng, 
          orderData.category,
          client
        );

        // Create vendor responses (initially pending)
        const vendorResponses = [];
        for (const vendor of nearbyVendors) {
          const responseId = uuidv4();
          const responseResult = await client.query(
            `INSERT INTO vendor_responses (id, rfq_id, vendor_id, status, created_at, updated_at)
             VALUES ($1, $2, $3, 'pending', NOW(), NOW())
             RETURNING *`,
            [responseId, rfqId, vendor.id]
          );
          vendorResponses.push({
            ...responseResult.rows[0],
            vendor_name: vendor.business_name
          });
        }

        // Update RFQ status to active if vendors found
        if (nearbyVendors.length > 0) {
          await client.query(
            'UPDATE rfqs SET status = $1, updated_at = NOW() WHERE id = $2',
            ['active', rfqId]
          );
          rfq.status = 'active';
        }

        return {
          success: true,
          rfq: {
            ...rfq,
            items: rfqItems,
            vendor_responses: vendorResponses,
            vendors_notified: nearbyVendors.length
          }
        };
      });
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw new Error('Failed to create RFQ');
    }
  }

  // Find nearby vendors for a category
  async findNearbyVendors(lat, lng, category, client = null) {
    try {
      const queryClient = client || { query };
      
      // Find vendors within 5km radius who serve this category
      const result = await queryClient.query(
        `SELECT v.*, 
                (6371 * acos(cos(radians($1)) * cos(radians(v.location_lat)) * 
                cos(radians(v.location_lng) - radians($2)) + 
                sin(radians($1)) * sin(radians(v.location_lat)))) AS distance
         FROM vendors v
         JOIN vendor_invites vi ON v.id = vi.vendor_id
         WHERE vi.status = 'accepted' 
           AND v.is_active = true
           AND $3 = ANY(v.categories)
           AND (6371 * acos(cos(radians($1)) * cos(radians(v.location_lat)) * 
                cos(radians(v.location_lng) - radians($2)) + 
                sin(radians($1)) * sin(radians(v.location_lat)))) <= 5
         ORDER BY distance
         LIMIT 10`,
        [lat, lng, category]
      );

      return result.rows;
    } catch (error) {
      console.error('Error finding nearby vendors:', error);
      return [];
    }
  }

  // Get RFQs for vendor
  async getVendorRFQs(vendorId, status = null) {
    try {
      let whereClause = 'WHERE vr.vendor_id = $1';
      let params = [vendorId];

      if (status) {
        whereClause += ' AND vr.status = $2';
        params.push(status);
      }

      const result = await query(
        `SELECT r.*, vr.status as response_status, vr.quoted_price, vr.notes,
                c.name as customer_name, c.phone_number as customer_phone,
                COUNT(ri.id) as item_count
         FROM rfqs r
         JOIN vendor_responses vr ON r.id = vr.rfq_id
         JOIN customers c ON r.customer_id = c.id
         LEFT JOIN rfq_items ri ON r.id = ri.rfq_id
         ${whereClause}
         GROUP BY r.id, vr.id, c.id
         ORDER BY r.created_at DESC`,
        params
      );

      return {
        success: true,
        rfqs: result.rows
      };
    } catch (error) {
      console.error('Error getting vendor RFQs:', error);
      throw new Error('Failed to get vendor RFQs');
    }
  }

  // Get RFQ details with items
  async getRFQDetails(rfqId, vendorId = null) {
    try {
      // Get RFQ basic info
      let rfqQuery = `
        SELECT r.*, c.name as customer_name, c.phone_number as customer_phone
        FROM rfqs r
        JOIN customers c ON r.customer_id = c.id
        WHERE r.id = $1
      `;
      let rfqParams = [rfqId];

      if (vendorId) {
        rfqQuery += ` AND EXISTS (
          SELECT 1 FROM vendor_responses vr 
          WHERE vr.rfq_id = r.id AND vr.vendor_id = $2
        )`;
        rfqParams.push(vendorId);
      }

      const rfqResult = await query(rfqQuery, rfqParams);
      
      if (rfqResult.rows.length === 0) {
        return {
          success: false,
          message: 'RFQ not found or access denied'
        };
      }

      const rfq = rfqResult.rows[0];

      // Get RFQ items
      const itemsResult = await query(
        'SELECT * FROM rfq_items WHERE rfq_id = $1 ORDER BY created_at',
        [rfqId]
      );

      // Get vendor response if vendorId provided
      let vendorResponse = null;
      if (vendorId) {
        const responseResult = await query(
          'SELECT * FROM vendor_responses WHERE rfq_id = $1 AND vendor_id = $2',
          [rfqId, vendorId]
        );
        vendorResponse = responseResult.rows[0] || null;
      }

      return {
        success: true,
        rfq: {
          ...rfq,
          items: itemsResult.rows,
          vendor_response: vendorResponse
        }
      };
    } catch (error) {
      console.error('Error getting RFQ details:', error);
      throw new Error('Failed to get RFQ details');
    }
  }

  // Submit vendor quote
  async submitVendorQuote(rfqId, vendorId, quoteData) {
    try {
      return await transaction(async (client) => {
        // Update vendor response
        const responseResult = await client.query(
          `UPDATE vendor_responses 
           SET status = 'submitted', quoted_price = $1, notes = $2, 
               quoted_at = NOW(), updated_at = NOW()
           WHERE rfq_id = $3 AND vendor_id = $4
           RETURNING *`,
          [quoteData.total_price, quoteData.notes, rfqId, vendorId]
        );

        if (responseResult.rows.length === 0) {
          throw new Error('Vendor response not found');
        }

        // Update RFQ status to quoted if this is the first quote
        await client.query(
          `UPDATE rfqs 
           SET status = 'quoted', updated_at = NOW() 
           WHERE id = $1 AND status = 'active'`,
          [rfqId]
        );

        // Create notification for customer
        await client.query(
          `INSERT INTO notifications (id, user_id, user_type, title, message, 
                                     rfq_id, created_at)
           VALUES ($1, (SELECT customer_id FROM rfqs WHERE id = $2), 'customer', 
                   'New Quote Received', 'A vendor has submitted a quote for your order', 
                   $2, NOW())`,
          [uuidv4(), rfqId]
        );

        return {
          success: true,
          message: 'Quote submitted successfully',
          response: responseResult.rows[0]
        };
      });
    } catch (error) {
      console.error('Error submitting vendor quote:', error);
      throw new Error('Failed to submit quote');
    }
  }

  // Get customer RFQs
  async getCustomerRFQs(customerId) {
    try {
      const result = await query(
        `SELECT r.*, COUNT(ri.id) as item_count,
                COUNT(vr.id) FILTER (WHERE vr.status = 'submitted') as quote_count
         FROM rfqs r
         LEFT JOIN rfq_items ri ON r.id = ri.rfq_id
         LEFT JOIN vendor_responses vr ON r.id = vr.rfq_id
         WHERE r.customer_id = $1
         GROUP BY r.id
         ORDER BY r.created_at DESC`,
        [customerId]
      );

      return {
        success: true,
        rfqs: result.rows
      };
    } catch (error) {
      console.error('Error getting customer RFQs:', error);
      throw new Error('Failed to get customer RFQs');
    }
  }

  // Get quotes for customer RFQ
  async getCustomerRFQQuotes(rfqId, customerId) {
    try {
      // Verify RFQ belongs to customer
      const rfqCheck = await query(
        'SELECT id FROM rfqs WHERE id = $1 AND customer_id = $2',
        [rfqId, customerId]
      );

      if (rfqCheck.rows.length === 0) {
        return {
          success: false,
          message: 'RFQ not found'
        };
      }

      // Get quotes
      const result = await query(
        `SELECT vr.*, v.business_name, v.phone_number as vendor_phone,
                v.address as vendor_address
         FROM vendor_responses vr
         JOIN vendors v ON vr.vendor_id = v.id
         WHERE vr.rfq_id = $1 AND vr.status = 'submitted'
         ORDER BY vr.quoted_price ASC`,
        [rfqId]
      );

      return {
        success: true,
        quotes: result.rows
      };
    } catch (error) {
      console.error('Error getting customer RFQ quotes:', error);
      throw new Error('Failed to get RFQ quotes');
    }
  }

  // Accept vendor quote
  async acceptVendorQuote(rfqId, vendorId, customerId) {
    try {
      return await transaction(async (client) => {
        // Verify RFQ belongs to customer
        const rfqCheck = await client.query(
          'SELECT id FROM rfqs WHERE id = $1 AND customer_id = $2',
          [rfqId, customerId]
        );

        if (rfqCheck.rows.length === 0) {
          throw new Error('RFQ not found');
        }

        // Accept the vendor response
        await client.query(
          `UPDATE vendor_responses 
           SET status = 'accepted', updated_at = NOW()
           WHERE rfq_id = $1 AND vendor_id = $2`,
          [rfqId, vendorId]
        );

        // Reject other vendor responses
        await client.query(
          `UPDATE vendor_responses 
           SET status = 'rejected', updated_at = NOW()
           WHERE rfq_id = $1 AND vendor_id != $2`,
          [rfqId, vendorId]
        );

        // Update RFQ status
        await client.query(
          'UPDATE rfqs SET status = $1, updated_at = NOW() WHERE id = $2',
          ['accepted', rfqId]
        );

        // Create order
        const orderId = uuidv4();
        const orderResult = await client.query(
          `INSERT INTO orders (id, rfq_id, customer_id, vendor_id, status, 
                              created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'confirmed', NOW(), NOW())
           RETURNING *`,
          [orderId, rfqId, customerId, vendorId]
        );

        // Notify vendor
        await client.query(
          `INSERT INTO notifications (id, user_id, user_type, title, message, 
                                     rfq_id, created_at)
           VALUES ($1, $2, 'vendor', 'Quote Accepted', 
                   'Your quote has been accepted by the customer', $3, NOW())`,
          [uuidv4(), vendorId, rfqId]
        );

        return {
          success: true,
          message: 'Quote accepted successfully',
          order: orderResult.rows[0]
        };
      });
    } catch (error) {
      console.error('Error accepting vendor quote:', error);
      throw new Error('Failed to accept quote');
    }
  }
}

module.exports = new RFQService();
