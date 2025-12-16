# 🔧 Fix Facebook OAuth "Can't load URL" Error

## ❌ Error Message
```
Can't load URL
The domain of this URL isn't included in the app's domains. 
To be able to load this URL, add all domains and sub-domains 
of your app to the App Domains field in your app settings
```

## 🔍 Root Cause

Facebook requires you to configure authorized domains in your Facebook App settings. The redirect URI domain must be whitelisted.

## 📋 Required Configuration

Your OAuth callback URL is:
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
```

**Domain to add**: `buzzit-production.up.railway.app`

## ✅ Step-by-Step Fix

### 1. Go to Facebook Developers

1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Select your app (the one with your `FACEBOOK_CLIENT_ID`)

### 2. Add App Domain

1. Go to **Settings** → **Basic**
2. Scroll to **App Domains** section
3. Add: `buzzit-production.up.railway.app`
4. Click **Save Changes**

### 3. Add Valid OAuth Redirect URIs

1. Go to **Settings** → **Basic** → **Advanced**
2. Scroll to **Valid OAuth Redirect URIs**
3. Add the full callback URL:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   ```
4. If you're also testing locally, you can also add:
   ```
   http://localhost:3000/api/social-auth/oauth/facebook/callback
   ```
5. Click **Save Changes**

### 4. (Optional) For Instagram OAuth

If you're using Instagram OAuth, add the same domain and redirect URI:

**App Domains**: `buzzit-production.up.railway.app`

**Valid OAuth Redirect URIs**:
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
```

### 5. Verify Environment Variables

Make sure these are set in Railway:

- `APP_BASE_URL=https://buzzit-production.up.railway.app`
- `FACEBOOK_CLIENT_ID=your_facebook_app_id`
- `FACEBOOK_CLIENT_SECRET=your_facebook_app_secret`

### 6. Restart Railway Service

After adding the domains in Facebook:

1. Go to Railway Dashboard
2. Select your service
3. Click **Settings** → **Redeploy** (or **Restart**)

**Important**: Changes in Facebook App settings can take a few minutes to propagate.

## 🧪 Test After Configuration

### Test Health Endpoint
```bash
curl https://buzzit-production.up.railway.app/api/social-auth/health
```

Should return:
```json
{
  "success": true,
  "facebookConfigured": true,
  ...
}
```

### Test OAuth URL (Requires Auth Token)
```bash
# First, get an auth token by logging in
# Then:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
```

Should return:
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?...",
  "platform": "facebook"
}
```

### Test in Browser

1. Get the OAuth URL from the API
2. Open it in a browser
3. You should see Facebook's OAuth consent screen (not the domain error)

## 📝 Facebook App Settings Checklist

- [ ] App Domains: `buzzit-production.up.railway.app` added
- [ ] Valid OAuth Redirect URIs: Full callback URL added
- [ ] App is in **Live** mode (not Development mode) if testing with non-admin users
- [ ] Required permissions are added:
  - `email`
  - `public_profile`
  - `pages_manage_posts`
  - `pages_read_engagement`
  - `instagram_basic`
  - `instagram_content_publish`

## 🔒 Security Notes

- Never expose `FACEBOOK_CLIENT_SECRET` in client-side code
- Keep `APP_BASE_URL` pointing to your production domain
- Use HTTPS for production (Railway provides this automatically)
- Only add trusted domains to App Domains

## 🐛 Troubleshooting

### Still Getting Domain Error?

1. **Wait 5-10 minutes** - Facebook settings can take time to propagate
2. **Check App Mode** - Make sure your app is in the correct mode:
   - **Development**: Only works for app admins/testers
   - **Live**: Works for all users (requires App Review for some permissions)
3. **Verify Redirect URI matches exactly** - No trailing slashes, correct protocol (https)
4. **Check Railway logs** - Verify `APP_BASE_URL` environment variable is set correctly

### Error: "Invalid OAuth Redirect URI"

- The redirect URI in your API call must **exactly match** what's in Facebook App settings
- Check for trailing slashes, http vs https, port numbers
- Railway uses HTTPS, so make sure you're using `https://` not `http://`

### Error: "App Not Setup"

- Make sure your Facebook App is properly configured
- Check that you're using the correct `FACEBOOK_CLIENT_ID`
- Verify the app is not in a restricted state

## 📚 References

- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [Facebook App Settings Guide](https://developers.facebook.com/docs/apps/manage)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

## ✅ After Fix

Once configured correctly, the Facebook OAuth flow should work:

1. User clicks "Connect Facebook"
2. Redirected to Facebook login/consent screen
3. User authorizes the app
4. Redirected back to: `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
5. Server exchanges code for access token
6. Account is connected successfully

