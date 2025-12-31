# 🔧 Facebook OAuth Scopes Fix - Advanced Permissions

## ❌ Error Fixed

```
Invalid Scopes: pages_manage_posts, pages_read_engagement, 
instagram_basic, instagram_content_publish. 
This message is only shown to developers.
```

## 🔍 Root Cause

These scopes require **Facebook App Review** and cannot be used without approval:
- `pages_manage_posts` - Requires App Review + Business Verification
- `pages_read_engagement` - Requires App Review
- `instagram_basic` - Requires App Review + Instagram Business Account
- `instagram_content_publish` - Requires App Review + Instagram Business Account

## ✅ Solution Applied

Updated Facebook OAuth to use only `public_profile` which:
- ✅ **Always available** - No App Review needed
- ✅ **Provides basic user info** - ID, name, profile picture
- ✅ **Works immediately** - Can test right away

## 📋 Updated Configuration

**Before:**
```
public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish
```

**After:**
```
public_profile
```

## 📊 Scope Comparison

### ✅ `public_profile` (Current - Works Now)
- **Status**: Always available
- **Provides**: User ID, name, profile picture, age range, gender, location
- **Use Case**: Basic Facebook login and profile display
- **Review Required**: ❌ No

### ⚠️ Advanced Scopes (Require App Review)

#### `pages_manage_posts`
- **Status**: Requires App Review
- **Use Case**: Post to Facebook Pages
- **Review Required**: ✅ Yes + Business Verification

#### `pages_read_engagement`
- **Status**: Requires App Review
- **Use Case**: Read Page engagement metrics
- **Review Required**: ✅ Yes

#### `instagram_basic`
- **Status**: Requires App Review
- **Use Case**: Access Instagram Business Account basic info
- **Review Required**: ✅ Yes + Instagram Business Account

#### `instagram_content_publish`
- **Status**: Requires App Review
- **Use Case**: Post to Instagram Business Account
- **Review Required**: ✅ Yes + Instagram Business Account

## 🔄 If You Need Advanced Features

### Step 1: Submit for App Review

1. Go to [Facebook App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Go to **App Review** → **Permissions and Features**
4. Request the permissions you need:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`

### Step 2: Provide Justification

For each permission, you'll need to explain:
- **Why do you need this permission?**
- **How will users benefit?**
- **How will you use the data?**

### Step 3: Submit Test Data

Facebook may require:
- Screenshots of your app using the feature
- Video demonstration
- Test user accounts
- Privacy policy URL

### Step 4: Wait for Approval

- Review typically takes **3-7 business days**
- Facebook may request additional information
- You'll be notified when approved or if changes are needed

### Step 5: Update Scopes

Once approved, you can add the scopes back to the configuration:

```javascript
scope: 'public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
```

## 🧪 Test Current Configuration

After this fix, Facebook OAuth should work with basic profile access:

```powershell
# Test OAuth URL (requires login first)
$loginBody = '{"username":"testuser","password":"Test123!"}'
$loginResponse = Invoke-RestMethod -Uri "https://buzzit-production.up.railway.app/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
if ($loginResponse.success) {
    $token = $loginResponse.token
    $headers = @{"Authorization" = "Bearer $token"}
    $oauthResponse = Invoke-RestMethod -Uri "https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url" -Method Get -Headers $headers
    Write-Host $oauthResponse.authUrl
}
```

The OAuth URL should now work without scope errors!

## 📝 What You Can Do Now

With `public_profile` only, you can:
- ✅ Connect Facebook accounts
- ✅ Get user's Facebook ID
- ✅ Get user's name
- ✅ Get user's profile picture
- ✅ Display basic Facebook profile info

You **cannot** yet:
- ❌ Post to Facebook Pages
- ❌ Read Page metrics
- ✅ Access Instagram accounts (requires App Review)
- ❌ Post to Instagram (requires App Review)

## 🚀 Deployment

After updating the code:
1. Commit and push to GitHub
2. Railway will automatically redeploy
3. Test Facebook OAuth - should work without scope errors

## 📚 References

- [Facebook Login Permissions](https://developers.facebook.com/docs/permissions/reference)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Pages API](https://developers.facebook.com/docs/pages)

