#!/usr/bin/env node
/**
 * Setup LocalModi Database Schema on Railway PostgreSQL
 */

const { query, transaction } = require('../config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupSchema() {
  console.log('🚀 Setting up LocalModi schema on Railway PostgreSQL...\n');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found at:', schemaPath);
      console.log('💡 Creating schema directly in script...');
      await createSchemaDirectly();
      return;
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema file loaded successfully');
    
    // Execute schema in transaction
    await transaction(async (client) => {
      console.log('🔧 Creating database schema...');
      await client.query(schemaSQL);
      console.log('✅ Schema created successfully');
    });
    
    // Verify tables were created
    await verifySchema();
    
    console.log('\n🎉 Railway database schema setup completed!');
    
  } catch (error) {
    console.error('❌ Schema setup failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('💡 Some tables already exist. This is normal if re-running setup.');
      await verifySchema();
    } else {
      throw error;
    }
  }
}

async function createSchemaDirectly() {
  console.log('🔧 Creating schema directly...');
  
  const schemaTables = [
    // Categories table
    `CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // Customers table
    `CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      phone_number VARCHAR(15) UNIQUE NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // Vendors table
    `CREATE TABLE IF NOT EXISTS vendors (
      id UUID PRIMARY KEY,
      business_name VARCHAR(200) NOT NULL,
      phone_number VARCHAR(15) UNIQUE NOT NULL,
      address TEXT NOT NULL,
      location_lat DECIMAL(10, 8) NOT NULL,
      location_lng DECIMAL(11, 8) NOT NULL,
      categories TEXT[] NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // Vendor invites table
    `CREATE TABLE IF NOT EXISTS vendor_invites (
      id UUID PRIMARY KEY,
      vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
      invited_by VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      invited_at TIMESTAMP DEFAULT NOW(),
      responded_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // RFQs table
    `CREATE TABLE IF NOT EXISTS rfqs (
      id UUID PRIMARY KEY,
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      category VARCHAR(50) NOT NULL,
      location_lat DECIMAL(10, 8) NOT NULL,
      location_lng DECIMAL(11, 8) NOT NULL,
      location_address TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'quoted', 'accepted', 'completed', 'cancelled')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // RFQ items table
    `CREATE TABLE IF NOT EXISTS rfq_items (
      id UUID PRIMARY KEY,
      rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
      item_name VARCHAR(200) NOT NULL,
      brand VARCHAR(100),
      unit VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // Vendor responses table
    `CREATE TABLE IF NOT EXISTS vendor_responses (
      id UUID PRIMARY KEY,
      rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
      vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'accepted', 'rejected')),
      quoted_price DECIMAL(10, 2),
      notes TEXT,
      quoted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(rfq_id, vendor_id)
    )`,
    
    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
      vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
      total_amount DECIMAL(10, 2),
      delivery_address TEXT,
      delivery_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // OTP verifications table
    `CREATE TABLE IF NOT EXISTS otp_verifications (
      phone_number VARCHAR(15) PRIMARY KEY,
      otp_code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    
    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL,
      user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'vendor')),
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  ];
  
  await transaction(async (client) => {
    for (const tableSQL of schemaTables) {
      await client.query(tableSQL);
      console.log('✅ Created table');
    }
  });
  
  console.log('✅ All tables created successfully');
}

async function verifySchema() {
  console.log('\n🔍 Verifying schema...');
  
  const tables = await query(`
    SELECT table_name, 
           (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = t.table_name AND table_schema = 'public') as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  console.log('\n📋 Created Tables:');
  tables.rows.forEach(row => {
    console.log(`  ✅ ${row.table_name} (${row.column_count} columns)`);
  });
  
  console.log(`\n📊 Total tables created: ${tables.rows.length}`);
}

// Run setup if called directly
if (require.main === module) {
  setupSchema()
    .then(() => {
      console.log('\n🎯 Ready to seed database with test data!');
      console.log('Run: node scripts/seedDatabase.js');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSchema };
