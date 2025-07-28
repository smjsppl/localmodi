#!/usr/bin/env node
/**
 * Test Railway PostgreSQL Database Connection
 */

const { pool, query } = require('../config/database');
require('dotenv').config();

async function testConnection() {
  console.log('🔌 Testing Railway PostgreSQL Connection...\n');
  
  try {
    // Test basic connection
    console.log('📡 Connecting to Railway database...');
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    
    console.log('✅ Database connection successful!');
    console.log(`🕐 Current time: ${result.rows[0].current_time}`);
    console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
    
    // Test database info
    const dbInfo = await query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);
    
    console.log('\n📊 Database Information:');
    console.log(`Database: ${dbInfo.rows[0].database_name}`);
    console.log(`User: ${dbInfo.rows[0].user_name}`);
    console.log(`Server: ${dbInfo.rows[0].server_ip}:${dbInfo.rows[0].server_port}`);
    
    // Check if tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing Tables:');
    if (tables.rows.length === 0) {
      console.log('❌ No tables found - Schema needs to be created');
    } else {
      tables.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }
    
    console.log('\n🎉 Railway database is ready for LocalModi!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible issues:');
      console.error('  - Check DB_HOST in .env file');
      console.error('  - Verify internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible issues:');
      console.error('  - Check DB_PORT in .env file');
      console.error('  - Verify Railway database is running');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Possible issues:');
      console.error('  - Check DB_USER and DB_PASSWORD in .env file');
      console.error('  - Verify Railway database credentials');
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testConnection();
