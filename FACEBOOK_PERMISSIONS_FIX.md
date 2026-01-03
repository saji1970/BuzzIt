# Fix: "This app needs at least one supported permission"

This error occurs when your Facebook app doesn't have permissions properly configured. Follow these steps to fix it.

---

## Quick Fix Steps

### Step 1: Add Facebook Login Product

1. Go to your Facebook App Dashboard: https://developers.facebook.com/apps/
2. Select your BuzzIt app
3. In the left sidebar, look for **"Add Products"** or **"Products"**
4. Find **"Facebook Login"** and click **"Set Up"**
5. Choose **"Settings"** under Facebook Login

### Step 2: Configure Facebook Login Settings

In the Facebook Login → Settings page:

1. **Valid OAuth Redirect URIs** - Add your redirect URLs:
   ```
   https://your-railway-domain.up.railway.app/oauth/facebook/callback
   https://your-railway-domain.up.railway.app/api/social-auth/facebook/callback
   http://localhost:3000/oauth/facebook/callback (for testing)
   ```

2. **Client OAuth Login** - Set to **YES**

3. **Web OAuth Login** - Set to **YES**

4. **Use Strict Mode for Redirect URIs** - Set to **YES**

5. Click **"Save Changes"**

### Step 3: Request Basic Permissions

1. In the left sidebar, go to **"App Review"** → **"Permissions and Features"**

2. Look for these permissions and click **"Request Advanced Access"** for each:
   - **email** - Click "Request Advanced Access" → "Get Advanced Access"
   - **public_profile** - Click "Request Advanced Access" → "Get Advanced Access"

3. You should see them marked as "Advanced Access" (green checkmark)

**Note**: `email` and `public_profile` are considered "basic permissions" and don't require App Review. You can get Advanced Access immediately.

### Step 4: Add App Settings

1. Go to **"Settings"** → **"Basic"**

2. Fill in all required fields:
   - **App Name**: BuzzIt
   - **App Domains**: Add your domain without `https://`
     ```
     your-railway-domain.up.railway.app
     ```
   - **Privacy Policy URL**:
     ```
     https://your-railway-domain.up.railway.app/privacy-policy.html
     ```
   - **User Data Deletion**:
     ```
     https://your-railway-domain.up.railway.app/api/facebook-data-deletion
     ```
   - **App Icon**: Upload your 1024x1024 icon

3. Click **"Save Changes"**

### Step 5: Add Test Users (Optional)

If your app is in Development mode, you can add test users:

1. Go to **"Roles"** → **"Test Users"**
2. Click **"Add"** to create test users
3. Use these test accounts to test Facebook login

Alternatively, add your Facebook account as a tester:

1. Go to **"Roles"** → **"Roles"**
2. Under **"Developers"** or **"Testers"**, add your Facebook account

### Step 6: Check App Mode

1. In the top-right corner of the dashboard, check the app mode toggle
2. You should see **"Development"** or **"Live"**

**Development Mode**: Only test users, developers, and admins can use the app
**Live Mode**: Anyone can use the app (requires App Review for most permissions)

For testing, stay in **Development Mode** and add yourself as a tester.

---

## Detailed Permission Configuration

### Understanding Permission Levels

Facebook has three levels of access:

1. **Standard Access** (Default) - Limited functionality, can only be used by app developers
2. **Advanced Access** - Full functionality without review (for basic permissions like email, public_profile)
3. **Requires App Review** - For sensitive permissions (like user_posts, user_photos)

### Get Advanced Access for Basic Permissions

`email` and `public_profile` can get Advanced Access immediately:

1. **App Review** → **Permissions and Features**
2. Find **"email"**:
   - Click **"Request Advanced Access"**
   - Click **"Get Advanced Access"** (no review needed)
   - Should show green checkmark with "Advanced Access"

3. Find **"public_profile"**:
   - Click **"Request Advanced Access"**
   - Click **"Get Advanced Access"** (no review needed)
   - Should show green checkmark with "Advanced Access"

### Verify Permissions Are Active

After requesting Advanced Access:

1. Go to **"App Review"** → **"Permissions and Features"**
2. Check that both permissions show:
   - ✅ **email** - Advanced Access (green)
   - ✅ **public_profile** - Advanced Access (green)

---

## Common Issues and Solutions

### Issue 1: "App isn't available" Error

**Cause**: Permissions not configured or not in Advanced Access mode

**Solution**:
1. Request Advanced Access for `email` and `public_profile`
2. Add your Facebook account as a developer/tester
3. Make sure Facebook Login product is added

### Issue 2: "URL Blocked" Error

**Cause**: OAuth redirect URL not whitelisted

**Solution**:
1. Go to Facebook Login → Settings
2. Add your exact redirect URL to "Valid OAuth Redirect URIs"
3. Make sure URLs match exactly (no extra slashes, correct protocol)

### Issue 3: Can't Get Advanced Access

**Cause**: App is missing required information

**Solution**:
1. Go to Settings → Basic
2. Fill in all required fields:
   - Privacy Policy URL
   - User Data Deletion
   - App Icon
   - App Domains
3. Save and try again

### Issue 4: Login Works for You But Not Others

**Cause**: App is in Development mode

**Solution**:
- Add other users as test users (Roles → Test Users)
- OR add them as Developers/Testers (Roles → Roles)
- OR switch app to Live mode (requires App Review)

---

## Step-by-Step Screenshots Guide

### 1. Add Facebook Login Product

```
Dashboard → Add Products → Facebook Login → Set Up
```

### 2. Configure OAuth Settings

```
Products → Facebook Login → Settings
↓
Valid OAuth Redirect URIs:
  https://your-domain.com/oauth/facebook/callback

Client OAuth Login: YES
Web OAuth Login: YES
```

### 3. Get Advanced Access

```
App Review → Permissions and Features
↓
email → Request Advanced Access → Get Advanced Access
public_profile → Request Advanced Access → Get Advanced Access
```

### 4. Add App Information

```
Settings → Basic
↓
App Domains: your-domain.com
Privacy Policy URL: https://your-domain.com/privacy-policy.html
User Data Deletion: https://your-domain.com/api/facebook-data-deletion
App Icon: [Upload 1024x1024 PNG]
```

### 5. Add Test Users (Development Mode)

```
Roles → Roles → Add Testers
OR
Roles → Test Users → Create Test Users
```

---

## Testing After Configuration

### Test 1: Check Permission Status

1. Go to App Review → Permissions and Features
2. Verify you see:
   ```
   ✅ email - Advanced Access
   ✅ public_profile - Advanced Access
   ```

### Test 2: Test Login Flow

1. Open your BuzzIt app
2. Click "Login with Facebook"
3. You should see Facebook's OAuth dialog
4. It should list the permissions: "email" and "public_profile"
5. Click "Continue" or "Authorize"
6. You should be redirected back to BuzzIt and logged in

### Test 3: Verify Token

After logging in, you can verify your access token:

1. Go to Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Select your BuzzIt app
3. Paste the access token (if you have it)
4. Make a test call: `GET /me?fields=id,name,email`
5. Should return your user data

---

## Checklist Before Testing

Complete this checklist:

- [ ] Facebook Login product is added to the app
- [ ] OAuth redirect URIs are configured
- [ ] `email` has Advanced Access (green checkmark)
- [ ] `public_profile` has Advanced Access (green checkmark)
- [ ] Privacy Policy URL is set
- [ ] User Data Deletion URL is set
- [ ] App Icon is uploaded (1024x1024)
- [ ] App Domains are set
- [ ] You're added as a developer/tester (if in Development mode)
- [ ] All changes are saved

---

## Quick Reference: Required URLs

Add these to your Facebook App Dashboard:

### App Settings → Basic

```
App Domains:
  your-railway-domain.up.railway.app

Privacy Policy URL:
  https://your-railway-domain.up.railway.app/privacy-policy.html

User Data Deletion:
  https://your-railway-domain.up.railway.app/api/facebook-data-deletion
```

### Facebook Login → Settings

```
Valid OAuth Redirect URIs:
  https://your-railway-domain.up.railway.app/oauth/facebook/callback
  https://your-railway-domain.up.railway.app/api/social-auth/facebook/callback
```

---

## Alternative: Use Graph API Explorer for Testing

If you're still having issues, you can manually test permissions:

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your BuzzIt app from the dropdown
3. Click "Generate Access Token"
4. Select permissions: `email`, `public_profile`
5. Click "Generate Access Token"
6. If this works, your permissions are configured correctly
7. If this fails, check your permission status in App Review

---

## Moving to Live Mode (After Testing)

Once everything works in Development mode:

1. Complete all required fields in Settings → Basic
2. Submit for App Review (if needed for additional permissions)
3. Wait for approval (1-7 days)
4. Switch app to Live mode

**Note**: `email` and `public_profile` don't require App Review if you have Advanced Access.

---

## Summary

The "app needs at least one supported permission" error is fixed by:

1. ✅ Adding Facebook Login product
2. ✅ Configuring OAuth redirect URIs
3. ✅ Getting Advanced Access for `email` and `public_profile`
4. ✅ Adding required app information (Privacy Policy, Data Deletion, Icon)
5. ✅ Adding yourself as a tester (if in Development mode)

**Time to complete**: 10-15 minutes

After following these steps, try the Facebook login again. It should work!

---

## Need More Help?

- Facebook Developer Community: https://developers.facebook.com/community/
- Facebook Support: https://developers.facebook.com/support/
- Check your app's Dashboard for any warnings or errors
