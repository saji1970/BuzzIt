# Facebook OAuth Setup & Testing Guide

## ✅ Current Status
- Backend OAuth configuration: **WORKING**
- Environment variables: **CONFIGURED**
- OAuth URL generation: **TESTED & PASSED**

## Step 1: Configure Facebook App (Required Before Testing)

### A. Add Valid OAuth Redirect URIs

1. **Go to Facebook Developer Console**:
   - Open: https://developers.facebook.com/apps/1393033811657781/fb-login/settings/
   - (You may need to log in with your Facebook developer account)

2. **Find "Valid OAuth Redirect URIs" Section**:
   - Scroll down to find this setting
   - Click "Edit" if needed

3. **Add These Redirect URIs**:
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

   **Why two URIs?**
   - First one: Web callback (for testing in browser)
   - Second one: Mobile deep link (for your React Native app)

4. **Save Changes**:
   - Click "Save Changes" button at the bottom
   - Wait for confirmation message

### B. Verify App Permissions

1. **Go to App Settings**:
   - Open: https://developers.facebook.com/apps/1393033811657781/settings/basic/

2. **Check App Mode**:
   - Look for "App Mode" at the top
   - **If Development Mode**: You can only test with test users
   - **If Live Mode**: Anyone can use OAuth

3. **Add Required Permissions** (if not already added):
   - Go to: https://developers.facebook.com/apps/1393033811657781/app-review/permissions/
   - Ensure these permissions are available:
     - ✅ `email` (usually approved by default)
     - ✅ `public_profile` (usually approved by default)
     - ⚠️ `pages_manage_posts` (requires App Review)
     - ⚠️ `pages_read_engagement` (requires App Review)
     - ⚠️ `instagram_basic` (requires App Review)
     - ⚠️ `instagram_content_publish` (requires App Review)

4. **For Development Testing**:
   - If permissions marked with ⚠️ are not approved yet:
   - Go to: https://developers.facebook.com/apps/1393033811657781/roles/test-users/
   - Add test users to test the OAuth flow
   - Test users can access all permissions without App Review

### C. Enable Facebook Login Product

1. **Go to Products**:
   - Open: https://developers.facebook.com/apps/1393033811657781/
   - Look for "Products" in the left sidebar

2. **Add Facebook Login** (if not already added):
   - Click "+ Add Products"
   - Find "Facebook Login"
   - Click "Set Up"

3. **Configure Settings**:
   - Client OAuth Login: **ON**
   - Web OAuth Login: **ON**
   - Use Strict Mode for Redirect URIs: **OFF** (for development)

---

## Step 2: Test OAuth Flow in Browser

### Quick Test:

1. **Copy this OAuth URL**:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?client_id=1393033811657781&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile%2Cpages_manage_posts%2Cpages_read_engagement%2Cinstagram_basic%2Cinstagram_content_publish&response_type=code&state=test
   ```

2. **Open in Browser**:
   - Paste the URL in Chrome/Edge/Firefox
   - You should see Facebook login page

3. **Expected Behavior**:
   - ✅ Facebook login page appears
   - ✅ Shows permissions being requested
   - ✅ After clicking "Continue", redirects to your callback URL
   - ❌ Error 401 or "Invalid token" is EXPECTED (because no real user token was provided)

4. **Common Errors**:
   - **"Invalid Redirect URI"**: You haven't added the redirect URI to Facebook App settings (go back to Step 1A)
   - **"App Not Setup"**: Facebook Login product not enabled (go to Step 1C)
   - **"App in Development Mode"**: You need to use a test user or switch to Live mode

---

## Step 3: Test OAuth Flow from Mobile App

### A. Verify Deep Linking Configuration

Your app needs to handle the OAuth callback. Check these files:

**1. AndroidManifest.xml**:
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.buzzit.app" android:host="oauth" />
</intent-filter>
```

**2. iOS Info.plist**:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.buzzit.app</string>
        </array>
    </dict>
</array>
```

### B. Test from Mobile App

1. **Open BuzzIt App** on your device/emulator

2. **Navigate to Settings**:
   - Go to: Profile → Settings → Privacy & Social Media

3. **Connect Facebook**:
   - Tap "Connect" button next to Facebook icon
   - App should open Facebook login in browser

4. **Expected Flow**:
   ```
   Mobile App → Opens Browser → Facebook Login →
   User Authorizes → Redirects to Callback →
   Backend Processes → Redirects to App → Connection Success
   ```

5. **Check Connection Status**:
   - After redirecting back to app
   - Facebook icon should show "Connected" status
   - You should see your Facebook profile name

### C. Troubleshooting Mobile App

**Issue: Browser opens but shows error**
- Check redirect URI in Facebook App settings
- Verify deep linking is configured

**Issue: Stuck on "Connecting..." after authorization**
- Check Railway backend logs
- Verify OAuth callback endpoint is accessible
- Test backend callback manually (see Step 4)

**Issue: Returns to app but shows "Connection Failed"**
- Check if user has required permissions
- Verify Facebook token exchange is working
- Check database connection for saving tokens

---

## Step 4: Manual Backend Testing

### Test OAuth Callback Endpoint

You can manually test the callback by simulating what Facebook sends:

```bash
# This will fail with "Invalid code" but confirms endpoint is accessible
curl -X POST https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -d '{"code": "test_code", "state": "test_state"}'
```

**Expected Response**:
- Status 500 with error about invalid code (this is OK - it means endpoint is working)

### Check Connected Accounts

After successful OAuth, verify it's saved:

```bash
curl https://buzzit-production.up.railway.app/api/social-auth/connected \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "accounts": [
    {
      "platform": "facebook",
      "username": "Your Facebook Name",
      "isConnected": true,
      "connectedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Step 5: Test Publishing to Facebook

Once connected, test posting:

1. **Create a Buzz in the app**
2. **Select Facebook as publish platform**
3. **Create the buzz**
4. **Check your Facebook page** to see if it posted

### Or Test via API:

```bash
curl -X POST https://buzzit-production.up.railway.app/api/social-share/facebook/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "content": "Test post from BuzzIt!",
    "mediaUrl": "https://example.com/image.jpg"
  }'
```

---

## Common Issues & Solutions

### Issue: "Invalid Redirect URI" Error

**Solution**:
1. Go to Facebook App Settings → Facebook Login → Settings
2. Add exact redirect URI (case-sensitive, must match exactly):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   ```
3. Save and wait 1-2 minutes for changes to propagate

### Issue: "App Not Setup" Error

**Solution**:
1. Go to Facebook App Dashboard
2. Add "Facebook Login" product if not added
3. Enable Client OAuth Login and Web OAuth Login

### Issue: "Insufficient Permissions" Error

**Solution**:
1. If in Development Mode: Add yourself as a test user
2. If in Live Mode: Submit for App Review to get required permissions approved
3. Or reduce requested permissions in code (remove advanced permissions)

### Issue: App in Development Mode

**Solution**:
- **Option A**: Add test users and test with them
- **Option B**: Switch app to Live mode (requires App Review for advanced permissions)

### Issue: OAuth Works in Browser but Not in Mobile App

**Solution**:
1. Check deep linking configuration (AndroidManifest.xml / Info.plist)
2. Verify mobile redirect URI is added to Facebook App
3. Test deep link manually: `adb shell am start -a android.intent.action.VIEW -d "com.buzzit.app://oauth/callback/facebook?code=test"`

---

## Verification Checklist

Before testing, make sure:

- [ ] Facebook App ID and Secret are set in Railway
- [ ] Redirect URIs added to Facebook App settings
- [ ] Facebook Login product is enabled
- [ ] Deep linking configured in mobile app
- [ ] App is either in Live mode OR you're using test users
- [ ] Backend endpoints are accessible (test with curl)
- [ ] Database is connected (check Railway logs)

---

## Next Steps

1. **Complete Step 1**: Configure Facebook App settings
2. **Run Step 2**: Test in browser first (easier to debug)
3. **Run Step 3**: Test from mobile app
4. **Run Step 5**: Test posting to Facebook

If you encounter any errors, check the specific error message against the "Common Issues & Solutions" section.

---

## Support Links

- **Facebook Developer Dashboard**: https://developers.facebook.com/apps/1393033811657781/
- **OAuth Settings**: https://developers.facebook.com/apps/1393033811657781/fb-login/settings/
- **Test Users**: https://developers.facebook.com/apps/1393033811657781/roles/test-users/
- **App Review**: https://developers.facebook.com/apps/1393033811657781/app-review/

---

**Last Updated**: Test completed successfully on Railway deployment
**Status**: ✅ Backend ready, awaiting Facebook App configuration
