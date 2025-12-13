const express = require('express');
const router = express.Router();
const axios = require('axios');

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

// Share buzz to social media
router.post('/buzz/:buzzId/share', verifyToken, async (req, res) => {
  const { buzzId } = req.params;
  const { platforms } = req.body; // Array of platforms: ['facebook', 'instagram', 'snapchat']
  const userId = req.userId;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please specify at least one platform to share to'
    });
  }

  try {
    const Buzz = require('../models/Buzz');
    const SocialAccount = require('../models/SocialAccount');

    // Get the buzz
    const buzz = await Buzz.findOne({ id: buzzId });
    if (!buzz) {
      return res.status(404).json({
        success: false,
        error: 'Buzz not found'
      });
    }

    // Get connected social accounts
    const connectedAccounts = await SocialAccount.find({
      userId,
      platform: { $in: platforms },
      isConnected: true
    });

    if (connectedAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No connected accounts found for the specified platforms'
      });
    }

    const results = [];

    // Share to each platform
    for (const account of connectedAccounts) {
      try {
        let shareResult;

        if (account.platform === 'facebook') {
          shareResult = await shareFacebookPost(buzz, account);
        } else if (account.platform === 'instagram') {
          shareResult = await shareInstagramPost(buzz, account);
        } else if (account.platform === 'snapchat') {
          shareResult = await shareSnapchatPost(buzz, account);
        }

        results.push({
          platform: account.platform,
          success: true,
          postId: shareResult?.id,
          message: `Successfully shared to ${account.platform}`
        });
      } catch (error) {
        console.error(`Error sharing to ${account.platform}:`, error);
        results.push({
          platform: account.platform,
          success: false,
          error: error.message || 'Failed to share'
        });
      }
    }

    // Update buzz share count
    await Buzz.findOneAndUpdate(
      { id: buzzId },
      { $inc: { shares: 1 } }
    );

    res.json({
      success: true,
      results,
      message: 'Sharing completed'
    });
  } catch (error) {
    console.error('Error sharing buzz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share buzz to social media'
    });
  }
});

// Helper function to share to Facebook
async function shareFacebookPost(buzz, account) {
  const message = buzz.content;
  const accessToken = account.accessToken;

  const response = await axios.post(
    `https://graph.facebook.com/me/feed`,
    {
      message: message,
      access_token: accessToken
    }
  );

  return response.data;
}

// Helper function to share to Instagram
async function shareInstagramPost(buzz, account) {
  // Note: Instagram API requires media (image/video) to post
  // For text-only buzzes, we'll create a story with text
  const message = buzz.content;
  const accessToken = account.accessToken;

  if (buzz.media && buzz.media.url) {
    // Post with media using Facebook Graph API (not graph.instagram.com)
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${account.profileId}/media`,
      {
        image_url: buzz.media.url,
        caption: message,
        access_token: accessToken
      }
    );

    // Publish the media using Facebook Graph API
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${account.profileId}/media_publish`,
      {
        creation_id: response.data.id,
        access_token: accessToken
      }
    );

    return publishResponse.data;
  } else {
    throw new Error('Instagram requires media (image or video) to post. Text-only posts are not supported.');
  }
}

// Helper function to share to Snapchat
async function shareSnapchatPost(buzz, account) {
  // Snapchat Creative Kit / Stories API
  const message = buzz.content;
  const accessToken = account.accessToken;

  // Note: Snapchat API is limited and requires special approval
  // This is a placeholder implementation
  throw new Error('Snapchat sharing is not yet supported. Please check back later.');
}

// Get share preview (what will be posted)
router.get('/buzz/:buzzId/preview', verifyToken, async (req, res) => {
  const { buzzId } = req.params;
  const { platform } = req.query;

  try {
    const Buzz = require('../models/Buzz');
    const buzz = await Buzz.findOne({ id: buzzId });

    if (!buzz) {
      return res.status(404).json({
        success: false,
        error: 'Buzz not found'
      });
    }

    const preview = {
      text: buzz.content,
      media: buzz.media?.url || null,
      type: buzz.type,
      platformSupported: true,
      warning: null
    };

    // Platform-specific warnings
    if (platform === 'instagram' && !buzz.media?.url) {
      preview.platformSupported = false;
      preview.warning = 'Instagram requires images or videos. Text-only posts are not supported.';
    }

    if (platform === 'snapchat') {
      preview.platformSupported = false;
      preview.warning = 'Snapchat sharing is not yet available.';
    }

    res.json({
      success: true,
      preview
    });
  } catch (error) {
    console.error('Error generating share preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate share preview'
    });
  }
});

// Publish content to a specific platform
router.post('/:platform/publish', verifyToken, async (req, res) => {
  const { platform } = req.params;
  const { content, mediaUrl, mediaType } = req.body;
  const userId = req.userId;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Content is required'
    });
  }

  try {
    const SocialAccount = require('../models/SocialAccount');

    // Get the connected account for this platform
    const account = await SocialAccount.findOne({
      userId,
      platform,
      isConnected: true
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: `No connected ${platform} account found. Please connect your account first.`
      });
    }

    // Check if token is expired
    const now = new Date();
    if (account.expiresAt && new Date(account.expiresAt) < now) {
      return res.status(401).json({
        success: false,
        error: `${platform} token has expired. Please reconnect your account.`
      });
    }

    // Publish to the platform
    let publishResult;
    try {
      if (platform === 'facebook') {
        publishResult = await publishToFacebook(content, mediaUrl, mediaType, account);
      } else if (platform === 'instagram') {
        publishResult = await publishToInstagram(content, mediaUrl, mediaType, account);
      } else if (platform === 'snapchat') {
        publishResult = await publishToSnapchat(content, mediaUrl, mediaType, account);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported platform'
        });
      }

      res.json({
        success: true,
        postId: publishResult.id || publishResult.postId,
        message: `Successfully published to ${platform}`,
        data: publishResult
      });
    } catch (publishError) {
      console.error(`Error publishing to ${platform}:`, publishError);

      // Parse error message
      let errorMessage = publishError.message || `Failed to publish to ${platform}`;
      if (publishError.response?.data) {
        errorMessage = publishError.response.data.error?.message ||
                      publishError.response.data.error_description ||
                      JSON.stringify(publishError.response.data);
      }

      res.status(400).json({
        success: false,
        error: errorMessage,
        details: publishError.response?.data
      });
    }
  } catch (error) {
    console.error('Error in publish endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish content'
    });
  }
});

// Helper function to publish to Facebook
async function publishToFacebook(content, mediaUrl, mediaType, account) {
  const accessToken = account.accessToken;

  if (mediaUrl && mediaType === 'image') {
    // Post with photo
    const response = await axios.post(
      `https://graph.facebook.com/me/photos`,
      {
        url: mediaUrl,
        caption: content,
        access_token: accessToken
      }
    );
    return response.data;
  } else if (mediaUrl && mediaType === 'video') {
    // Post with video
    const response = await axios.post(
      `https://graph.facebook.com/me/videos`,
      {
        file_url: mediaUrl,
        description: content,
        access_token: accessToken
      }
    );
    return response.data;
  } else {
    // Text-only post
    const response = await axios.post(
      `https://graph.facebook.com/me/feed`,
      {
        message: content,
        access_token: accessToken
      }
    );
    return response.data;
  }
}

// Helper function to publish to Instagram
async function publishToInstagram(content, mediaUrl, mediaType, account) {
  const accessToken = account.accessToken;
  const profileId = account.profileId;

  if (!mediaUrl) {
    throw new Error('Instagram requires media (image or video) to post. Text-only posts are not supported.');
  }

  if (!profileId) {
    throw new Error('Instagram profile ID not found. Please reconnect your Instagram account.');
  }

  // Create media container using Facebook Graph API (correct API for Instagram Business)
  const containerParams = {
    access_token: accessToken,
    caption: content,
  };

  if (mediaType === 'image') {
    containerParams.image_url = mediaUrl;
  } else if (mediaType === 'video') {
    containerParams.video_url = mediaUrl;
    containerParams.media_type = 'VIDEO';
  } else {
    throw new Error('Invalid media type for Instagram. Only images and videos are supported.');
  }

  // Use Facebook Graph API endpoint (not graph.instagram.com)
  const containerResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${profileId}/media`,
    containerParams
  );

  const creationId = containerResponse.data.id;

  // Publish the media container using Facebook Graph API
  const publishResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${profileId}/media_publish`,
    {
      creation_id: creationId,
      access_token: accessToken
    }
  );

  return publishResponse.data;
}

// Helper function to publish to Snapchat
async function publishToSnapchat(content, mediaUrl, mediaType, account) {
  // Snapchat API is limited and requires special approval
  // This is a basic implementation for the Creative Kit API

  const accessToken = account.accessToken;

  if (!mediaUrl) {
    throw new Error('Snapchat requires media (image or video) to post.');
  }

  // Snapchat Stories API endpoint
  // Note: This requires Snapchat for Business approval and proper scopes
  const response = await axios.post(
    'https://adsapi.snapchat.com/v1/creatives',
    {
      name: 'BuzzIt Post',
      type: 'SNAP',
      snap: {
        media_urls: [mediaUrl],
        headline: content.substring(0, 34), // Snapchat headline limit
        brand_name: 'BuzzIt'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = router;
