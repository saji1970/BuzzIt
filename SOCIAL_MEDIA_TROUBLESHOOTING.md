# Social Media Integration Troubleshooting Guide

This guide covers common issues with Facebook and Instagram posting and how to fix them.

---

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Connection Issues](#connection-issues)
3. [Publishing Issues](#publishing-issues)
4. [Token Issues](#token-issues)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [Error Messages Reference](#error-messages-reference)

---

## Quick Diagnostics

### Step 1: Check Health Endpoint

Visit: `https://buzzit-production.up.railway.app/api/social-auth/health`

**Expected Response:**
```json
{
  "success": true,
  "facebookConfigured": true,
  "instagramConfigured": true
}
```

**If you see `false` for any platform:**
- Environment variables are NOT set in Railway
- See `RAILWAY_ENV_VERIFICATION.md` to set them correctly

### Step 2: Check Railway Logs

1. Go to Railway Dashboard
2. Select your backend service
3. Click **"Logs"** tab
4. Look for errors containing:
   - `OAuth`
   - `social-auth`
   - `Facebook`
   - `Instagram`

### Step 3: Test OAuth URL Generation

Try to get an OAuth URL:

```bash
# Replace YOUR_AUTH_TOKEN with your actual token
curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
```

**Expected Response:**
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?...",
  "platform": "facebook"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "facebook OAuth is not configured on the server"
}
```
→ **Fix:** Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in Railway

---

## Connection Issues

### Issue: "Connect" Button Does Nothing

**Symptoms:**
- Tap "Connect" on Facebook/Instagram
- Nothing happens, no browser opens

**Possible Causes:**

1. **No Auth Token** - User not logged in
   - **Fix:** Make sure user is logged in before accessing Settings

2. **Network Error** - App can't reach server
   - **Fix:** Check internet connection
   - **Fix:** Verify `https://buzzit-production.up.railway.app` is accessible

3. **OAuth URL Endpoint Failing**
   - **Fix:** Check Railway logs for errors
   - **Fix:** Verify environment variables are set

### Issue: Browser Opens But Shows Error

**Symptoms:**
- Browser opens after tapping "Connect"
- Shows Facebook/Instagram error page

**Common Error Messages:**

#### "Invalid App ID"
```
App ID 0 does not exist or is not properly configured
```
- **Cause:** `FACEBOOK_APP_ID` or `INSTAGRAM_APP_ID` is not set
- **Fix:** Set the environment variable in Railway with your actual App ID

#### "Redirect URI Mismatch"
```
URL blocked: This redirect failed because the redirect URI is not whitelisted
```
- **Cause:** Redirect URI not configured in Facebook App settings
- **Fix:** Add these URIs to your Facebook App:
  1. Go to Facebook Developers → Your App → Settings → Basic
  2. Click "Add Platform" → Website
  3. Add redirect URIs:
     - `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
     - `https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback`

#### "App Not Approved"
```
This app is in Development Mode and you are not a developer
```
- **Cause:** Facebook app is in development mode
- **Fix Option 1:** Add your test users in Facebook App → Roles → Testers
- **Fix Option 2:** Switch app to Live mode (requires app review for some permissions)

### Issue: OAuth Callback Fails

**Symptoms:**
- User logs in successfully on Facebook/Instagram
- Redirects back to app
- Shows error or "Connection failed"

**Check Railway Logs for:**

#### "Invalid authorization code"
- **Cause:** Code expired or already used
- **Fix:** Try connecting again (codes expire in ~10 minutes)

#### "Invalid client secret"
```
Error validating client secret
```
- **Cause:** `FACEBOOK_APP_SECRET` is incorrect
- **Fix:** Go to Facebook Developers → Settings → Basic
- **Fix:** Copy the correct App Secret and update Railway variable

#### "Database error"
```
SocialAccount.findOneAndUpdate is not a function
```
- **Cause:** Database connection issue or model not loaded
- **Fix:** Check Railway logs for database connection errors
- **Fix:** Verify MongoDB/PostgreSQL is running and connected

---

## Publishing Issues

### Issue: "Failed to publish to Facebook/Instagram"

**Symptoms:**
- Buzz creates successfully
- Publishing to social media fails

**Diagnostic Steps:**

1. **Check if account is connected:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://buzzit-production.up.railway.app/api/social-auth/connected
   ```

   Should return connected accounts. If empty:
   - **Fix:** Connect your Facebook/Instagram account first

2. **Check if token is expired:**
   - Look for `expiresAt` in the response
   - If expired: **Fix:** Reconnect your account

3. **Check Railway logs** for publishing errors

### Issue: "Instagram requires media"

**Symptoms:**
```
Instagram requires media (image or video) to post. Text-only posts are not supported.
```

**Cause:** Instagram API doesn't support text-only posts

**Fix:** Always include an image or video when posting to Instagram

**Workaround:** Only select Instagram when your buzz has media attached

### Issue: "No connected account found"

**Symptoms:**
```
No connected facebook account found. Please connect your account first.
```

**Diagnostic:**
1. Go to app Settings → Privacy & Social
2. Check if Facebook shows as "Connected"
3. If not connected, tap "Connect"

**If still fails after connecting:**
- Check Railway logs for token storage errors
- Verify database is working

### Issue: "Token has expired"

**Symptoms:**
```
facebook token has expired. Please reconnect your account.
```

**Cause:** OAuth tokens expire after 60-90 days (Facebook/Instagram)

**Fix:**
1. Go to Settings → Privacy & Social
2. Tap "Reconnect" on the expired platform
3. Complete OAuth flow again

**Automatic Fix (Future):**
- Token refresh should happen automatically
- If refresh fails, manual reconnection is required

---

## Token Issues

### Issue: "Invalid token" or "No token provided"

**Symptoms:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Cause:** Your auth token is missing or invalid

**Fix:**
1. Log out and log back in to the app
2. Get a fresh auth token
3. Try the operation again

### Issue: Tokens Not Refreshing

**Symptoms:**
- Tokens expire every 60 days
- Have to manually reconnect

**Expected Behavior:** Tokens should auto-refresh

**Debug:**
1. Check Railway logs for refresh attempts
2. Look for errors in `/api/social-auth/:platform/refresh-token` endpoint

**Manual Refresh (Temporary):**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/facebook/refresh-token
```

---

## Platform-Specific Issues

### Facebook Issues

#### "Cannot post to personal profile"

**Cause:** Facebook API requires posting to a **Facebook Page**, not personal profile

**Fix:**
1. Create a Facebook Page (if you don't have one)
2. Go to Facebook Developers → Your App → Products → Facebook Login
3. Request `pages_manage_posts` permission
4. Reconnect your account

#### "Permission denied"

**Cause:** Missing required permissions

**Required Permissions:**
- `pages_manage_posts` - Required to post to pages
- `pages_read_engagement` - Required to read page data
- `public_profile` - Basic profile access
- `email` - User email (optional)

**Fix:**
1. Go to Facebook Developers → App Review
2. Request the required permissions
3. Provide use case explanation
4. Wait for approval (can take 1-7 days)

### Instagram Issues

#### "No Instagram Business Account found"

**Cause:** Instagram account is not a Business Account or not linked to Facebook Page

**Fix:**
1. Convert Instagram account to Business Account:
   - Instagram app → Settings → Account → Switch to Professional Account
   - Choose "Business"
2. Link to Facebook Page:
   - Instagram app → Settings → Account → Linked Accounts
   - Connect to your Facebook Page
3. Reconnect in BuzzIt app

#### "Instagram profile ID not found"

**Cause:** App couldn't retrieve Instagram Business Account ID

**Fix:**
1. Verify Instagram account is linked to a Facebook Page
2. Check if you have `instagram_basic` permission
3. Reconnect your account

#### "Container creation failed"

**Cause:** Media URL is not accessible or invalid format

**Requirements:**
- Image: JPG or PNG, max 8MB
- Video: MP4, max 100MB
- URL must be publicly accessible (HTTPS)
- Aspect ratio: 1:1, 4:5, or 16:9

**Fix:**
1. Verify media URL is accessible
2. Check media format and size
3. Try with a different image/video

### Snapchat Issues

#### "Snapchat sharing is not yet supported"

**Cause:** Snapchat API integration is not fully implemented

**Status:** Placeholder implementation only

**Alternative:**
- Use Facebook and Instagram for now
- Snapchat support coming in future update

---

## Error Messages Reference

### OAuth Errors

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `Invalid platform` | Platform name misspelled | Use: `facebook`, `instagram`, or `snapchat` |
| `OAuth is not configured` | Missing env variables | Set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in Railway |
| `Authorization code is required` | No code in callback | Check deep linking configuration |
| `Invalid client secret` | Wrong app secret | Update `FACEBOOK_APP_SECRET` in Railway |
| `Token expired` | OAuth token expired | Reconnect your account |

### Publishing Errors

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `Content is required` | Empty content field | Provide buzz content |
| `No connected account found` | Account not connected | Connect account in Settings |
| `Token has expired` | Token validity period ended | Reconnect account |
| `Instagram requires media` | Text-only post to Instagram | Add image or video |
| `Unsupported platform` | Invalid platform name | Use: `facebook`, `instagram`, or `snapchat` |

### API Errors

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `(#100) Invalid parameter` | Facebook API parameter error | Check media URL is valid and accessible |
| `(#200) Permissions error` | Missing Facebook permissions | Request permissions in App Review |
| `(#368) Temporarily blocked` | Rate limit exceeded | Wait 1 hour and try again |
| `(#190) Token expired` | Access token invalid | Reconnect account |

---

## Still Having Issues?

### Check These Common Mistakes

- [ ] Environment variables use OLD names (`FACEBOOK_CLIENT_ID` instead of `FACEBOOK_APP_ID`)
- [ ] Environment variables have extra spaces or quotes
- [ ] Facebook App is in Development Mode but user is not added as Tester
- [ ] Redirect URIs not configured in Facebook App settings
- [ ] Instagram account is Personal, not Business
- [ ] Instagram account not linked to Facebook Page
- [ ] Trying to post text-only to Instagram

### Enable Debug Mode

Add this to your Railway environment variables:
```
DEBUG=social-auth,social-share
LOG_LEVEL=debug
```

Then check Railway logs for detailed debug output.

### Contact Support

If you've tried everything above and it still doesn't work:

1. Gather information:
   - Railway logs (last 100 lines)
   - Error messages from app
   - Health check response
   - Environment variables (names only, not values)

2. Check issues on GitHub:
   - Search for similar issues
   - Create a new issue with details above

3. Verify your setup matches:
   - `RAILWAY_ENV_VERIFICATION.md` for env variables
   - `SOCIAL_MEDIA_INTEGRATION.md` for overall setup
   - `RAILWAY_SOCIAL_MEDIA_CONFIG.md` for OAuth app setup

---

## Prevention Tips

### Keep Tokens Fresh
- Tokens expire every 60-90 days
- App should auto-refresh, but check periodically
- If publishing fails, try reconnecting first

### Monitor Permissions
- Facebook can revoke permissions at any time
- Check App Dashboard for permission status
- Re-request permissions if revoked

### Test Regularly
- Test OAuth flow monthly
- Test publishing to each platform
- Verify media uploads work

### Stay Updated
- Facebook/Instagram API changes frequently
- Check deprecation notices in Facebook Developers Dashboard
- Update API version when needed (currently using v18.0)

---

## Useful Links

- **Facebook Developers:** https://developers.facebook.com
- **Instagram Graph API Docs:** https://developers.facebook.com/docs/instagram-api
- **Facebook Graph API Explorer:** https://developers.facebook.com/tools/explorer
- **Railway Dashboard:** https://railway.app
- **BuzzIt Production API:** https://buzzit-production.up.railway.app

---

## Version History

- **v1.0** - Initial troubleshooting guide
- **v1.1** - Added environment variable fix (FACEBOOK_APP_ID vs FACEBOOK_CLIENT_ID)
