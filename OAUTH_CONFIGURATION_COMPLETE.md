# OAuth Configuration Complete ✅

## What Was Configured

### 1. Facebook & Instagram OAuth ✅
Your Facebook credentials have been configured in `server/.env`:

```
FACEBOOK_CLIENT_ID=2700884196937447
FACEBOOK_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131

INSTAGRAM_CLIENT_ID=2700884196937447
INSTAGRAM_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131
```

**Note**: Instagram uses the same Facebook app credentials since Instagram OAuth uses Facebook's Graph API.

### 2. Dependencies Installed ✅
- ✅ `axios` package installed in server

### 3. Navigation Route Added ✅
- ✅ `PrivacySettingsScreen` imported in `App.tsx`
- ✅ Route added to Stack Navigator

## Facebook App Configuration Required

To complete the setup, you need to configure your Facebook app at https://developers.facebook.com/apps/2700884196937447/

### Required Steps in Facebook Developer Console:

1. **Add OAuth Redirect URIs**

   Go to: Settings → Basic → Add Platform → Website

   Add these redirect URIs:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
   ```

2. **Configure Facebook Login Product**

   Go to: Products → Facebook Login → Settings

   Add to "Valid OAuth Redirect URIs":
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   ```

3. **Request Required Permissions**

   Your app needs these permissions:
   - ✅ `email` (Basic)
   - ✅ `public_profile` (Basic)
   - ⚠️ `publish_to_groups` (Requires review)
   - ⚠️ `pages_manage_posts` (Optional, for posting to pages)

   **Note**: Some permissions require Facebook app review before they can be used in production.

4. **Add Instagram Basic Display (for Instagram integration)**

   Go to: Products → Add Product → Instagram Basic Display

   Configure:
   - Valid OAuth Redirect URIs: `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`
   - Deauthorize Callback URL: `https://buzzit-production.up.railway.app/api/social-auth/deauth`
   - Data Deletion Request URL: `https://buzzit-production.up.railway.app/api/social-auth/delete`

5. **Set App to Live Mode**

   Currently your app is in Development mode. To allow any user to authenticate:
   - Go to: Settings → Basic
   - Toggle "App Mode" to "Live"
   - Complete app review if required

## Railway Environment Variables

Add these to your Railway Backend service:

```bash
FACEBOOK_CLIENT_ID=2700884196937447
FACEBOOK_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131
INSTAGRAM_CLIENT_ID=2700884196937447
INSTAGRAM_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131
APP_BASE_URL=https://buzzit-production.up.railway.app
```

## Testing the Integration

### Local Testing (Development)

1. **Start the server**:
   ```bash
   cd server
   npm start
   ```

2. **Test OAuth URL endpoint**:
   ```bash
   curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     http://localhost:3000/api/social-auth/oauth/facebook/url
   ```

3. **Expected Response**:
   ```json
   {
     "success": true,
     "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?...",
     "platform": "facebook"
   }
   ```

### In-App Testing

1. Open the BuzzIt app
2. Go to **Settings** → **Privacy & Social**
3. Tap **Connect** on Facebook
4. You should see instructions about OAuth authentication

### Production Testing

Once deployed to Railway:
1. User taps "Connect" on Facebook in Privacy & Social settings
2. User is redirected to Facebook OAuth page
3. User authorizes the app
4. User is redirected back to the app with success message
5. Connected status shows in Privacy & Social screen

## Current Limitations

### Development Mode Restrictions
While your Facebook app is in Development mode:
- Only app admins, developers, and testers can authenticate
- General users will see "App Not Set Up" error
- You need to add test users in Facebook Developer Console

### Instagram Posting Requirements
- Instagram API requires **media (image or video)** to post
- Text-only buzzes cannot be shared to Instagram
- The app will show a warning when trying to share text-only content to Instagram

### Snapchat
- Snapchat OAuth credentials are not yet configured
- You'll need to register a Snapchat app at https://kit.snapchat.com/
- Update `.env` with Snapchat credentials when ready

## Next Steps

1. **Complete Facebook App Configuration** (see above)
2. **Add Railway Environment Variables**
3. **Deploy to Railway**:
   ```bash
   git add .
   git commit -m "Add social media OAuth integration"
   git push
   ```
4. **Test OAuth Flow on Production**
5. **Submit for Facebook App Review** (if you need `publish_to_groups` permission)

## Security Notes

✅ **Good Practices in Place**:
- OAuth credentials stored in `.env` (not committed to git)
- Tokens never sent to client (except during OAuth flow)
- All endpoints require authentication
- Secure token storage in database

⚠️ **Important Reminders**:
- Never commit `.env` file to version control
- Keep your App Secret secure
- Rotate secrets if compromised
- Use HTTPS for all OAuth redirects (✅ already configured)

## Support

If you encounter issues:

### "App Not Set Up" Error
- Check that redirect URIs match exactly in Facebook settings
- Ensure app is in Live mode (or add yourself as a test user)

### "OAuth is not configured" Error
- Verify credentials in `.env` file
- Restart the server after updating `.env`
- Check Railway environment variables

### "Invalid redirect_uri" Error
- Verify the redirect URI in Facebook app settings
- Ensure APP_BASE_URL matches your Railway URL
- Check for trailing slashes

### Connection Successful but Can't Share
- Verify token hasn't expired
- Check that required permissions are granted
- For Instagram: Ensure buzz has media content

---

**Status**: ✅ OAuth Configured - Ready for Facebook App Setup
**Next**: Configure redirect URIs in Facebook Developer Console
