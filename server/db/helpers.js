/**
 * Database helper functions for PostgreSQL queries
 */

const { query, isConnected } = require('./postgres');

// Helper to convert database user row to object
const convertDbUserToObject = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password, // Include password for authentication
    displayName: row.display_name,
    email: row.email || '',
    mobileNumber: row.mobile_number || '',
    bio: row.bio || '',
    avatar: row.avatar,
    dateOfBirth: row.date_of_birth,
    interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : (row.interests || []),
    followers: row.followers || 0,
    following: row.following || 0,
    buzzCount: row.buzz_count || 0,
    subscribedChannels: typeof row.subscribed_channels === 'string' ? JSON.parse(row.subscribed_channels) : (row.subscribed_channels || []),
    blockedUsers: typeof row.blocked_users === 'string' ? JSON.parse(row.blocked_users) : (row.blocked_users || []),
    isVerified: row.is_verified || false,
    banned: row.banned || false,
    role: row.role || 'user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Helper to convert database buzz row to object
const convertDbBuzzToObject = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    userAvatar: null,
    content: row.content,
    media: {
      type: row.media_type || null,
      url: row.media_url || null,
    },
    interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : (row.interests || []),
    location: row.location_latitude && row.location_longitude ? {
      latitude: parseFloat(row.location_latitude),
      longitude: parseFloat(row.location_longitude),
      city: row.location_city,
      country: row.location_country,
    } : undefined,
    buzzType: row.buzz_type || 'thought',
    eventDate: row.event_date,
    pollOptions: typeof row.poll_options === 'string' ? JSON.parse(row.poll_options) : (row.poll_options || []),
    likes: row.likes || 0,
    comments: row.comments || 0,
    shares: row.shares || 0,
    isLiked: row.is_liked || false,
    createdAt: row.created_at,
  };
};

// User queries
const getUserById = async (userId) => {
  if (!userId) {
    console.error('getUserById called with null/undefined userId');
    return null;
  }
  
  if (!isConnected()) {
    console.warn('Database not connected, cannot fetch user:', userId);
    return null;
  }
  
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      const user = convertDbUserToObject(result.rows[0]);
      console.log('User fetched:', { id: user.id, username: user.username });
      return user;
    } else {
      console.warn('User not found in database:', userId);
      return null;
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      userId: userId,
    });
    return null;
  }
};

const getUserByUsername = async (username) => {
  if (!isConnected()) return null;
  try {
    const result = await query('SELECT * FROM users WHERE LOWER(username) = $1', [username.toLowerCase()]);
    return result.rows.length > 0 ? convertDbUserToObject(result.rows[0]) : null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

const getAllUsers = async () => {
  if (!isConnected()) return [];
  try {
    const result = await query('SELECT id, username, display_name, email, mobile_number, bio, avatar, date_of_birth, interests, followers, following, buzz_count, subscribed_channels, blocked_users, is_verified, banned, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    return result.rows.map(convertDbUserToObject);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

const getUserCount = async (filters = {}) => {
  if (!isConnected()) return 0;
  try {
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.role) {
      whereClause += ` AND role = $${paramIndex++}`;
      params.push(filters.role);
    }

    const result = await query(`SELECT COUNT(*) as count FROM users WHERE ${whereClause}`, params);
    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
};

const getUsersPaginated = async (page = 1, limit = 20, filters = {}) => {
  if (!isConnected()) return { users: [], total: 0 };
  try {
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.role) {
      whereClause += ` AND role = $${paramIndex++}`;
      params.push(filters.role);
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const result = await query(
      `SELECT id, username, display_name, email, mobile_number, bio, avatar, date_of_birth, interests, followers, following, buzz_count, subscribed_channels, blocked_users, is_verified, banned, role, created_at, updated_at 
       FROM users 
       WHERE ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) as count FROM users WHERE ${whereClause}`, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count) || 0;

    return {
      users: result.rows.map(convertDbUserToObject),
      total,
    };
  } catch (error) {
    console.error('Error getting paginated users:', error);
    return { users: [], total: 0 };
  }
};

// Buzz queries
const getBuzzById = async (buzzId) => {
  if (!isConnected()) return null;
  try {
    const result = await query('SELECT * FROM buzzes WHERE id = $1', [buzzId]);
    return result.rows.length > 0 ? convertDbBuzzToObject(result.rows[0]) : null;
  } catch (error) {
    console.error('Error getting buzz by ID:', error);
    return null;
  }
};

const getAllBuzzes = async (filters = {}) => {
  if (!isConnected()) return [];
  try {
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    const result = await query(
      `SELECT * FROM buzzes WHERE ${whereClause} ORDER BY created_at DESC`,
      params
    );
    return result.rows.map(convertDbBuzzToObject);
  } catch (error) {
    console.error('Error getting all buzzes:', error);
    return [];
  }
};

const getBuzzesPaginated = async (page = 1, limit = 20, filters = {}) => {
  if (!isConnected()) return { buzzes: [], total: 0 };
  try {
    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.userId) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const result = await query(
      `SELECT * FROM buzzes WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) as count FROM buzzes WHERE ${whereClause}`, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count) || 0;

    return {
      buzzes: result.rows.map(convertDbBuzzToObject),
      total,
    };
  } catch (error) {
    console.error('Error getting paginated buzzes:', error);
    return { buzzes: [], total: 0 };
  }
};

module.exports = {
  convertDbUserToObject,
  convertDbBuzzToObject,
  getUserById,
  getUserByUsername,
  getAllUsers,
  getUserCount,
  getUsersPaginated,
  getBuzzById,
  getAllBuzzes,
  getBuzzesPaginated,
};

