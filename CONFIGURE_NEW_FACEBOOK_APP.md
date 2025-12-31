# Configure Your New Facebook App - Quick Checklist

## ✅ Step 1: Get Your App Credentials

1. **Go to your app's Settings → Basic**:
   ```
   https://developers.facebook.com/apps/YOUR_APP_ID/settings/basic/
   ```

2. **Copy these credentials**:
   - **App ID**: [The number at the top]
   - **App Secret**: [Click "Show" button, solve security check, copy it]

3. **Write them down** - You'll need them for Railway!

---

## ✅ Step 2: Add Facebook Login Product

1. **In left sidebar, click "Add Products"** (or "Products" if already there)

2. **Find "Facebook Login"**

3. **Click "Set Up"** (if not already added)

4. **Skip quickstart or complete it** - either way is fine

---

## ✅ Step 3: Configure Redirect URIs (CRITICAL!)

1. **Go to: Facebook Login → Settings** (in left sidebar)

2. **Scroll down to "Valid OAuth Redirect URIs"**

3. **Add these TWO URLs** (copy-paste exactly):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Make sure these settings are ON**:
   - ✅ **Client OAuth Login** = ON
   - ✅ **Web OAuth Login** = ON
   - ❌ **Use Strict Mode for Redirect URIs** = OFF (optional, for easier testing)

5. **Click "Save Changes"** at the bottom

---

## ✅ Step 4: Update Railway Environment Variables

1. **Go to Railway dashboard**: https://railway.app

2. **Select your backend service** (the one running server/index.js)

3. **Click "Variables" tab**

4. **Update these 4 variables** with your NEW App ID and Secret:

   **FACEBOOK_CLIENT_ID**:
   ```
   YOUR_NEW_APP_ID
   ```

   **FACEBOOK_CLIENT_SECRET**:
   ```
   YOUR_NEW_APP_SECRET
   ```

   **INSTAGRAM_CLIENT_ID**:
   ```
   YOUR_NEW_APP_ID
   ```
   (Instagram uses the same Facebook App!)

   **INSTAGRAM_CLIENT_SECRET**:
   ```
   YOUR_NEW_APP_SECRET
   ```

5. **Save** - Railway will automatically redeploy (wait 1-2 minutes)

---

## ✅ Step 5: Wait for Railway Deployment

1. **Go to "Deployments" tab** in Railway

2. **Wait for status**: ✅ **"Active"**

3. **Usually takes 1-2 minutes**

---

## ✅ Step 6: Test OAuth URL

After Railway redeploys, test the URL:

1. **Replace YOUR_APP_ID with your actual App ID** and open in browser:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test
   ```

2. **You should see**:
   - ✅ Facebook login page (NOT an error!)
   - ✅ Your app name asking for permissions

3. **If you see error**:
   - "Invalid Redirect URI" = Go back to Step 3, check redirect URIs
   - "Invalid App ID" = Double-check App ID in Railway (Step 4)

---

## ✅ Step 7: Test from Mobile App

1. **Clear app data** (optional):
   ```batch
   adb shell pm clear com.buzzit.app
   ```

2. **Restart app or run**:
   ```batch
   quick-deploy.bat
   ```

3. **In app**: Go to Settings → Privacy & Social Media

4. **Tap "Connect" on Facebook**

5. **Expected flow**:
   - Browser opens with Facebook login
   - Login with your Facebook account
   - Grant permissions
   - Redirects back to app
   - Shows "Connected" status ✅

---

## 🎯 Quick Summary:

- [ ] Get App ID and Secret from Facebook app
- [ ] Add Facebook Login product
- [ ] Configure redirect URIs in Facebook Login settings
- [ ] Update 4 Railway variables (FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET)
- [ ] Wait for Railway to redeploy (1-2 minutes)
- [ ] Test OAuth URL in browser
- [ ] Test from mobile app

---

## 📝 Tell Me Your New App ID:

Once you have your new App ID and Secret, paste them here and I'll help you:
1. Test the OAuth URL
2. Verify Railway is configured correctly
3. Deploy and test in the mobile app

**What's your new App ID and App Secret?**
