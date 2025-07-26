#!/usr/bin/env node
/**
 * Mock Data Seeder for LocalModi Phase 2 Testing
 * Populates database with test vendors, customers, and sample data
 */

const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class DatabaseSeeder {
  constructor() {
    this.mockData = {
      vendors: [
        {
          id: uuidv4(),
          business_name: 'Fresh Mart',
          phone_number: '+919876543211',
          address: 'Shop 12, MG Road, Bangalore',
          location_lat: 12.9716,
          location_lng: 77.5946,
          categories: ['beverages', 'snacks'],
          is_active: true
        },
        {
          id: uuidv4(),
          business_name: 'Quick Store',
          phone_number: '+919876543212',
          address: 'Plot 45, Koramangala, Bangalore',
          location_lat: 12.9352,
          location_lng: 77.6245,
          categories: ['groceries', 'beverages'],
          is_active: true
        },
        {
          id: uuidv4(),
          business_name: 'Local Supplies',
          phone_number: '+919876543213',
          address: 'Street 8, Indiranagar, Bangalore',
          location_lat: 12.9719,
          location_lng: 77.6412,
          categories: ['snacks', 'groceries'],
          is_active: true
        }
      ],
      customers: [
        {
          id: uuidv4(),
          phone_number: '+919876543210',
          name: 'John Doe'
        },
        {
          id: uuidv4(),
          phone_number: '+919876543220',
          name: 'Jane Smith'
        }
      ],
      categories: [
        { id: uuidv4(), name: 'beverages', display_name: 'Beverages' },
        { id: uuidv4(), name: 'snacks', display_name: 'Snacks' },
        { id: uuidv4(), name: 'groceries', display_name: 'Groceries' }
      ]
    };
  }

  async clearExistingData() {
    console.log('🧹 Clearing existing test data...');
    
    const tables = [
      'notifications',
      'orders', 
      'vendor_responses',
      'rfq_items',
      'rfqs',
      'otp_verifications',
      'vendor_invites',
      'vendors',
      'customers',
      'categories'
    ];

    for (const table of tables) {
      try {
        await query(`DELETE FROM ${table} WHERE true`);
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not clear ${table}: ${error.message}`);
      }
    }
  }

  async seedCategories() {
    console.log('📂 Seeding categories...');
    
    for (const category of this.mockData.categories) {
      await query(
        `INSERT INTO categories (id, name, display_name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [category.id, category.name, category.display_name]
      );
    }
    
    console.log(`✅ Added ${this.mockData.categories.length} categories`);
  }

  async seedCustomers() {
    console.log('👤 Seeding customers...');
    
    for (const customer of this.mockData.customers) {
      await query(
        `INSERT INTO customers (id, phone_number, name, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [customer.id, customer.phone_number, customer.name]
      );
    }
    
    console.log(`✅ Added ${this.mockData.customers.length} customers`);
  }

  async seedVendors() {
    console.log('🏪 Seeding vendors...');
    
    return await transaction(async (client) => {
      for (const vendor of this.mockData.vendors) {
        // Insert vendor
        await client.query(
          `INSERT INTO vendors (id, business_name, phone_number, address, 
                               location_lat, location_lng, categories, is_active, 
                               created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            vendor.id, vendor.business_name, vendor.phone_number, 
            vendor.address, vendor.location_lat, vendor.location_lng,
            vendor.categories, vendor.is_active
          ]
        );

        // Create vendor invite (accepted)
        const inviteId = uuidv4();
        await client.query(
          `INSERT INTO vendor_invites (id, vendor_id, invited_by, status, 
                                      invited_at, responded_at, created_at, updated_at)
           VALUES ($1, $2, 'system', 'accepted', NOW(), NOW(), NOW(), NOW())`,
          [inviteId, vendor.id]
        );
      }
    });
    
    console.log(`✅ Added ${this.mockData.vendors.length} vendors with invites`);
  }

  async createSampleRFQ() {
    console.log('📝 Creating sample RFQ...');
    
    const customer = this.mockData.customers[0];
    const rfqId = uuidv4();
    
    return await transaction(async (client) => {
      // Create RFQ
      await client.query(
        `INSERT INTO rfqs (id, customer_id, category, location_lat, location_lng,
                          location_address, status, created_at, updated_at)
         VALUES ($1, $2, 'beverages', 12.9716, 77.5946, 
                 'MG Road, Bangalore', 'active', NOW(), NOW())`,
        [rfqId, customer.id]
      );

      // Add RFQ items
      const items = [
        { item: 'Limca', brand: 'Limca', unit: '500ml', qty: 3 },
        { item: 'Thums Up', brand: 'Thums Up', unit: '1L', qty: 2 }
      ];

      for (const item of items) {
        const itemId = uuidv4();
        await client.query(
          `INSERT INTO rfq_items (id, rfq_id, item_name, brand, unit, quantity,
                                 created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [itemId, rfqId, item.item, item.brand, item.unit, item.qty]
        );
      }

      // Create vendor responses for beverage vendors
      const beverageVendors = this.mockData.vendors.filter(v => 
        v.categories.includes('beverages')
      );

      for (const vendor of beverageVendors) {
        const responseId = uuidv4();
        await client.query(
          `INSERT INTO vendor_responses (id, rfq_id, vendor_id, status, 
                                        created_at, updated_at)
           VALUES ($1, $2, $3, 'pending', NOW(), NOW())`,
          [responseId, rfqId, vendor.id]
        );
      }

      return { rfqId, itemCount: items.length, vendorCount: beverageVendors.length };
    });
  }

  async displaySummary() {
    console.log('\n📊 Database Seeding Summary:');
    console.log('================================');
    
    const counts = await Promise.all([
      query('SELECT COUNT(*) FROM categories'),
      query('SELECT COUNT(*) FROM customers'), 
      query('SELECT COUNT(*) FROM vendors'),
      query('SELECT COUNT(*) FROM vendor_invites WHERE status = $1', ['accepted']),
      query('SELECT COUNT(*) FROM rfqs'),
      query('SELECT COUNT(*) FROM rfq_items'),
      query('SELECT COUNT(*) FROM vendor_responses')
    ]);

    console.log(`📂 Categories: ${counts[0].rows[0].count}`);
    console.log(`👤 Customers: ${counts[1].rows[0].count}`);
    console.log(`🏪 Vendors: ${counts[2].rows[0].count}`);
    console.log(`✅ Active Vendor Invites: ${counts[3].rows[0].count}`);
    console.log(`📝 RFQs: ${counts[4].rows[0].count}`);
    console.log(`📦 RFQ Items: ${counts[5].rows[0].count}`);
    console.log(`💬 Vendor Responses: ${counts[6].rows[0].count}`);
    
    console.log('\n🧪 Test Credentials:');
    console.log('====================');
    console.log('Customer Login: +919876543210 (John Doe)');
    console.log('Vendor Login: +919876543211 (Fresh Mart)');
    console.log('Vendor Login: +919876543212 (Quick Store)');
    console.log('Vendor Login: +919876543213 (Local Supplies)');
    
    console.log('\n🎯 Ready to test Phase 2 workflows!');
  }

  async seed() {
    try {
      console.log('🚀 Starting LocalModi Database Seeding...\n');
      
      await this.clearExistingData();
      await this.seedCategories();
      await this.seedCustomers();
      await this.seedVendors();
      
      const sampleRFQ = await this.createSampleRFQ();
      console.log(`✅ Created sample RFQ with ${sampleRFQ.itemCount} items and ${sampleRFQ.vendorCount} vendor responses`);
      
      await this.displaySummary();
      
      console.log('\n🎉 Database seeding completed successfully!');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.seed();
}

module.exports = DatabaseSeeder;
