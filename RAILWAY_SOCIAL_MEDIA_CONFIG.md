# Railway Configuration for Social Media Integration

## Required Configuration in Railway

Yes, you need to configure several things in Railway for the social media integration to work properly.

## 1. Environment Variables (Required)

### OAuth App Credentials

You need to set up OAuth apps for each platform and add their credentials to Railway:

#### Facebook OAuth
```bash
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
```

#### Instagram OAuth
```bash
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
```

#### Snapchat OAuth
```bash
SNAPCHAT_CLIENT_ID=your_snapchat_client_id
SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret
SNAPCHAT_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
```

### App Configuration
```bash
APP_BASE_URL=https://buzzit-production.up.railway.app
OAUTH_CALLBACK_BASE_URL=https://buzzit-production.up.railway.app
# Or for mobile deep linking:
MOBILE_OAUTH_CALLBACK_URL=com.buzzit.app://oauth/callback
```

## 2. How to Set Variables in Railway

### Step-by-Step:

1. **Go to Railway Dashboard**
   - Navigate to: https://railway.app
   - Sign in and select your project

2. **Select Backend Service**
   - Click on your backend service (the one running `server/index.js`)

3. **Open Variables Tab**
   - Click on the **"Variables"** tab
   - This shows all environment variables for this service

4. **Add Each Variable**
   - Click **"New Variable"** or **"Add Variable"**
   - Enter the variable name (e.g., `FACEBOOK_APP_ID`)
   - Enter the value
   - Click **"Add"** or **"Save"**

5. **Redeploy**
   - Railway will automatically redeploy when you add variables
   - Or manually trigger a redeploy from the **"Deployments"** tab

## 3. OAuth App Setup (Required First)

Before adding variables, you need to create OAuth apps on each platform:

### Facebook App Setup

1. Go to https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Business"** type
4. Add app name and contact email
5. Go to **Settings** → **Basic**
   - Copy **App ID** → Use as `FACEBOOK_APP_ID`
   - Copy **App Secret** → Use as `FACEBOOK_APP_SECRET`
6. Go to **Products** → **Facebook Login** → **Settings**
   - Add **Valid OAuth Redirect URIs**:
     - `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
     - `com.buzzit.app://oauth/callback/facebook`
7. Go to **Products** → **Pages** → **Add**
   - Required for publishing to Facebook Pages
8. Request Permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`

### Instagram App Setup

1. Go to https://developers.facebook.com/apps/
2. Create or use existing Facebook App
3. Go to **Products** → **Instagram** → **Add**
4. Go to **Instagram** → **Basic Display** or **Graph API**
5. For **Graph API** (recommended for publishing):
   - Go to **Instagram Graph API** → **Settings**
   - Add **Valid OAuth Redirect URIs**:
     - `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`
     - `com.buzzit.app://oauth/callback/instagram`
6. Request Permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
7. **Important**: User must have Instagram Business Account connected to Facebook Page

### Snapchat App Setup

1. Go to https://ads.snapchat.com/
2. Navigate to **Business Hub** → **Integrations** → **Marketing API**
3. Click **"Create App"**
4. Fill in app details
5. Copy **Client ID** → Use as `SNAPCHAT_CLIENT_ID`
6. Copy **Client Secret** → Use as `SNAPCHAT_CLIENT_SECRET`
7. Add **Redirect URIs**:
   - `https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback`
   - `com.buzzit.app://oauth/callback/snapchat`
8. Request Scopes:
   - `snapchat.ads.management`
   - `snapchat.marketing_api`

## 4. Backend Endpoints (Must Be Implemented)

Your backend must implement these endpoints:

### OAuth Endpoints
```
GET  /api/social-auth/oauth/:platform/url
     - Returns OAuth authorization URL
     - Query params: redirectUri (optional)

POST /api/social-auth/oauth/:platform/callback
     - Exchanges authorization code for tokens
     - Body: { code, state }
     - Returns: { success, account }

GET  /api/social-auth/connected
     - Returns all connected accounts for current user
     - Returns: { success, accounts: [...] }

DELETE /api/social-auth/:platform
     - Disconnects platform account
     - Returns: { success, message }

POST /api/social-auth/:platform/refresh-token
     - Refreshes access token
     - Returns: { success, account }
```

### Publishing Endpoints
```
POST /api/social-share/:platform/publish
     - Publishes content to platform
     - Body: { content, mediaUrl?, mediaType? }
     - Returns: { success, postId?, message?, error? }
```

## 5. Quick Setup Checklist

- [ ] Create Facebook App
- [ ] Create Instagram App (via Facebook)
- [ ] Create Snapchat App
- [ ] Add OAuth redirect URIs to each app
- [ ] Copy App IDs and Secrets
- [ ] Add environment variables to Railway:
  - [ ] `FACEBOOK_APP_ID`
  - [ ] `FACEBOOK_APP_SECRET`
  - [ ] `INSTAGRAM_APP_ID`
  - [ ] `INSTAGRAM_APP_SECRET`
  - [ ] `SNAPCHAT_CLIENT_ID`
  - [ ] `SNAPCHAT_CLIENT_SECRET`
  - [ ] `APP_BASE_URL`
- [ ] Implement backend OAuth endpoints
- [ ] Implement backend publishing endpoints
- [ ] Test OAuth flow
- [ ] Test publishing flow

## 6. Testing OAuth Flow

After configuration:

1. **Test OAuth URL Generation**
   ```bash
   curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
   ```
   Should return: `{ success: true, authUrl: "https://facebook.com/..." }`

2. **Test Connection**
   - Open app → Settings → Privacy & Social
   - Tap "Connect" on Facebook
   - Should open browser with Facebook login
   - After login, should redirect back to app
   - Connection status should update

3. **Test Publishing**
   - Create a buzz
   - Select Facebook platform
   - Create buzz
   - Check if published to Facebook

## 7. Troubleshooting

### OAuth URL Not Generated
- Check if environment variables are set correctly
- Verify app credentials are valid
- Check Railway logs for errors

### Callback Not Working
- Verify redirect URIs match exactly in OAuth apps
- Check deep linking configuration
- Verify URL scheme in AndroidManifest.xml

### Publishing Fails
- Check if tokens are stored correctly
- Verify platform permissions are granted
- Check API rate limits
- Review Railway logs for errors

### Token Refresh Fails
- Verify refresh token is stored
- Check if refresh endpoint is implemented
- Review platform API documentation

## 8. Security Notes

- **Never commit** OAuth secrets to Git
- Use Railway's **Variables** tab (encrypted storage)
- Rotate secrets periodically
- Use different apps for development/production
- Monitor API usage and rate limits

## 9. Current Status

Check if endpoints are implemented:
```bash
# Test OAuth URL endpoint
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url

# Test connected accounts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/connected
```

If endpoints return 404, they need to be implemented in `server/index.js`.



