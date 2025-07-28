require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Read all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure they run in order

    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get already run migrations
    const { rows: completedMigrations } = await query('SELECT name FROM migrations');
    const completedMigrationNames = new Set(completedMigrations.map(m => m.name));

    // Run new migrations
    for (const file of migrationFiles) {
      if (!completedMigrationNames.has(file)) {
        console.log(`🔄 Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Run the migration in a transaction
        await query('BEGIN');
        try {
          await query(migrationSQL);
          await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await query('COMMIT');
          console.log(`✅ Successfully applied migration: ${file}`);
        } catch (error) {
          await query('ROLLBACK');
          console.error(`❌ Error applying migration ${file}:`, error);
          process.exit(1);
        }
      } else {
        console.log(`⏩ Migration already applied: ${file}`);
      }
    }

    console.log('✨ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigrations();
