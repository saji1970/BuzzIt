# 🔗 Social Media OAuth Integration Setup Guide

## Problem
Getting error: "Failed to get facebook auth URL: Invalid r..." when trying to connect social media accounts.

## Root Cause
The social media OAuth integration requires:
1. Developer accounts on each platform (Facebook, Instagram, Snapchat)
2. OAuth app credentials configured on each platform
3. Environment variables set in Railway
4. Redirect URIs whitelisted in each platform's settings

Currently, these are not configured, so the OAuth flow fails.

---

## Quick Fix: Disable Social Media Integration (Temporary)

If you don't need social media integration right now, you can hide the buttons temporarily:

### Option 1: Hide Social Media Section
In `src/screens/PrivacySettingsScreen.tsx`, comment out or remove the social media integration section.

### Option 2: Show "Coming Soon" Message
Replace the Connect buttons with a "Coming Soon" message.

---

## Full Setup: Enable Social Media Integration

This process takes 30-60 minutes per platform. You'll need to create developer accounts and configure OAuth apps.

### Prerequisites
- Railway account with BuzzIt backend deployed
- Developer accounts on social platforms
- Basic understanding of OAuth 2.0 flow

---

## 1. Facebook/Instagram OAuth Setup

Facebook and Instagram OAuth both use Facebook's developer platform.

### Step 1.1: Create Facebook App

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Consumer" or "Business" (Consumer recommended)
4. Fill in:
   - **App Name**: BuzzIt
   - **App Contact Email**: your email
   - Click "Create App"

### Step 1.2: Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** → Click **Set Up**
3. Select **Web** platform
4. Enter Site URL: `https://buzzit-production.up.railway.app`
5. Save

### Step 1.3: Configure OAuth Redirect URIs

1. Go to **Facebook Login → Settings** (left sidebar)
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   ```
3. Click **Save Changes**

### Step 1.4: Get App Credentials

1. Go to **Settings → Basic** (left sidebar)
2. Copy:
   - **App ID** (this is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (click Show, this is your `FACEBOOK_CLIENT_SECRET`)

### Step 1.5: Make App Live

1. In the top navigation, your app is in "Development" mode
2. Click the toggle to switch to "Live" mode
3. You may need to provide privacy policy and terms URLs:
   - Privacy Policy: `https://buzzit-production.up.railway.app/privacy`
   - Terms of Service: `https://buzzit-production.up.railway.app/terms`

### Step 1.6: Instagram Setup (Optional)

If you also want Instagram integration:
1. In your Facebook app, go to **Add Product**
2. Find **Instagram Basic Display** → Click **Set Up**
3. Create an Instagram App ID
4. Copy the **Instagram App ID** and **App Secret**

---

## 2. Snapchat OAuth Setup

### Step 2.1: Create Snapchat App

1. Go to [Snapchat for Developers](https://kit.snapchat.com/)
2. Click "Get Started" → Sign up/Sign in
3. Click "Create App"
4. Fill in:
   - **App Name**: BuzzIt
   - **Description**: Social media sharing app
   - Click "Create App"

### Step 2.2: Configure OAuth

1. In your app dashboard, go to **OAuth**
2. Under **Redirect URIs**, add:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
   ```
3. Save

### Step 2.3: Get Credentials

1. In the app dashboard, find:
   - **OAuth Client ID** (this is your `SNAPCHAT_CLIENT_ID`)
   - **OAuth Client Secret** (this is your `SNAPCHAT_CLIENT_SECRET`)

---

## 3. Configure Railway Environment Variables

Once you have all credentials, add them to Railway:

1. Go to Railway Dashboard → Backend Service → **Variables**
2. Add the following environment variables:

```bash
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here

# Instagram OAuth (uses Facebook Graph API)
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here

# Snapchat OAuth
SNAPCHAT_CLIENT_ID=your_snapchat_client_id_here
SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret_here

# Make sure this is set correctly
APP_BASE_URL=https://buzzit-production.up.railway.app
```

3. Click "Deploy" or wait for automatic redeployment

---

## 4. Testing OAuth Integration

### Step 4.1: Verify Server Configuration

1. Check Railway logs after deployment:
   ```
   ✅ Social media routes loaded
   ```

2. Test the OAuth URL endpoint:
   - Open: `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url`
   - You should get an auth URL (requires authentication token)

### Step 4.2: Test in App

1. Open BuzzIt app
2. Go to **Settings → Privacy & Social**
3. Click **Connect** next to Facebook
4. You should be redirected to Facebook login
5. After authorizing, you'll be redirected back to the app
6. Facebook should show as "Connected"

---

## 5. Troubleshooting

### Error: "Failed to get facebook auth URL: Invalid r..."

**Cause:** OAuth credentials not configured or redirect URI mismatch

**Fix:**
1. Verify environment variables are set in Railway
2. Check redirect URI in Facebook app matches exactly:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   ```
3. Ensure Facebook app is in "Live" mode, not "Development"

### Error: "OAuth failed" or "missing_code"

**Cause:** User denied authorization or OAuth callback failed

**Fix:**
1. Try connecting again and click "Allow" on the permission screen
2. Check Railway logs for detailed error messages

### Error: "Invalid client_id"

**Cause:** Wrong credentials in environment variables

**Fix:**
1. Double-check `FACEBOOK_CLIENT_ID` matches your Facebook App ID
2. Redeploy Railway service after updating variables

### Error: "Redirect URI mismatch"

**Cause:** Redirect URI not whitelisted in platform settings

**Fix:**
1. Go to Facebook/Snapchat developer console
2. Add the exact redirect URI:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/[platform]/callback
   ```
3. Save and try again

---

## 6. Alternative: Disable Social Media Integration

If you don't want to set this up now, you can disable the feature:

### Method 1: Hide from UI

Edit `src/screens/PrivacySettingsScreen.tsx`:

Find the "Social Media Integration" section and wrap it in a conditional:

```typescript
{false && ( // Set to false to hide
  <View>
    <Text>Social Media Integration</Text>
    {/* ... rest of social media section */}
  </View>
)}
```

### Method 2: Show Coming Soon

Replace the social media section with:

```typescript
<View style={styles.comingSoon}>
  <Icon name="construction" size={48} color={theme.colors.textSecondary} />
  <Text style={styles.comingSoonText}>
    Social Media Integration Coming Soon!
  </Text>
</View>
```

---

## Summary

**To enable social media integration:**
1. ✅ Create developer apps on each platform
2. ✅ Configure OAuth redirect URIs
3. ✅ Add credentials to Railway environment variables
4. ✅ Test in the app

**If you skip this:**
- Social media connect buttons will show errors
- You can hide them or show "Coming Soon" message
- Other app features work normally

---

## Environment Variables Reference

| Variable | Required | Where to Get It |
|----------|----------|----------------|
| `FACEBOOK_CLIENT_ID` | No | Facebook for Developers → App ID |
| `FACEBOOK_CLIENT_SECRET` | No | Facebook for Developers → App Secret |
| `INSTAGRAM_CLIENT_ID` | No | Facebook for Developers → Instagram App ID |
| `INSTAGRAM_CLIENT_SECRET` | No | Facebook for Developers → Instagram App Secret |
| `SNAPCHAT_CLIENT_ID` | No | Snapchat for Developers → OAuth Client ID |
| `SNAPCHAT_CLIENT_SECRET` | No | Snapchat for Developers → OAuth Client Secret |
| `APP_BASE_URL` | Yes | Your Railway backend URL |

---

**Note:** Social media OAuth is optional. The core app functionality (buzzes, streaming, channels) works without it!
