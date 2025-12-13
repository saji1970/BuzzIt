# Railway Environment Variables Required

## Current Error

```
Connection Error
Failed to get facebook authentication URL. Please check server configuration.
```

## Root Cause

The Railway deployment is missing the Facebook/Instagram OAuth credentials in environment variables.

## Quick Fix (2 Minutes)

### Step 1: Go to Railway Dashboard

1. Open: https://railway.app/dashboard
2. Select your **BuzzIt** project
3. Click on your **service** (the one running the backend)
4. Click the **"Variables"** tab

### Step 2: Add These Environment Variables

Add these **4 required variables**:

```bash
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here
```

**IMPORTANT**:
- Instagram uses the **SAME** credentials as Facebook
- Do NOT include quotes around the values
- Make sure there are no spaces before or after the values

### Step 3: Get Your Facebook App Credentials

If you haven't created a Facebook App yet:

1. Go to: https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Business"** type
4. Fill in App Name: `BuzzIt`
5. Once created, go to **Settings → Basic**
6. Copy **App ID**
7. Click **"Show"** next to **App Secret** and copy it
8. Use these values in Railway

### Step 4: Configure Facebook App

1. In Facebook App, go to **"Add Product"**
2. Add **"Facebook Login"**
3. Add **"Instagram Graph API"**
4. Go to **Facebook Login → Settings**
5. In **"Valid OAuth Redirect URIs"**, add:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
   ```
6. Click **"Save Changes"**

### Step 5: Wait for Deployment

After adding the variables to Railway:
1. Railway will auto-deploy (1-2 minutes)
2. Check **"Deployments"** tab for status
3. Wait for deployment to show **"Success"**

### Step 6: Test

1. Reopen BuzzIt app
2. Go to **Settings → Privacy & Social**
3. Tap **"Connect"** on Facebook
4. Should open Facebook OAuth page (not error)

---

## Verification

### Check if Variables are Set

You can verify environment variables are set by checking Railway logs:

1. Go to Railway Dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click latest deployment
5. Look for logs like:
   ```
   [OAuth] Environment check - FACEBOOK_CLIENT_ID exists: true
   [OAuth] Environment check - INSTAGRAM_CLIENT_ID exists: true
   ```

### Expected Behavior After Fix

When you tap "Connect" on Facebook:
- ✅ Opens Facebook OAuth page in browser
- ✅ You can log in and authorize
- ✅ Redirects back to app
- ✅ Shows "Connected" status

---

## Example Environment Variables

```bash
# Facebook OAuth (get from https://developers.facebook.com/apps/)
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Instagram OAuth (same as Facebook)
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Already set (don't change)
APP_BASE_URL=https://buzzit-production.up.railway.app
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

## Troubleshooting

### Still getting "Failed to get authentication URL"?

1. **Check Railway Deployment**
   - Make sure deployment completed successfully
   - Check logs for any errors

2. **Verify Environment Variables**
   - Make sure they're in the correct format (no quotes, no spaces)
   - Make sure they're in the **service** variables (not project variables)

3. **Check Facebook App**
   - Make sure App ID and Secret are correct
   - Make sure Facebook Login product is added
   - Make sure OAuth redirects are configured

4. **Force Railway Redeploy**
   - Go to deployments tab
   - Click **"Redeploy"** button
   - Wait for completion

### Still not working?

Check Railway logs for debug output:
- `[OAuth] facebook - clientId configured: false` → Environment variable not set
- `[OAuth] facebook - clientId configured: true` → Environment variable is set correctly

---

## Summary

**Problem**: Railway environment variables not set
**Solution**: Add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to Railway
**Time**: 2 minutes
**Result**: Facebook and Instagram OAuth will work
