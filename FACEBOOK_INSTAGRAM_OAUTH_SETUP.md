# Facebook & Instagram OAuth Setup Guide

## ✅ Fixes Applied

### 1. **Fixed Instagram API Configuration**
- **Problem**: Instagram OAuth was using the deprecated Instagram Basic Display API
- **Solution**: Updated to use Facebook Graph API (the correct API for Instagram Business)
- **Changes**:
  - Updated Instagram auth URL from `api.instagram.com` to Facebook Graph API
  - Updated Instagram token exchange endpoint
  - Fixed Instagram profile data fetching to use Graph API
  - Added proper Instagram Business Account detection

### 2. **Fixed OAuth Scopes**
- **Problem**: Missing required permissions for Facebook Pages and Instagram publishing
- **Solution**: Added all necessary scopes
- **Facebook scopes**: `email,public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish`
- **Instagram scopes**: `instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`

### 3. **Fixed Token Exchange**
- **Problem**: Using wrong HTTP method for Facebook/Instagram token exchange
- **Solution**: Changed from POST to GET with query parameters (Facebook Graph API standard)

### 4. **Fixed Environment Variables**
- **Problem**: Inconsistent naming in documentation
- **Solution**: Clarified that Instagram uses the SAME Facebook App credentials

---

## 🚀 Setup Instructions

### Step 1: Create Facebook App

1. **Go to Facebook Developers Console**
   - Visit: https://developers.facebook.com/apps/
   - Click **"Create App"**

2. **Select App Type**
   - Choose: **"Business"** or **"None"**
   - Click **"Next"**

3. **Fill App Details**
   ```
   App Name: BuzzIt
   App Contact Email: your_email@example.com
   Business Portfolio: (Optional - Skip if you don't have one)
   ```
   - Click **"Create App"**

4. **Get Your App Credentials**
   - Go to **Settings → Basic** (left sidebar)
   - Find:
     - **App ID**: `123456789012345` (your actual ID)
     - **App Secret**: Click **"Show"** to reveal
   - **Copy both values** - you'll need them for Railway

### Step 2: Add Facebook Login Product

1. **In your app dashboard**, scroll to **"Add Products"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Click **"Settings"** under Facebook Login (left sidebar)

4. **Configure OAuth Redirect URIs**
   - In **"Valid OAuth Redirect URIs"** field, add these URLs (one per line):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
   com.buzzit.app://oauth/callback/facebook
   com.buzzit.app://oauth/callback/instagram
   http://localhost:3000/api/social-auth/oauth/facebook/callback
   http://localhost:3000/api/social-auth/oauth/instagram/callback
   ```
   - Click **"Save Changes"**

### Step 3: Add Instagram Graph API Product

1. **In your app dashboard**, scroll to **"Add Products"**
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. This enables Instagram Business account integration

### Step 4: Configure App Permissions

1. **Go to App Review → Permissions and Features**
2. **Request these permissions** (click "Request Advanced Access"):
   - `pages_manage_posts` - For posting to Facebook Pages
   - `pages_read_engagement` - For reading Facebook Page data
   - `instagram_basic` - For accessing Instagram account info
   - `instagram_content_publish` - For publishing to Instagram
   - `pages_show_list` - For listing Facebook Pages

   > **Note**: Some permissions require App Review by Facebook, but you can use them in Development Mode for testing.

### Step 5: Set Up Instagram Business Account

**IMPORTANT**: Instagram OAuth only works with Instagram Business Accounts linked to Facebook Pages.

1. **Convert your Instagram to Business Account** (if not already):
   - Open Instagram app
   - Go to Profile → Menu (≡) → Settings
   - Tap **"Account"** → **"Switch to Professional Account"**
   - Choose **"Business"**
   - Complete setup

2. **Link Instagram to Facebook Page**:
   - In Instagram app: Settings → Account → Linked Accounts → Facebook
   - OR in Facebook Page Settings: Instagram → Connect Account
   - Follow prompts to link your Instagram Business account to your Facebook Page

3. **Verify the connection**:
   - Go to your Facebook Page
   - Settings → Instagram
   - Should show your Instagram account as connected

### Step 6: Configure Railway Environment Variables

1. **Go to Railway Dashboard**:
   - Open your BuzzIt project
   - Click on your service
   - Go to **"Variables"** tab

2. **Add/Update these variables**:

   ```bash
   # Use the SAME App ID and Secret for both Facebook and Instagram
   FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_APP_ID
   FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET

   # Instagram uses the SAME credentials as Facebook
   INSTAGRAM_CLIENT_ID=YOUR_FACEBOOK_APP_ID
   INSTAGRAM_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET

   # Make sure this is set
   APP_BASE_URL=https://buzzit-production.up.railway.app
   ```

   > **Important**: Replace `YOUR_FACEBOOK_APP_ID` and `YOUR_FACEBOOK_APP_SECRET` with the actual values from Step 1.

3. **Click "Deploy"** or wait for automatic deployment

### Step 7: Test the Integration

1. **Wait for Railway deployment to complete** (1-2 minutes)

2. **Test in your app**:
   - Open BuzzIt app
   - Go to **Settings → Privacy & Social**
   - Tap **"Connect"** on Facebook
   - You should see Facebook OAuth login screen
   - Log in and authorize the app
   - Should redirect back to app with success message

3. **Test Instagram**:
   - In **Settings → Privacy & Social**
   - Tap **"Connect"** on Instagram
   - You should see Facebook OAuth login screen (this is correct!)
   - Log in and authorize
   - App will detect your Instagram Business account
   - Should show as connected

---

## 🔍 Troubleshooting

### Error: "OAuth is not configured on the server"

**Cause**: Environment variables not set in Railway

**Solution**:
1. Check Railway Variables tab
2. Verify `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` are set
3. Verify `INSTAGRAM_CLIENT_ID` and `INSTAGRAM_CLIENT_SECRET` are set
4. Make sure deployment completed after adding variables

### Error: "Invalid redirect URI"

**Cause**: Redirect URI not configured in Facebook App settings

**Solution**:
1. Go to Facebook App → Products → Facebook Login → Settings
2. Add all redirect URIs from Step 2 above
3. Make sure you clicked "Save Changes"
4. Wait a few minutes for changes to propagate

### Error: "Instagram Business Account not found"

**Cause**: Instagram account is not a Business account or not linked to Facebook Page

**Solution**:
1. Convert Instagram to Business Account (see Step 5)
2. Link Instagram Business Account to Facebook Page
3. Try connecting again

### Error: "Permission denied"

**Cause**: Required permissions not granted during OAuth flow

**Solution**:
1. Disconnect the account in Settings
2. Try connecting again
3. Make sure you click "Continue" on all permission screens
4. Don't skip any permissions

### Facebook Login Shows Instagram Scopes

**This is normal!** Instagram uses Facebook OAuth, so you'll see Facebook's login screen even when connecting Instagram. The app will automatically detect your Instagram Business account after you authorize.

### Testing in Development Mode

Your Facebook App is in "Development Mode" by default. This means:
- ✅ You and your team can test all features
- ✅ All permissions work without review
- ❌ Other users cannot use the app

To allow all users:
1. Go to App Review → Requests
2. Request permissions for production use
3. Submit your app for review
4. Once approved, switch to "Live Mode"

---

## 📋 Environment Variable Checklist

Before testing, verify these are set in Railway:

- [ ] `FACEBOOK_CLIENT_ID` - Your Facebook App ID
- [ ] `FACEBOOK_CLIENT_SECRET` - Your Facebook App Secret
- [ ] `INSTAGRAM_CLIENT_ID` - Same as Facebook App ID
- [ ] `INSTAGRAM_CLIENT_SECRET` - Same as Facebook App Secret
- [ ] `APP_BASE_URL` - https://buzzit-production.up.railway.app
- [ ] `JWT_SECRET` - Your JWT secret key

---

## 🎯 Quick Start Checklist

- [ ] Created Facebook App
- [ ] Copied App ID and App Secret
- [ ] Added Facebook Login product
- [ ] Added Instagram Graph API product
- [ ] Configured OAuth redirect URIs
- [ ] Requested app permissions
- [ ] Converted Instagram to Business account
- [ ] Linked Instagram to Facebook Page
- [ ] Added environment variables to Railway
- [ ] Waited for Railway deployment
- [ ] Tested Facebook connection in app
- [ ] Tested Instagram connection in app

---

## 📚 Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)

---

## ⚠️ Important Notes

1. **Instagram uses Facebook OAuth** - This is the correct setup. Instagram Business accounts are managed through the Facebook Graph API.

2. **Same credentials for both** - Facebook and Instagram should use the SAME App ID and Secret in your Railway environment variables.

3. **Business accounts only** - Instagram content publishing only works with Instagram Business or Creator accounts linked to Facebook Pages.

4. **Development vs Live Mode** - Your app must be in Live Mode and approved for production use by other users.

5. **Token expiration** - Access tokens expire after 60 days. The app handles token refresh automatically.

---

## 🆘 Need Help?

If you're still having issues:

1. Check Railway logs for specific error messages
2. Verify all redirect URIs are correctly configured
3. Make sure Instagram is properly linked to Facebook Page
4. Ensure Facebook App is not restricted or disabled
5. Check that all required permissions are granted

The setup is now complete and should work correctly!
