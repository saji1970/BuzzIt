# Social Media Integration - Implementation Summary

## Overview
I've implemented a complete social media integration system that allows users to:
1. Connect their Instagram, Facebook, and Snapchat accounts via OAuth
2. Control privacy settings for their profile information
3. Share buzz posts directly to their connected social media accounts

## What Was Implemented

### 1. Database Updates

#### User Model (`server/models/User.js`)
- Added `privacySettings` object with the following fields:
  - `shareEmail`: Control if email is visible to others (default: false)
  - `shareMobileNumber`: Control if mobile number is visible (default: false)
  - `shareLocation`: Control if location is visible (default: false)
  - `shareBio`: Control if bio is visible (default: true)
  - `shareInterests`: Control if interests are visible (default: true)

#### SocialAccount Model (`server/models/SocialAccount.js`)
- Enhanced with additional fields:
  - `refreshToken`: Store OAuth refresh token
  - `expiresAt`: Token expiration date
  - `profileId`: Social media profile ID
  - `profileUrl`: Link to social media profile
  - `profilePicture`: Profile picture URL
  - `isConnected`: Connection status

### 2. Backend API Routes

#### OAuth Routes (`server/routes/socialAuthRoutes.js`)
- `GET /api/social-auth/oauth/:platform/url` - Get OAuth authorization URL
- `GET /api/social-auth/oauth/:platform/callback` - Handle OAuth callback
- `GET /api/social-auth/connected` - Get user's connected accounts
- `DELETE /api/social-auth/:platform` - Disconnect a social account

#### Share Routes (`server/routes/socialShareRoutes.js`)
- `POST /api/social-share/buzz/:buzzId/share` - Share buzz to social media platforms
- `GET /api/social-share/buzz/:buzzId/preview` - Preview what will be shared

### 3. Frontend Components

#### PrivacySettingsScreen (`src/screens/PrivacySettingsScreen.tsx`)
New screen that allows users to:
- Toggle privacy settings for each field
- View connected social media accounts
- Connect/disconnect social accounts
- See connection status with username

#### Updated SocialMediaShareModal (`src/components/SocialMediaShareModal.tsx`)
- Now uses real API instead of local storage
- Shows connected accounts from server
- Allows sharing to individual platforms or all at once
- Displays loading and sharing states
- Provides feedback on success/failure

#### Updated SettingsScreen (`src/screens/SettingsScreen.tsx`)
- Removed non-working static items:
  - Notifications
  - Language
  - Storage
  - Help & Support
  - About
- Added "Privacy & Social" menu item
- Cleaner, more focused UI

#### Updated APIService (`src/services/APIService.ts`)
- Added `getSocialAuthUrl(platform)` method
- Added `getConnectedSocialAccounts()` method
- Added `disconnectSocialAccount(platform)` method
- Added `shareBuzzToSocial(buzzId, platforms)` method
- Added `getSharePreview(buzzId, platform)` method
- Updated User interface to include `privacySettings`

### 4. Server Integration (`server/index.js`)
- Imported and mounted new routes:
  - `/api/social-auth` for OAuth operations
  - `/api/social-share` for sharing functionality

## Next Steps to Complete Setup

### 1. Install Required Dependencies

The OAuth integration requires the `axios` package:

```bash
cd server
npm install axios
```

### 2. Configure OAuth Credentials

Create a `.env` file in the `server` directory with your OAuth credentials:

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Instagram OAuth (uses Facebook Graph API)
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

# Snapchat OAuth
SNAPCHAT_CLIENT_ID=your_snapchat_client_id
SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret

# App Base URL (for OAuth redirects)
APP_BASE_URL=https://buzzit-production.up.railway.app
```

### 3. Register OAuth Apps

#### Facebook
1. Go to https://developers.facebook.com/
2. Create a new app
3. Add "Facebook Login" product
4. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
5. Request permissions: `email`, `public_profile`, `publish_to_groups`

#### Instagram
1. Instagram uses Facebook's Graph API
2. Follow Facebook setup above
3. Add Instagram Basic Display product
4. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`

#### Snapchat
1. Go to https://kit.snapchat.com/
2. Create a new app
3. Add OAuth2 credentials
4. Set redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback`

### 4. Add Navigation Route

You need to add the `PrivacySettingsScreen` to your navigation stack. In your main navigation file (likely `App.tsx` or navigation config):

```typescript
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';

// Add to your stack navigator:
<Stack.Screen
  name="PrivacySettings"
  component={PrivacySettingsScreen}
  options={{ headerShown: false }}
/>
```

### 5. Database Migration (if using PostgreSQL)

If you're using PostgreSQL, you'll need to run migrations to add the new fields to the `users` table:

```sql
-- Add privacy settings column
ALTER TABLE users
ADD COLUMN privacy_settings JSONB DEFAULT '{
  "shareEmail": false,
  "shareMobileNumber": false,
  "shareLocation": false,
  "shareBio": true,
  "shareInterests": true
}'::jsonb;

-- Ensure social_accounts table exists with new fields
-- (Schema should already be defined in the models)
```

## How Users Will Use the Feature

### Connecting Social Media Accounts

1. User goes to **Settings** > **Privacy & Social**
2. Taps on a platform (Facebook, Instagram, or Snapchat)
3. Clicks "Connect"
4. Is redirected to OAuth authorization page
5. Authorizes the app
6. Is redirected back and sees "Connected" status

### Adjusting Privacy Settings

1. User goes to **Settings** > **Privacy & Social**
2. Toggles each privacy setting:
   - Share Email
   - Share Mobile Number
   - Share Location
   - Share Bio
   - Share Interests
3. Settings are saved automatically

### Sharing a Buzz

1. User creates or views a buzz
2. Taps the **Share** button
3. Modal opens showing all platforms
4. User can either:
   - Tap individual platform to share there
   - Tap "Share to All Connected" to share everywhere
5. Receives confirmation on success

## API Testing

Test the endpoints using curl or Postman:

```bash
# Get OAuth URL
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/social-auth/oauth/facebook/url

# Get connected accounts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/social-auth/connected

# Share a buzz
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platforms": ["facebook", "instagram"]}' \
  http://localhost:3000/api/social-share/buzz/BUZZ_ID/share
```

## Important Notes

### Security Considerations
- OAuth tokens are stored securely in the database
- Tokens are never sent to the client (except during OAuth flow)
- Privacy settings are enforced on the backend
- All social media endpoints require authentication

### Platform Limitations
- **Instagram**: Requires media (image/video) to post - text-only posts are not supported
- **Snapchat**: API has limited availability and requires special approval
- **Facebook**: Posts go to user's timeline (not pages/groups by default)

### Error Handling
- Users are notified if OAuth credentials are not configured
- Connection errors are caught and displayed to the user
- Failed shares show which platforms succeeded/failed

## Testing Checklist

- [ ] Install axios in server directory
- [ ] Add OAuth credentials to .env file
- [ ] Add PrivacySettingsScreen to navigation
- [ ] Test OAuth connection for each platform
- [ ] Test privacy settings updates
- [ ] Test sharing to individual platforms
- [ ] Test sharing to all platforms at once
- [ ] Test disconnecting accounts
- [ ] Verify token security
- [ ] Test error scenarios

## Files Modified/Created

### Created:
- `server/routes/socialAuthRoutes.js`
- `server/routes/socialShareRoutes.js`
- `src/screens/PrivacySettingsScreen.tsx`
- This documentation file

### Modified:
- `server/models/User.js` - Added privacySettings
- `server/models/SocialAccount.js` - Added OAuth fields
- `server/index.js` - Added route imports
- `src/services/APIService.ts` - Added social media methods
- `src/screens/SettingsScreen.tsx` - Removed static items, added Privacy & Social
- `src/components/SocialMediaShareModal.tsx` - Integrated with real API
- `src/components/BuzzCard.tsx` - Added buzzId prop to share modal

## Support

If you encounter any issues:
1. Check that all OAuth credentials are properly configured
2. Verify axios is installed in the server
3. Check server logs for detailed error messages
4. Ensure the redirect URIs match exactly in OAuth app settings
5. Test API endpoints directly before testing in the app

---

**Status**: ✅ Implementation Complete - Ready for OAuth Configuration and Testing
