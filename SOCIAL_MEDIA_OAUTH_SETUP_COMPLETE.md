# Complete Social Media OAuth & Publishing Setup Guide

## Overview
This guide covers ALL requirements to enable users to connect their social media accounts to BuzzIt and post buzzes to:
- ✅ Facebook (Already Working)
- ✅ Instagram (Already Working)
- 🆕 Snapchat (Implementing Now)
- 🆕 Twitter/X (Implementing Now)

---

## Table of Contents
1. [Server Environment Variables](#server-environment-variables)
2. [Facebook Setup](#1-facebook-setup)
3. [Instagram Setup](#2-instagram-setup)
4. [Snapchat Setup](#3-snapchat-setup)
5. [Twitter/X Setup](#4-twitterx-setup)
6. [Server Configuration](#server-configuration)
7. [Testing Checklist](#testing-checklist)

---

## Server Environment Variables

### Required Variables in Railway/Server `.env`

```bash
# ========================================
# APP CONFIGURATION
# ========================================
APP_BASE_URL=https://buzzit-production.up.railway.app
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production

# ========================================
# DATABASE
# ========================================
DATABASE_URL=postgresql://user:password@host:port/database

# ========================================
# CLOUDINARY (Media Storage)
# ========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ========================================
# TWILIO (SMS Verification)
# ========================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ========================================
# FACEBOOK OAUTH
# ========================================
FACEBOOK_APP_ID=123456789012345
FACEBOOK_CLIENT_ID=123456789012345  # Same as APP_ID
FACEBOOK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback

# ========================================
# INSTAGRAM OAUTH (Uses Facebook Graph API)
# ========================================
INSTAGRAM_APP_ID=123456789012345  # Same as Facebook App ID
INSTAGRAM_CLIENT_ID=123456789012345  # Same as Facebook App ID
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890  # Same as Facebook secret
INSTAGRAM_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback

# ========================================
# SNAPCHAT OAUTH
# ========================================
SNAPCHAT_CLIENT_ID=your-snapchat-client-id
SNAPCHAT_CLIENT_SECRET=your-snapchat-client-secret
SNAPCHAT_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback

# ========================================
# TWITTER/X OAUTH 2.0
# ========================================
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/twitter/callback
TWITTER_API_KEY=your-api-key  # Optional: For API v1.1
TWITTER_API_SECRET=your-api-secret  # Optional: For API v1.1
TWITTER_BEARER_TOKEN=your-bearer-token  # Optional: For read-only operations

# ========================================
# AMAZON IVS (Live Streaming - Already Set)
# ========================================
IVS_INGEST_RTMPS_URL=rtmps://your-ingest-endpoint.global-contribute.live-video.net:443/app/
IVS_STREAM_KEY=sk_your-stream-key
IVS_PLAYBACK_URL=https://your-playback-url.cloudfront.net/your-channel.m3u8
```

---

## 1. Facebook Setup

### Step 1: Create Facebook App

1. **Go to:** https://developers.facebook.com/apps
2. **Click:** "Create App"
3. **Select:** "Business" or "Consumer" type
4. **App Name:** "BuzzIt" (or your app name)
5. **App Contact Email:** your-email@example.com

### Step 2: Configure App Settings

**Basic Settings:**
- **App Domains:** `buzzit-production.up.railway.app`
- **Privacy Policy URL:** `https://buzzit-production.up.railway.app/privacy`
- **Terms of Service URL:** `https://buzzit-production.up.railway.app/terms`

### Step 3: Add Facebook Login Product

1. **Click:** "Add Product" → Select "Facebook Login"
2. **Platform:** Select "Website"
3. **Site URL:** `https://buzzit-production.up.railway.app`

### Step 4: Configure OAuth Redirect URIs

**Facebook Login Settings:**
- **Valid OAuth Redirect URIs:**
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
  https://buzzit-production.up.railway.app/settings
  ```
- **Client OAuth Login:** ✅ Enabled
- **Web OAuth Login:** ✅ Enabled
- **Use Strict Mode for Redirect URIs:** ✅ Enabled

### Step 5: App Review (For Public Access)

**Initial Permissions (Automatically Approved):**
- ✅ `public_profile` - Get basic profile info
- ✅ `email` - Get user email (optional)

**Advanced Permissions (Require App Review):**
- `pages_manage_posts` - Post to Pages (if needed)
- `publish_video` - Upload videos
- `pages_read_engagement` - Read page insights

**To Submit for Review:**
1. Go to "App Review" → "Permissions and Features"
2. Click "Request" next to each permission
3. Provide screencast showing how you use the permission
4. Submit for review (takes 3-7 days)

### Step 6: Get App Credentials

**Location:** App Dashboard → Settings → Basic

```bash
FACEBOOK_APP_ID=123456789012345
FACEBOOK_CLIENT_ID=123456789012345  # Same as App ID
FACEBOOK_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

### Step 7: Enable App for Public

**Location:** App Dashboard → Settings → Basic
- **App Mode:** Switch from "Development" to "Live"
- ⚠️ Only switch to Live after testing!

---

## 2. Instagram Setup

### Important: Instagram Uses Facebook Graph API

Instagram publishing requires:
1. ✅ Facebook App (created above)
2. ✅ Instagram Business or Creator Account
3. ✅ Instagram account connected to Facebook Page

### Step 1: Convert Instagram to Business Account

**On Instagram Mobile App:**
1. Go to Profile → Menu → Settings
2. Account → Switch to Professional Account
3. Choose "Business" or "Creator"
4. Connect to Facebook Page

### Step 2: Connect Instagram to Facebook Page

**On Facebook:**
1. Go to your Facebook Page
2. Settings → Instagram → Connect Account
3. Log in to Instagram
4. Authorize connection

### Step 3: Get Instagram Business Account ID

**Using Graph API Explorer:**
1. Go to: https://developers.facebook.com/tools/explorer
2. Select your app
3. Get User Access Token with `instagram_basic` permission
4. Make request: `GET /me/accounts`
5. Copy Page ID
6. Make request: `GET /{page-id}?fields=instagram_business_account`
7. Copy Instagram Business Account ID

### Step 4: Configure Instagram OAuth

**Same Facebook App Settings:**
- Use same App ID and Secret as Facebook
- Add Instagram permissions in App Review:
  - `instagram_basic` - Read profile info
  - `instagram_content_publish` - Publish posts
  - `pages_read_engagement` - Read insights
  - `pages_show_list` - List connected pages

### Step 5: Environment Variables

```bash
INSTAGRAM_CLIENT_ID=123456789012345  # Same as Facebook
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890  # Same as Facebook
```

---

## 3. Snapchat Setup

### Step 1: Create Snapchat Business Account

1. **Go to:** https://business.snapchat.com
2. **Sign Up** with your business email
3. **Verify** your email address
4. **Complete** business profile

### Step 2: Create Snapchat App

1. **Go to:** https://kit.snapchat.com/portal
2. **Click:** "Create App"
3. **App Name:** "BuzzIt"
4. **App Description:** "Social media aggregation platform"
5. **Category:** Social Networking
6. **Website:** https://buzzit-production.up.railway.app

### Step 3: Configure OAuth Settings

**OAuth Settings:**
- **Redirect URIs:**
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
  https://buzzit-production.up.railway.app/settings
  ```
- **Scope:**
  - `https://auth.snapchat.com/oauth2/api/user.display_name` (Basic profile)
  - `https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar` (Avatar)

### Step 4: Apply for Creative Kit API Access

**⚠️ IMPORTANT: Snapchat requires manual approval for publishing**

1. **Go to:** App Settings → "Products"
2. **Select:** "Creative Kit"
3. **Click:** "Apply for Access"
4. **Provide:**
   - App description
   - Use case explanation
   - Screenshots of your app
   - Video demo (optional but helps)
5. **Wait:** 7-14 days for approval

### Step 5: Get App Credentials

**Location:** App Dashboard → Settings

```bash
SNAPCHAT_CLIENT_ID=your-snapchat-client-id-here
SNAPCHAT_CLIENT_SECRET=your-snapchat-client-secret-here
```

### Step 6: Production Access

**Before going live:**
- Submit app for production review
- Provide privacy policy
- Provide terms of service
- Pass security review
- Get approval (can take 2-4 weeks)

---

## 4. Twitter/X Setup

### ⚠️ IMPORTANT: Twitter API is Now Paid

**Pricing Tiers:**
- **Free:** Read-only, very limited (deprecated)
- **Basic:** $100/month - 1,500 tweets/month, 10k reads/month
- **Pro:** $5,000/month - 300k tweets/month, 1M reads/month
- **Enterprise:** Custom pricing - Unlimited

**For BuzzIt:** You'll need at least **Basic tier ($100/month)**

### Step 1: Sign Up for Twitter Developer Account

1. **Go to:** https://developer.twitter.com/en/portal/dashboard
2. **Click:** "Sign up"
3. **Verify** your email and phone number
4. **Complete** developer profile:
   - What's your use case? "Social media management tool"
   - Will you make Twitter content available to government? No
   - Will you analyze Twitter data? Yes (for analytics)

### Step 2: Create Twitter App

1. **Dashboard:** https://developer.twitter.com/en/portal/projects-and-apps
2. **Click:** "Create Project"
3. **Project Name:** "BuzzIt Social Media Platform"
4. **Use Case:** "Making a bot or app that tweets"
5. **Project Description:** "Cross-platform social media posting application"
6. **Create App**

### Step 3: Configure App Settings

**App Settings:**
- **App Name:** BuzzIt
- **Website URL:** https://buzzit-production.up.railway.app
- **Callback URL / Redirect URL:**
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/twitter/callback
  ```
- **Website:** https://buzzit.app (or your domain)
- **Terms of Service:** https://buzzit-production.up.railway.app/terms
- **Privacy Policy:** https://buzzit-production.up.railway.app/privacy

### Step 4: Enable OAuth 2.0

**Authentication Settings:**
- **OAuth 2.0:** ✅ Enabled
- **Type of App:** Web App
- **Callback URI:**
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/twitter/callback
  ```
- **Website URL:** https://buzzit-production.up.railway.app

**Scopes Needed:**
- ✅ `tweet.read` - Read tweets
- ✅ `tweet.write` - Post tweets
- ✅ `users.read` - Read user profile
- ✅ `offline.access` - Refresh tokens (important!)

### Step 5: Get API Credentials

**Location:** App Dashboard → Keys and Tokens

```bash
# OAuth 2.0 (Recommended)
TWITTER_CLIENT_ID=your-client-id-here
TWITTER_CLIENT_SECRET=your-client-secret-here

# OAuth 1.0a (Legacy, optional)
TWITTER_API_KEY=your-api-key-here
TWITTER_API_SECRET=your-api-secret-here
TWITTER_BEARER_TOKEN=your-bearer-token-here
```

### Step 6: Subscribe to API Plan

1. **Go to:** Developer Portal → Overview
2. **Click:** "Subscribe to API"
3. **Select:** Basic tier ($100/month minimum)
4. **Enter** payment information
5. **Activate** subscription

### Step 7: Elevated Access (Optional)

**For higher rate limits:**
1. **Go to:** Developer Portal → Products
2. **Apply for:** Elevated Access
3. **Provide:**
   - Detailed use case
   - How you'll use the API
   - Data handling practices
4. **Wait:** 1-3 days for approval

---

## Server Configuration

### 1. Update Railway Environment Variables

**Railway Dashboard:**
1. Go to your Railway project
2. Click "Variables" tab
3. Add all variables from the "Server Environment Variables" section above
4. Click "Deploy" to restart with new variables

### 2. Verify Database Schema

**Required Tables:**

```sql
-- Social accounts table (should already exist)
CREATE TABLE IF NOT EXISTS social_accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  username VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  profile_id VARCHAR(255),
  profile_picture TEXT,
  profile_url TEXT,
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform)
);

-- Indexes
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_user_platform ON social_accounts(user_id, platform);

-- Publication logs (for tracking cross-posts)
CREATE TABLE IF NOT EXISTS buzz_publications (
  id VARCHAR(255) PRIMARY KEY,
  buzz_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  platform_post_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, published, failed
  error_message TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buzz_id) REFERENCES buzzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_buzz_publications_buzz_id ON buzz_publications(buzz_id);
CREATE INDEX idx_buzz_publications_user_id ON buzz_publications(user_id);
CREATE INDEX idx_buzz_publications_platform ON buzz_publications(platform);
```

### 3. Install Required NPM Packages

**Server packages:**

```bash
cd server
npm install twitter-api-v2 --save
# twitter-api-v2: Official Twitter API v2 client for Node.js
```

**Package.json should include:**
```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "twitter-api-v2": "^1.15.0"
  }
}
```

### 4. Update Server Code

**Files to modify:**
1. `server/routes/socialAuthRoutes.js` - Add Twitter and Snapchat OAuth
2. `server/routes/socialShareRoutes.js` - Add Twitter and Snapchat publishing
3. `server/index.js` - Verify routes are loaded

---

## Testing Checklist

### Facebook Testing
- [ ] Get OAuth URL: `GET /api/social-auth/oauth/facebook/url`
- [ ] Complete OAuth flow and get callback
- [ ] Verify account saved in database
- [ ] Test text post: `POST /api/social-share/facebook/publish`
- [ ] Test image post with media URL
- [ ] Test video post with media URL
- [ ] Verify post appears on Facebook
- [ ] Test token refresh

### Instagram Testing
- [ ] Verify account is Business/Creator account
- [ ] Verify account is linked to Facebook Page
- [ ] Get OAuth URL: `GET /api/social-auth/oauth/instagram/url`
- [ ] Complete OAuth flow
- [ ] Test image post (Instagram requires media)
- [ ] Test video post
- [ ] Verify post appears on Instagram
- [ ] Check Instagram Business Account ID is saved

### Snapchat Testing
- [ ] Verify app has Creative Kit API approval
- [ ] Get OAuth URL: `GET /api/social-auth/oauth/snapchat/url`
- [ ] Complete OAuth flow
- [ ] Test snap post with image
- [ ] Test snap post with video
- [ ] Verify post appears on Snapchat
- [ ] Test token refresh

### Twitter Testing
- [ ] Verify API subscription is active ($100/month minimum)
- [ ] Get OAuth URL: `GET /api/social-auth/oauth/twitter/url`
- [ ] Complete OAuth flow
- [ ] Test tweet post: `POST /api/social-share/twitter/publish`
- [ ] Test tweet with image
- [ ] Test tweet with video
- [ ] Test thread (multiple tweets)
- [ ] Verify tweet appears on Twitter/X
- [ ] Check rate limits

---

## Common Issues & Solutions

### Issue 1: "OAuth redirect URI mismatch"
**Solution:** Ensure redirect URIs match EXACTLY in:
- Platform developer console
- Environment variables
- Code (check `socialAuthRoutes.js`)

### Issue 2: "Invalid access token"
**Solution:**
- Check if token has expired
- Implement token refresh logic
- Verify scopes/permissions are granted

### Issue 3: "Instagram requires business account"
**Solution:**
- Convert Instagram to Business/Creator account
- Connect to Facebook Page
- Use Facebook Graph API for Instagram

### Issue 4: "Twitter API rate limit exceeded"
**Solution:**
- Upgrade to higher tier ($5,000/month for Pro)
- Implement request queuing
- Cache API responses

### Issue 5: "Snapchat API access denied"
**Solution:**
- Apply for Creative Kit API access (takes 1-2 weeks)
- Submit detailed use case
- Provide app screenshots and demo

---

## Security Best Practices

### 1. Token Storage
- ✅ Store access tokens encrypted in database
- ✅ Never send tokens to client-side
- ✅ Use HTTPS for all OAuth redirects
- ✅ Implement token refresh before expiration

### 2. Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use Railway environment variables
- ✅ Rotate secrets regularly
- ✅ Use different credentials for dev/prod

### 3. OAuth State Parameter
- ✅ Generate random state for each OAuth request
- ✅ Validate state on callback to prevent CSRF
- ✅ Include userId in state (base64 encoded)

### 4. Rate Limiting
- ✅ Implement rate limiting on OAuth endpoints
- ✅ Queue publishing requests to avoid platform limits
- ✅ Monitor API usage dashboards

---

## Next Steps After Setup

1. **Deploy Updated Code** to Railway
2. **Test OAuth Flows** for each platform
3. **Submit Apps for Review** (Facebook, Snapchat)
4. **Monitor Error Logs** for first week
5. **Set Up Analytics** to track publishing success rates
6. **Create User Documentation** on how to connect accounts

---

## Support Resources

**Facebook/Instagram:**
- Developer Docs: https://developers.facebook.com/docs
- Graph API Explorer: https://developers.facebook.com/tools/explorer
- Support: https://developers.facebook.com/support

**Snapchat:**
- Developer Docs: https://developers.snap.com/docs
- Snap Kit Portal: https://kit.snapchat.com/portal
- Support: https://businesshelp.snapchat.com

**Twitter/X:**
- Developer Docs: https://developer.twitter.com/en/docs
- API Console: https://developer.twitter.com/en/portal/dashboard
- Support: https://twittercommunity.com

---

## Estimated Timeline

| Task | Duration | Blocker |
|------|----------|---------|
| Create developer accounts | 1-2 hours | None |
| Configure OAuth apps | 2-3 hours | None |
| Set environment variables | 30 mins | None |
| Deploy updated code | 30 mins | Code implementation |
| Test OAuth flows | 2-3 hours | None |
| Submit for app reviews | 1 hour | None |
| **Wait for approvals** | **1-4 weeks** | External review process |
| Production testing | 1-2 hours | App approvals |

**Total Active Time:** ~8-12 hours
**Total Calendar Time:** 1-4 weeks (due to review processes)

---

## Cost Summary

| Platform | Setup Cost | Monthly Cost | Required for Publishing |
|----------|-----------|--------------|------------------------|
| **Facebook** | FREE | FREE | ✅ Yes |
| **Instagram** | FREE | FREE | ✅ Yes |
| **Snapchat** | FREE | FREE | ⚠️ Requires approval |
| **Twitter/X** | FREE setup | **$100-5,000/month** | ✅ Yes |

**TOTAL:** $100-5,000/month (Twitter API subscription)
