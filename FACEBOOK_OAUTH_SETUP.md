# Facebook OAuth Setup Guide

## Problem
Getting error: "This app isn't available - This app needs at least one supported permission"

## Solution

### Step 1: Access Facebook Developer Console
1. Go to https://developers.facebook.com/apps
2. Select your BuzzIt app (or create a new one)

### Step 2: Configure App Basic Settings
1. Click **Settings** → **Basic** in the left sidebar
2. Fill in required fields:
   - **App Name**: BuzzIt
   - **App Contact Email**: your-email@example.com
   - **Privacy Policy URL**: https://buzzit-production.up.railway.app/privacy (create this page)
   - **Terms of Service URL**: https://buzzit-production.up.railway.app/terms (create this page)
   - **App Icon**: Upload your app logo (1024x1024 recommended)

### Step 3: Add Facebook Login Product
1. In the left sidebar, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** as the platform

### Step 4: Configure Facebook Login Settings
1. Go to **Facebook Login** → **Settings**
2. Set **Valid OAuth Redirect URIs**:
   ```
   https://buzzit-production.up.railway.app/social-settings.html
   https://buzzit-production.up.railway.app/oauth/callback
   http://localhost:3000/social-settings.html (for local testing)
   ```
3. Set **Allowed Domains for the JavaScript SDK**:
   ```
   buzzit-production.up.railway.app
   localhost
   ```

### Step 5: Enable Required Permissions
1. Go to **App Review** → **Permissions and Features**
2. Request these permissions (if not already approved):
   - ✅ **public_profile** - Should be approved by default
   - ✅ **email** - Request if needed (optional)

### Step 6: App Mode
Choose one of the following:

#### Option A: Development Mode (For Testing)
1. Go to **Settings** → **Basic**
2. Ensure **App Mode** is set to **Development**
3. Add test users:
   - Go to **Roles** → **Test Users**
   - Click **Add** to create test users
   - Use these test accounts to test OAuth

#### Option B: Live Mode (For Production)
1. Complete **App Review** requirements:
   - Privacy Policy URL
   - Terms of Service URL
   - App Icon
   - Category selection
2. Go to **Settings** → **Basic**
3. Toggle **App Mode** to **Live**
4. Click **Switch Mode**

**⚠️ Important**: In Development Mode, only test users, developers, and admins can authenticate. For regular users to connect, the app must be in Live Mode.

### Step 7: Get App Credentials
1. Go to **Settings** → **Basic**
2. Copy **App ID** → This is your `FACEBOOK_CLIENT_ID`
3. Copy **App Secret** → This is your `FACEBOOK_CLIENT_SECRET`
4. Update your Railway environment variables:
   ```
   FACEBOOK_CLIENT_ID=your_app_id_here
   FACEBOOK_CLIENT_SECRET=your_app_secret_here
   ```

### Step 8: Update Railway Environment Variables
1. Go to your Railway dashboard
2. Select your BuzzIt project
3. Go to **Variables** tab
4. Add/Update these variables:
   ```
   FACEBOOK_CLIENT_ID=<your_facebook_app_id>
   FACEBOOK_CLIENT_SECRET=<your_facebook_app_secret>
   APP_BASE_URL=https://buzzit-production.up.railway.app
   ```
5. Click **Deploy** to restart with new variables

## Testing

### For Development Mode (with test users):
1. Create a test user in Facebook Developer Console
2. Login to BuzzIt with a regular account
3. Go to Social Settings
4. Click "Connect Facebook"
5. Login with the **test user** credentials
6. Authorize the app
7. Should redirect back successfully

### For Live Mode (with real users):
1. Ensure app is approved and in Live mode
2. Any Facebook user can now connect
3. Test with your real Facebook account

## Common Issues

### Issue: "App Not Set Up"
**Solution**: Complete all required fields in Basic Settings (Privacy Policy, Terms, Icon, etc.)

### Issue: "Redirect URI Mismatch"
**Solution**: Ensure the redirect URI in Facebook Login settings exactly matches:
```
https://buzzit-production.up.railway.app/social-settings.html
```

### Issue: "This app isn't available"
**Solution**:
- If in Development Mode: Use test users only
- If in Live Mode: Complete App Review and get approved
- Check that `public_profile` permission is available

### Issue: "Invalid OAuth Redirect"
**Solution**: Add your domain to Valid OAuth Redirect URIs

## Quick Checklist

- [ ] Facebook app created
- [ ] Basic settings filled (Name, Email, Privacy Policy, Terms, Icon)
- [ ] Facebook Login product added
- [ ] OAuth Redirect URIs configured
- [ ] App Mode set (Development or Live)
- [ ] Test users created (if Development mode)
- [ ] Environment variables updated on Railway
- [ ] Railway redeployed

## Alternative: Use Facebook Test App

If you just want to test the integration quickly:

1. In Facebook Developer Console, create a **Test App**
2. Test apps automatically have permissions approved
3. Use test users to authenticate
4. No App Review required

## Need Help?

Check Facebook's official documentation:
- https://developers.facebook.com/docs/facebook-login/web
- https://developers.facebook.com/docs/development/create-an-app

## Current Configuration

Your code is currently using:
- **Scope**: `public_profile`
- **Auth URL**: `https://www.facebook.com/v18.0/dialog/oauth`
- **Token URL**: `https://graph.facebook.com/v18.0/oauth/access_token`
- **Redirect URI**: Should be `https://buzzit-production.up.railway.app/social-settings.html`
