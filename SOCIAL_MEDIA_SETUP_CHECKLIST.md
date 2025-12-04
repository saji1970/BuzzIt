# Social Media Integration - Quick Setup Checklist

## Step 1: Install Dependencies ✅
Run the setup script or install manually:

**Option A: Using the setup script**
```bash
setup-social-media.bat
```

**Option B: Manual installation**
```bash
cd server
npm install axios
```

## Step 2: Configure OAuth Credentials 🔑

### 2.1 Register Facebook App
- [ ] Go to https://developers.facebook.com/apps
- [ ] Click "Create App" → "Consumer"
- [ ] Add "Facebook Login" product
- [ ] In Settings → Basic: Copy App ID and App Secret
- [ ] In Facebook Login → Settings, add redirect URI:
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
  ```
- [ ] Request permissions: `email`, `public_profile`, `publish_to_groups`

### 2.2 Register Instagram App
- [ ] Instagram uses the same Facebook app
- [ ] In Facebook app, add "Instagram Basic Display" product
- [ ] Add redirect URI:
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
  ```
- [ ] Get App ID and App Secret (usually same as Facebook)

### 2.3 Register Snapchat App
- [ ] Go to https://kit.snapchat.com/
- [ ] Create a new app
- [ ] Go to OAuth2 settings
- [ ] Add redirect URI:
  ```
  https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
  ```
- [ ] Copy Client ID and Client Secret

### 2.4 Update server/.env file
```env
# Add these to your server/.env file:
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_secret_here

INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_secret_here

SNAPCHAT_CLIENT_ID=your_snapchat_client_id_here
SNAPCHAT_CLIENT_SECRET=your_snapchat_secret_here

APP_BASE_URL=https://buzzit-production.up.railway.app
```

## Step 3: Add Navigation Route 🗺️

In your `App.tsx` or navigation configuration file:

```typescript
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';

// Add to your Stack.Navigator:
<Stack.Screen
  name="PrivacySettings"
  component={PrivacySettingsScreen}
  options={{ headerShown: false }}
/>
```

## Step 4: Test the Integration ✨

### 4.1 Test Privacy Settings
- [ ] Open the app
- [ ] Go to Settings → Privacy & Social
- [ ] Toggle privacy settings (they should save automatically)
- [ ] Verify changes persist after app restart

### 4.2 Test Social Media Connection
- [ ] In Privacy & Social, tap "Connect" on Facebook
- [ ] You should see an alert explaining OAuth
- [ ] For full testing, implement OAuth redirect handling
- [ ] Verify connected accounts show "Connected" status

### 4.3 Test Buzz Sharing
- [ ] Create or view a buzz
- [ ] Tap the Share button
- [ ] Modal should show:
  - All platforms (Facebook, Instagram, Snapchat)
  - Connection status for each
  - "Connect" button for unconnected platforms
  - "Share to All Connected" button if any are connected
- [ ] Try sharing to a connected platform
- [ ] Verify success message appears

## Step 5: Deploy to Production 🚀

### Update Railway Environment Variables
- [ ] Go to Railway dashboard
- [ ] Select your Backend service
- [ ] Go to Variables tab
- [ ] Add all OAuth credentials:
  - `FACEBOOK_CLIENT_ID`
  - `FACEBOOK_CLIENT_SECRET`
  - `INSTAGRAM_CLIENT_ID`
  - `INSTAGRAM_CLIENT_SECRET`
  - `SNAPCHAT_CLIENT_ID`
  - `SNAPCHAT_CLIENT_SECRET`
  - `APP_BASE_URL` (should be your Railway URL)

### Redeploy
- [ ] Commit and push changes to GitHub
- [ ] Railway will auto-deploy
- [ ] Verify deployment succeeded
- [ ] Test OAuth flow on production

## Common Issues & Solutions 🔧

### "OAuth is not configured" error
- Make sure all OAuth credentials are in .env file (server)
- Restart the server after adding credentials

### OAuth redirect fails
- Verify redirect URIs match exactly in OAuth app settings
- Check that APP_BASE_URL is set correctly
- Ensure URLs end with `/callback` in OAuth app settings

### "Failed to share" error
- Check that user has connected the account first
- Verify tokens haven't expired
- For Instagram: Ensure buzz has media (image/video)

### Privacy settings not saving
- Check server logs for errors
- Verify user is authenticated
- Confirm database connection is working

## Files You Modified 📝

The following files were created or updated:

**Created:**
- ✅ `server/routes/socialAuthRoutes.js`
- ✅ `server/routes/socialShareRoutes.js`
- ✅ `src/screens/PrivacySettingsScreen.tsx`
- ✅ `SOCIAL_MEDIA_INTEGRATION.md`
- ✅ `setup-social-media.bat`
- ✅ This checklist file

**Modified:**
- ✅ `server/models/User.js` - Added privacySettings
- ✅ `server/models/SocialAccount.js` - Enhanced OAuth fields
- ✅ `server/index.js` - Mounted new routes
- ✅ `server/.env.example` - Added OAuth config
- ✅ `src/services/APIService.ts` - Added social media API methods
- ✅ `src/screens/SettingsScreen.tsx` - Cleaned up UI
- ✅ `src/components/SocialMediaShareModal.tsx` - API integration
- ✅ `src/components/BuzzCard.tsx` - Added buzzId prop

## Need Help? 💡

Check the detailed documentation in `SOCIAL_MEDIA_INTEGRATION.md` for:
- Detailed API documentation
- Security considerations
- Platform-specific limitations
- Troubleshooting guide

---

**Current Status**: Implementation Complete ✅
**Next Step**: Configure OAuth credentials and add navigation route
