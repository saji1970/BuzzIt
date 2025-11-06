/**
 * Migration Script: Add interests column to channels table
 * 
 * Run this script to add the interests column to existing channels tables
 * 
 * Usage:
 *   node run_migration.js
 * 
 * Or set DATABASE_URL environment variable:
 *   DATABASE_URL=your_connection_string node run_migration.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 
                        process.env.POSTGRES_URL ||
                        process.env.POSTGRES_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('   Set DATABASE_URL in Railway or create .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('railway') || connectionString.includes('rlwy.net') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running migration: Add interests column to channels table...');
    
    // Check if column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'channels' AND column_name = 'interests'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Interests column already exists. No migration needed.');
      return;
    }
    
    // Add the column
    await client.query(`
      ALTER TABLE channels 
      ADD COLUMN interests JSONB DEFAULT '[]'
    `);
    
    console.log('✅ Successfully added interests column to channels table');
    
    // Verify
    const verify = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'channels' AND column_name = 'interests'
    `);
    
    if (verify.rows.length > 0) {
      console.log('✅ Verification successful:', verify.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Error code:', error.code);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

