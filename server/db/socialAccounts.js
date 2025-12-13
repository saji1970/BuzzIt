const { query } = require('./postgres');

// Create social_accounts table if it doesn't exist
async function createSocialAccountsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS social_accounts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      platform VARCHAR(50) NOT NULL,
      username VARCHAR(255),
      access_token TEXT,
      refresh_token TEXT,
      expires_at TIMESTAMP,
      profile_id VARCHAR(255),
      profile_url TEXT,
      profile_picture TEXT,
      is_connected BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
  `;

  try {
    await query(createTableQuery);
    console.log('✅ Social accounts table ready');
  } catch (error) {
    console.error('Error creating social accounts table:', error);
  }
}

// Initialize table on import
createSocialAccountsTable();

// Social Account operations
class SocialAccount {
  static async findOne(conditions) {
    const { userId, platform } = conditions;
    const result = await query(
      'SELECT * FROM social_accounts WHERE user_id = $1 AND platform = $2 LIMIT 1',
      [userId, platform]
    );
    return result.rows[0] || null;
  }

  static async find(conditions) {
    const { userId } = conditions;
    const result = await query(
      'SELECT * FROM social_accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(row => ({
      ...row,
      userId: row.user_id,
      profileId: row.profile_id,
      profileUrl: row.profile_url,
      profilePicture: row.profile_picture,
      isConnected: row.is_connected,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static async findOneAndUpdate(conditions, updates, options = {}) {
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
             expires_at = $6, profile_id = $7, profile_url = $8,
             profile_picture = $9, is_connected = $10, updated_at = CURRENT_TIMESTAMP
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
          profileUrl,
          profilePicture,
          isConnected !== undefined ? isConnected : true,
        ]
      );

      if (updateResult.rows.length > 0) {
        const row = updateResult.rows[0];
        return {
          ...row,
          userId: row.user_id,
          profileId: row.profile_id,
          profileUrl: row.profile_url,
          profilePicture: row.profile_picture,
          isConnected: row.is_connected,
          accessToken: row.access_token,
          refreshToken: row.refresh_token,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }

      // If no rows updated, insert
      const insertResult = await query(
        `INSERT INTO social_accounts
         (user_id, platform, username, access_token, refresh_token, expires_at, profile_id, profile_url, profile_picture, is_connected)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          platform,
          username,
          accessToken,
          refreshToken,
          expiresAt,
          profileId,
          profileUrl,
          profilePicture,
          isConnected !== undefined ? isConnected : true,
        ]
      );

      const row = insertResult.rows[0];
      return {
        ...row,
        userId: row.user_id,
        profileId: row.profile_id,
        profileUrl: row.profile_url,
        profilePicture: row.profile_picture,
        isConnected: row.is_connected,
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    // Regular update without upsert
    const result = await query(
      `UPDATE social_accounts
       SET username = $3, access_token = $4, refresh_token = $5,
           expires_at = $6, profile_id = $7, profile_url = $8,
           profile_picture = $9, is_connected = $10, updated_at = CURRENT_TIMESTAMP
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
        profileUrl,
        profilePicture,
        isConnected !== undefined ? isConnected : true,
      ]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      userId: row.user_id,
      profileId: row.profile_id,
      profileUrl: row.profile_url,
      profilePicture: row.profile_picture,
      isConnected: row.is_connected,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      save: async function() {
        const saveResult = await query(
          `UPDATE social_accounts
           SET access_token = $3, refresh_token = $4, expires_at = $5,
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
    const { userId, platform } = conditions;
    const result = await query(
      'DELETE FROM social_accounts WHERE user_id = $1 AND platform = $2 RETURNING *',
      [userId, platform]
    );
    return result.rows[0] || null;
  }
}

module.exports = SocialAccount;
