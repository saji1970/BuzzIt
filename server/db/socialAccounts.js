const { query, isConnected } = require('./postgres');

// Flag to track if table has been created
let tableInitialized = false;

// Create social_accounts table if it doesn't exist
async function createSocialAccountsTable() {
  if (tableInitialized) return;

  // Check if database is connected
  if (!isConnected()) {
    console.log('⏳ Database not ready yet, will create social_accounts table later');
    return;
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS social_accounts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      platform VARCHAR(50) NOT NULL,
      platform_user_id VARCHAR(255),
      username VARCHAR(255),
      display_name VARCHAR(255),
      profile_picture_url TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMP,
      scope TEXT,
      is_connected BOOLEAN DEFAULT true,
      last_published_at TIMESTAMP,
      publish_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
    CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON social_accounts(user_id, platform);
    CREATE INDEX IF NOT EXISTS idx_social_accounts_is_connected ON social_accounts(is_connected);
  `;

  try {
    await query(createTableQuery);
    tableInitialized = true;
    console.log('✅ Social accounts table ready');
  } catch (error) {
    console.error('❌ Error creating social accounts table:', error.message);
    throw error;
  }
}

// Helper function to ensure table exists before operations
async function ensureTableExists() {
  if (!tableInitialized) {
    await createSocialAccountsTable();
  }
}

// Social Account operations
class SocialAccount {
  static async findOne(conditions) {
    await ensureTableExists();

    const { userId, platform, isConnected } = conditions;

    // Build query dynamically based on conditions
    let queryText = 'SELECT * FROM social_accounts WHERE user_id = $1 AND platform = $2';
    const params = [userId, platform];

    // Handle isConnected filter
    if (isConnected !== undefined) {
      queryText += ' AND is_connected = $3';
      params.push(isConnected);
    }

    queryText += ' LIMIT 1';

    const result = await query(queryText, params);
    return result.rows[0] || null;
  }

  static async find(conditions) {
    await ensureTableExists();

    const { userId, platform, isConnected } = conditions;

    // Build query dynamically based on conditions
    let queryText = 'SELECT * FROM social_accounts WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    // Handle platform filter (supports both single value and MongoDB $in operator)
    if (platform) {
      if (platform.$in && Array.isArray(platform.$in)) {
        // MongoDB-style $in operator
        const placeholders = platform.$in.map((_, i) => `$${paramCount + i + 1}`).join(', ');
        queryText += ` AND platform IN (${placeholders})`;
        params.push(...platform.$in);
        paramCount += platform.$in.length;
      } else {
        // Single platform value
        paramCount++;
        queryText += ` AND platform = $${paramCount}`;
        params.push(platform);
      }
    }

    // Handle isConnected filter
    if (isConnected !== undefined) {
      paramCount++;
      queryText += ` AND is_connected = $${paramCount}`;
      params.push(isConnected);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows.map(row => ({
      ...row,
      userId: row.user_id,
      profileId: row.platform_user_id,
      profileUrl: row.profile_url,
      profilePicture: row.profile_picture_url,
      isConnected: row.is_connected,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.token_expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      displayName: row.display_name,
      scope: row.scope,
      lastPublishedAt: row.last_published_at,
      publishCount: row.publish_count,
    }));
  }

  static async findOneAndUpdate(conditions, updates, options = {}) {
    await ensureTableExists();

    const { userId, platform } = conditions;
    const {
      userId: updateUserId,
      username,
      accessToken,
      refreshToken,
      expiresAt,
      profileId,
      profileUrl,
      profilePicture,
      isConnected,
    } = updates;

    if (options.upsert) {
      // Try to update first
      const updateResult = await query(
        `UPDATE social_accounts
         SET username = $3, access_token = $4, refresh_token = $5,
             token_expires_at = $6, platform_user_id = $7, profile_picture_url = $8,
             is_connected = $9, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND platform = $2
         RETURNING *`,
        [
          userId,
          platform,
          username,
          accessToken,
          refreshToken,
          expiresAt,
          profileId,
          profilePicture,
          isConnected !== undefined ? isConnected : true,
        ]
      );

      if (updateResult.rows.length > 0) {
        const row = updateResult.rows[0];
        return {
          ...row,
          userId: row.user_id,
          profileId: row.platform_user_id,
          profileUrl: row.profile_url,
          profilePicture: row.profile_picture_url,
          isConnected: row.is_connected,
          accessToken: row.access_token,
          refreshToken: row.refresh_token,
          expiresAt: row.token_expires_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }

      // If no rows updated, insert
      const insertResult = await query(
        `INSERT INTO social_accounts
         (user_id, platform, username, access_token, refresh_token, token_expires_at, platform_user_id, profile_picture_url, is_connected)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          userId,
          platform,
          username,
          accessToken,
          refreshToken,
          expiresAt,
          profileId,
          profilePicture,
          isConnected !== undefined ? isConnected : true,
        ]
      );

      const row = insertResult.rows[0];
      return {
        ...row,
        userId: row.user_id,
        profileId: row.platform_user_id,
        profileUrl: row.profile_url,
        profilePicture: row.profile_picture_url,
        isConnected: row.is_connected,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.token_expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    // Regular update without upsert
    const result = await query(
      `UPDATE social_accounts
       SET username = $3, access_token = $4, refresh_token = $5,
           token_expires_at = $6, platform_user_id = $7, profile_picture_url = $8,
           is_connected = $9, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND platform = $2
       RETURNING *`,
      [
        userId,
        platform,
        username,
        accessToken,
        refreshToken,
        expiresAt,
        profileId,
        profilePicture,
        isConnected !== undefined ? isConnected : true,
      ]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      userId: row.user_id,
      profileId: row.platform_user_id,
      profileUrl: row.profile_url,
      profilePicture: row.profile_picture_url,
      isConnected: row.is_connected,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.token_expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      save: async function() {
        const saveResult = await query(
          `UPDATE social_accounts
           SET access_token = $3, refresh_token = $4, token_expires_at = $5,
               is_connected = $6, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND platform = $2
           RETURNING *`,
          [this.userId, this.platform, this.accessToken, this.refreshToken, this.expiresAt, this.isConnected]
        );
        return saveResult.rows[0];
      }
    };
  }

  static async findOneAndDelete(conditions) {
    await ensureTableExists();

    const { userId, platform } = conditions;
    const result = await query(
      'DELETE FROM social_accounts WHERE user_id = $1 AND platform = $2 RETURNING *',
      [userId, platform]
    );
    return result.rows[0] || null;
  }
}

module.exports = SocialAccount;
