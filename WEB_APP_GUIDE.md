# BuzzIt Web App - Create Buzz & Social Media Integration

## Overview
The BuzzIt web app now includes two new pages for creating buzzes and managing social media integrations:

1. **create-buzz.html** - Create buzzes with full feature parity to the mobile app
2. **social-settings.html** - Connect and manage Facebook, Instagram, Snapchat, and Twitter accounts

## Access URLs

### Production (Railway)
- Create Buzz: `https://buzzit-production.up.railway.app/create-buzz.html`
- Social Settings: `https://buzzit-production.up.railway.app/social-settings.html`
- User Login: `https://buzzit-production.up.railway.app/user-login.html`

### Local Development
- Create Buzz: `http://localhost:3000/create-buzz.html`
- Social Settings: `http://localhost:3000/social-settings.html`

## Features

### Create Buzz Page (`create-buzz.html`)

#### Buzz Types
- **💬 Gossip** - Share news, rumors, or general updates
- **💭 Just a Thought** - Share your thoughts and ideas
- **📅 Event** - Create event announcements with date and location
- **📊 Poll** - Create polls with multiple options (2-10 options)

#### Core Features
1. **Content Editor**
   - 500 character limit with real-time counter
   - Visual feedback (orange at 450+, red at 500)

2. **Interests Selector**
   - 13 predefined interests to choose from
   - At least 1 interest required
   - Multi-select with visual feedback

3. **Media Upload**
   - Supports images and videos
   - Max file size: 50MB
   - Drag-and-drop or click to upload
   - Real-time upload progress
   - Cloudinary integration
   - Preview before posting

4. **Event-Specific Features** (when Event buzz type is selected)
   - Date & time picker
   - Location search using Nominatim API
   - "Use My Location" button (browser geolocation)
   - Selected location display

5. **Poll-Specific Features** (when Poll buzz type is selected)
   - Add/remove poll options (2-10 options)
   - Dynamic option management

6. **Social Media Sharing**
   - Automatically publish to connected platforms
   - Select one or multiple platforms
   - Facebook, Instagram, Snapchat, Twitter support
   - Link to social settings if not connected

#### Workflow
1. Select buzz type
2. Enter content (required)
3. Select at least 1 interest (required)
4. (Optional) Add event date/location or poll options
5. (Optional) Upload media
6. (Optional) Select social platforms to share to
7. Click "Create Buzz 🚀"

### Social Media Settings Page (`social-settings.html`)

#### Features
- View all 4 social platforms (Facebook, Instagram, Snapchat, Twitter)
- Connection status for each platform
- One-click OAuth connection flow
- Disconnect accounts
- View account details:
  - Username
  - Connection date
  - Number of posts published

#### OAuth Flow
1. Click "Connect [Platform]"
2. Redirected to platform's authorization page
3. Authorize BuzzIt app
4. Automatically redirected back to social-settings.html
5. Account connected and displayed

#### Platform-Specific Notes

**Facebook**
- Posts to user's timeline
- Supports text, images, and videos
- Scope: `public_profile`

**Instagram**
- Requires Facebook Pages connection
- Requires media (images or videos)
- Text-only posts not supported
- Scope: `instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`

**Snapchat**
- Posts to Snapchat stories
- Requires media (images or videos)
- Scope: `display_name,bitmoji.avatar`

**Twitter**
- Posts to Twitter feed
- Supports text with optional media
- Scope: `tweet.read tweet.write users.read offline.access`

## Authentication

### Requirements
- Must be logged in through `user-login.html`
- JWT token stored in localStorage
- Automatic redirect to login if not authenticated

### Token Management
- Token stored as `authToken` in localStorage
- User data stored as `user` in localStorage
- Automatic token injection in all API calls
- Auto-redirect to login on 401 responses

## API Endpoints Used

### Buzz Creation
```
POST /api/uploads
- Upload media to Cloudinary
- Headers: Authorization: Bearer <token>
- Body: FormData with file
- Response: { success, data: { url, mimeType, ... } }

POST /api/buzzes
- Create buzz
- Headers: Authorization: Bearer <token>
- Body: { content, buzzType, interests, media?, location?, eventDate?, pollOptions? }
- Response: { success, data: <Buzz object> }
```

### Social Media
```
GET /api/social-auth/connected
- Get connected social accounts
- Headers: Authorization: Bearer <token>
- Response: { success, accounts: [...] }

GET /api/social-auth/oauth/{platform}/url
- Get OAuth authorization URL
- Headers: Authorization: Bearer <token>
- Response: { success, authUrl }

POST /api/social-auth/oauth/{platform}/callback
- Handle OAuth callback
- Headers: Authorization: Bearer <token>
- Body: { code }
- Response: { success, account }

DELETE /api/social-auth/{platform}
- Disconnect account
- Headers: Authorization: Bearer <token>
- Response: { success, message }

POST /api/social-share/{platform}/publish
- Publish to social platform
- Headers: Authorization: Bearer <token>
- Body: { content, mediaUrl?, mediaType? }
- Response: { success, postId }
```

## Testing Guide

### Test Create Buzz
1. Login at `user-login.html`
2. Navigate to `create-buzz.html`
3. Test each buzz type:
   - Create a Gossip buzz with text only
   - Create a Thought buzz with an image
   - Create an Event buzz with date and location
   - Create a Poll buzz with 3 options
4. Test interests selection (minimum 1 required)
5. Test media upload (both image and video)
6. Test character counter (approach 500 limit)
7. Test social media sharing (if connected)

### Test Social Settings
1. Login at `user-login.html`
2. Navigate to `social-settings.html`
3. Test connecting Facebook:
   - Click "Connect Facebook"
   - Authorize on Facebook
   - Verify successful connection
4. Test disconnecting Facebook:
   - Click "Disconnect Facebook"
   - Confirm disconnect
   - Verify account removed
5. Repeat for Instagram, Snapchat, Twitter

### Test End-to-End
1. Connect all social platforms in `social-settings.html`
2. Go to `create-buzz.html`
3. Create a buzz with:
   - Type: Gossip
   - Content: "Testing BuzzIt web integration!"
   - Interest: Technology
   - Media: Upload an image
   - Social: Select all connected platforms
4. Submit buzz
5. Verify:
   - Buzz created in database
   - Posts appear on all selected social platforms
   - Success message displayed

## Troubleshooting

### Media Upload Fails
- Check file size (must be < 50MB)
- Check file type (images and videos only)
- Verify Cloudinary credentials in server `.env`

### OAuth Connection Fails
- Verify OAuth credentials in server `.env`:
  - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
  - `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`
  - `SNAPCHAT_CLIENT_ID`, `SNAPCHAT_CLIENT_SECRET`
  - `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
- Check OAuth redirect URLs match in platform settings
- Verify `APP_BASE_URL` in `.env`

### Social Publishing Fails
- Ensure account is connected and not expired
- Instagram requires media (images/videos)
- Snapchat requires media
- Check platform-specific character limits:
  - Facebook: 5000 chars
  - Instagram: 2200 chars
  - Snapchat: 250 chars
  - Twitter: 280 chars

### Login Issues
- Clear localStorage and login again
- Verify JWT_SECRET in server `.env`
- Check database connection

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

## Future Enhancements
1. Buzz feed/timeline view
2. User profile management
3. Edit/delete buzzes
4. Comment and like functionality
5. Real-time notifications
6. Progressive Web App (PWA) support
7. Dark mode
8. Buzz scheduling
9. Analytics dashboard

## Support
For issues or questions, please report at:
https://github.com/anthropics/buzzit/issues
