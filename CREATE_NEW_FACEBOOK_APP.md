# Create New Facebook App - Step by Step

## Why You Need This:
App ID `2700884196937447` is invalid or you don't have access to it.

---

## Step-by-Step Instructions:

### 1. Go to Facebook Developers
```
https://developers.facebook.com/apps/
```

### 2. Click "Create App" (Green button)

### 3. Choose App Type
- Select: **"Consumer"** (for social media integration)
- Click "Next"

### 4. Fill in App Details
- **App Name**: BuzzIt
- **App Contact Email**: Your email address
- Click "Create App"

### 5. Complete Security Check
- Solve the CAPTCHA if prompted

### 6. Your App is Created!
- You'll be redirected to the app dashboard
- **IMPORTANT**: Copy your new App ID and App Secret

### 7. Copy Your New Credentials

Go to: **Settings → Basic**

You'll see:
```
App ID: XXXXXXXXXXXX  ← Copy this!
App Secret: [Click "Show"] XXXXXXXXXXXXXXXX  ← Copy this!
```

**Write them down NOW!**

### 8. Add Facebook Login Product

1. In left sidebar, click **"Add Products"**
2. Find **"Facebook Login"**
3. Click **"Set Up"**
4. Choose **"Quickstart"** or skip and go to Settings

### 9. Configure Facebook Login

Go to: **Facebook Login → Settings** (in left sidebar)

Scroll to **"Valid OAuth Redirect URIs"** and add:
```
https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
com.buzzit.app://oauth/callback/facebook
```

### 10. Enable OAuth Settings

Make sure these are turned ON:
- ✅ **Client OAuth Login**
- ✅ **Web OAuth Login**

Click **"Save Changes"**

### 11. Set App Mode (Optional for Testing)

Top right of dashboard:
- **Development Mode**: Only you and test users can use it (good for testing)
- **Live Mode**: Anyone can use it (requires App Review for advanced permissions)

For testing, keep it in **Development Mode**.

---

## After Creating the App:

### Update Railway Environment Variables

1. Go to: https://railway.app
2. Open your backend service
3. Go to Variables tab
4. Update these with your NEW App ID and Secret:

```
FACEBOOK_CLIENT_ID=YOUR_NEW_APP_ID
FACEBOOK_CLIENT_SECRET=YOUR_NEW_APP_SECRET
INSTAGRAM_CLIENT_ID=YOUR_NEW_APP_ID
INSTAGRAM_CLIENT_SECRET=YOUR_NEW_APP_SECRET
```

5. Save and wait for redeployment (1-2 minutes)

### Test Your New App

Run:
```batch
cd server
node test-facebook-oauth.js
```

Should show your NEW App ID without errors!

Then redeploy to device:
```batch
quick-deploy.bat
```

---

## 🎯 Quick Summary:

1. ✅ Create Facebook App at https://developers.facebook.com/apps/
2. ✅ Add Facebook Login product
3. ✅ Configure redirect URIs
4. ✅ Copy new App ID and Secret
5. ✅ Update Railway variables
6. ✅ Wait for Railway to redeploy
7. ✅ Test in mobile app

---

**Total time: 5-10 minutes**

Let me know when you have your NEW App ID and I'll help you update Railway!
