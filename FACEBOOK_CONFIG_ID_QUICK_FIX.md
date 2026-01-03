# Facebook Login for Business - Quick Fix

## The Problem
Error: **"This app needs at least one supported permission"**

Your Facebook app was migrated to **Facebook Login for Business**, which requires a `config_id`.

---

## The Solution (5 Minutes)

### Step 1: Create Configuration in Facebook

1. Go to https://developers.facebook.com/apps/
2. Select your BuzzIt app
3. Left sidebar → **Facebook Login for Business** → **Configurations**
4. Click **"Create Configuration"**

### Step 2: Fill Configuration Details

```
Configuration Name: BuzzIt Web Login
Configuration Type: Web

Allowed Domains:
  your-railway-domain.up.railway.app

Valid OAuth Redirect URIs:
  https://your-railway-domain.up.railway.app/oauth/callback/facebook
  https://your-railway-domain.up.railway.app/api/social-auth/oauth/facebook/callback
```

### Step 3: Get Your Config ID

After saving, you'll see:
```
Configuration ID: 1592342735525633
```
**Copy this number!**

### Step 4: Add to Railway

1. Go to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Click **"+ New Variable"**
5. Add:
   ```
   Variable: FACEBOOK_CONFIG_ID
   Value: 1592342735525633
   ```
   (Use YOUR config ID, not this example)
6. The app will auto-redeploy

### Step 5: Test

1. Try Facebook login in your BuzzIt app
2. The error should be gone!

---

## What This Does

Your OAuth URL will now include the `config_id`:

**Before:**
```
https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...
```

**After:**
```
https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...&config_id=1592342735525633
```

The code automatically adds `config_id` when the environment variable is set.

---

## Still Have Issues?

See the full guide: `FACEBOOK_LOGIN_FOR_BUSINESS_SETUP.md`

---

## What Changed in the Code?

**File**: `server/routes/socialAuthRoutes.js`

```javascript
// Automatically adds config_id if set
if (platform === 'facebook' && process.env.FACEBOOK_CONFIG_ID) {
  params.append('config_id', process.env.FACEBOOK_CONFIG_ID);
}
```

✅ **Already committed and pushed to GitHub!**
