# Facebook App ID Verification - URGENT

## 🚨 Problem: "Invalid App ID" Error

You're getting "Invalid app ID" error even though Railway has `2700884196937447`.

This means **ONE** of these is true:

1. **App ID `2700884196937447` doesn't exist**
2. **You don't own/have access to this app**
3. **The app was deleted or disabled**

---

## Step 1: Verify You Own This Facebook App

### A. Check Your Facebook Apps

1. **Go to Facebook Developer Console**:
   ```
   https://developers.facebook.com/apps/
   ```

2. **Sign in with the account that created the app**

3. **Look for an app in your list**:
   - Do you see an app called "BuzzIt" or similar?
   - What's the App ID shown?

4. **If you DON'T see any apps OR the App ID is different**:
   - You need to CREATE a new Facebook App
   - OR find the correct App ID from an existing app

### B. Try to Access This Specific App

Try opening this URL directly:
```
https://developers.facebook.com/apps/2700884196937447/
```

**What happens?**
- ✅ App dashboard loads = You have access (go to Step 2)
- ❌ "App does not exist" error = This App ID is wrong
- ❌ "You don't have permission" = This app belongs to someone else

---

## Step 2: If App Doesn't Exist - Create New Facebook App

If you don't have access to `2700884196937447`, create a NEW app:

### A. Create Facebook App

1. **Go to**: https://developers.facebook.com/apps/

2. **Click "Create App"**

3. **Select app type**: "Consumer" or "Business"

4. **Fill in details**:
   - App Name: BuzzIt
   - App Contact Email: your email
   - (Optional) Business Account: your business account

5. **Click "Create App"**

6. **Copy the NEW App ID and App Secret** from Settings → Basic

### B. Add Facebook Login Product

1. **In your new app dashboard**, click "Add Products" (left sidebar)

2. **Find "Facebook Login"**, click "Set Up"

3. **Configure settings**:
   - Go to Facebook Login → Settings
   - Add Valid OAuth Redirect URIs:
     ```
     https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
     com.buzzit.app://oauth/callback/facebook
     ```
   - Turn ON: "Client OAuth Login"
   - Turn ON: "Web OAuth Login"
   - Click "Save Changes"

### C. Update Railway with NEW Credentials

Once you have the NEW App ID and Secret:

1. **Go to Railway dashboard**: https://railway.app

2. **Select your backend service**

3. **Go to Variables tab**

4. **Update these variables** with your NEW credentials:
   ```
   FACEBOOK_CLIENT_ID=YOUR_NEW_APP_ID
   FACEBOOK_CLIENT_SECRET=YOUR_NEW_APP_SECRET
   INSTAGRAM_CLIENT_ID=YOUR_NEW_APP_ID
   INSTAGRAM_CLIENT_SECRET=YOUR_NEW_APP_SECRET
   ```

5. **Save and wait for automatic redeployment** (1-2 minutes)

---

## Step 3: If App DOES Exist - Configure It

If you CAN access `2700884196937447`, then configure it:

### A. Add Redirect URIs

1. **Go to**: https://developers.facebook.com/apps/2700884196937447/fb-login/settings/

2. **Scroll to "Valid OAuth Redirect URIs"**

3. **Add these EXACT URLs**:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Save Changes**

### B. Enable OAuth Settings

1. **Turn ON**: "Client OAuth Login"
2. **Turn ON**: "Web OAuth Login"
3. **Save Changes**

### C. Check App Mode

1. **Look at top of dashboard**: Development or Live mode?

2. **For testing in Development mode**:
   - Go to Roles → Test Users
   - Add yourself as a test user
   - OR switch app to Live mode

---

## 🎯 Quick Decision Tree:

**Can you access https://developers.facebook.com/apps/2700884196937447/ ?**

→ **YES** = Go to Step 3 (Configure the app with redirect URIs)

→ **NO** = Go to Step 2 (Create a new Facebook App)

---

## 📸 What to Check Next:

1. **Go to**: https://developers.facebook.com/apps/

2. **Take a screenshot** of your apps list

3. **Tell me**:
   - Do you see any apps?
   - What are the App IDs shown?
   - Can you access app `2700884196937447`?

---

## ⚡ Quick Commands After Creating New App:

Once you have the correct App ID and Secret:

```bash
# Test the new credentials
cd server
node test-facebook-oauth.js

# Should show your NEW App ID
```

Then redeploy:
```bash
quick-deploy.bat
```

---

**NEXT STEP**: Go to https://developers.facebook.com/apps/ and tell me what you see!
