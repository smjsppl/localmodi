require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'localmodi',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

// Create a new pool
const pool = new Pool(dbConfig);

// Helper function to execute queries with better error handling
const query = async (text, params = []) => {
  const client = await pool.connect();
  try {
    console.log(`🔍 Executing: ${text.substring(0, 100)}...`);
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Query executed in ${duration}ms`);
    return res;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting database migration...');
    
    // Check if we can connect to the database
    console.log('🔍 Testing database connection...');
    const dbRes = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful. Current time:', dbRes.rows[0].now);

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/20230726_add_customer_addresses_simple.sql');
    console.log(`🔍 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    console.log('🔄 Running migration...');
    await client.query(migrationSQL);
    
    // Record the migration
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)', 
      ['20230726_add_customer_addresses_simple.sql']
    );
    
    await client.query('COMMIT');
    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Check if migrations table exists, if not create it
async function ensureMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Migrations table ready');
  } catch (error) {
    console.error('❌ Error ensuring migrations table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Check if migration already ran
async function checkIfMigrationRan() {
  try {
    const result = await query(
      'SELECT 1 FROM migrations WHERE name = $1', 
      ['20230726_add_customer_addresses_simple.sql']
    );
    return result.rows.length > 0;
  } catch (error) {
    // Table might not exist yet
    return false;
  }
}

// Main function
async function main() {
  try {
    await ensureMigrationsTable();
    
    const alreadyRan = await checkIfMigrationRan();
    if (alreadyRan) {
      console.log('⏭️  Migration already applied, skipping...');
      return;
    }
    
    await runMigration();
  } catch (error) {
    console.error('❌ Error in migration process:', error);
    process.exit(1);
  }
}

main();
