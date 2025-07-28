const { query } = require('../config/database');

async function checkTables() {
  try {
    // Check if customer_addresses table exists
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customer_addresses';
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ customer_addresses table does not exist or has no columns');
      return;
    }
    
    console.log('✅ customer_addresses table exists with the following columns:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
