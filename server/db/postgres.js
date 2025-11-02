const { Pool } = require('pg');

let pool = null;
let isConnected = false;

const connectDB = async () => {
  if (isConnected && pool) {
    console.log('✅ PostgreSQL already connected');
    return pool;
  }

  // Get PostgreSQL connection string
  const connectionString = process.env.DATABASE_URL || 
                          process.env.POSTGRES_URL ||
                          process.env.POSTGRES_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL environment variable not set');
    console.warn('⚠️ Server will run in fallback mode (in-memory storage only)');
    console.warn('⚠️ To enable database, set DATABASE_URL in Railway environment variables');
    isConnected = false;
    return null;
  }

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('sslmode=require') 
        ? { rejectUnauthorized: false } 
        : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 20, // Maximum number of clients in the pool
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    isConnected = true;
    console.log('✅ PostgreSQL connected successfully');
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err);
      isConnected = false;
    });

    // Initialize database tables if they don't exist
    await initializeTables();
    
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message || error);
    isConnected = false;
    pool = null;
    console.warn('⚠️ Server will continue without database connection');
    console.warn('⚠️ Users and data will be stored in memory only');
    return null;
  }
};

const initializeTables = async () => {
  if (!pool || !isConnected) return;

  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        display_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        mobile_number VARCHAR(50),
        bio TEXT,
        avatar TEXT,
        date_of_birth VARCHAR(50),
        interests JSONB DEFAULT '[]',
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        buzz_count INTEGER DEFAULT 0,
        subscribed_channels JSONB DEFAULT '[]',
        blocked_users JSONB DEFAULT '[]',
        is_verified BOOLEAN DEFAULT false,
        banned BOOLEAN DEFAULT false,
        banned_at TIMESTAMP,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    // Create buzzes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS buzzes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'text',
        media_type VARCHAR(50),
        media_url TEXT,
        interests JSONB DEFAULT '[]',
        location_latitude DECIMAL(10, 8),
        location_longitude DECIMAL(11, 8),
        location_city VARCHAR(255),
        location_country VARCHAR(255),
        buzz_type VARCHAR(50) DEFAULT 'thought',
        event_date TIMESTAMP,
        poll_options JSONB DEFAULT '[]',
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        is_liked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create buzzes indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_buzzes_user_id ON buzzes(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_buzzes_created_at ON buzzes(created_at DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_buzzes_user_created ON buzzes(user_id, created_at DESC)');

    // Create user_interactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        buzz_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON user_interactions(user_id, timestamp DESC)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_interactions_buzz_id ON user_interactions(buzz_id, type)');

    // Create verification_codes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id VARCHAR(255) PRIMARY KEY,
        mobile_number VARCHAR(50) NOT NULL,
        code VARCHAR(10) NOT NULL,
        username VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_verification_mobile ON verification_codes(mobile_number)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_verification_expires ON verification_codes(expires_at)');

    // Create live_streams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS live_streams (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stream_url TEXT NOT NULL,
        thumbnail_url TEXT,
        is_live BOOLEAN DEFAULT true,
        viewers INTEGER DEFAULT 0,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_streams_user_id ON live_streams(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_streams_is_live ON live_streams(is_live)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_streams_started_at ON live_streams(started_at DESC)');

    client.release();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message || error);
  }
};

const getPool = () => {
  return pool;
};

const query = async (text, params) => {
  if (!pool || !isConnected) {
    throw new Error('Database not connected');
  }
  return pool.query(text, params);
};

module.exports = { 
  connectDB, 
  getPool,
  query,
  isConnected: () => isConnected 
};

