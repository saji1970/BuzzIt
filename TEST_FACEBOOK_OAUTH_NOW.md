# 🚀 Test Facebook OAuth Now - Quick Start Guide

## ✅ Status: Backend Ready for Testing!

Your backend OAuth configuration is **WORKING** and ready to test. Here's what you need to do:

---

## 🎯 Step 1: Configure Facebook App (5 minutes)

### Add Redirect URIs to Your Facebook App

1. **Open Facebook Developer Console**:
   ```
   https://developers.facebook.com/apps/1393033811657781/fb-login/settings/
   ```

2. **Scroll to "Valid OAuth Redirect URIs"**

3. **Add these TWO redirect URIs** (copy-paste exactly):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Click "Save Changes"** at the bottom

5. **Enable Facebook Login** (if not already enabled):
   - Go to: https://developers.facebook.com/apps/1393033811657781/
   - Click "Add Products" → Find "Facebook Login" → Click "Set Up"
   - Turn ON: "Client OAuth Login" and "Web OAuth Login"

---

## 🧪 Step 2: Test OAuth Flow (Choose One)

### Option A: Test in Web Browser (Quickest)

1. **Copy this URL**:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?client_id=1393033811657781&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test
   ```

2. **Open in Browser** (Chrome/Edge/Firefox)

3. **Expected Results**:
   - ✅ You see Facebook login page
   - ✅ After login, you see permission dialog
   - ✅ After clicking "Continue", it redirects to callback URL
   - ⚠️ Error 401/403 is OKAY (it means OAuth URL is working, just no valid user token)

4. **Common Errors**:
   - **"Invalid Redirect URI"** → Go back to Step 1, make sure you saved the redirect URI
   - **"App Not Setup"** → Enable Facebook Login product in Step 1
   - **"App in Development Mode"** → Normal, continue to mobile testing

### Option B: Test from Mobile App (Complete Flow)

1. **Deploy App to Device/Emulator**:
   ```bash
   cd android
   gradlew.bat installDebug
   ```
   Or use the provided test script:
   ```bash
   test-mobile-oauth.bat
   ```

2. **Open BuzzIt App**

3. **Navigate**:
   - Tap your profile icon
   - Go to **Settings**
   - Tap **Privacy & Social Media**

4. **Connect Facebook**:
   - Tap the **"Connect"** button next to Facebook
   - App will open browser with Facebook login

5. **Expected Flow**:
   ```
   App → Browser → Facebook Login → Permission Screen →
   Callback → Backend → Deep Link back to App → "Connected" Status
   ```

6. **Verify Connection**:
   - Facebook icon should show **green checkmark** or "Connected"
   - You should see your Facebook profile name

---

## 📱 Step 3: Test Publishing (Optional)

Once connected, test posting to Facebook:

1. **Create a Buzz**:
   - Tap the **"+"** button
   - Enter some text
   - Optionally add a photo

2. **Select Facebook Platform**:
   - Before posting, you should see social platform icons
   - Tap **Facebook** icon to enable

3. **Post**:
   - Tap **"Create Buzz"**
   - Wait for confirmation

4. **Verify**:
   - Check your Facebook profile to see if the post appeared

---

## 🔧 Troubleshooting

### Issue: "Invalid Redirect URI" in Browser

**Solution**:
1. Double-check you added BOTH redirect URIs in Step 1
2. Make sure there are no extra spaces
3. Click "Save Changes" and wait 1-2 minutes
4. Try the OAuth URL again

### Issue: Browser Test Works, but Mobile App Doesn't

**Solution**:
1. Check that app is installed: `adb shell pm list packages | findstr buzzit`
2. Test deep link manually:
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "com.buzzit.app://oauth/callback/facebook?code=test"
   ```
3. Check logs:
   ```bash
   adb logcat | findstr "DeepLink OAuth facebook"
   ```

### Issue: "Facebook is not connected" Error

**Solution**:
1. Verify backend can save connections:
   - Open: https://buzzit-production.up.railway.app/api/debug/env
   - Check `hasDatabase: true`
2. Check Railway logs for database errors
3. Try reconnecting Facebook

### Issue: App Opens Browser but Gets Stuck

**Solution**:
1. Make sure you clicked "Continue" on Facebook permission screen
2. Check if redirect URI is correct in Facebook App settings
3. Verify deep linking works (use test script Option B)
4. Check app logs for errors

### Issue: "App in Development Mode" Warning

**Solution**:
- **Option 1** (Quick): Add yourself as a test user
  - Go to: https://developers.facebook.com/apps/1393033811657781/roles/test-users/
  - Click "Add Test Users"
  - Test with test user account

- **Option 2** (Permanent): Switch to Live Mode
  - Requires App Review for advanced permissions
  - Basic login will work immediately
  - Advanced features (posting) require approval

---

## ✨ What's Already Configured

✅ **Backend**:
- OAuth URL generation endpoint: Working
- OAuth callback endpoint: Working
- Database schema: Fixed and deployed
- Environment variables: Configured on Railway
- Social auth routes: Loaded successfully

✅ **Mobile App**:
- Deep linking: Configured in AndroidManifest.xml
- OAuth handler: Implemented in DeepLinkingHandler.ts
- Social media service: Fully implemented
- Privacy settings screen: Has Facebook connect button
- API integration: Connected to Railway backend

✅ **iOS** (if needed):
- Deep linking scheme: `com.buzzit.app`
- Configured in Info.plist

---

## 📋 Quick Testing Checklist

Before testing:
- [ ] Added redirect URIs to Facebook App (Step 1)
- [ ] Saved changes in Facebook Developer Console
- [ ] Waited 1-2 minutes for changes to propagate

For browser test:
- [ ] Opened OAuth URL in browser
- [ ] Saw Facebook login page
- [ ] Got redirected to callback URL

For mobile test:
- [ ] App installed on device/emulator
- [ ] Opened app and navigated to Privacy & Social
- [ ] Tapped "Connect" on Facebook
- [ ] Browser opened with Facebook login
- [ ] After login, app showed "Connected" status

---

## 🎉 Success Indicators

You'll know it's working when:

1. **Browser Test**:
   - Facebook login page appears
   - No "Invalid Redirect URI" error
   - Redirects to your backend callback URL

2. **Mobile Test**:
   - Facebook connect button changes to "Connected"
   - Green checkmark appears next to Facebook icon
   - Your Facebook name shows up

3. **Publishing Test**:
   - Post appears on your Facebook profile
   - No "token expired" or "not connected" errors

---

## 📞 Support

If you encounter issues:

1. **Check Backend Status**:
   ```
   https://buzzit-production.up.railway.app/api/debug/env
   ```
   Should show `hasFacebookClientId: true`

2. **Test OAuth Endpoint**:
   - Use the test script: `cd server && node test-facebook-oauth.js`
   - Should pass all checks

3. **Check Railway Logs**:
   - Go to Railway dashboard
   - Check deployment logs for errors
   - Look for "Social media routes loaded" message

4. **Review Files**:
   - Backend guide: `FACEBOOK_OAUTH_SETUP_GUIDE.md`
   - Test script: `test-mobile-oauth.bat`

---

## 🔗 Useful Links

- **Facebook App Dashboard**: https://developers.facebook.com/apps/1393033811657781/
- **OAuth Settings**: https://developers.facebook.com/apps/1393033811657781/fb-login/settings/
- **Test Users**: https://developers.facebook.com/apps/1393033811657781/roles/test-users/
- **Railway Backend**: https://buzzit-production.up.railway.app
- **Debug Endpoint**: https://buzzit-production.up.railway.app/api/debug/env

---

**Ready to test?** Start with Step 1 and follow the browser test (Option A) - it's the quickest way to verify everything is working!

**Last Updated**: Backend tested and confirmed working ✅
