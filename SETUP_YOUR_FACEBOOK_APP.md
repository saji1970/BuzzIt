# Setup Your Facebook App - Specific Instructions

## ✅ Your New Facebook App Credentials:
```
App ID: 1385131833212514
App Secret: 7c9ef833260de03a7101248e24ad3aa9
```

---

## 🔧 Step 1: Configure Facebook App (Do This First!)

### A. Add Facebook Login Product (if not already added)

1. **Open your Facebook app dashboard**:
   ```
   https://developers.facebook.com/apps/1385131833212514/
   ```

2. **In left sidebar**, look for "Add Products" or "Products"

3. **Find "Facebook Login"**:
   - If you see "Set Up" → Click it
   - If you see "Settings" → It's already added, go to next step

### B. Configure Redirect URIs (CRITICAL!)

1. **Go to Facebook Login Settings**:
   ```
   https://developers.facebook.com/apps/1385131833212514/fb-login/settings/
   ```

2. **Scroll to "Valid OAuth Redirect URIs"**

3. **Add these TWO exact URLs** (copy-paste):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Enable these settings**:
   - ✅ Turn ON: **"Client OAuth Login"**
   - ✅ Turn ON: **"Web OAuth Login"**
   - ❌ Turn OFF: **"Use Strict Mode for Redirect URIs"** (optional, makes testing easier)

5. **Click "Save Changes"** at the bottom of the page

6. **WAIT 1-2 MINUTES** for Facebook changes to propagate

---

## 🚂 Step 2: Update Railway Environment Variables

### A. Go to Railway Dashboard

1. **Open**: https://railway.app

2. **Sign in** and select your BuzzIt project

3. **Click on your backend service** (the one running server/index.js)

4. **Click "Variables" tab**

### B. Update These 4 Variables

**FACEBOOK_CLIENT_ID**:
- Current value: `2700884196937447` ❌
- **New value**: `1385131833212514` ✅
- Click variable → Edit → Paste → Save

**FACEBOOK_CLIENT_SECRET**:
- Current value: `eebbddf0eb205a3af394e2cdc62ae131` ❌
- **New value**: `7c9ef833260de03a7101248e24ad3aa9` ✅
- Click variable → Edit → Paste → Save

**INSTAGRAM_CLIENT_ID**:
- Current value: `1393033811657781` ❌
- **New value**: `1385131833212514` ✅
- Click variable → Edit → Paste → Save

**INSTAGRAM_CLIENT_SECRET**:
- Current value: `8feb4f68ca96a05a075bea39aa214451` ❌
- **New value**: `7c9ef833260de03a7101248e24ad3aa9` ✅
- Click variable → Edit → Paste → Save

### C. Wait for Deployment

1. **Railway will automatically redeploy** after you save

2. **Go to "Deployments" tab**

3. **Wait for status**: ✅ **"Active"** (usually 1-2 minutes)

---

## 🧪 Step 3: Test OAuth URL in Browser

After Railway redeploys, test the OAuth URL:

### Test URL:
```
https://www.facebook.com/v18.0/dialog/oauth?client_id=1385131833212514&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test
```

### What You Should See:
- ✅ Facebook login page with your app name
- ✅ "BuzzIt is requesting access to your profile"
- ✅ Option to "Continue" or "Cancel"

### If You See Errors:
- **"Invalid Redirect URI"**: Go back to Step 1B, check redirect URIs are added exactly
- **"Invalid App ID"**: Double-check Railway variables in Step 2B
- **"App Not Set Up"**: Make sure Facebook Login product is added (Step 1A)

---

## 📱 Step 4: Test from Mobile App

After Railway redeploys and browser test succeeds:

### A. Clear App Data (Recommended)
```batch
adb shell pm clear com.buzzit.app
```

### B. Redeploy App
```batch
quick-deploy.bat
```

### C. Test OAuth Flow

1. **Open the app on your device**

2. **Navigate to**: Profile/Settings → Privacy & Social Media

3. **Tap "Connect" next to Facebook**

4. **Expected Flow**:
   ```
   App → Browser Opens → Facebook Login Page →
   Enter Credentials → Grant Permissions →
   Redirect to Backend → Deep Link to App →
   ✅ Shows "Connected" Status
   ```

5. **Check Status**: Should show "Connected" with your Facebook name/profile

---

## 🎯 Quick Verification Checklist:

### Before Testing from App:

- [ ] Added redirect URI: `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback`
- [ ] Added redirect URI: `com.buzzit.app://oauth/callback/facebook`
- [ ] Turned ON: "Client OAuth Login"
- [ ] Turned ON: "Web OAuth Login"
- [ ] Clicked "Save Changes" in Facebook app
- [ ] Updated `FACEBOOK_CLIENT_ID` to `1385131833212514` in Railway
- [ ] Updated `FACEBOOK_CLIENT_SECRET` to `7c9ef833260de03a7101248e24ad3aa9` in Railway
- [ ] Updated `INSTAGRAM_CLIENT_ID` to `1385131833212514` in Railway
- [ ] Updated `INSTAGRAM_CLIENT_SECRET` to `7c9ef833260de03a7101248e24ad3aa9` in Railway
- [ ] Waited for Railway deployment to complete (Status: Active)
- [ ] Waited 1-2 minutes for Facebook changes to propagate
- [ ] Tested OAuth URL in browser - saw Facebook login page (not error)

---

## 🔗 Quick Links:

**Your Facebook App Dashboard**:
https://developers.facebook.com/apps/1385131833212514/

**Facebook Login Settings**:
https://developers.facebook.com/apps/1385131833212514/fb-login/settings/

**Railway Dashboard**:
https://railway.app

**Test OAuth URL**:
https://www.facebook.com/v18.0/dialog/oauth?client_id=1385131833212514&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test

---

## ⚠️ IMPORTANT SECURITY NOTE:

These credentials are now visible in this file. After testing:
1. DO NOT commit this file to public repositories
2. DO NOT share these credentials publicly
3. Keep them secure in Railway environment variables only

---

## 📞 Next Steps:

1. **First**: Configure Facebook app redirect URIs (Step 1)
2. **Second**: Update Railway variables (Step 2)
3. **Third**: Wait for deployment (usually 1-2 minutes)
4. **Fourth**: Test OAuth URL in browser (Step 3)
5. **Finally**: Test from mobile app (Step 4)

**Estimated total time**: 5-10 minutes

---

**Ready to start? Begin with Step 1!**
