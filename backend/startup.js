#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabaseConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/crm_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔍 Checking database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'crm_%'
      ORDER BY table_name
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No CRM tables found. Please run the database schema:');
      console.log('   psql -d your_database -f database/crm-schema.sql');
    } else {
      console.log(`✅ Found ${result.rows.length} CRM tables:`, 
        result.rows.map(r => r.table_name).join(', ')
      );
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('   1. Install PostgreSQL');
    console.log('   2. Create a database');
    console.log('   3. Update DATABASE_URL in .env file');
    console.log('   4. Run database schema: psql -d your_database -f database/crm-schema.sql');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('🚀 Starting CRM API Server...\n');
  
  // Check environment
  if (!process.env.JWT_SECRET) {
    console.log('⚠️  JWT_SECRET not set, using fallback (not recommended for production)');
  }
  
  // Check database
  await checkDatabaseConnection();
  
  console.log('\n🌟 Starting Express server...');
  
  // Start the main application
  require('./crm-api.js');
}

main().catch(console.error);