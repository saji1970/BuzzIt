# How to Fix "Invalid Redirect URI" Error

## The Error
```
This is an invalid redirect URI for this application
You can make this URI valid by adding it to the list of valid OAuth redirect URIs above
```

This means you need to add your redirect URIs to the OAuth app settings on each platform.

## Facebook/Instagram Redirect URI Setup

### Step 1: Go to Your Facebook App
1. Visit https://developers.facebook.com/apps/
2. Click on your app (or create a new one)

### Step 2: Configure Facebook Login
1. In the left sidebar, click **"Products"**
2. Find **"Facebook Login"** and click **"Settings"** under it
   - If Facebook Login isn't added, click **"Add Product"** and add "Facebook Login" first

### Step 3: Add Valid OAuth Redirect URIs
In the **"Valid OAuth Redirect URIs"** field, add these EXACT URLs (one per line):

```
https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
com.buzzit.app://oauth/callback/facebook
http://localhost:3000/api/social-auth/oauth/facebook/callback
```

**Important:**
- ✅ NO trailing slashes
- ✅ Exact match (case-sensitive)
- ✅ Include http://localhost for testing
- ✅ One URL per line

### Step 4: Save Changes
1. Scroll down and click **"Save Changes"** button
2. Wait a few seconds for changes to propagate

### Step 5: Configure Instagram (if using Instagram)
Instagram uses the same Facebook app, but you need to configure it separately:

1. In left sidebar, find **"Instagram"** under Products
2. Click **"Basic Display"** or **"Instagram Graph API"** settings
3. Add the same redirect URIs:

```
https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
com.buzzit.app://oauth/callback/instagram
http://localhost:3000/api/social-auth/oauth/instagram/callback
```

4. Click **"Save Changes"**

## Snapchat Redirect URI Setup

### Step 1: Go to Snapchat Marketing API
1. Visit https://ads.snapchat.com/
2. Sign in with your Snapchat account
3. Go to **Business Hub** → **Integrations** → **Marketing API**

### Step 2: Create or Edit Your App
1. Click on your existing app or **"Create App"**
2. Fill in basic information if creating new

### Step 3: Add Redirect URIs
1. Find the **"Redirect URIs"** or **"OAuth2 Redirect URIs"** section
2. Click **"Add Redirect URI"**
3. Add these URLs (one at a time):

```
https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
com.buzzit.app://oauth/callback/snapchat
http://localhost:3000/api/social-auth/oauth/snapchat/callback
```

4. Click **"Save"** after each one

### Step 4: Submit for Review (if needed)
- Snapchat may require app review before going live
- You can test in development mode first

## Common Mistakes to Avoid

### ❌ Wrong Format
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback/  ← Trailing slash
https://buzzit-production.up.railway.app/oauth/callback/facebook  ← Wrong path
http://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback  ← http instead of https
```

### ✅ Correct Format
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
```

## Platform-Specific Notes

### Facebook/Instagram
- **Location**: App Dashboard → Products → Facebook Login → Settings
- **Field Name**: "Valid OAuth Redirect URIs"
- **Multiple URIs**: Enter one per line (press Enter after each)
- **Custom URL Schemes**: Facebook also supports custom schemes like `com.buzzit.app://`
- **Save Button**: Don't forget to click "Save Changes" at the bottom

### Snapchat
- **Location**: Marketing API → Your App → OAuth Settings
- **Field Name**: "Redirect URIs"
- **Multiple URIs**: Add one at a time using "Add Redirect URI" button
- **Approval**: May need review for production use

## Testing Your Configuration

### Test 1: Check Redirect URI in OAuth URL
After configuring, test if the OAuth URL is generated correctly:

```bash
# Test Facebook
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
```

The response should include a `redirect_uri` parameter:
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&..."
}
```

### Test 2: Try Connecting in App
1. Open app → Settings → Privacy & Social
2. Tap "Connect" on Facebook
3. Browser should open without errors
4. After authorizing, you should be redirected back

## Troubleshooting

### Issue: Still Getting "Invalid Redirect URI"
**Solutions:**
1. **Wait**: Changes can take 1-2 minutes to propagate
2. **Check Exact Match**: URI must match EXACTLY (no extra spaces, slashes, etc.)
3. **Clear Browser Cache**: Old OAuth URL might be cached
4. **Check App Status**: Make sure app is not in "Development Mode" restrictions

### Issue: URI Added But Error Persists
**Check:**
1. Did you click "Save Changes"?
2. Is the app in "Live Mode" or "Development Mode"?
3. For Facebook: Is Facebook Login product actually added?
4. For Instagram: Did you configure both Facebook Login AND Instagram separately?

### Issue: Custom URL Scheme Not Working
**For `com.buzzit.app://oauth/callback/facebook`:**

1. **Facebook**: Should accept custom schemes
2. **Check AndroidManifest.xml**: Verify intent-filter is configured
3. **Test Deep Linking**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "com.buzzit.app://oauth/callback/facebook?code=test"
   ```

## Quick Setup Checklist

### Facebook:
- [ ] Go to https://developers.facebook.com/apps/
- [ ] Select your app
- [ ] Products → Facebook Login → Settings
- [ ] Add all 3 redirect URIs to "Valid OAuth Redirect URIs"
- [ ] Click "Save Changes"
- [ ] Wait 1-2 minutes

### Instagram:
- [ ] Same Facebook app
- [ ] Products → Instagram → Settings
- [ ] Add all 3 redirect URIs
- [ ] Click "Save Changes"
- [ ] Wait 1-2 minutes

### Snapchat:
- [ ] Go to https://ads.snapchat.com/
- [ ] Business Hub → Integrations → Marketing API
- [ ] Select your app
- [ ] Add redirect URIs one by one
- [ ] Click "Save"

## Environment Variables to Set

After configuring redirect URIs, make sure these are set in Railway:

```bash
# Facebook
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=abc123def456ghi789

# Instagram (usually same as Facebook)
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=abc123def456ghi789

# Snapchat
SNAPCHAT_CLIENT_ID=your-snapchat-client-id
SNAPCHAT_CLIENT_SECRET=your-snapchat-client-secret

# App URL
APP_BASE_URL=https://buzzit-production.up.railway.app
```

## Screenshot Guide

### Facebook Login Settings Location:
```
Facebook Developers Dashboard
└── Your App
    └── Products (left sidebar)
        └── Facebook Login
            └── Settings
                └── Valid OAuth Redirect URIs (text area)
                    ├── https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
                    ├── com.buzzit.app://oauth/callback/facebook
                    └── http://localhost:3000/api/social-auth/oauth/facebook/callback
                └── [Save Changes] button
```

## Need More Help?

If you're still getting errors:

1. **Share the exact error message** you're seeing
2. **Check which platform** is giving the error (Facebook, Instagram, or Snapchat)
3. **Verify your app credentials** are set correctly in Railway
4. **Check Railway logs** for detailed error messages:
   ```bash
   # In Railway dashboard, go to your service → Logs
   ```

## Testing After Configuration

Once redirect URIs are configured:

1. **Test in app**:
   - Settings → Privacy & Social
   - Tap "Connect Facebook"
   - Should open browser
   - Authorize permissions
   - Should redirect back to app

2. **Check for errors**:
   - If error, check Railway logs
   - Look for OAuth callback errors
   - Verify environment variables are set

3. **Verify connection**:
   - After successful auth, check Settings
   - Should show "Connected" with username
   - Try creating a buzz and publishing to platform
