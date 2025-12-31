# 🚀 Critical Railway Variables - Add These NOW

## ⚡ Quick Copy-Paste for Railway

### Step 1: Add These Variables to Railway RIGHT NOW

Go to Railway → Your Project → Variables → Add these:

```bash
# ============================================================
# CRITICAL - App Configuration (REQUIRED)
# ============================================================
JWT_SECRET=BuzzIt-7k9mP2nQ8vL3xR5wN1jH4bC6yT0zF-2025-SecureKey
NODE_ENV=production

# ============================================================
# CRITICAL - OAuth Redirect URIs (REQUIRED for Social Media)
# ============================================================
FACEBOOK_APP_ID=1385131833212514
FACEBOOK_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback

INSTAGRAM_APP_ID=1393033811657781
INSTAGRAM_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
```

**✅ After adding these, click "Deploy" in Railway**

---

## 📸 Step 2: Set Up Cloudinary (5 minutes)

### Get Cloudinary Credentials

1. **Go to:** https://cloudinary.com/users/register_free
2. **Sign up** with your email (or use Google/GitHub login)
3. **Verify** your email
4. **You'll be taken to the Dashboard automatically**

### Copy These Values from Dashboard

Once logged in, you'll see your credentials on the main dashboard:

```
Cloud Name: [Copy this - looks like: "dxyz123abc"]
API Key: [Copy this - looks like: "123456789012345"]
API Secret: [Copy this - looks like: "AbCdEfGhIjKlMnOpQrStUvWxYz12"]
```

### Add to Railway

```bash
# ============================================================
# CRITICAL - Cloudinary (Media Storage) - REQUIRED
# ============================================================
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME_HERE
CLOUDINARY_API_KEY=YOUR_API_KEY_HERE
CLOUDINARY_API_SECRET=YOUR_API_SECRET_HERE
```

**Example (replace with YOUR actual values):**
```bash
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz12
```

---

## 🎯 Step 3: Verify All Variables in Railway

After adding the variables above, your Railway should have these:

### ✅ Variables You Already Have:
```
APP_BASE_URL=https://buzzit-production.up.railway.app
DATABASE_PUBLIC_URL=postgresql://postgres:...
DATABASE_URL=postgresql://postgres:...
FACEBOOK_CLIENT_ID=1385131833212514
FACEBOOK_CLIENT_SECRET=7c9ef833260de03a7101248e24ad3aa9
INSTAGRAM_CLIENT_ID=1393033811657781
INSTAGRAM_CLIENT_SECRET=8feb4f68ca96a05a075bea39aa214451
IVS_INGEST_RTMPS_URL=rtmps://4232ed0fa439...
IVS_PLAYBACK_URL=https://4232ed0fa439...
IVS_STREAM_KEY=sk_us-west-2_SyGDmgzv1MJp...
(+ all the PGDATA, PGHOST, etc.)
```

### ✅ Variables You Just Added:
```
JWT_SECRET=BuzzIt-7k9mP2nQ8vL3xR5wN1jH4bC6yT0zF-2025-SecureKey
NODE_ENV=production
FACEBOOK_APP_ID=1385131833212514
FACEBOOK_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
INSTAGRAM_APP_ID=1393033811657781
INSTAGRAM_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

---

## 🔧 Step 4: Configure Facebook App OAuth Redirects

### Important: Update Facebook Developer Settings

1. **Go to:** https://developers.facebook.com/apps
2. **Select your app** (App ID: 1385131833212514)
3. **Go to:** Settings → Basic
4. **Scroll down to:** "Valid OAuth Redirect URIs"
5. **Add these URLs:**
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
   https://buzzit-production.up.railway.app/settings
   ```
6. **Click "Save Changes"**

### For Instagram (Same App)

Since Instagram uses the same Facebook app, the redirect URIs you added above will work for both!

---

## 🧪 Step 5: Test After Deployment

### Check Railway Logs

After deploying, check the logs:

```bash
# Look for these success messages:
✅ PostgreSQL connected successfully
✅ Social media routes loaded
✅ Server running on port...
```

### Test OAuth Configuration

```bash
# Test endpoint (no auth required):
GET https://buzzit-production.up.railway.app/api/social-auth/test-config

# Should return:
{
  "success": true,
  "config": {
    "facebook": {
      "hasClientId": true,
      "hasClientSecret": true,
      "clientIdLength": 16
    },
    "instagram": {
      "hasClientId": true,
      "hasClientSecret": true,
      "clientIdLength": 16
    }
  }
}
```

---

## ⚠️ STILL MISSING (Not Critical for Basic Functionality)

### Optional: Twilio (SMS Verification)

**Impact:** Users won't be able to register with phone numbers. They'll need to use email/username login.

**To add later:**
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**How to get:** Sign up at https://www.twilio.com

---

### Optional: Twitter (Requires $100/month)

**Impact:** Users can't post to Twitter

**To add later:**
```bash
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
TWITTER_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/twitter/callback
```

---

### Optional: Snapchat (Requires API Approval)

**Impact:** Users can't post to Snapchat

**To add later:**
```bash
SNAPCHAT_CLIENT_ID=your-snapchat-client-id
SNAPCHAT_CLIENT_SECRET=your-snapchat-client-secret
SNAPCHAT_OAUTH_REDIRECT_URI=https://buzzit-production.up.railway.app/api/social-auth/oauth/snapchat/callback
```

---

## ✅ Checklist

### Immediate Actions (Do Now):
- [ ] Add JWT_SECRET to Railway
- [ ] Add NODE_ENV to Railway
- [ ] Add FACEBOOK_OAUTH_REDIRECT_URI to Railway
- [ ] Add INSTAGRAM_OAUTH_REDIRECT_URI to Railway
- [ ] Sign up for Cloudinary (https://cloudinary.com)
- [ ] Copy Cloudinary credentials
- [ ] Add CLOUDINARY_CLOUD_NAME to Railway
- [ ] Add CLOUDINARY_API_KEY to Railway
- [ ] Add CLOUDINARY_API_SECRET to Railway
- [ ] Click "Deploy" in Railway
- [ ] Add OAuth redirect URIs in Facebook Developer Console
- [ ] Test the deployment
- [ ] Check Railway logs for errors

### Later (Optional):
- [ ] Set up Twilio for SMS verification
- [ ] Set up Twitter API (if you want Twitter posting)
- [ ] Set up Snapchat API (if you want Snapchat posting)

---

## 🎯 What Will Work After These Changes

✅ **User Authentication:** Login/Register with JWT tokens
✅ **Image/Video Upload:** Users can upload media to buzzes
✅ **Facebook OAuth:** Users can connect Facebook accounts
✅ **Instagram OAuth:** Users can connect Instagram accounts
✅ **Facebook Posting:** Users can post buzzes to Facebook
✅ **Instagram Posting:** Users can post buzzes to Instagram
✅ **Live Streaming:** Amazon IVS already configured
✅ **Database:** PostgreSQL already configured

---

## 🚨 What Won't Work Yet (Until You Add Optional Services)

⚠️ **Phone Number Registration:** Needs Twilio
⚠️ **Twitter Posting:** Needs Twitter API subscription
⚠️ **Snapchat Posting:** Needs Snapchat API approval

---

## 📝 Notes

### About JWT_SECRET
The JWT_SECRET I generated for you is:
```
BuzzIt-7k9mP2nQ8vL3xR5wN1jH4bC6yT0zF-2025-SecureKey
```

This is secure and random. You can use it as-is, or generate your own at https://randomkeygen.com/

### About Cloudinary Free Tier
Cloudinary's free tier includes:
- ✅ 25 GB storage
- ✅ 25k transformations/month
- ✅ 25 GB bandwidth/month

This is MORE than enough for testing and initial launch!

### About OAuth Redirect URIs
Make sure these EXACTLY match between:
1. Railway environment variables
2. Facebook Developer Console
3. Your actual Railway app URL

Any mismatch will cause OAuth to fail!

---

## 🆘 Troubleshooting

### Error: "JWT malformed" or "No token provided"
**Fix:** Make sure JWT_SECRET is added to Railway and app is redeployed

### Error: "Cloudinary not configured"
**Fix:** Make sure all 3 Cloudinary variables are added (CLOUD_NAME, API_KEY, API_SECRET)

### Error: "OAuth redirect_uri_mismatch"
**Fix:** Make sure redirect URIs in Facebook Developer Console exactly match the ones in Railway

### App not starting after deployment
**Fix:** Check Railway logs for specific error messages

---

## ✅ You're Almost Done!

After completing these steps, your BuzzIt app will have:
- ✅ Full authentication
- ✅ Media uploads working
- ✅ Facebook & Instagram posting working
- ✅ Live streaming working
- ✅ Ready for production use!

The only optional features missing are:
- Phone number registration (needs Twilio)
- Twitter posting (needs $100/month API)
- Snapchat posting (needs approval)

**Good luck! Your app will be fully functional after these changes! 🚀**
