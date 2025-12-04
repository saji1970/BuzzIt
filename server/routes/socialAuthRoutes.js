const express = require('express');
const router = express.Router();
const axios = require('axios');

// Social media OAuth configuration
const SOCIAL_CONFIG = {
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    scope: 'email,public_profile,publish_to_groups',
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    scope: 'user_profile,user_media',
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

// OAuth callback handler
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

    const tokenResponse = await axios.post(config.tokenUrl, {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

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
      const profileResponse = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username',
          access_token: access_token,
        },
      });
      profileData = {
        profileId: profileResponse.data.id,
        username: profileResponse.data.username,
      };
    }

    // Store the social account connection (this will be handled by the main server)
    const SocialAccount = require('../models/SocialAccount');

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

// Disconnect social account
router.delete('/:platform', verifyToken, async (req, res) => {
  const { platform } = req.params;
  const userId = req.userId;

  try {
    const SocialAccount = require('../models/SocialAccount');

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
    const SocialAccount = require('../models/SocialAccount');

    const accounts = await SocialAccount.find({ userId: req.userId, isConnected: true });

    // Don't send sensitive tokens to client
    const sanitizedAccounts = accounts.map(account => ({
      platform: account.platform,
      username: account.username,
      profileId: account.profileId,
      profilePicture: account.profilePicture,
      profileUrl: account.profileUrl,
      connectedAt: account.createdAt,
    }));

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

module.exports = router;
