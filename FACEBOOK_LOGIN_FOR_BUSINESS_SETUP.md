# Facebook Login for Business Setup Guide

If you're getting the error **"This app needs at least one supported permission"** and your Facebook app has **"Facebook Login for Business"** instead of regular "Facebook Login", you need to create a configuration and use a `config_id`.

---

## What Changed?

Facebook automatically migrates some apps from **"Facebook Login"** to **"Facebook Login for Business"**. This new product requires:
1. Creating a Configuration in the Facebook Dashboard
2. Getting a `config_id`
3. Adding the `config_id` to your OAuth URL

---

## Step-by-Step Setup

### Step 1: Check Your Facebook App Product

1. Go to https://developers.facebook.com/apps/
2. Select your BuzzIt app
3. Look in the left sidebar under **"Products"**
4. If you see **"Facebook Login for Business"** instead of "Facebook Login", follow this guide

### Step 2: Create a Configuration

1. In the left sidebar, go to:
   ```
   Products → Facebook Login for Business → Configurations
   ```

2. Click **"Create Configuration"** (or "+ Create")

3. Fill in the configuration details:

   **Configuration Name**: BuzzIt Web Login

   **Configuration Type**: Choose **"Web"**

   **Allowed Domains**: Add your domains (one per line):
   ```
   your-railway-domain.up.railway.app
   localhost:3000
   ```

   **Valid OAuth Redirect URIs**: Add your redirect URLs:
   ```
   https://your-railway-domain.up.railway.app/oauth/callback/facebook
   https://your-railway-domain.up.railway.app/api/social-auth/oauth/facebook/callback
   http://localhost:3000/oauth/callback/facebook
   ```

   **Client OAuth Login**: Enable (toggle to ON)

   **Web OAuth Login**: Enable (toggle to ON)

4. Click **"Save"** or **"Create Configuration"**

5. After creating, you'll see your **Configuration ID** - it looks like:
   ```
   1592342735525633
   ```
   **Copy this ID - you'll need it!**

### Step 3: Add Config ID to Your Environment Variables

1. If running locally, add to your `.env` file:
   ```bash
   FACEBOOK_CONFIG_ID=1592342735525633
   ```

2. If deployed to Railway:
   - Go to Railway Dashboard
   - Select your backend service
   - Go to **Variables** tab
   - Click **"+ New Variable"**
   - Add:
     ```
     Variable: FACEBOOK_CONFIG_ID
     Value: 1592342735525633
     ```
   - Click **"Add"** and **"Deploy"**

### Step 4: Verify the Configuration

After adding the `FACEBOOK_CONFIG_ID` environment variable, your OAuth URL will automatically include it:

**Before** (without config_id):
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=https://your-domain.com/oauth/callback/facebook&
  scope=public_profile&
  response_type=code&
  state=...
```

**After** (with config_id):
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=https://your-domain.com/oauth/callback/facebook&
  scope=public_profile&
  response_type=code&
  state=...&
  config_id=1592342735525633
```

---

## Testing the Configuration

### Test 1: Verify Config ID is Being Used

1. In your BuzzIt app, try to connect Facebook
2. Check the OAuth URL that's generated
3. It should include `config_id=1592342735525633` at the end

### Test 2: Complete Facebook Login Flow

1. Click "Connect Facebook" in your app
2. You should be redirected to Facebook
3. Facebook should show the login/permission dialog
4. After clicking "Continue", you should be redirected back to BuzzIt
5. Your Facebook account should be connected

### Test 3: Check Server Logs

Look for log messages showing the config_id is being used:
```
[OAuth] facebook - clientId configured: true
[OAuth] Generating auth URL with config_id: 1592342735525633
```

---

## Common Issues

### Issue 1: Still Getting "App isn't available" Error

**Cause**: Configuration not properly saved or config_id not added to environment

**Solution**:
1. Verify the `FACEBOOK_CONFIG_ID` environment variable is set
2. Restart your server (or redeploy on Railway)
3. Check the OAuth URL includes `config_id=...`
4. Make sure the configuration is "Active" in Facebook dashboard

### Issue 2: "Invalid configuration ID"

**Cause**: Wrong config_id or configuration deleted

**Solution**:
1. Go to Facebook App Dashboard → Facebook Login for Business → Configurations
2. Verify the configuration still exists
3. Copy the correct config_id
4. Update your environment variable
5. Redeploy

### Issue 3: "Redirect URI mismatch"

**Cause**: Redirect URI not added to the configuration

**Solution**:
1. Go to the configuration in Facebook dashboard
2. Under "Valid OAuth Redirect URIs", add all your redirect URLs:
   ```
   https://your-railway-domain.up.railway.app/oauth/callback/facebook
   ```
3. Save the configuration
4. Try again

### Issue 4: Environment variable not being used

**Cause**: Server not restarted after adding variable

**Solution**:
- **Local**: Stop and restart your server
- **Railway**:
  1. Go to Deployments
  2. Click "Redeploy" or push a new commit
  3. Wait for deployment to complete

---

## Multiple Configurations (Optional)

You can create multiple configurations for different platforms:

1. **Web Configuration** - For browser-based login
   - Name: "BuzzIt Web Login"
   - Type: Web
   - Get config_id: `1592342735525633`

2. **Mobile Configuration** (if needed later) - For mobile apps
   - Name: "BuzzIt Mobile Login"
   - Type: Mobile (iOS/Android)
   - Get separate config_id

To use different configurations, you would conditionally set the config_id based on the platform:
```javascript
// In your code (advanced usage)
const configId = isMobileApp ?
  process.env.FACEBOOK_MOBILE_CONFIG_ID :
  process.env.FACEBOOK_CONFIG_ID;
```

---

## Verification Checklist

Before submitting to Facebook App Review, verify:

- [ ] Facebook Login for Business configuration created
- [ ] Configuration includes all redirect URIs
- [ ] Configuration ID copied correctly
- [ ] `FACEBOOK_CONFIG_ID` environment variable set in Railway
- [ ] Server redeployed after adding environment variable
- [ ] OAuth URL includes `config_id` parameter
- [ ] Facebook login works in your app
- [ ] Permissions (`email`, `public_profile`) have Advanced Access
- [ ] No errors in server logs during OAuth flow

---

## Alternative: Migrate Back to Facebook Login (Not Recommended)

If you want to use regular "Facebook Login" instead of "Facebook Login for Business":

1. Go to Facebook App Dashboard
2. Products → Remove "Facebook Login for Business"
3. Add Products → "Facebook Login" → Set Up
4. Configure OAuth redirect URIs in Facebook Login → Settings
5. Remove `FACEBOOK_CONFIG_ID` from environment variables

**Note**: Facebook may automatically migrate you back to "Facebook Login for Business" in the future.

---

## Code Implementation

The code has already been updated to support `config_id`. Here's what was changed:

**File**: `server/routes/socialAuthRoutes.js`

```javascript
const params = new URLSearchParams({
  client_id: config.clientId,
  redirect_uri: redirectUri,
  scope: config.scope,
  response_type: 'code',
  state: state,
});

// Add Facebook Login for Business config_id if available
if (platform === 'facebook' && process.env.FACEBOOK_CONFIG_ID) {
  params.append('config_id', process.env.FACEBOOK_CONFIG_ID);
}

const authUrl = `${config.authUrl}?${params.toString()}`;
```

This code:
1. Checks if the platform is Facebook
2. Checks if `FACEBOOK_CONFIG_ID` environment variable is set
3. If both are true, adds `config_id` to the OAuth URL
4. If not set, works without it (for regular Facebook Login)

---

## Summary

**Quick Fix (5 minutes):**

1. Go to Facebook App Dashboard → Facebook Login for Business → Configurations
2. Create a new configuration
3. Copy the Configuration ID
4. Add to Railway:
   ```
   FACEBOOK_CONFIG_ID=1592342735525633
   ```
5. Redeploy
6. Test Facebook login

**The config_id will automatically be included in your OAuth URLs.**

---

## Resources

- **Facebook Login for Business Docs**: https://developers.facebook.com/docs/facebook-login/for-business
- **Configuration Guide**: https://developers.facebook.com/docs/facebook-login/for-business/configure
- **OAuth Documentation**: https://developers.facebook.com/docs/facebook-login/guides/access-tokens

---

## Need Help?

If you're still having issues:
1. Check the Facebook App Dashboard for any warnings or errors
2. Verify all redirect URIs match exactly
3. Check server logs for OAuth errors
4. Make sure the configuration is "Active" status
5. Try creating a new configuration and using that config_id
