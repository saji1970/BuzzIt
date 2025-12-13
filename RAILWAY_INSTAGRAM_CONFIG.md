# Railway Configuration for Instagram App

## Your Instagram App Credentials

```
App Name: BuzzIt-IG
Instagram App ID: 1393033811657781
Instagram App Secret: 8feb4f68ca96a05a075bea39aa214451
```

## How to Add to Railway

### Method 1: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Sign in

2. **Select Your Project**
   - Find your BuzzIt backend project
   - Click on it

3. **Select Your Service**
   - Click on the service running your backend (server)

4. **Go to Variables Tab**
   - Click on the **"Variables"** tab at the top

5. **Add These Variables**
   Click **"New Variable"** for each one:

   **Variable 1:**
   ```
   Name: INSTAGRAM_CLIENT_ID
   Value: 1393033811657781
   ```

   **Variable 2:**
   ```
   Name: INSTAGRAM_CLIENT_SECRET
   Value: 8feb4f68ca96a05a075bea39aa214451
   ```

   **Variable 3 (if not already set):**
   ```
   Name: APP_BASE_URL
   Value: https://buzzit-production.up.railway.app
   ```

6. **Save**
   - Railway will automatically redeploy with new variables
   - Wait for deployment to complete (usually 1-2 minutes)

### Method 2: Via Railway CLI (Optional)

If you have Railway CLI installed:

```bash
# Set Instagram credentials
railway variables set INSTAGRAM_CLIENT_ID=1393033811657781
railway variables set INSTAGRAM_CLIENT_SECRET=8feb4f68ca96a05a075bea39aa214451
railway variables set APP_BASE_URL=https://buzzit-production.up.railway.app
```

## Verify Variables Are Set

### Check in Railway Dashboard:
1. Go to your service → Variables tab
2. You should see:
   - ✅ INSTAGRAM_CLIENT_ID = 1393033811657781
   - ✅ INSTAGRAM_CLIENT_SECRET = 8feb4f68ca96a05a075bea39aa214451
   - ✅ APP_BASE_URL = https://buzzit-production.up.railway.app

### Test via API:
After Railway redeploys, test if Instagram OAuth is configured:

```bash
# Test OAuth URL generation (replace YOUR_TOKEN with actual auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/url
```

Expected response:
```json
{
  "success": true,
  "authUrl": "https://api.instagram.com/oauth/authorize?client_id=1393033811657781&...",
  "platform": "instagram"
}
```

If you get an error like "Instagram OAuth is not configured on the server", then the environment variables aren't set correctly.

## Important Notes

### Variable Names Must Match Exactly:
The backend code looks for:
- `INSTAGRAM_CLIENT_ID` (not INSTAGRAM_APP_ID)
- `INSTAGRAM_CLIENT_SECRET` (not INSTAGRAM_APP_SECRET)

### Keep Credentials Secret:
- ⚠️ Never commit these to Git
- ⚠️ Never share your App Secret publicly
- ✅ Railway encrypts environment variables
- ✅ Only set them in Railway dashboard

### Redeploy After Adding:
- Railway auto-redeploys when you add variables
- Wait for deployment to finish before testing
- Check deployment logs for any errors

## Complete Environment Variables Checklist

For full social media integration, you should have:

```bash
# Instagram
✅ INSTAGRAM_CLIENT_ID=1393033811657781
✅ INSTAGRAM_CLIENT_SECRET=8feb4f68ca96a05a075bea39aa214451

# Facebook (if you have a Facebook app)
❓ FACEBOOK_CLIENT_ID=your_facebook_app_id
❓ FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Snapchat (if you have a Snapchat app)
❓ SNAPCHAT_CLIENT_ID=your_snapchat_client_id
❓ SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret

# App Configuration
✅ APP_BASE_URL=https://buzzit-production.up.railway.app
✅ JWT_SECRET=your-secure-jwt-secret

# Database (should already be set)
✅ MONGODB_URI=your_mongodb_connection_string

# Cloudinary (for media uploads, should already be set)
✅ CLOUDINARY_CLOUD_NAME=your_cloudinary_name
✅ CLOUDINARY_API_KEY=your_cloudinary_key
✅ CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## After Setting Variables

### 1. Configure Redirect URIs in Instagram App
Go to: https://developers.facebook.com/apps/1393033811657781/

Add these redirect URIs (see INSTAGRAM_APP_SETUP.md for detailed steps):
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
com.buzzit.app://oauth/callback/instagram
http://localhost:3000/api/social-auth/oauth/instagram/callback
```

### 2. Test Connection in App
1. Open BuzzIt app
2. Go to Settings → Privacy & Social
3. Tap "Connect" on Instagram
4. Should open browser
5. Log in with Instagram Business Account
6. Authorize permissions
7. Should return to app showing "Connected"

### 3. Test Publishing
1. Create a buzz with an image
2. Select Instagram platform
3. Create buzz
4. Check Instagram - post should appear

## Troubleshooting

### Variables Not Working?
1. **Check spelling** - Must be exact: `INSTAGRAM_CLIENT_ID`
2. **Check value** - Copy/paste to avoid typos
3. **Wait for redeploy** - Railway needs to restart
4. **Check logs** - Railway → Service → Logs for errors

### Still Getting "OAuth not configured"?
1. Verify variables are visible in Railway Variables tab
2. Check Railway deployment logs
3. Try redeploying manually
4. Ensure no extra spaces in values

### OAuth URL Generated But Connection Fails?
1. Check redirect URIs in Instagram app settings
2. Verify exact match (no trailing slashes)
3. Make sure you clicked "Save Changes"
4. Wait 1-2 minutes for changes to propagate

## Security Best Practices

✅ **DO:**
- Store credentials only in Railway Variables
- Use different apps for development/production
- Rotate secrets periodically
- Monitor API usage

❌ **DON'T:**
- Commit credentials to Git
- Share App Secret publicly
- Hard-code credentials in source code
- Use production credentials for testing
