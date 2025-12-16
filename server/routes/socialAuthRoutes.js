const express = require('express');
const router = express.Router();
const axios = require('axios');

// Social media OAuth configuration
console.log('🔍 [socialAuthRoutes] Loading OAuth configuration...');
console.log('🔍 [socialAuthRoutes] FACEBOOK_CLIENT_ID:', process.env.FACEBOOK_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('🔍 [socialAuthRoutes] FACEBOOK_CLIENT_SECRET:', process.env.FACEBOOK_CLIENT_SECRET ? 'SET' : 'NOT SET');

const SOCIAL_CONFIG = {
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    scope: 'public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
  },
  instagram: {
    // Instagram uses Facebook Graph API - same endpoints as Facebook
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
  },
  snapchat: {
    authUrl: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    tokenUrl: 'https://accounts.snapchat.com/accounts/oauth2/token',
    clientId: process.env.SNAPCHAT_CLIENT_ID || '',
    clientSecret: process.env.SNAPCHAT_CLIENT_SECRET || '',
    scope: 'https://auth.snapchat.com/oauth2/api/user.display_name',
  },
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Test endpoint to check OAuth configuration (no auth required for debugging)
router.get('/test-config', (req, res) => {
  res.json({
    success: true,
    config: {
      facebook: {
        hasClientId: !!SOCIAL_CONFIG.facebook.clientId,
        hasClientSecret: !!SOCIAL_CONFIG.facebook.clientSecret,
        clientIdLength: SOCIAL_CONFIG.facebook.clientId.length,
      },
      instagram: {
        hasClientId: !!SOCIAL_CONFIG.instagram.clientId,
        hasClientSecret: !!SOCIAL_CONFIG.instagram.clientSecret,
        clientIdLength: SOCIAL_CONFIG.instagram.clientId.length,
      },
      snapchat: {
        hasClientId: !!SOCIAL_CONFIG.snapchat.clientId,
        hasClientSecret: !!SOCIAL_CONFIG.snapchat.clientSecret,
        clientIdLength: SOCIAL_CONFIG.snapchat.clientId.length,
      }
    }
  });
});

// Get OAuth URL for a platform
router.get('/oauth/:platform/url', verifyToken, (req, res) => {
  const { platform } = req.params;
  const config = SOCIAL_CONFIG[platform];

  if (!config) {
    return res.status(400).json({
      success: false,
      error: 'Invalid platform. Supported platforms: facebook, instagram, snapchat'
    });
  }

  // Debug logging for environment variables
  console.log(`[OAuth] ${platform} - clientId configured:`, !!config.clientId);
  console.log(`[OAuth] ${platform} - env var name:`, platform.toUpperCase() + '_CLIENT_ID');
  console.log(`[OAuth] Environment check - FACEBOOK_CLIENT_ID exists:`, !!process.env.FACEBOOK_CLIENT_ID);
  console.log(`[OAuth] Environment check - INSTAGRAM_CLIENT_ID exists:`, !!process.env.INSTAGRAM_CLIENT_ID);

  if (!config.clientId) {
    return res.status(500).json({
      success: false,
      error: `${platform} OAuth is not configured on the server`
    });
  }

  const redirectUri = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/social-auth/oauth/${platform}/callback`;
  const state = Buffer.from(JSON.stringify({ userId: req.userId })).toString('base64');

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: state,
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;

  res.json({
    success: true,
    authUrl,
    platform
  });
});

// OAuth callback handler (GET - for browser redirects)
router.get('/oauth/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    return res.redirect(`/settings?social_error=${error}&description=${error_description || 'OAuth failed'}`);
  }

  if (!code || !state) {
    return res.redirect('/settings?social_error=missing_code');
  }

  const config = SOCIAL_CONFIG[platform];
  if (!config) {
    return res.redirect('/settings?social_error=invalid_platform');
  }

  try {
    // Decode state to get userId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;

    // Exchange code for access token
    const redirectUri = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/social-auth/oauth/${platform}/callback`;

    let tokenResponse;
    if (platform === 'facebook' || platform === 'instagram') {
      // Facebook Graph API uses GET with query params for token exchange
      tokenResponse = await axios.get(config.tokenUrl, {
        params: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: code,
          redirect_uri: redirectUri,
        },
      });
    } else {
      // Other platforms use POST
      tokenResponse = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile info from the platform
    let profileData = {};
    if (platform === 'facebook') {
      const profileResponse = await axios.get(config.userInfoUrl, {
        params: {
          fields: 'id,name,picture',
          access_token: access_token,
        },
      });
      profileData = {
        profileId: profileResponse.data.id,
        username: profileResponse.data.name,
        profilePicture: profileResponse.data.picture?.data?.url,
      };
    } else if (platform === 'instagram') {
      // For Instagram, first get Facebook pages
      const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
        params: {
          access_token: access_token,
        },
      });

      // Get Instagram business account connected to the first page
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        const pageId = pagesResponse.data.data[0].id;
        const pageAccessToken = pagesResponse.data.data[0].access_token;

        try {
          const igAccountResponse = await axios.get(`https://graph.facebook.com/${pageId}`, {
            params: {
              fields: 'instagram_business_account',
              access_token: pageAccessToken,
            },
          });

          if (igAccountResponse.data.instagram_business_account) {
            const igUserId = igAccountResponse.data.instagram_business_account.id;
            const igProfileResponse = await axios.get(`https://graph.facebook.com/${igUserId}`, {
              params: {
                fields: 'id,username,profile_picture_url',
                access_token: pageAccessToken,
              },
            });

            profileData = {
              profileId: igProfileResponse.data.id,
              username: igProfileResponse.data.username,
              profilePicture: igProfileResponse.data.profile_picture_url,
            };
          } else {
            profileData = {
              profileId: pageId,
              username: pagesResponse.data.data[0].name,
            };
          }
        } catch (igError) {
          console.error('Error fetching Instagram account:', igError);
          profileData = {
            profileId: pageId,
            username: pagesResponse.data.data[0].name,
          };
        }
      }
    }

    // Store the social account connection (this will be handled by the main server)
    const SocialAccount = require('../db/socialAccounts');

    await SocialAccount.findOneAndUpdate(
      { userId, platform },
      {
        userId,
        platform,
        username: profileData.username,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        profileId: profileData.profileId,
        profilePicture: profileData.profilePicture,
        isConnected: true,
      },
      { upsert: true, new: true }
    );

    // Redirect back to settings with success message
    res.redirect(`/settings?social_success=${platform}`);
  } catch (error) {
    console.error(`OAuth ${platform} callback error:`, error);
    res.redirect(`/settings?social_error=${platform}_auth_failed`);
  }
});

// OAuth callback handler (POST - for mobile app callbacks)
router.post('/oauth/:platform/callback', verifyToken, async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.body;
  const userId = req.userId;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required'
    });
  }

  const config = SOCIAL_CONFIG[platform];
  if (!config) {
    return res.status(400).json({
      success: false,
      error: 'Invalid platform. Supported platforms: facebook, instagram, snapchat'
    });
  }

  if (!config.clientId) {
    return res.status(500).json({
      success: false,
      error: `${platform} OAuth is not configured on the server`
    });
  }

  try {
    // Exchange code for access token
    const redirectUri = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/social-auth/oauth/${platform}/callback`;

    let tokenResponse;
    if (platform === 'facebook' || platform === 'instagram') {
      // Facebook Graph API uses GET with query params for token exchange
      tokenResponse = await axios.get(config.tokenUrl, {
        params: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: code,
          redirect_uri: redirectUri,
        },
      });
    } else {
      // Other platforms use POST
      tokenResponse = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
    }

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile info from the platform
    let profileData = {};
    if (platform === 'facebook') {
      const profileResponse = await axios.get(config.userInfoUrl, {
        params: {
          fields: 'id,name,picture',
          access_token: access_token,
        },
      });
      profileData = {
        profileId: profileResponse.data.id,
        username: profileResponse.data.name,
        profilePicture: profileResponse.data.picture?.data?.url,
      };
    } else if (platform === 'instagram') {
      // For Instagram, first get Facebook pages
      const pagesResponse = await axios.get('https://graph.facebook.com/me/accounts', {
        params: {
          access_token: access_token,
        },
      });

      // Get Instagram business account connected to the first page
      if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
        const pageId = pagesResponse.data.data[0].id;
        const pageAccessToken = pagesResponse.data.data[0].access_token;

        try {
          const igAccountResponse = await axios.get(`https://graph.facebook.com/${pageId}`, {
            params: {
              fields: 'instagram_business_account',
              access_token: pageAccessToken,
            },
          });

          if (igAccountResponse.data.instagram_business_account) {
            const igUserId = igAccountResponse.data.instagram_business_account.id;
            const igProfileResponse = await axios.get(`https://graph.facebook.com/${igUserId}`, {
              params: {
                fields: 'id,username,profile_picture_url',
                access_token: pageAccessToken,
              },
            });

            profileData = {
              profileId: igProfileResponse.data.id,
              username: igProfileResponse.data.username,
              profilePicture: igProfileResponse.data.profile_picture_url,
            };
          } else {
            profileData = {
              profileId: pageId,
              username: pagesResponse.data.data[0].name,
            };
          }
        } catch (igError) {
          console.error('Error fetching Instagram account:', igError);
          profileData = {
            profileId: pageId,
            username: pagesResponse.data.data[0].name,
          };
        }
      }
    } else if (platform === 'snapchat') {
      const profileResponse = await axios.get('https://kit.snapchat.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      profileData = {
        profileId: profileResponse.data.me?.id,
        username: profileResponse.data.me?.display_name || profileResponse.data.me?.external_id,
      };
    }

    // Store the social account connection
    const SocialAccount = require('../db/socialAccounts');

    const account = await SocialAccount.findOneAndUpdate(
      { userId, platform },
      {
        userId,
        platform,
        username: profileData.username || 'Unknown',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
        profileId: profileData.profileId,
        profilePicture: profileData.profilePicture,
        isConnected: true,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      account: {
        platform: account.platform,
        username: account.username,
        profileId: account.profileId,
        profilePicture: account.profilePicture,
        connectedAt: account.createdAt,
        isConnected: account.isConnected,
        expiresAt: account.expiresAt,
      }
    });
  } catch (error) {
    console.error(`OAuth ${platform} callback error:`, error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error_description || error.message || `Failed to connect ${platform} account`
    });
  }
});

// Disconnect social account
router.delete('/:platform', verifyToken, async (req, res) => {
  const { platform } = req.params;
  const userId = req.userId;

  try {
    const SocialAccount = require('../db/socialAccounts');

    const result = await SocialAccount.findOneAndDelete({ userId, platform });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Social account not found'
      });
    }

    res.json({
      success: true,
      message: `${platform} account disconnected successfully`
    });
  } catch (error) {
    console.error(`Error disconnecting ${platform}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect social account'
    });
  }
});

// Get connected social accounts
router.get('/connected', verifyToken, async (req, res) => {
  try {
    const SocialAccount = require('../db/socialAccounts');

    const accounts = await SocialAccount.find({ userId: req.userId });

    // Don't send sensitive tokens to client
    const sanitizedAccounts = accounts.map(account => {
      const now = new Date();
      const expiresAt = account.expiresAt ? new Date(account.expiresAt) : null;
      let status = 'connected';

      if (!account.isConnected) {
        status = 'disconnected';
      } else if (expiresAt && expiresAt < now) {
        status = 'expired';
      } else if (!account.accessToken) {
        status = 'error';
      }

      return {
        platform: account.platform,
        username: account.username,
        name: account.username,
        profileId: account.profileId,
        profilePicture: account.profilePicture,
        picture: account.profilePicture,
        profileUrl: account.profileUrl,
        connectedAt: account.createdAt,
        createdAt: account.createdAt,
        isConnected: account.isConnected && status === 'connected',
        expiresAt: account.expiresAt,
        status: status,
        lastRefresh: account.updatedAt,
      };
    });

    res.json({
      success: true,
      accounts: sanitizedAccounts
    });
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connected accounts'
    });
  }
});

// Refresh access token for a platform
router.post('/:platform/refresh-token', verifyToken, async (req, res) => {
  const { platform } = req.params;
  const userId = req.userId;

  try {
    const SocialAccount = require('../db/socialAccounts');
    const account = await SocialAccount.findOne({ userId, platform });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: `No ${platform} account found`
      });
    }

    if (!account.refreshToken) {
      return res.status(400).json({
        success: false,
        error: `No refresh token available for ${platform}. Please reconnect your account.`
      });
    }

    const config = SOCIAL_CONFIG[platform];
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform'
      });
    }

    // Refresh the token
    try {
      let tokenResponse;

      if (platform === 'facebook' || platform === 'instagram') {
        // Facebook/Instagram use the Graph API for token refresh
        tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: config.clientId,
            client_secret: config.clientSecret,
            fb_exchange_token: account.accessToken,
          },
        });
      } else if (platform === 'snapchat') {
        // Snapchat uses OAuth2 token refresh
        tokenResponse = await axios.post(config.tokenUrl, {
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: account.refreshToken,
        });
      }

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Update the account with new tokens
      account.accessToken = access_token;
      if (refresh_token) {
        account.refreshToken = refresh_token;
      }
      if (expires_in) {
        account.expiresAt = new Date(Date.now() + expires_in * 1000);
      }
      await account.save();

      res.json({
        success: true,
        message: `${platform} token refreshed successfully`,
        account: {
          platform: account.platform,
          username: account.username,
          expiresAt: account.expiresAt,
          isConnected: true,
        }
      });
    } catch (tokenError) {
      console.error(`Token refresh error for ${platform}:`, tokenError);

      // Mark account as expired if refresh fails
      account.isConnected = false;
      await account.save();

      res.status(400).json({
        success: false,
        error: `Failed to refresh ${platform} token. Please reconnect your account.`,
        details: tokenError.response?.data?.error_description || tokenError.message
      });
    }
  } catch (error) {
    console.error(`Error refreshing ${platform} token:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

module.exports = router;
