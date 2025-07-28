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

// Create a new pool for debugging
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

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🚀 Starting database migrations...');
    
    // Check if we can connect to the database
    console.log('🔍 Testing database connection...');
    const dbRes = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful. Current time:', dbRes.rows[0].now);

    // Create migrations table if it doesn't exist
    console.log('🔍 Checking migrations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Migrations table ready');

    // Read all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    console.log(`🔍 Reading migration files from: ${migrationsDir}`);
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Found ${migrationFiles.length} migration files`);

    // Get already run migrations
    const { rows: completedMigrations } = await client.query('SELECT name FROM migrations');
    const completedMigrationNames = new Set(completedMigrations.map(m => m.name));
    console.log(`📊 Completed migrations: ${completedMigrations.length}`);

    // Run new migrations
    for (const file of migrationFiles) {
      if (!completedMigrationNames.has(file)) {
        console.log(`\n🔄 Running migration: ${file}`);
        try {
          const migrationPath = path.join(migrationsDir, file);
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          
          // Split the SQL into individual statements
          const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
          
          console.log(`🔍 Executing ${statements.length} statements from ${file}`);
          
          for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            if (!stmt.trim()) continue;
            
            console.log(`📝 Statement ${i + 1}/${statements.length}: ${stmt.substring(0, 60)}...`);
            await client.query(stmt);
          }
          
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          console.log(`✅ Successfully applied migration: ${file}`);
        } catch (error) {
          console.error(`❌ Error in migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`⏩ Migration already applied: ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✨ All migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
