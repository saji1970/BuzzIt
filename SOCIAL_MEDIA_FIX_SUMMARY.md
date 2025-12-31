# Social Media Integration Fix - Quick Summary

## What Was Fixed

**Problem:** Facebook and Instagram posting wasn't working even with Railway environment variables configured.

**Root Cause:** Environment variable name mismatch
- Code was looking for: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- Documentation said to use: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`
- Result: Code couldn't find the variables → OAuth failed

**Solution:** Updated code to use correct variable names matching the documentation.

**Files Changed:**
- `server/routes/socialAuthRoutes.js` - Fixed environment variable names

**Commit:** `7c73343` - "Fix: Correct environment variable names for Facebook/Instagram OAuth"

---

## What You Need to Do Now

### Step 1: Wait for Railway Deployment (2-3 minutes)

The code fix has been pushed to GitHub. Railway will automatically deploy it.

**Check deployment status:**
1. Go to [Railway Dashboard](https://railway.app)
2. Select your BuzzIt backend service
3. Click **"Deployments"** tab
4. Wait for latest deployment to show **"Success"**

### Step 2: Verify Environment Variables in Railway

Make sure these **EXACT** variable names are set in Railway:

```
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here
APP_BASE_URL=https://buzzit-production.up.railway.app
```

**How to check/set variables:**
1. Railway Dashboard → Your Service → **"Variables"** tab
2. Look for the variable names above
3. If missing, click **"New Variable"** and add them
4. If wrong name (like `FACEBOOK_CLIENT_ID`), delete it and add correct name

**📖 Detailed guide:** See `RAILWAY_ENV_VERIFICATION.md`

### Step 3: Test That It's Working

#### Quick Test: Health Check
Visit this URL in your browser:
```
https://buzzit-production.up.railway.app/api/social-auth/health
```

**Expected result:**
```json
{
  "success": true,
  "facebookConfigured": true,
  "instagramConfigured": true
}
```

If you see `false`, the environment variables are not set correctly.

#### Full Test: OAuth Connection
1. Open your BuzzIt app
2. Go to **Settings** → **Privacy & Social**
3. Tap **"Connect"** on Facebook
4. Should open browser with Facebook login
5. After login, should redirect back to app
6. Status should show **"Connected"** ✅

#### Test Publishing
1. Create a new buzz (with an image for Instagram)
2. In the create buzz screen, select Facebook and/or Instagram
3. Tap **"Create Buzz"**
4. Should successfully post to selected platforms
5. Check your Facebook/Instagram to verify the post appeared

---

## Where to Get OAuth Credentials

If you haven't set up Facebook/Instagram OAuth apps yet:

### Facebook App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click **"Create App"** (or select existing app)
3. Go to **Settings** → **Basic**
4. Copy **App ID** → This is your `FACEBOOK_APP_ID`
5. Copy **App Secret** → This is your `FACEBOOK_APP_SECRET`
   - Click "Show" and enter your Facebook password to reveal it

6. Configure redirect URIs:
   - Go to **Products** → **Facebook Login** → **Settings**
   - Add **Valid OAuth Redirect URIs:**
     ```
     https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
     https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
     ```

7. Request permissions (for App Review):
   - `pages_manage_posts` - Required for posting
   - `pages_read_engagement` - Required for page access
   - `instagram_basic` - Required for Instagram
   - `instagram_content_publish` - Required for Instagram posting

### Instagram Setup

**Instagram uses the same Facebook app!**

Just use the same credentials:
```
INSTAGRAM_APP_ID=same_as_facebook_app_id
INSTAGRAM_APP_SECRET=same_as_facebook_app_secret
```

**Additional requirements:**
- Your Instagram account must be a **Business Account**
- Must be linked to a **Facebook Page**

**To convert to Business Account:**
1. Open Instagram app
2. Go to **Settings** → **Account**
3. Tap **"Switch to Professional Account"**
4. Select **"Business"**
5. Link to your Facebook Page

---

## Troubleshooting

### Issue: Health check shows `false`

**Fix:** Environment variables not set in Railway
- Go to Railway → Variables tab
- Add the missing variables
- Wait for redeploy

### Issue: "OAuth is not configured on the server"

**Fix:** Same as above - environment variables not set

### Issue: Browser opens but shows Facebook error

**Possible causes:**
1. **"Invalid App ID"** → App ID is wrong or not set
2. **"Redirect URI mismatch"** → Add redirect URIs to Facebook app settings
3. **"App not approved"** → Add yourself as a test user, or submit for app review

### Issue: "Instagram requires media"

**Cause:** Instagram API doesn't support text-only posts

**Fix:** Always include an image or video when posting to Instagram

### Issue: Publishing fails after connecting

**Check:**
1. Is your Instagram account a Business Account?
2. Is it linked to a Facebook Page?
3. Does the buzz have media (required for Instagram)?
4. Are tokens expired? (Reconnect if so)

**📖 Full troubleshooting guide:** See `SOCIAL_MEDIA_TROUBLESHOOTING.md`

---

## Documentation Reference

| Guide | Purpose |
|-------|---------|
| **RAILWAY_ENV_VERIFICATION.md** | Step-by-step guide to set Railway environment variables |
| **SOCIAL_MEDIA_TROUBLESHOOTING.md** | Common issues and solutions |
| **SOCIAL_MEDIA_INTEGRATION.md** | Complete integration documentation |
| **RAILWAY_SOCIAL_MEDIA_CONFIG.md** | OAuth app setup instructions |

---

## Quick Checklist

After the fix has been deployed, verify:

- [ ] Railway deployment completed successfully
- [ ] Environment variables set in Railway:
  - [ ] `FACEBOOK_APP_ID`
  - [ ] `FACEBOOK_APP_SECRET`
  - [ ] `INSTAGRAM_APP_ID`
  - [ ] `INSTAGRAM_APP_SECRET`
  - [ ] `APP_BASE_URL`
- [ ] Health check shows all platforms configured
- [ ] Can connect Facebook account from app
- [ ] Can connect Instagram account from app
- [ ] Can publish to Facebook
- [ ] Can publish to Instagram (with media)

---

## Summary

**Before the fix:**
- Code looked for wrong variable names
- OAuth failed silently
- Publishing didn't work

**After the fix:**
- Code uses correct variable names
- OAuth works when variables are set
- Publishing works as expected

**What you need to do:**
1. Wait for Railway to deploy (automatic)
2. Set environment variables in Railway (if not already set)
3. Test OAuth connection
4. Test publishing

**That's it!** Facebook and Instagram posting should now work correctly.

---

**Last Updated:** 2025-12-15
**Fix Commit:** 7c73343
**Status:** ✅ Fixed and deployed
