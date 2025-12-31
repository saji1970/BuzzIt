# Facebook "INVALID_APP_ID" Error - Fix Guide

## 🚨 Error Found in Logs:
```
error_code=PLATFORM__INVALID_APP_ID
```

Facebook is rejecting your OAuth request. Here's how to fix it:

---

## ✅ Solution Steps:

### Step 1: Verify Your Facebook App Exists

1. **Go to Facebook Developer Console**:
   ```
   https://developers.facebook.com/apps/
   ```

2. **Check if App ID `1393033811657781` exists**:
   - Look for an app with this ID in your apps list
   - If you don't see it, you need to create a new app OR use the correct App ID

3. **If app doesn't exist**, create a new one:
   - Click **"Create App"**
   - Select **"Consumer"** or **"Business"** type
   - Enter app name (e.g., "BuzzIt")
   - Click **"Create App"**
   - Copy the new App ID and App Secret

---

### Step 2: Update Railway Environment Variables (If App ID Changed)

If you created a new app or need to use a different App ID:

1. **Go to Railway Dashboard**:
   ```
   https://railway.app
   ```

2. **Select your backend service**

3. **Go to Variables tab**

4. **Update these variables** with your correct App ID and Secret:
   ```
   FACEBOOK_CLIENT_ID=YOUR_ACTUAL_APP_ID
   FACEBOOK_CLIENT_SECRET=YOUR_ACTUAL_APP_SECRET
   ```

5. **Save** and wait for automatic redeployment

---

### Step 3: Configure Facebook App Settings (CRITICAL)

Even if the App ID is correct, you MUST configure these settings:

#### A. Add OAuth Redirect URIs

1. **Go to your app settings**:
   ```
   https://developers.facebook.com/apps/YOUR_APP_ID/fb-login/settings/
   ```
   (Replace YOUR_APP_ID with your actual App ID)

2. **Find "Valid OAuth Redirect URIs"**

3. **Add these EXACT URLs** (no typos, case-sensitive):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Click "Save Changes"**

5. **Wait 1-2 minutes** for changes to propagate

#### B. Enable Facebook Login Product

1. **Go to your app dashboard**:
   ```
   https://developers.facebook.com/apps/YOUR_APP_ID/
   ```

2. **Click "Add Products" in left sidebar**

3. **Find "Facebook Login"** and click **"Set Up"**

4. **Configure settings**:
   - Turn ON: **"Client OAuth Login"**
   - Turn ON: **"Web OAuth Login"**
   - Turn OFF: **"Use Strict Mode for Redirect URIs"** (for development)

5. **Click "Save Changes"**

#### C. Set App Mode

1. **Look at top of Facebook App Dashboard**

2. **Check current mode**:
   - **Development Mode**: Only test users can authenticate
   - **Live Mode**: Anyone can authenticate (requires App Review for advanced permissions)

3. **For Testing** - Use Development Mode:
   - Go to **Roles → Test Users**
   - Click **"Add Test Users"**
   - Use test user to login

4. **For Production** - Switch to Live Mode:
   - App Review required for permissions like `pages_manage_posts`
   - Basic login works immediately

---

### Step 4: Verify Configuration

#### Test OAuth URL Manually:

1. **Open this URL in Chrome** (replace YOUR_APP_ID if changed):
   ```
   https://www.facebook.com/v18.0/dialog/oauth?client_id=1393033811657781&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test
   ```

2. **Expected Results**:
   - ✅ You see Facebook login page (NOT an error page)
   - ✅ After login, shows permission request
   - ✅ After clicking "Continue", redirects to your callback URL

3. **If you still see error**:
   - Double-check App ID is correct
   - Verify redirect URI is added exactly as shown
   - Make sure Facebook Login product is enabled

---

## 🧪 Quick Test Checklist:

- [ ] Facebook App ID `1393033811657781` exists in your Developer Console
- [ ] You have access to this app (you're the owner/admin)
- [ ] Facebook Login product is added to the app
- [ ] "Client OAuth Login" is turned ON
- [ ] "Web OAuth Login" is turned ON
- [ ] Redirect URI `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback` is added
- [ ] Redirect URI `com.buzzit.app://oauth/callback/facebook` is added
- [ ] Changes are saved
- [ ] Waited 1-2 minutes after saving
- [ ] Tested OAuth URL in browser - no "Invalid App ID" error

---

## 🔍 How to Find Your Correct Facebook App ID:

1. Go to: https://developers.facebook.com/apps/
2. Click on your app
3. Go to **Settings → Basic**
4. Look for **"App ID"** at the top
5. Copy this ID
6. Update Railway environment variables if different from `1393033811657781`

---

## 📱 After Fixing:

1. **Clear app data** (optional but recommended):
   ```bash
   adb shell pm clear com.buzzit.app
   ```

2. **Restart app**

3. **Try connecting Facebook again**:
   - Go to Settings → Privacy & Social Media
   - Tap "Connect" on Facebook
   - Should now open Facebook login (not error page)
   - Complete login
   - Grant permissions
   - Redirects back to app
   - Shows "Connected" status

---

## ⚠️ Common Mistakes:

1. **Wrong App ID**: Using someone else's App ID or an ID that doesn't exist
2. **Redirect URI typos**: Even ONE character wrong will cause "Invalid Redirect URI" error
3. **Facebook Login not enabled**: Product must be added to app
4. **OAuth settings not turned on**: "Client OAuth Login" must be ON
5. **App in Review mode**: Can't test until app is approved (use test users instead)

---

## 🆘 Still Not Working?

### Check Railway Logs:

```bash
# View Railway logs in dashboard
# Look for: "Social media routes loaded"
# Check for any error messages
```

### Check if you own the Facebook App:

The App ID `1393033811657781` might belong to someone else. You need to either:
1. Get access to this app from the owner, OR
2. Create your own Facebook App and use that App ID

---

## 📞 Need Help?

If you're still stuck:
1. Share screenshot of your Facebook App settings page
2. Confirm you can see App ID `1393033811657781` in your apps list
3. Share error message from Facebook (if different)
4. Check Railway environment variables are correct

---

**Most likely fix**: Add the redirect URIs to your Facebook App settings (Step 3A above)
