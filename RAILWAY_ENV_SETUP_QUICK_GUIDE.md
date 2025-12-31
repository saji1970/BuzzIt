# Railway Environment Variables - Quick Setup Guide

## Copy & Paste to Railway

Go to your Railway project → Click on your service → Variables tab → Add these variables:

```bash
# ============================================================
# REQUIRED - App Configuration
# ============================================================
APP_BASE_URL=https://buzzit-production.up.railway.app
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-TO-RANDOM-STRING
NODE_ENV=production

# ============================================================
# REQUIRED - Database
# ============================================================
DATABASE_URL=your-postgresql-connection-string-from-railway

# ============================================================
# REQUIRED - Cloudinary (Media Storage)
# ============================================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================================
# REQUIRED - Twilio (SMS Verification)
# ============================================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================================
# FACEBOOK & INSTAGRAM (Same App)
# ============================================================
FACEBOOK_APP_ID=123456789012345
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback

INSTAGRAM_APP_ID=123456789012345
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=your-facebook-app-secret
INSTAGRAM_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback

# ============================================================
# SNAPCHAT (Requires API Approval)
# ============================================================
SNAPCHAT_CLIENT_ID=your-snapchat-client-id
SNAPCHAT_CLIENT_SECRET=your-snapchat-client-secret
SNAPCHAT_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback

# ============================================================
# TWITTER/X (Requires Paid API Plan - $100/month minimum)
# ============================================================
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/twitter/callback

# ============================================================
# AMAZON IVS (Live Streaming)
# ============================================================
IVS_INGEST_RTMPS_URL=rtmps://your-ingest-endpoint.global-contribute.live-video.net:443/app/
IVS_STREAM_KEY=sk_your-stream-key
IVS_PLAYBACK_URL=https://your-playback-url.cloudfront.net/your-channel.m3u8
```

---

## Step-by-Step Railway Setup

### 1. Log into Railway
- Go to: https://railway.app
- Select your BuzzIt project

### 2. Add Environment Variables
- Click on your service name
- Click "Variables" tab
- Click "New Variable"
- Add each variable from above

### 3. Verify Variables
After adding all variables, click "Deploy" to restart your service with the new configuration.

---

## How to Get Each Credential

### Facebook/Instagram
1. Go to: https://developers.facebook.com/apps
2. Create app or select existing app
3. Copy App ID and App Secret
4. Use same credentials for both Facebook and Instagram

### Snapchat
1. Go to: https://kit.snapchat.com/portal
2. Create app
3. Apply for Creative Kit API access (takes 1-2 weeks)
4. Copy Client ID and Client Secret

### Twitter/X
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Create project and app
3. Subscribe to API plan (minimum $100/month)
4. Copy Client ID and Client Secret from OAuth 2.0 settings

### Cloudinary
1. Go to: https://cloudinary.com
2. Sign up or log in
3. Dashboard → Copy Cloud Name, API Key, API Secret

### Twilio
1. Go to: https://www.twilio.com
2. Sign up or log in
3. Console → Copy Account SID and Auth Token
4. Get a phone number

### Amazon IVS
1. Go to: https://console.aws.amazon.com/ivs
2. Create channel
3. Copy Ingest Server, Stream Key, and Playback URL

---

## Testing Your Setup

### 1. Check Server Logs
```bash
# In Railway, go to your service → Deployments → Latest → View Logs
# Look for:
✅ PostgreSQL connected successfully
✅ Social media routes loaded
```

### 2. Test OAuth Configuration
```bash
# Test endpoint (no auth required):
GET https://buzzit-production.up.railway.app/api/social-auth/test-config

# Should return:
{
  "success": true,
  "config": {
    "facebook": { "hasClientId": true, "hasClientSecret": true },
    "instagram": { "hasClientId": true, "hasClientSecret": true },
    "snapchat": { "hasClientId": true, "hasClientSecret": true },
    "twitter": { "hasClientId": true, "hasClientSecret": true }
  }
}
```

### 3. Test OAuth URLs
```bash
# Get Facebook OAuth URL (requires auth token):
GET https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
Headers: Authorization: Bearer YOUR_JWT_TOKEN

# Should return:
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?...",
  "platform": "facebook"
}
```

---

## Common Issues

### Issue: "OAuth is not configured on the server"
**Solution:** Make sure you've added the CLIENT_ID and CLIENT_SECRET for that platform in Railway

### Issue: "redirect_uri_mismatch"
**Solution:**
1. Check that APP_BASE_URL matches your Railway URL exactly
2. Verify redirect URI in platform developer console matches:
   - Facebook: https://yourapp.up.railway.app/api/social-auth/oauth/facebook/callback
   - Instagram: https://yourapp.up.railway.app/api/social-auth/oauth/instagram/callback
   - Twitter: https://yourapp.up.railway.app/api/social-auth/oauth/twitter/callback
   - Snapchat: https://yourapp.up.railway.app/api/social-auth/oauth/snapchat/callback

### Issue: Twitter API not working
**Solution:**
1. Verify you have an active API subscription ($100/month minimum)
2. Check that you have the correct scopes: tweet.read, tweet.write, users.read, offline.access

### Issue: Snapchat not working
**Solution:** Snapchat requires Creative Kit API approval which can take 1-2 weeks. Check your Snapchat developer portal for approval status.

---

## Security Checklist

- [ ] Changed JWT_SECRET to a random string (use https://randomkeygen.com/)
- [ ] All API secrets are kept confidential
- [ ] Never commit .env files to git
- [ ] Railway environment variables are set to "hidden" where possible
- [ ] OAuth redirect URIs use HTTPS (not HTTP)
- [ ] Database connection string uses SSL

---

## Next Steps After Setup

1. ✅ Deploy to Railway with new environment variables
2. ✅ Test OAuth connections from BuzzIt mobile app
3. ✅ Submit Facebook/Instagram app for review (if not already approved)
4. ⏳ Wait for Snapchat Creative Kit API approval (1-2 weeks)
5. 💰 Subscribe to Twitter API plan ($100/month)
6. ✅ Test publishing to each platform
7. ✅ Monitor error logs for any issues

---

## Cost Summary

| Service | Cost | Required For |
|---------|------|--------------|
| **Railway** | $5-20/month | Hosting |
| **PostgreSQL** | Included in Railway | Database |
| **Cloudinary** | FREE (10GB, 25k transforms/mo) | Media storage |
| **Twilio** | $1-5/month (pay-as-you-go) | SMS verification |
| **Facebook/Instagram** | FREE | Social posting |
| **Snapchat** | FREE (but requires approval) | Social posting |
| **Twitter API** | **$100-5,000/month** | Social posting |
| **Amazon IVS** | ~$10-50/month (usage-based) | Live streaming |

**Total Monthly Cost:** $116 - $5,075/month
(Minimum $116 if using Basic Twitter plan)

---

## Support

For detailed setup instructions, see:
- Full guide: `SOCIAL_MEDIA_OAUTH_SETUP_COMPLETE.md`
- Facebook setup: https://developers.facebook.com/docs
- Twitter setup: https://developer.twitter.com/en/docs
- Snapchat setup: https://developers.snap.com/docs

For issues, check Railway logs:
```bash
# View real-time logs
railway logs --service your-service-name

# Or via Railway dashboard
Dashboard → Your Service → Deployments → View Logs
```
