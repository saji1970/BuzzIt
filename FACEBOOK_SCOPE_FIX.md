# 🔧 Facebook OAuth Scope Fix

## ❌ Error Fixed

```
Invalid Scopes: email. This message is only shown to developers. 
Users of your app will ignore these permissions if present.
```

## ✅ Solution Applied

Removed `email` from the Facebook OAuth scopes because:

1. **`email` permission is deprecated** in newer Facebook Login flows
2. **`email` requires App Review** for production use
3. **`public_profile` is sufficient** for basic Facebook login and includes basic user info

## 📋 Updated Facebook Scopes

**Before:**
```
email,public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish
```

**After:**
```
public_profile,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish
```

## 🔍 What `public_profile` Includes

The `public_profile` permission (which is always available) provides:
- User ID
- Name
- Profile picture
- Age range (if available)
- Gender (if available)
- Language
- Location (if available)

## 📧 If You Need Email

If you absolutely need the user's email address, you have two options:

### Option 1: Request Email After Login (Recommended)

After the user connects their Facebook account, you can request their email through the Graph API:

```javascript
// After getting access token from OAuth
const profileResponse = await axios.get('https://graph.facebook.com/me', {
  params: {
    fields: 'id,name,email,picture',
    access_token: access_token,
  },
});
```

**Note**: The email will only be available if:
- The user has granted email permission in their Facebook settings
- The app has requested email permission and it was approved via App Review

### Option 2: Add Email Permission via App Review

1. Go to [Facebook App Review](https://developers.facebook.com/apps/YOUR_APP_ID/app-review/)
2. Request the `email` permission
3. Submit your app for review
4. Once approved, add `email` back to the scope string

**Warning**: App Review can take several days and requires justification for why you need email access.

## 🧪 Test the Fix

After redeploying with the updated scopes:

1. **Get OAuth URL** (requires auth token):
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
   ```

2. **Open the authUrl in browser** - you should now see Facebook's consent screen without the "Invalid Scopes" error

3. **Complete OAuth flow** - user should be able to authorize and get redirected back

## 📝 Current Facebook Scopes Breakdown

- ✅ `public_profile` - Basic profile info (always available, no review needed)
- ⚠️ `pages_manage_posts` - Requires App Review + Business Verification
- ⚠️ `pages_read_engagement` - Requires App Review
- ⚠️ `instagram_basic` - Requires App Review + Instagram Business Account
- ⚠️ `instagram_content_publish` - Requires App Review + Instagram Business Account

## 🚀 Next Steps

1. **Deploy the updated code** to Railway
2. **Test Facebook OAuth** - it should work without the scope error
3. **If you need advanced permissions** (pages, Instagram), submit for App Review
4. **For email**, use Option 1 (request via Graph API) or submit for App Review

## 🔗 References

- [Facebook Login Permissions](https://developers.facebook.com/docs/permissions/reference)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)
- [Graph API User Endpoint](https://developers.facebook.com/docs/graph-api/reference/user)

