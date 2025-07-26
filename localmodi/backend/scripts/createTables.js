#!/usr/bin/env node
/**
 * Create LocalModi tables directly on Railway PostgreSQL
 */

const { query } = require('../config/database');
require('dotenv').config();

async function createTables() {
  console.log('🚀 Creating LocalModi tables on Railway PostgreSQL...\n');
  
  const tables = [
    {
      name: 'categories',
      sql: `CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'customers',
      sql: `CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY,
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'vendors',
      sql: `CREATE TABLE IF NOT EXISTS vendors (
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
      )`
    },
    {
      name: 'vendor_invites',
      sql: `CREATE TABLE IF NOT EXISTS vendor_invites (
        id UUID PRIMARY KEY,
        vendor_id UUID NOT NULL,
        invited_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        invited_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'rfqs',
      sql: `CREATE TABLE IF NOT EXISTS rfqs (
        id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        category VARCHAR(50) NOT NULL,
        location_lat DECIMAL(10, 8) NOT NULL,
        location_lng DECIMAL(11, 8) NOT NULL,
        location_address TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'rfq_items',
      sql: `CREATE TABLE IF NOT EXISTS rfq_items (
        id UUID PRIMARY KEY,
        rfq_id UUID NOT NULL,
        item_name VARCHAR(200) NOT NULL,
        brand VARCHAR(100),
        unit VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'vendor_responses',
      sql: `CREATE TABLE IF NOT EXISTS vendor_responses (
        id UUID PRIMARY KEY,
        rfq_id UUID NOT NULL,
        vendor_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        quoted_price DECIMAL(10, 2),
        notes TEXT,
        quoted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'orders',
      sql: `CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        rfq_id UUID NOT NULL,
        customer_id UUID NOT NULL,
        vendor_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        total_amount DECIMAL(10, 2),
        delivery_address TEXT,
        delivery_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'otp_verifications',
      sql: `CREATE TABLE IF NOT EXISTS otp_verifications (
        phone_number VARCHAR(15) PRIMARY KEY,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    },
    {
      name: 'notifications',
      sql: `CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        user_type VARCHAR(20) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        rfq_id UUID,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }
  ];

  try {
    for (const table of tables) {
      console.log(`🔧 Creating table: ${table.name}`);
      await query(table.sql);
      console.log(`✅ Created: ${table.name}`);
    }

    // Verify tables were created
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📋 Created Tables:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    console.log(`\n🎉 Successfully created ${result.rows.length} tables!`);
    console.log('\n🎯 Ready to seed database with test data!');
    console.log('Run: node scripts/seedDatabase.js');

  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };
