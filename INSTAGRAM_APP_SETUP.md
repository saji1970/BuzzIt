# Instagram App Setup - BuzzIt-IG

## Your App Details

```
App Name: BuzzIt-IG
Instagram App ID: 1393033811657781
Instagram App Secret: 8feb4f68ca96a05a075bea39aa214451
```

## Step 1: Configure Redirect URIs in Instagram App

### Go to Facebook Developers Dashboard
1. Visit: https://developers.facebook.com/apps/1393033811657781/
2. Sign in if needed

### Add Redirect URIs

#### Option A: If using Instagram Basic Display
1. In left sidebar → **"Products"**
2. Find **"Instagram Basic Display"**
3. Click **"Basic Display"** or **"Settings"**
4. Scroll to **"Valid OAuth Redirect URIs"**
5. Add these URLs (one per line):

```
https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
com.buzzit.app://oauth/callback/instagram
http://localhost:3000/api/social-auth/oauth/instagram/callback
```

6. Click **"Save Changes"**

#### Option B: If using Instagram Graph API (Recommended for Publishing)
1. In left sidebar → **"Products"**
2. Find **"Instagram Graph API"** (or just "Instagram")
3. Click **"Settings"**
4. If you see **"Client OAuth Settings"** section:
   - Find **"Valid OAuth Redirect URIs"**
   - Add the same URLs as above
5. Click **"Save Changes"**

#### Option C: If Instagram uses Facebook Login settings
Sometimes Instagram apps share Facebook Login settings:

1. In left sidebar → **"Products"**
2. Find **"Facebook Login"**
3. Click **"Settings"**
4. Add these URLs to **"Valid OAuth Redirect URIs"**:

```
https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
com.buzzit.app://oauth/callback/instagram
http://localhost:3000/api/social-auth/oauth/instagram/callback
```

5. Click **"Save Changes"**

## Step 2: Verify App Permissions/Scopes

Make sure your Instagram app has these permissions requested:

### Required Permissions:
- ✅ `instagram_basic` - Basic profile information
- ✅ `instagram_content_publish` - Publish posts to Instagram
- ✅ `pages_show_list` - List Facebook Pages (needed for Instagram Business)

### How to Check/Add Permissions:
1. In your app dashboard → **"App Review"** → **"Permissions and Features"**
2. Search for each permission
3. If not added, click **"Request"** or **"Add"**
4. Some may require app review before going live

## Step 3: Important Instagram Requirements

### Instagram Business Account Required
Instagram Graph API (for publishing) requires:
- ✅ Instagram Business Account (not personal)
- ✅ Instagram account must be connected to a Facebook Page
- ✅ Facebook Page must be in "Business" mode

### How Users Connect:
1. User must have Instagram Business Account
2. Their Instagram must be linked to their Facebook Page
3. When they authorize, they select which Page/Instagram to connect
4. Your app gets access to that Instagram account via the Page

## Step 4: Set Environment Variables in Railway

Go to Railway Dashboard → Your Service → Variables:

### Add These Variables:

```bash
# Instagram OAuth Credentials
INSTAGRAM_CLIENT_ID=1393033811657781
INSTAGRAM_APP_SECRET=8feb4f68ca96a05a075bea39aa214451

# App Configuration (if not already set)
APP_BASE_URL=https://buzzit-production.up.railway.app
JWT_SECRET=your-secure-jwt-secret-here
```

**Note:** The variable name in the code is `INSTAGRAM_CLIENT_SECRET` but the actual value is your App Secret.

### Current Backend Code Uses These Names:
Looking at `server/routes/socialAuthRoutes.js`, it uses:
- `process.env.INSTAGRAM_CLIENT_ID`
- `process.env.INSTAGRAM_CLIENT_SECRET`

So set them as:
```
INSTAGRAM_CLIENT_ID = 1393033811657781
INSTAGRAM_CLIENT_SECRET = 8feb4f68ca96a05a075bea39aa214451
```

## Step 5: Test Instagram OAuth Flow

### Test 1: Check OAuth URL Generation
```bash
curl -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/url
```

Expected response:
```json
{
  "success": true,
  "authUrl": "https://api.instagram.com/oauth/authorize?client_id=1393033811657781&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Finstagram%2Fcallback&scope=user_profile%2Cuser_media&response_type=code&state=...",
  "platform": "instagram"
}
```

### Test 2: Connect in App
1. Open BuzzIt app
2. Go to Settings → Privacy & Social
3. Tap "Connect" on Instagram
4. Should open browser with Instagram login
5. Log in with Instagram Business Account
6. Authorize permissions
7. Should redirect back to app
8. App should show "Connected" with your Instagram username

## Step 6: Verify Publishing Works

### Test Publishing to Instagram:

1. **Create a buzz with an image** (Instagram requires media!)
2. **Select Instagram** in platform selector
3. **Create buzz**
4. **Check Instagram** - post should appear on your feed

**Important:** Instagram doesn't support text-only posts via API. Users MUST include an image or video.

## Troubleshooting

### Error: "Invalid Redirect URI"
**Solution:**
1. Go back to https://developers.facebook.com/apps/1393033811657781/
2. Double-check redirect URIs are added exactly as shown above
3. Make sure you clicked "Save Changes"
4. Wait 1-2 minutes and try again

### Error: "Instagram Profile ID not found"
**Solution:**
1. User needs Instagram Business Account
2. Instagram must be linked to a Facebook Page
3. When authorizing, they must grant access to the Page/Instagram

### Error: "This app is in development mode"
**Solution:**
If your app is in Development Mode:
1. Add your Instagram account as a Test User
2. Or switch app to Live Mode (may require review)

To add test users:
1. App Dashboard → Roles → Roles
2. Add Instagram Testers
3. They receive an invite on Instagram
4. They must accept before testing

### Error: "Permission not granted"
**Solution:**
1. Go to App Review → Permissions and Features
2. Make sure `instagram_content_publish` is approved or in development testing
3. User must grant all requested permissions during OAuth

### Error: "Token expired"
**Solution:**
- Instagram tokens typically last 60 days
- App should auto-refresh (endpoint implemented)
- If fails, user should reconnect in Settings

## Instagram API Limitations

### What Works:
- ✅ Publishing photos to feed
- ✅ Publishing videos to feed
- ✅ Adding captions (up to 2,200 characters)
- ✅ Getting profile information

### What Doesn't Work:
- ❌ Text-only posts (API doesn't support)
- ❌ Stories (requires different API/permissions)
- ❌ Reels (requires different API)
- ❌ Direct messages
- ❌ Comments/likes management (different permissions)

### Publishing Process:
Instagram uses a 2-step process:
1. **Create Media Container** - Upload/link media, add caption
2. **Publish Container** - Actually publish to feed

This can take a few seconds, so users might see a delay.

## Quick Checklist

- [ ] Redirect URIs added to Instagram app settings
- [ ] Clicked "Save Changes" in app dashboard
- [ ] Environment variables added to Railway:
  - [ ] INSTAGRAM_CLIENT_ID=1393033811657781
  - [ ] INSTAGRAM_CLIENT_SECRET=8feb4f68ca96a05a075bea39aa214451
  - [ ] APP_BASE_URL=https://buzzit-production.up.railway.app
- [ ] Railway redeployed with new variables
- [ ] Instagram permissions requested (instagram_basic, instagram_content_publish)
- [ ] Test OAuth URL generation (curl command)
- [ ] Test connecting in app
- [ ] Test publishing with image

## Testing Tips

### Test with Your Own Account First:
1. Convert your Instagram to Business Account:
   - Instagram app → Settings → Account → Switch to Professional Account
2. Link to a Facebook Page
3. Add yourself as Instagram Tester in app dashboard
4. Test connection and publishing

### Common Test Scenarios:
1. ✅ Post with image only
2. ✅ Post with image and caption
3. ✅ Post with video
4. ❌ Post with text only (should fail with clear error)
5. ✅ Disconnect and reconnect
6. ✅ Multiple posts in a row

## Next Steps

After Instagram is working:
1. Test Facebook integration (if you have a Facebook app)
2. Add Snapchat if desired
3. Train users on Instagram Business Account requirement
4. Monitor for API errors in Railway logs

## Need More Help?

If you're still having issues:
1. Check Railway logs for detailed errors
2. Verify Instagram account is Business type
3. Ensure Instagram is linked to Facebook Page
4. Check that all permissions are granted during OAuth
