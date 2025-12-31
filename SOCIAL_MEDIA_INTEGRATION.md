# Social Media Integration Module

## Overview

Complete social media integration module that allows users to connect Facebook, Instagram, and Snapchat accounts via OAuth and automatically publish buzzes to selected platforms.

## Features

### ✅ Implemented Features

1. **OAuth Connection**
   - Connect Facebook, Instagram, and Snapchat from Settings
   - Official OAuth flows for each platform
   - Token refresh and expiration handling
   - Connection status indicators

2. **Platform Selection in Create Buzz**
   - Visual platform selector with connection status
   - Real-time validation (content length, media requirements)
   - Multi-platform selection
   - Clear error messages

3. **Automatic Publishing**
   - Publishes to selected platforms when buzz is created
   - Handles media uploads per platform
   - Platform-specific validation
   - Error reporting per platform

4. **Token Management**
   - Automatic token refresh
   - Expiration detection
   - Reconnection prompts
   - Status indicators (connected, expired, error)

5. **Error Handling**
   - User-friendly error messages
   - Platform-specific error handling
   - Rate limit detection
   - Permission error handling
   - Network error handling

## Architecture

### Components

1. **PrivacySettingsScreen** (`src/screens/PrivacySettingsScreen.tsx`)
   - Social account connection UI
   - Connection status display
   - Connect/Disconnect/Reconnect actions

2. **SocialPlatformSelector** (`src/components/SocialPlatformSelector.tsx`)
   - Platform selection UI for Create Buzz
   - Real-time validation
   - Connection status indicators

3. **SocialMediaService** (`src/services/SocialMediaService.ts`)
   - OAuth flow management
   - Token refresh logic
   - Publishing logic
   - Platform validation

4. **APIService** (`src/services/APIService.ts`)
   - Backend API calls
   - OAuth callback handling
   - Publishing endpoints

### Deep Linking

- **URL Scheme**: `com.buzzit.app://oauth/callback/:platform`
- **HTTPS**: `https://buzzit-production.up.railway.app/oauth/callback/:platform`
- Handles OAuth redirects automatically

## Platform Requirements

### Facebook
- **Content**: Max 5,000 characters
- **Images**: Max 4MB (JPG, PNG, GIF)
- **Videos**: Max 1GB (MP4, MOV)
- **Permissions**: `pages_manage_posts`, `pages_read_engagement`

### Instagram
- **Content**: Max 2,200 characters
- **Images**: Max 8MB (JPG, PNG)
- **Videos**: Max 100MB (MP4)
- **Aspect Ratios**: 1:1, 4:5, 16:9
- **Permissions**: `instagram_basic`, `instagram_content_publish`

### Snapchat
- **Content**: Max 250 characters
- **Images**: Max 10MB (JPG, PNG)
- **Videos**: Max 50MB (MP4)
- **Permissions**: `snapchat.ads.management`

## Usage

### Connecting Accounts

1. Navigate to **Settings** → **Privacy & Social**
2. Tap **Connect** on desired platform
3. Complete OAuth flow in browser
4. App automatically handles callback

### Publishing Buzzes

1. Create a buzz in **Create** screen
2. Select platforms in **Publish to Social Media** section
3. Tap **Create Buzz**
4. App automatically publishes to selected platforms

### Reconnecting Expired Accounts

1. Go to **Settings** → **Privacy & Social**
2. Tap **Reconnect** on expired platform
3. Complete OAuth flow again

## API Endpoints

### Backend Endpoints (Required)

```
GET  /api/social-auth/oauth/:platform/url
     - Get OAuth authorization URL

POST /api/social-auth/oauth/:platform/callback
     - Exchange authorization code for tokens
     - Body: { code, state }

GET  /api/social-auth/connected
     - Get all connected accounts

DELETE /api/social-auth/:platform
     - Disconnect platform

POST /api/social-auth/:platform/refresh-token
     - Refresh access token

POST /api/social-share/:platform/publish
     - Publish content to platform
     - Body: { content, mediaUrl?, mediaType? }
```

## Error Handling

### Token Errors
- **Expired**: Automatically attempts refresh
- **Invalid**: Prompts user to reconnect
- **Missing**: Shows connection prompt

### Publishing Errors
- **Rate Limit**: Shows user-friendly message
- **Permission**: Prompts to reconnect with permissions
- **Media Validation**: Shows platform-specific requirements
- **Network**: Retry prompt with clear message

### OAuth Errors
- **User Cancelled**: Silent failure
- **Access Denied**: Clear error message
- **Network Error**: Retry prompt

## Platform-Specific Notes

### Facebook
- Requires Facebook Page (not personal profile)
- Uses Facebook Graph API
- Long-lived tokens (60 days)
- Auto-refresh supported

### Instagram
- Requires Instagram Business Account
- Uses Instagram Graph API
- Media container creation required
- Publishing can take 1-2 minutes

### Snapchat
- Requires Snapchat Ads Manager account
- Uses Snapchat Marketing API
- Media must be uploaded first
- Supports stories and ads

## Testing

### Test OAuth Flow
1. Connect account in Settings
2. Verify callback URL handling
3. Check token storage
4. Verify connection status

### Test Publishing
1. Create buzz with media
2. Select platforms
3. Verify publishing results
4. Check error handling

## Troubleshooting

### OAuth Callback Not Working
- Check deep linking configuration
- Verify URL scheme in AndroidManifest
- Check iOS Info.plist URL schemes
- Ensure backend callback URL matches

### Publishing Fails
- Check token expiration
- Verify platform permissions
- Check media requirements
- Review API rate limits

### Token Refresh Fails
- Check refresh token validity
- Verify backend refresh endpoint
- Check network connectivity
- Review platform API status

## Security Considerations

1. **Token Storage**: Tokens stored securely on backend
2. **HTTPS Only**: All API calls use HTTPS
3. **Token Refresh**: Automatic refresh before expiration
4. **Permission Scopes**: Minimal required permissions
5. **Error Messages**: No sensitive data in error messages

## Future Enhancements

- [ ] Scheduled publishing
- [ ] Post analytics
- [ ] Multi-account support per platform
- [ ] Draft management
- [ ] Publishing queue
- [ ] Content templates
