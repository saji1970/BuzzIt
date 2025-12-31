# Quick Fix: Facebook & Instagram Connection Failed

## ❌ Current Issue

Getting "Connection Failed" error when trying to connect Facebook or Instagram in the app.

## 🔍 Root Cause

The code is fixed and deployed, but **Railway environment variables are not set yet**.

The backend server needs Facebook App credentials to work, but they're missing.

---

## ✅ Quick Fix (5 Minutes)

### Option 1: Set Temporary Test Credentials (If You Have Facebook App)

If you already created a Facebook App:

1. **Go to Railway Dashboard**
   - Open: https://railway.app
   - Select your BuzzIt project
   - Click on your service
   - Go to **Variables** tab

2. **Add These Variables**:
   ```bash
   FACEBOOK_CLIENT_ID=your_facebook_app_id_here
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
   INSTAGRAM_CLIENT_ID=your_facebook_app_id_here
   INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret_here
   ```

3. **Wait for Deployment**
   - Railway will auto-deploy (1-2 minutes)
   - Check deployment status

4. **Test Again**
   - Reopen BuzzIt app
   - Settings → Privacy & Social
   - Try connecting Facebook/Instagram

---

### Option 2: Create Facebook App First (10 Minutes)

If you haven't created a Facebook App yet:

#### Step 1: Create Facebook App

1. Go to: https://developers.facebook.com/apps/
2. Click **"Create App"**
3. Select **"Business"** type
4. Fill in:
   - App Name: `BuzzIt`
   - Email: `your_email@example.com`
5. Click **"Create App"**

#### Step 2: Get Credentials

1. Go to **Settings → Basic**
2. Copy **App ID** (example: 1393033811657781)
3. Click **"Show"** next to App Secret and copy it
4. Save both values

#### Step 3: Add Facebook Login

1. In left sidebar, click **"Add Product"**
2. Find **"Facebook Login"**
3. Click **"Set Up"**

#### Step 4: Add Instagram Graph API

1. In left sidebar, click **"Add Product"**
2. Find **"Instagram Graph API"**
3. Click **"Set Up"**

#### Step 5: Configure OAuth Redirects

1. Go to **Products → Facebook Login → Settings**
2. In **"Valid OAuth Redirect URIs"** add:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   https://buzzit-production.up.railway.app/api/social-auth/oauth/instagram/callback
   com.buzzit.app://oauth/callback/facebook
   com.buzzit.app://oauth/callback/instagram
   http://localhost:3000/api/social-auth/oauth/facebook/callback
   http://localhost:3000/api/social-auth/oauth/instagram/callback
   ```
3. Click **"Save Changes"**

#### Step 6: Add to Railway

1. Go to Railway Dashboard → Variables
2. Add the credentials from Step 2
3. Wait for auto-deployment

---

## 🧪 Testing

After setting Railway variables:

1. **Check Railway Deployment**
   - Should auto-deploy after adding variables
   - Wait 1-2 minutes
   - Check logs for "Deployment successful"

2. **Test in App**
   - Force close BuzzIt app
   - Reopen app
   - Go to Settings → Privacy & Social
   - Tap "Connect" on Facebook

3. **Expected Behavior**:
   - ✅ Should open Facebook OAuth page in browser
   - ✅ You log in with Facebook
   - ✅ Grant permissions
   - ✅ Redirects back to app
   - ✅ Shows "Connected" status

---

## 🔍 Current Error Analysis

The error you're seeing is likely one of these:

### Error 1: "OAuth is not configured on the server"
**Cause**: `FACEBOOK_CLIENT_ID` or `INSTAGRAM_CLIENT_ID` not set in Railway
**Fix**: Add environment variables to Railway (see above)

### Error 2: "Failed to get authentication URL"
**Cause**: Backend can't generate OAuth URL (missing credentials)
**Fix**: Add environment variables to Railway

### Error 3: "Invalid redirect URI"
**Cause**: Redirect URIs not configured in Facebook App
**Fix**: Add redirect URIs in Facebook App settings (Step 5 above)

### Error 4: "Network request failed"
**Cause**: Backend server not running or wrong URL
**Fix**: Check Railway deployment is running

---

## 📋 Verification Checklist

Before testing, verify:

- [ ] Facebook App created
- [ ] App ID and Secret obtained
- [ ] Facebook Login product added
- [ ] Instagram Graph API product added
- [ ] OAuth redirect URIs configured
- [ ] Environment variables added to Railway
- [ ] Railway deployment completed
- [ ] Backend server running

---

## 🆘 If Still Not Working

### Check Railway Logs

1. Go to Railway Dashboard
2. Click on your service
3. Go to **Deployments** tab
4. Click latest deployment
5. Check logs for errors

### Check Backend Status

Test if backend is running:

```bash
# Windows PowerShell
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
```

Expected response (if credentials are missing):
```json
{
  "success": false,
  "error": "facebook OAuth is not configured on the server"
}
```

This confirms the backend is running but needs credentials.

### Check App Logs

On device:
```bash
adb logcat | grep -i "oauth\|facebook\|instagram"
```

Look for error messages showing exact issue.

---

## 📚 Full Documentation

For complete setup guide with screenshots:
- **FACEBOOK_INSTAGRAM_OAUTH_SETUP.md** - Detailed setup guide
- **OAUTH_FIXES_SUMMARY.md** - Technical summary
- **FIX_FACEBOOK_AUTH_ERROR.md** - Troubleshooting guide

---

## ✨ Summary

**Problem**: Connection fails because Railway doesn't have Facebook App credentials

**Solution**: Add credentials to Railway environment variables

**Time**: 5-10 minutes

**Result**: Facebook and Instagram connections will work

The code is already fixed and deployed - you just need to add the credentials!
