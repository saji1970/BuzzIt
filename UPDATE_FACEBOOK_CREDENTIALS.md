# Update Facebook OAuth Credentials - Step by Step

## ✅ Your Correct Facebook App Credentials:
```
App ID: 2700884196937447
App Secret: eebbddf0eb205a3af394e2cdc62ae131
```

---

## Step 1: Update Railway Environment Variables (CRITICAL - Do This First!)

### A. Go to Railway Dashboard

1. **Open**: https://railway.app
2. **Sign in** to your account
3. **Select your project** (BuzzIt backend)
4. **Click on your backend service** (the one running server/index.js)

### B. Update Environment Variables

1. **Click on the "Variables" tab**

2. **Find and UPDATE these variables**:

   **FACEBOOK_CLIENT_ID**:
   - Current value: `1393033811657781` ❌ (Wrong!)
   - New value: `2700884196937447` ✅ (Correct!)
   - Click the variable → Edit → Paste new value → Save

   **FACEBOOK_CLIENT_SECRET**:
   - Current value: `8feb4f68ca96a05a075bea39aa214451` ❌ (Wrong!)
   - New value: `eebbddf0eb205a3af394e2cdc62ae131` ✅ (Correct!)
   - Click the variable → Edit → Paste new value → Save

   **INSTAGRAM_CLIENT_ID**:
   - Instagram uses the SAME Facebook App
   - Update to: `2700884196937447`

   **INSTAGRAM_CLIENT_SECRET**:
   - Update to: `eebbddf0eb205a3af394e2cdc62ae131`

3. **Save changes**

4. **Railway will automatically redeploy** (wait 1-2 minutes)

---

## Step 2: Configure Your Facebook App

### A. Add OAuth Redirect URIs

1. **Go to your Facebook App settings**:
   ```
   https://developers.facebook.com/apps/2700884196937447/fb-login/settings/
   ```

2. **Scroll down to "Valid OAuth Redirect URIs"**

3. **Add these TWO redirect URIs** (copy-paste exactly):
   ```
   https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback
   com.buzzit.app://oauth/callback/facebook
   ```

4. **Click "Save Changes"** at the bottom

### B. Enable OAuth Settings

1. **On the same page**, find these settings:
   - ✅ Turn ON: **"Client OAuth Login"**
   - ✅ Turn ON: **"Web OAuth Login"**
   - Turn OFF: **"Use Strict Mode for Redirect URIs"** (optional, for easier testing)

2. **Click "Save Changes"**

### C. Enable Facebook Login Product (If Not Already)

1. **Go to your app dashboard**:
   ```
   https://developers.facebook.com/apps/2700884196937447/
   ```

2. **Check if "Facebook Login" is in the Products list**

3. **If NOT**, add it:
   - Click **"Add Products"** in left sidebar
   - Find **"Facebook Login"**
   - Click **"Set Up"**

### D. Add Instagram Product (For Instagram OAuth)

1. **Go to Products → Add Products**

2. **Find "Instagram"** and click **"Set Up"**

3. **Choose "Instagram Graph API"** (for publishing)

4. **Configure Instagram settings**:
   - Add same redirect URIs for Instagram
   - Enable necessary permissions

---

## Step 3: Wait for Railway Deployment

1. **Go back to Railway dashboard**

2. **Check "Deployments" tab**

3. **Wait for status**: "Active" ✅

4. **This usually takes 1-2 minutes**

5. **Once deployed, verify**:
   - Open: https://buzzit-production.up.railway.app/api/debug/env
   - Check: `hasFacebookClientId: true`
   - (The actual App ID won't be shown for security, but it confirms it's set)

---

## Step 4: Verify OAuth URL (Test Backend)

After Railway redeploys, test the OAuth URL:

1. **Run test script**:
   ```bash
   cd server
   node test-facebook-oauth.js
   ```

2. **Expected Output**:
   ```
   ✅ OAuth URL endpoint responded successfully!
   Client ID: 2700884196937447
   ```

3. **Test URL manually** - Open this in Chrome:
   ```
   https://www.facebook.com/v18.0/dialog/oauth?client_id=2700884196937447&redirect_uri=https%3A%2F%2Fbuzzit-production.up.railway.app%2Fapi%2Fsocial-auth%2Foauth%2Ffacebook%2Fcallback&scope=email%2Cpublic_profile&response_type=code&state=test
   ```

4. **You should see**:
   - ✅ Facebook login page (NOT an error!)
   - ✅ No "Invalid App ID" error

---

## Step 5: Test from Mobile App

1. **Clear app data** (recommended):
   ```bash
   adb shell pm clear com.buzzit.app
   ```

2. **Restart app**

3. **Navigate to**: Profile → Settings → Privacy & Social Media

4. **Tap "Connect" next to Facebook**

5. **Expected Flow**:
   ```
   App → Browser Opens → Facebook Login Page →
   Enter Credentials → Grant Permissions →
   Redirect to Backend → Deep Link to App →
   ✅ Shows "Connected" Status
   ```

---

## 🎯 Quick Verification Checklist:

Before testing from app, verify:

- [ ] Updated `FACEBOOK_CLIENT_ID` to `2700884196937447` in Railway
- [ ] Updated `FACEBOOK_CLIENT_SECRET` to `eebbddf0eb205a3af394e2cdc62ae131` in Railway
- [ ] Updated `INSTAGRAM_CLIENT_ID` to `2700884196937447` in Railway
- [ ] Updated `INSTAGRAM_CLIENT_SECRET` to `eebbddf0eb205a3af394e2cdc62ae131` in Railway
- [ ] Railway deployment completed (Status: Active)
- [ ] Added redirect URI `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/callback` to Facebook App
- [ ] Added redirect URI `com.buzzit.app://oauth/callback/facebook` to Facebook App
- [ ] Saved changes in Facebook App settings
- [ ] Waited 1-2 minutes for Facebook changes to propagate
- [ ] "Client OAuth Login" is turned ON
- [ ] "Web OAuth Login" is turned ON
- [ ] Facebook Login product is enabled

---

## 🔧 Railway Variable Update Commands (Alternative Method)

If you prefer using Railway CLI:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Update variables
railway variables set FACEBOOK_CLIENT_ID=2700884196937447
railway variables set FACEBOOK_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131
railway variables set INSTAGRAM_CLIENT_ID=2700884196937447
railway variables set INSTAGRAM_CLIENT_SECRET=eebbddf0eb205a3af394e2cdc62ae131

# Check deployment
railway status
```

---

## 📸 Screenshots to Take (For Verification):

1. **Railway Variables Page**: Showing updated FACEBOOK_CLIENT_ID
2. **Facebook App Settings**: Showing redirect URIs added
3. **Facebook Login Page**: When testing OAuth URL (no error)

---

## ⚠️ Important Notes:

1. **DO NOT share these credentials publicly** - They're sensitive!
2. **Instagram uses the same Facebook App** - No need for separate app
3. **Test users** - If app is in Development mode, add test users or switch to Live mode
4. **Permissions** - Advanced permissions like `pages_manage_posts` require App Review

---

## 🎉 Success Indicators:

You'll know it's working when:

1. **Browser test**: OAuth URL opens Facebook login (no "Invalid App ID" error)
2. **Mobile test**: App shows "Connected" after completing Facebook login
3. **Backend logs**: No "OAuth not configured" errors
4. **Test script**: Shows correct App ID `2700884196937447`

---

## 📞 Next Steps After Update:

1. Update Railway (Step 1)
2. Configure Facebook App (Step 2)
3. Wait for deployment (Step 3)
4. Run test script (Step 4)
5. Test from mobile app (Step 5)

**Estimated time**: 5-10 minutes total

---

**Ready?** Start with Step 1 - Update Railway variables!
