# Railway Environment Variables Verification Guide

## Quick Check: Is OAuth Configured?

After the fix has been deployed, verify your OAuth configuration by visiting:

```
https://buzzit-production.up.railway.app/api/social-auth/health
```

You should see:
```json
{
  "success": true,
  "message": "Social auth routes are working",
  "timestamp": "2025-12-15T...",
  "availablePlatforms": ["facebook", "instagram", "snapchat"],
  "facebookConfigured": true,    // ✅ Should be true
  "instagramConfigured": true,   // ✅ Should be true
  "snapchatConfigured": true     // ✅ Should be true (if configured)
}
```

If any platform shows `false`, the environment variables are NOT set correctly.

---

## Step-by-Step: Set Environment Variables in Railway

### 1. Access Railway Dashboard

1. Go to [https://railway.app](https://railway.app)
2. Sign in to your account
3. Select your project: **BuzzIt Production**
4. Click on your **backend service** (the one running Node.js)

### 2. Open Variables Tab

1. In the service dashboard, click on the **"Variables"** tab
2. You'll see all current environment variables

### 3. Required Variables

Make sure you have these **EXACT** variable names set:

#### Facebook OAuth
```
FACEBOOK_APP_ID=your_actual_facebook_app_id
FACEBOOK_APP_SECRET=your_actual_facebook_app_secret
```

#### Instagram OAuth
```
INSTAGRAM_APP_ID=your_actual_instagram_app_id
INSTAGRAM_APP_SECRET=your_actual_instagram_app_secret
```

#### Snapchat OAuth (Optional)
```
SNAPCHAT_CLIENT_ID=your_actual_snapchat_client_id
SNAPCHAT_CLIENT_SECRET=your_actual_snapchat_client_secret
```

#### App Configuration
```
APP_BASE_URL=https://buzzit-production.up.railway.app
JWT_SECRET=your-super-secret-jwt-key
```

### 4. How to Add/Edit Variables

**To Add a New Variable:**
1. Click **"New Variable"** or **"+ Add Variable"**
2. Enter the **Variable Name** (e.g., `FACEBOOK_APP_ID`)
3. Enter the **Value** (your actual app ID from Facebook)
4. Click **"Add"**

**To Edit an Existing Variable:**
1. Find the variable in the list
2. Click on the value field
3. Edit the value
4. Click **"Save"** or press Enter

**To Delete a Variable:**
1. Find the variable in the list
2. Click the **trash/delete icon**
3. Confirm deletion

### 5. Verify Railway Auto-Deploys

After adding/editing variables:
1. Railway will **automatically trigger a redeploy**
2. Wait 2-3 minutes for deployment to complete
3. Check the **"Deployments"** tab to see deployment status
4. Look for **"Deployment successful"** message

### 6. Manual Redeploy (If Needed)

If Railway doesn't auto-deploy:
1. Go to the **"Deployments"** tab
2. Click **"Deploy"** button
3. Select **"Redeploy"**
4. Wait for deployment to complete

---

## Common Mistakes to Avoid

### ❌ Wrong Variable Names
```
# WRONG - Don't use these names:
FACEBOOK_CLIENT_ID=...        # ❌ Old/incorrect name
FACEBOOK_CLIENT_SECRET=...    # ❌ Old/incorrect name
INSTAGRAM_CLIENT_ID=...       # ❌ Old/incorrect name
INSTAGRAM_CLIENT_SECRET=...   # ❌ Old/incorrect name

# CORRECT - Use these names:
FACEBOOK_APP_ID=...           # ✅ Correct name
FACEBOOK_APP_SECRET=...       # ✅ Correct name
INSTAGRAM_APP_ID=...          # ✅ Correct name
INSTAGRAM_APP_SECRET=...      # ✅ Correct name
```

### ❌ Missing Values
```
# WRONG - Empty values won't work:
FACEBOOK_APP_ID=              # ❌ Empty
FACEBOOK_APP_ID=your_app_id   # ❌ Placeholder text

# CORRECT - Use actual values:
FACEBOOK_APP_ID=123456789012345  # ✅ Real Facebook App ID
```

### ❌ Extra Spaces or Quotes
```
# WRONG - Don't add extra characters:
FACEBOOK_APP_ID= 123456789012345   # ❌ Space before value
FACEBOOK_APP_ID="123456789012345"  # ❌ Quotes (Railway adds them)

# CORRECT - Raw value only:
FACEBOOK_APP_ID=123456789012345    # ✅ Clean value
```

---

## Where to Get OAuth App Credentials

### Facebook App ID and Secret

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Select your BuzzIt app (or create one)
3. Go to **Settings** → **Basic**
4. Copy **App ID** → Use as `FACEBOOK_APP_ID`
5. Copy **App Secret** → Use as `FACEBOOK_APP_SECRET`
   - Click **"Show"** next to App Secret
   - Enter your Facebook password
   - Copy the revealed secret

### Instagram App ID and Secret

**Option 1: Use Same as Facebook** (Recommended)
```
INSTAGRAM_APP_ID=same_as_facebook_app_id
INSTAGRAM_APP_SECRET=same_as_facebook_app_secret
```

**Option 2: Separate Instagram App**
1. Create a separate Facebook app for Instagram
2. Add **Instagram** product to the app
3. Use that app's credentials

### Snapchat Client ID and Secret

1. Go to [Snapchat Business](https://ads.snapchat.com/)
2. Navigate to **Business Hub** → **Integrations** → **Marketing API**
3. Select your app
4. Copy **Client ID** → Use as `SNAPCHAT_CLIENT_ID`
5. Copy **Client Secret** → Use as `SNAPCHAT_CLIENT_SECRET`

---

## Verification Checklist

After setting all variables, verify everything is working:

- [ ] All environment variables are set in Railway
- [ ] Variable names match EXACTLY (case-sensitive)
- [ ] No extra spaces or quotes in values
- [ ] Railway has redeployed (check Deployments tab)
- [ ] Health check shows all platforms configured: `https://buzzit-production.up.railway.app/api/social-auth/health`
- [ ] `facebookConfigured: true` in health check
- [ ] `instagramConfigured: true` in health check

---

## Test OAuth Flow

Once everything is configured:

1. **Open your BuzzIt app**
2. Go to **Settings** → **Privacy & Social**
3. Tap **"Connect"** on Facebook
4. Should open browser with Facebook login
5. After login, should redirect back to app
6. Connection status should show **"Connected"**

If it fails, see the troubleshooting guide: `SOCIAL_MEDIA_TROUBLESHOOTING.md`

---

## Quick Commands to Check Variables

You can also check if variables are set using Railway CLI:

```bash
# Install Railway CLI (one-time)
npm install -g @railway/cli

# Login to Railway
railway login

# List all environment variables
railway variables

# Check specific variable
railway variables | grep FACEBOOK
```

---

## Need Help?

If you're still having issues after following this guide:

1. Check `SOCIAL_MEDIA_TROUBLESHOOTING.md` for common errors
2. Check Railway logs for error messages
3. Verify your Facebook/Instagram app settings
4. Make sure OAuth redirect URIs are configured correctly
