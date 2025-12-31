# Railway Configuration Required for Social Media Integration

## ⚠️ YES - You Need to Configure Railway

The social media integration requires **backend endpoints** and **environment variables** to be configured in Railway.

## 1. Environment Variables (Required)

Add these to Railway Dashboard → Your Backend Service → Variables:

### OAuth App Credentials

```bash
# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Instagram OAuth (uses Facebook App)
INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here

# Snapchat OAuth
SNAPCHAT_CLIENT_ID=your_snapchat_client_id_here
SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret_here

# App URLs
APP_BASE_URL=https://buzzit-production.up.railway.app
OAUTH_CALLBACK_BASE_URL=https://buzzit-production.up.railway.app
```

### How to Add in Railway:

1. Go to https://railway.app
2. Select your project → Backend service
3. Click **"Variables"** tab
4. Click **"New Variable"**
5. Add each variable above
6. Railway will auto-redeploy

## 2. Backend Endpoints (Must Be Implemented)

Your backend **must implement** these endpoints in `server/index.js`:

### OAuth Endpoints

```javascript
// Get OAuth URL
GET /api/social-auth/oauth/:platform/url
// Returns: { success: true, authUrl: "https://..." }

// Handle OAuth callback
POST /api/social-auth/oauth/:platform/callback
// Body: { code, state }
// Returns: { success: true, account: {...} }

// Get connected accounts
GET /api/social-auth/connected
// Returns: { success: true, accounts: [...] }

// Disconnect account
DELETE /api/social-auth/:platform
// Returns: { success: true, message: "..." }

// Refresh token
POST /api/social-auth/:platform/refresh-token
// Returns: { success: true, account: {...} }
```

### Publishing Endpoints

```javascript
// Publish to platform
POST /api/social-share/:platform/publish
// Body: { content, mediaUrl?, mediaType? }
// Returns: { success: true, postId: "...", message: "..." }
```

## 3. OAuth App Setup (Do This First!)

Before adding variables, create OAuth apps:

### Facebook App
1. https://developers.facebook.com/apps/
2. Create App → Business type
3. Get **App ID** and **App Secret**
4. Add **Facebook Login** product
5. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
6. Request permissions: `pages_manage_posts`, `pages_read_engagement`

### Instagram App
1. Use same Facebook App
2. Add **Instagram Graph API** product
3. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`
4. Request permissions: `instagram_basic`, `instagram_content_publish`
5. **Note**: User needs Instagram Business Account

### Snapchat App
1. https://ads.snapchat.com/
2. Business Hub → Integrations → Marketing API
3. Create App
4. Get **Client ID** and **Client Secret**
5. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback`

## 4. Quick Setup Steps

### Step 1: Create OAuth Apps
- [ ] Facebook App created
- [ ] Instagram App configured
- [ ] Snapchat App created

### Step 2: Add Variables to Railway
- [ ] `FACEBOOK_APP_ID`
- [ ] `FACEBOOK_APP_SECRET`
- [ ] `INSTAGRAM_APP_ID`
- [ ] `INSTAGRAM_APP_SECRET`
- [ ] `SNAPCHAT_CLIENT_ID`
- [ ] `SNAPCHAT_CLIENT_SECRET`
- [ ] `APP_BASE_URL`

### Step 3: Implement Backend Endpoints
- [ ] OAuth URL generation
- [ ] OAuth callback handler
- [ ] Connected accounts endpoint
- [ ] Disconnect endpoint
- [ ] Token refresh endpoint
- [ ] Publishing endpoint

### Step 4: Test
- [ ] Test OAuth flow
- [ ] Test publishing

## 5. Current Status Check

Test if endpoints exist:
```bash
# Should return OAuth URL
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url

# Should return 404 if not implemented
```

If you get 404, the endpoints need to be implemented in `server/index.js`.

## 6. Implementation Template

If endpoints don't exist, you'll need to add them. Here's what's needed:

```javascript
// In server/index.js

// Get OAuth URL
app.get('/api/social-auth/oauth/:platform/url', authenticateToken, async (req, res) => {
  const { platform } = req.params;
  const redirectUri = `${process.env.APP_BASE_URL}/api/social-auth/oauth/${platform}/callback`;
  
  // Generate OAuth URL based on platform
  // Return { success: true, authUrl: "..." }
});

// Handle OAuth callback
app.post('/api/social-auth/oauth/:platform/callback', authenticateToken, async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.body;
  
  // Exchange code for tokens
  // Store tokens in database
  // Return { success: true, account: {...} }
});

// Get connected accounts
app.get('/api/social-auth/connected', authenticateToken, async (req, res) => {
  // Get user's connected accounts from database
  // Return { success: true, accounts: [...] }
});

// Disconnect
app.delete('/api/social-auth/:platform', authenticateToken, async (req, res) => {
  // Remove account from database
  // Return { success: true, message: "..." }
});

// Refresh token
app.post('/api/social-auth/:platform/refresh-token', authenticateToken, async (req, res) => {
  // Refresh access token
  // Update in database
  // Return { success: true, account: {...} }
});

// Publish
app.post('/api/social-share/:platform/publish', authenticateToken, async (req, res) => {
  const { platform } = req.params;
  const { content, mediaUrl, mediaType } = req.body;
  
  // Get user's token for platform
  // Call platform API to publish
  // Return { success: true, postId: "...", message: "..." }
});
```

## 7. Summary

**What You Need:**
1. ✅ OAuth apps created (Facebook, Instagram, Snapchat)
2. ✅ Environment variables set in Railway
3. ✅ Backend endpoints implemented
4. ✅ Database table for social accounts (already exists: `SocialAccount` model)

**What's Already Done:**
- ✅ Frontend integration complete
- ✅ OAuth flow UI complete
- ✅ Publishing UI complete
- ✅ Deep linking configured
- ✅ Error handling complete

**What's Missing:**
- ⚠️ Backend OAuth endpoints (need implementation)
- ⚠️ Backend publishing endpoints (need implementation)
- ⚠️ Environment variables in Railway (need to add)

## Next Steps

1. Create OAuth apps on each platform
2. Add environment variables to Railway
3. Implement backend endpoints (or ask for implementation)
4. Test the integration



