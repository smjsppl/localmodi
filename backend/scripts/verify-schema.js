const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'localmodi',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function verifySchema() {
  const pool = new Pool(dbConfig);
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying database schema...');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'customer_addresses'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ customer_addresses table does not exist');
      return;
    }
    
    console.log('✅ customer_addresses table exists');
    
    // Get table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customer_addresses'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nTable structure:');
    console.table(columns.rows);
    
    // Check if extension is installed
    const extensionCheck = await client.query(`
      SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
    `);
    
    if (extensionCheck.rows.length === 0) {
      console.log('⚠️  uuid-ossp extension is not installed');
    } else {
      console.log('✅ uuid-ossp extension is installed');
    }
    
    // Check if trigger exists
    const triggerCheck = await client.query(`
      SELECT * FROM pg_trigger 
      WHERE tgname = 'update_customer_addresses_updated_at';
    `);
    
    if (triggerCheck.rows.length === 0) {
      console.log('⚠️  update_customer_addresses_updated_at trigger does not exist');
    } else {
      console.log('✅ update_customer_addresses_updated_at trigger exists');
    }
    
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifySchema();
