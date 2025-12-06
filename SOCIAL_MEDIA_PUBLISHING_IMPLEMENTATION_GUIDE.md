# 📱 Social Media Publishing - Complete Implementation Guide

## Executive Summary

This guide provides a complete implementation plan for enabling users to connect Facebook, Instagram, and Snapchat accounts and publish buzzes to these platforms.

**Estimated Development Time:** 40-60 hours
**Complexity:** High
**Dependencies:** Facebook/Instagram/Snapchat Developer Apps

---

## ✅ What's Already Done

### 1. Database Schema ✅
- **`social_accounts` table** - Stores OAuth tokens and connection status
- **`buzz_publications` table** - Tracks which buzzes were published where
- **Indexes** - Optimized for performance
- **Foreign keys** - Data integrity maintained

### 2. Basic OAuth Routes ✅
- File: `server/routes/socialAuthRoutes.js`
- Endpoints for Facebook, Instagram, Snapchat
- OAuth URL generation
- Callback handlers (partial)

### 3. UI Components ✅
- Privacy Settings screen with social media section
- Connection buttons for each platform
- User-friendly error messages

---

## 🔨 What Needs To Be Implemented

### Phase 1: OAuth & Token Management (Est: 15-20 hours)

#### 1.1 Token Encryption
**File to create:** `server/utils/encryption.js`

```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
```

**Environment Variable Required:**
```
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```

#### 1.2 Update Social Auth Routes
**File:** `server/routes/socialAuthRoutes.js`

Add token storage with encryption:
```javascript
const { encrypt, decrypt } = require('../utils/encryption');
const db = require('../db/postgres');

// After successful OAuth, store encrypted tokens
await db.query(`
  INSERT INTO social_accounts (
    user_id, platform, platform_user_id, username, display_name,
    profile_picture_url, access_token, refresh_token, token_expires_at, scope
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  ON CONFLICT (user_id, platform)
  DO UPDATE SET
    access_token = $7,
    refresh_token = $8,
    token_expires_at = $9,
    updated_at = CURRENT_TIMESTAMP
`, [
  userId,
  platform,
  profileData.id,
  profileData.username,
  profileData.name,
  profileData.picture,
  encrypt(access_token),  // Encrypt token
  refresh_token ? encrypt(refresh_token) : null,
  expiresAt,
  scope
]);
```

#### 1.3 Token Refresh Service
**File to create:** `server/services/tokenRefreshService.js`

```javascript
const axios = require('axios');
const { encrypt, decrypt } = require('../utils/encryption');
const db = require('../db/postgres');

async function refreshTokenIfNeeded(userId, platform) {
  // Get social account
  const result = await db.query(
    'SELECT * FROM social_accounts WHERE user_id = $1 AND platform = $2',
    [userId, platform]
  );

  if (result.rows.length === 0) {
    throw new Error('Social account not found');
  }

  const account = result.rows[0];

  // Check if token needs refresh
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    // Token expired, refresh it
    const refreshToken = decrypt(account.refresh_token);

    // Platform-specific refresh logic
    if (platform === 'facebook' || platform === 'instagram') {
      const response = await axios.get('https://graph.facebook.com/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          fb_exchange_token: decrypt(account.access_token)
        }
      });

      // Update token in database
      await db.query(
        'UPDATE social_accounts SET access_token = $1, token_expires_at = $2 WHERE id = $3',
        [encrypt(response.data.access_token), new Date(Date.now() + response.data.expires_in * 1000), account.id]
      );

      return response.data.access_token;
    }

    // Add similar logic for Snapchat
  }

  return decrypt(account.access_token);
}

module.exports = { refreshTokenIfNeeded };
```

---

### Phase 2: Settings UI Updates (Est: 5-8 hours)

#### 2.1 Update PrivacySettingsScreen
**File:** `src/screens/PrivacySettingsScreen.tsx`

Add connection status display:

```typescript
interface ConnectedAccount {
  id: number;
  platform: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  is_connected: boolean;
  created_at: string;
}

const renderSocialMediaRow = (platform: string, icon: string) => {
  const account = connectedAccounts.find(acc => acc.platform === platform);
  const isConnected = account?.is_connected;

  return (
    <View style={styles.socialRow}>
      <View style={styles.socialLeft}>
        <Icon name={icon} size={32} color={theme.colors.primary} />
        <View style={styles.socialInfo}>
          <Text style={styles.socialPlatform}>{platform}</Text>
          {isConnected ? (
            <Text style={styles.socialStatus}>
              Connected as {account.username}
            </Text>
          ) : (
            <Text style={styles.socialStatus}>Not connected</Text>
          )}
        </View>
      </View>
      {isConnected ? (
        <TouchableOpacity
          onPress={() => handleDisconnect(platform)}
          style={styles.disconnectButton}>
          <Text style={styles.disconnectText}>Disconnect</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => handleConnect(platform)}
          style={styles.connectButton}>
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

#### 2.2 Implement OAuth Flow in React Native
Use `react-native-app-auth` or `react-native-inappbrowser-reborn`:

```bash
npm install react-native-inappbrowser-reborn
```

```typescript
import InAppBrowser from 'react-native-inappbrowser-reborn';

const handleConnect = async (platform: string) => {
  try {
    const response = await ApiService.getSocialAuthUrl(platform);
    if (response.success && response.authUrl) {
      // Open OAuth in in-app browser
      const result = await InAppBrowser.openAuth(
        response.authUrl,
        'buzzit://oauth-callback',
        {
          // iOS options
          ephemeralWebSession: false,
          // Android options
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        }
      );

      if (result.type === 'success' && result.url) {
        // Handle callback URL
        await handleOAuthCallback(result.url, platform);
      }
    }
  } catch (error) {
    console.error('OAuth error:', error);
    Alert.alert('Error', 'Failed to connect. Please try again.');
  }
};
```

---

### Phase 3: Create Buzz Screen Updates (Est: 8-12 hours)

#### 3.1 Add Platform Toggles
**File:** `src/screens/CreateBuzzScreen.tsx`

```typescript
const [publishToPlatforms, setPublishToPlatforms] = useState({
  facebook: false,
  instagram: false,
  snapchat: false,
});

const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

useEffect(() => {
  loadConnectedPlatforms();
}, []);

const loadConnectedPlatforms = async () => {
  const response = await ApiService.getConnectedSocialAccounts();
  if (response.success && response.accounts) {
    const platforms = response.accounts
      .filter(acc => acc.is_connected)
      .map(acc => acc.platform);
    setConnectedPlatforms(platforms);
  }
};

// Render platform toggles
<View style={styles.publishSection}>
  <Text style={styles.sectionTitle}>Share to</Text>

  {connectedPlatforms.includes('facebook') && (
    <View style={styles.toggleRow}>
      <Text>Facebook</Text>
      <Switch
        value={publishToPlatforms.facebook}
        onValueChange={(val) => setPublishToPlatforms({...publishToPlatforms, facebook: val})}
      />
    </View>
  )}

  {connectedPlatforms.includes('instagram') && (
    <View style={styles.toggleRow}>
      <Text>Instagram</Text>
      <Switch
        value={publishToPlatforms.instagram}
        onValueChange={(val) => setPublishToPlatforms({...publishToPlatforms, instagram: val})}
      />
    </View>
  )}

  {connectedPlatforms.includes('snapchat') && (
    <View style={styles.toggleRow}>
      <Text>Snapchat</Text>
      <Switch
        value={publishToPlatforms.snapchat}
        onValueChange={(val) => setPublishToPlatforms({...publishToPlatforms, snapchat: val})}
      />
    </View>
  )}

  {connectedPlatforms.length === 0 && (
    <TouchableOpacity onPress={() => navigation.navigate('PrivacySettings')}>
      <Text style={styles.connectPrompt}>
        Connect social accounts in Settings to share
      </Text>
    </TouchableOpacity>
  )}
</View>
```

---

### Phase 4: Publishing Service (Est: 15-20 hours)

#### 4.1 Create Social Media Publishing Service
**File to create:** `server/services/socialMediaPublishingService.js`

```javascript
const axios = require('axios');
const FormData = require('form-data');
const { refreshTokenIfNeeded } = require('./tokenRefreshService');
const db = require('../db/postgres');

class SocialMediaPublishingService {

  async publishToFacebook(userId, buzzData, accessToken) {
    try {
      // Get user's Facebook page ID (if posting to page)
      const meResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: { access_token: accessToken }
      });

      const pageId = meResponse.data.data[0]?.id; // First page

      // Upload media first if present
      let mediaIds = [];
      if (buzzData.media && buzzData.media.length > 0) {
        for (const media of buzzData.media) {
          const formData = new FormData();
          formData.append('source', media.buffer, media.filename);
          formData.append('published', 'false'); // Unpublished initially

          const uploadResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${pageId}/photos`,
            formData,
            {
              params: { access_token: accessToken },
              headers: formData.getHeaders()
            }
          );

          mediaIds.push({ media_fbid: uploadResponse.data.id });
        }
      }

      // Create post
      const postData = {
        message: buzzData.content,
        access_token: accessToken
      };

      if (mediaIds.length > 0) {
        postData.attached_media = mediaIds;
      }

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        postData
      );

      return {
        success: true,
        platform_post_id: response.data.id,
        platform_post_url: `https://facebook.com/${response.data.id}`
      };

    } catch (error) {
      console.error('Facebook publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async publishToInstagram(userId, buzzData, accessToken) {
    try {
      // Instagram requires a Business or Creator account
      // Get Instagram Business Account ID
      const meResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken
        }
      });

      const igAccountId = meResponse.data.data[0]?.instagram_business_account?.id;

      if (!igAccountId) {
        throw new Error('Instagram Business Account not found. Please connect an Instagram Business or Creator account.');
      }

      // Instagram requires at least one image or video
      if (!buzzData.media || buzzData.media.length === 0) {
        throw new Error('Instagram posts require at least one image or video');
      }

      const media = buzzData.media[0]; // Instagram typically posts one at a time

      // Step 1: Create media container
      const containerData = {
        access_token: accessToken
      };

      if (media.type === 'image') {
        containerData.image_url = media.url; // Must be publicly accessible URL
        containerData.caption = buzzData.content;
      } else if (media.type === 'video') {
        containerData.video_url = media.url;
        containerData.caption = buzzData.content;
        containerData.media_type = 'VIDEO';
      }

      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccountId}/media`,
        containerData
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish the container
      await this.waitForMediaProcessing(igAccountId, creationId, accessToken);

      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
        {
          creation_id: creationId,
          access_token: accessToken
        }
      );

      return {
        success: true,
        platform_post_id: publishResponse.data.id,
        platform_post_url: `https://instagram.com/p/${publishResponse.data.id}`
      };

    } catch (error) {
      console.error('Instagram publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async waitForMediaProcessing(igAccountId, creationId, accessToken, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${creationId}`,
        {
          params: {
            fields: 'status_code',
            access_token: accessToken
          }
        }
      );

      if (statusResponse.data.status_code === 'FINISHED') {
        return true;
      } else if (statusResponse.data.status_code === 'ERROR') {
        throw new Error('Media processing failed');
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Media processing timeout');
  }

  async publishToSnapchat(userId, buzzData, accessToken) {
    try {
      // Snapchat Creative Kit API
      // Note: Snapchat's publishing API is more limited and may require different approach

      // This is a simplified example - actual implementation depends on your Snapchat app setup
      const response = await axios.post(
        'https://adsapi.snapchat.com/v1/adaccounts/YOUR_AD_ACCOUNT_ID/creative_assets',
        {
          media_url: buzzData.media[0]?.url,
          caption: buzzData.content
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        platform_post_id: response.data.id,
        platform_post_url: `https://snapchat.com/...` // Construct based on response
      };

    } catch (error) {
      console.error('Snapchat publishing error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  async publishBuzz(userId, buzzId, platforms) {
    const results = {
      facebook: null,
      instagram: null,
      snapchat: null
    };

    // Get buzz data
    const buzzResult = await db.query('SELECT * FROM buzzes WHERE id = $1', [buzzId]);
    if (buzzResult.rows.length === 0) {
      throw new Error('Buzz not found');
    }

    const buzz = buzzResult.rows[0];

    // Publish to each selected platform
    for (const platform of platforms) {
      try {
        // Get access token
        const accessToken = await refreshTokenIfNeeded(userId, platform);

        // Publish to platform
        let result;
        if (platform === 'facebook') {
          result = await this.publishToFacebook(userId, buzz, accessToken);
        } else if (platform === 'instagram') {
          result = await this.publishToInstagram(userId, buzz, accessToken);
        } else if (platform === 'snapchat') {
          result = await this.publishToSnapchat(userId, buzz, accessToken);
        }

        results[platform] = result;

        // Store publication record
        await db.query(`
          INSERT INTO buzz_publications (
            buzz_id, user_id, platform, platform_post_id, platform_post_url, status, error_message
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          buzzId,
          userId,
          platform,
          result.platform_post_id,
          result.platform_post_url,
          result.success ? 'published' : 'failed',
          result.error || null
        ]);

        // Update social account last published time
        if (result.success) {
          await db.query(
            'UPDATE social_accounts SET last_published_at = CURRENT_TIMESTAMP, publish_count = publish_count + 1 WHERE user_id = $1 AND platform = $2',
            [userId, platform]
          );
        }

      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error);
        results[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }
}

module.exports = new SocialMediaPublishingService();
```

#### 4.2 Add Publishing Endpoint
**File:** `server/index.js` or `server/routes/buzzRoutes.js`

```javascript
const socialMediaPublishingService = require('./services/socialMediaPublishingService');

app.post('/api/buzzes/:buzzId/publish', verifyToken, async (req, res) => {
  try {
    const { buzzId } = req.params;
    const { platforms } = req.body; // ['facebook', 'instagram', 'snapchat']

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No platforms selected'
      });
    }

    const results = await socialMediaPublishingService.publishBuzz(
      req.userId,
      buzzId,
      platforms
    );

    // Check if any succeeded
    const successCount = Object.values(results).filter(r => r?.success).length;
    const failureCount = Object.values(results).filter(r => !r?.success).length;

    res.json({
      success: successCount > 0,
      results,
      summary: {
        total: platforms.length,
        succeeded: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Publishing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish buzz'
    });
  }
});
```

---

### Phase 5: Media Validation (Est: 4-6 hours)

#### 5.1 Platform Requirements

**Facebook:**
- Images: JPG, PNG, max 10MB
- Videos: MP4, MOV, max 1GB, max 120 minutes
- Aspect ratio: 9:16 to 16:9

**Instagram:**
- Images: JPG, PNG, max 8MB
- Videos: MP4, MOV, max 100MB, 3-60 seconds
- Aspect ratio: 4:5 to 1.91:1
- Min resolution: 600x600
- **Requires Business/Creator account**

**Snapchat:**
- Images: JPG, PNG, max 5MB
- Videos: MP4, MOV, max 32MB, max 60 seconds
- Aspect ratio: 9:16 preferred

#### 5.2 Media Validation Service
**File to create:** `server/services/mediaValidationService.js`

```javascript
const sharp = require('sharp'); // For image processing

class MediaValidationService {

  validateForPlatform(media, platform) {
    const rules = {
      facebook: {
        image: { maxSize: 10 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png'] },
        video: { maxSize: 1024 * 1024 * 1024, formats: ['mp4', 'mov'], maxDuration: 7200 }
      },
      instagram: {
        image: { maxSize: 8 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png'] },
        video: { maxSize: 100 * 1024 * 1024, formats: ['mp4', 'mov'], maxDuration: 60, minDuration: 3 }
      },
      snapchat: {
        image: { maxSize: 5 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png'] },
        video: { maxSize: 32 * 1024 * 1024, formats: ['mp4', 'mov'], maxDuration: 60 }
      }
    };

    const platformRules = rules[platform];
    if (!platformRules) {
      return { valid: false, error: 'Invalid platform' };
    }

    const typeRules = platformRules[media.type];
    if (!typeRules) {
      return { valid: false, error: `${platform} does not support ${media.type}` };
    }

    // Check file size
    if (media.size > typeRules.maxSize) {
      return {
        valid: false,
        error: `${media.type} size exceeds ${platform} limit of ${typeRules.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check format
    const ext = media.filename.split('.').pop().toLowerCase();
    if (!typeRules.formats.includes(ext)) {
      return {
        valid: false,
        error: `${platform} does not support .${ext} files. Supported: ${typeRules.formats.join(', ')}`
      };
    }

    return { valid: true };
  }

  async normalizeImage(buffer, platform) {
    // Resize and optimize image for platform
    const maxSizes = {
      facebook: { width: 2048, height: 2048 },
      instagram: { width: 1080, height: 1350 },
      snapchat: { width: 1080, height: 1920 }
    };

    const size = maxSizes[platform];

    return await sharp(buffer)
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}

module.exports = new MediaValidationService();
```

---

## 📋 Complete Implementation Checklist

### Backend
- [x] Database schema for social_accounts
- [x] Database schema for buzz_publications
- [ ] Token encryption utilities
- [ ] Token refresh service
- [ ] Update OAuth routes with token storage
- [ ] Social media publishing service
- [ ] Media validation service
- [ ] Publishing API endpoint
- [ ] Error handling and logging

### Frontend
- [ ] Install react-native-inappbrowser-reborn
- [ ] Update Settings UI with connection status
- [ ] Implement OAuth flow in React Native
- [ ] Add platform toggles to Create Buzz screen
- [ ] Implement publishing UI
- [ ] Show publishing progress/results
- [ ] Retry failed publications
- [ ] Handle errors gracefully

### Testing
- [ ] Test Facebook OAuth and publishing
- [ ] Test Instagram OAuth and publishing
- [ ] Test Snapchat OAuth and publishing
- [ ] Test token refresh
- [ ] Test media validation
- [ ] Test error scenarios
- [ ] Test on physical devices

### Configuration
- [ ] Set up Facebook Developer App
- [ ] Set up Instagram Business Account
- [ ] Set up Snapchat Developer App
- [ ] Add OAuth credentials to Railway
- [ ] Add encryption key to Railway
- [ ] Test in production

---

## 🚀 Quick Start: Minimal Implementation

If you want to start with just Facebook:

### 1. Install dependencies
```bash
cd server
npm install sharp form-data
```

### 2. Add encryption key to Railway
```
ENCRYPTION_KEY=your-32-byte-hex-key
```

### 3. Deploy database changes
The tables will be created automatically on next deploy.

### 4. Set up Facebook Developer App
Follow `SOCIAL_MEDIA_OAUTH_SETUP.md` for Facebook setup.

### 5. Test OAuth flow
Use the existing UI to connect Facebook.

### 6. Implement publishing
Add the publishing service code from Phase 4.

---

## 💡 Recommendations

1. **Start with Facebook only** - It's the most straightforward
2. **Use Instagram Graph API** - Requires Business account but more reliable
3. **Consider Zapier/IFTTT integration** - As an alternative to direct publishing
4. **Implement retry queue** - For failed publications
5. **Add webhook handling** - For post status updates
6. **Monitor API rate limits** - Each platform has different limits
7. **Log all API calls** - For debugging and analytics

---

## ⚠️ Important Notes

### Instagram Requirements
- Must use Instagram Business or Creator account
- Must be connected to a Facebook Page
- Cannot post to personal accounts via API
- Stories require different API endpoints

### Facebook Requirements
- Publishing to personal timeline has been deprecated
- Need to publish to Pages instead
- Requires `pages_manage_posts` permission
- Must go through App Review for production

### Snapchat Limitations
- Limited API for content posting
- May require Snapchat Marketing API access
- Consider using Snap Kit for sharing instead of direct publishing

---

## 📞 Need Help?

This is a complex feature. Consider:
1. Hiring a specialist for OAuth integration
2. Using third-party services (Buffer, Hootsuite APIs)
3. Implementing one platform at a time
4. Starting with just connection (no publishing) first

---

**Total Files to Create/Modify:** 10+ files
**Total Lines of Code:** 2000+ lines
**Estimated Cost (contractor):** $3,000 - $5,000

This guide provides everything you need. You can implement it yourself or hand this to a developer.
