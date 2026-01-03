# Facebook App Testing Guide

Before submitting your BuzzIt app to Facebook for review, you need to test all use cases to ensure they work correctly.

## Overview

Facebook requires you to test:
1. **User Authentication** - Users can log in with Facebook
2. **Data Deletion** - Users can delete their data
3. **Privacy Policy** - Accessible and complete
4. **Permissions** - Only request what you need

Testing data can take up to 24 hours to appear, and each test is valid for 30 days.

---

## 1. Test Privacy Policy

### What to Test
Your privacy policy page must be publicly accessible and compliant.

### How to Test

**Step 1: Access the Privacy Policy**
```
https://your-railway-domain.up.railway.app/privacy-policy.html
```

**Step 2: Verify Content**
Check that the page includes:
- ✅ What data you collect (email, username, profile info)
- ✅ How you use the data (provide services, enable features)
- ✅ User rights (access, correction, deletion)
- ✅ Facebook integration details
- ✅ Data deletion instructions with link

**Step 3: Check Accessibility**
- Page loads in less than 3 seconds
- No login required to view
- Mobile-friendly (responsive design)
- No broken links

**Result**: ✅ Privacy policy is accessible and complete

---

## 2. Test Data Deletion (User-Initiated)

### What to Test
Users can request deletion of their account and data through the web form.

### How to Test

**Step 1: Access the Deletion Page**
```
https://your-railway-domain.up.railway.app/data-deletion-request.html
```

**Step 2: Submit a Test Deletion Request**
1. Open the page in your browser
2. Enter a test user's email (create a test account first if needed)
3. Optionally enter username and reason
4. Check the confirmation checkbox
5. Click "Submit Deletion Request"

**Step 3: Verify the Response**
- You should see a success message
- Check your server logs for deletion confirmation
- Verify the user and their data were deleted from the database

**Step 4: Check Server Logs**
Look for these log messages:
```
📧 Data deletion request received: { email: '...', ... }
🗑️ Starting data deletion for user ID: ...
  ✓ Deleted user interactions
  ✓ Deleted social accounts
  ✓ Deleted verification codes
  ✓ Deleted stream comments
  ✓ Deleted live streams
  ✓ Deleted buzzes
  ✓ Deleted subscriptions
  ✓ Deleted channels
  ✓ Deleted user account
✅ Successfully deleted all data for user ID: ...
```

**Step 5: Verify Database Deletion**
Connect to your database and confirm:
```sql
-- User should be deleted
SELECT * FROM users WHERE email = 'test@example.com';
-- Should return 0 rows

-- User's buzzes should be deleted
SELECT * FROM buzzes WHERE user_id = 'deleted-user-id';
-- Should return 0 rows
```

**Result**: ✅ User data deletion works correctly

---

## 3. Test Facebook Data Deletion Callback

### What to Test
Facebook can send deletion requests to your callback endpoint.

### How to Test

**Method 1: Browser Test (GET)**

Access the endpoint in your browser:
```
https://your-railway-domain.up.railway.app/api/facebook-data-deletion
```

You should see:
```json
{
  "endpoint": "/api/facebook-data-deletion",
  "method": "POST",
  "status": "Active and ready to receive requests",
  ...
}
```

**Method 2: cURL Test (POST)**

Test with a simulated Facebook request:
```bash
curl -X POST https://your-railway-domain.up.railway.app/api/facebook-data-deletion \
  -H "Content-Type: application/json" \
  -d '{
    "signed_request": "test_signature.eyJ1c2VyX2lkIjoiMTIzNDU2Nzg5IiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE3MDk0MjQwMDAsImFwcF9pZCI6InlvdXItYXBwLWlkIn0="
  }'
```

This will test the endpoint's ability to:
- Accept POST requests
- Parse the signed_request parameter
- Return a confirmation code and status URL

**Expected Response**:
```json
{
  "url": "https://your-domain.com/data-deletion-status?id=...",
  "confirmation_code": "..."
}
```

**Method 3: Using Postman/Insomnia**

1. Create a new POST request
2. URL: `https://your-domain.com/api/facebook-data-deletion`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
   ```json
   {
     "signed_request": "test.eyJ1c2VyX2lkIjoiMTIzNDU2In0="
   }
   ```
5. Send the request
6. Verify you get a 200 response with confirmation code

**Result**: ✅ Facebook callback endpoint is functional

---

## 4. Test Facebook Login Integration

### What to Test
Users can log in to BuzzIt using their Facebook account.

### How to Test

**Step 1: Test Login Flow**

1. Open your BuzzIt mobile app or web app
2. Look for "Login with Facebook" or "Connect Facebook" button
3. Click the button
4. You should be redirected to Facebook's OAuth page
5. Grant permissions
6. You should be redirected back to BuzzIt
7. Verify you're logged in

**Step 2: Check Permissions Requested**

When logging in with Facebook, verify you only request:
- `email` - To create/identify user account
- `public_profile` - For basic profile information

Do NOT request unnecessary permissions like:
- ❌ `user_posts`
- ❌ `user_photos`
- ❌ `publish_actions`
- ❌ Any permissions you don't actively use

**Step 3: Test Account Linking**

After logging in with Facebook:
1. Check that your BuzzIt user account was created/linked
2. Verify Facebook user ID is stored in your database
3. Check that social_accounts table has the Facebook connection
4. Verify you can post buzzes and use all BuzzIt features

**Step 4: Test Disconnect**

If you have a "Disconnect Facebook" feature:
1. Go to account settings
2. Click "Disconnect Facebook"
3. Verify the connection is removed from database
4. Verify you can still use BuzzIt with regular login

**Result**: ✅ Facebook login works correctly

---

## 5. Test with Facebook's Tools

### Using Graph API Explorer

**Step 1: Access Graph API Explorer**
```
https://developers.facebook.com/tools/explorer/
```

**Step 2: Select Your App**
- Click "Meta App" dropdown
- Select your BuzzIt app

**Step 3: Generate Access Token**
1. Click "Generate Access Token"
2. Select permissions: `email`, `public_profile`
3. Click "Generate Token"
4. Copy the access token

**Step 4: Test API Calls**

Test getting user information:
```
GET /me?fields=id,name,email
```

This verifies:
- Your app can request user data
- Permissions are working
- OAuth is configured correctly

**Step 5: Test Data Deletion Request (Advanced)**

You can simulate a data deletion request:
```
POST /{user-id}/accounts/data_deletion
```

This sends a real deletion request to your callback URL.

---

## 6. End-to-End Testing Checklist

Complete this checklist before submitting to Facebook:

### Privacy & Compliance
- [ ] Privacy policy loads correctly at `/privacy-policy.html`
- [ ] Privacy policy includes all required sections
- [ ] Privacy policy mentions Facebook integration
- [ ] Data deletion instructions are clear
- [ ] Links in privacy policy work (no 404s)

### Data Deletion
- [ ] Data deletion form loads at `/data-deletion-request.html`
- [ ] Form validates email input
- [ ] Form shows success message after submission
- [ ] API endpoint `/api/data-deletion-request` accepts POST
- [ ] Facebook callback `/api/facebook-data-deletion` accepts POST
- [ ] GET request to callback shows endpoint info (not 404)
- [ ] User data is actually deleted from database
- [ ] Server logs show deletion process

### Facebook Integration
- [ ] Facebook login works in your app
- [ ] Only necessary permissions are requested
- [ ] Users can disconnect Facebook account
- [ ] Facebook user ID is stored correctly
- [ ] OAuth redirect URLs match Facebook app settings

### Server & Deployment
- [ ] Server is deployed to Railway (or production host)
- [ ] All endpoints are publicly accessible
- [ ] HTTPS is enabled (required by Facebook)
- [ ] Environment variables are set correctly
- [ ] Database is connected and migrations are run

### App Icon
- [ ] Icon is exactly 1024x1024 pixels
- [ ] Icon is PNG or JPG format
- [ ] Icon file size is under 5MB
- [ ] Icon looks good at small sizes
- [ ] Icon represents BuzzIt brand

---

## 7. Common Testing Issues

### Issue: Privacy Policy Returns 404
**Solution:**
- Verify file exists at `server/public/privacy-policy.html`
- Check server is serving static files from `public` directory
- Redeploy your server
- Check Railway logs for errors

### Issue: Data Deletion Doesn't Work
**Solution:**
- Check database connection in Railway
- Verify all tables exist (users, buzzes, social_accounts, etc.)
- Check server logs for specific error messages
- Test with a real user account that exists in database

### Issue: Facebook Callback Returns Error
**Solution:**
- Verify endpoint is POST, not GET
- Check request body has `signed_request` parameter
- Ensure Facebook App ID matches your configuration
- Check server logs for parsing errors

### Issue: Facebook Login Fails
**Solution:**
- Verify OAuth redirect URLs in Facebook app settings
- Check that URLs match exactly (no trailing slashes)
- Ensure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are set
- Test with a different Facebook account

---

## 8. Facebook Review Preparation

### What Facebook Will Check

1. **Functionality Testing**
   - They'll try to log in with Facebook
   - They'll test data deletion
   - They'll check your privacy policy
   - They'll verify permissions usage

2. **Privacy Compliance**
   - Privacy policy is accessible
   - Data handling is transparent
   - User rights are clearly stated
   - Deletion process works

3. **User Experience**
   - App doesn't crash
   - Features work as described
   - Permissions make sense for your use case
   - UI is professional

### Prepare These Materials

Before submitting, have ready:

1. **Test Account Credentials**
   - Create a test account in BuzzIt
   - Connect it to Facebook
   - Document the credentials for Facebook reviewers

2. **Screen Recording** (Optional but Recommended)
   - Record yourself logging in with Facebook
   - Show the permissions screen
   - Demonstrate data deletion
   - Show key app features

3. **Use Case Description**
   - "Users can log in to BuzzIt using their Facebook account"
   - "Users can share their Buzz posts to Facebook"
   - "Users can delete all their data including Facebook connection"

---

## 9. Test Results Documentation

Use this template to document your test results:

```
BuzzIt Facebook Integration Test Results
Date: [Today's Date]
Tester: [Your Name]
Environment: Production (Railway)

✅ PASSED TESTS:
- Privacy Policy Accessibility
- Privacy Policy Content
- Data Deletion Form
- Data Deletion API (User-Initiated)
- Data Deletion API (Facebook Callback)
- Facebook Login Flow
- Permission Requests
- Account Linking
- Data Storage
- Server Deployment
- HTTPS Configuration
- App Icon Upload

❌ FAILED TESTS:
[List any failed tests here]

📝 NOTES:
- All endpoints tested and working
- Database connections verified
- Server logs show successful operations
- Ready for Facebook submission

URLS TESTED:
- Privacy Policy: https://[your-domain]/privacy-policy.html
- Data Deletion: https://[your-domain]/data-deletion-request.html
- Facebook Callback: https://[your-domain]/api/facebook-data-deletion

NEXT STEPS:
1. Submit app to Facebook App Review
2. Wait for review (1-7 days)
3. Respond to any feedback
```

---

## 10. Quick Test Commands

Run these commands to quickly test all endpoints:

```bash
# Replace YOUR_DOMAIN with your actual Railway domain

# 1. Test privacy policy
curl -I https://YOUR_DOMAIN/privacy-policy.html

# 2. Test data deletion page
curl -I https://YOUR_DOMAIN/data-deletion-request.html

# 3. Test Facebook callback (GET)
curl https://YOUR_DOMAIN/api/facebook-data-deletion

# 4. Test Facebook callback (POST)
curl -X POST https://YOUR_DOMAIN/api/facebook-data-deletion \
  -H "Content-Type: application/json" \
  -d '{"signed_request":"test.eyJ1c2VyX2lkIjoiMTIzNDU2In0="}'

# 5. Test user deletion API
curl -X POST https://YOUR_DOMAIN/api/data-deletion-request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","reason":"Testing"}'

# 6. Test health endpoint
curl https://YOUR_DOMAIN/health

# All should return 200 OK or valid responses
```

---

## Summary

**Before Submitting to Facebook:**

1. ✅ Test all endpoints with browser and cURL
2. ✅ Verify privacy policy is complete and accessible
3. ✅ Test data deletion with a real user account
4. ✅ Confirm Facebook login works in your app
5. ✅ Document all test results
6. ✅ Prepare test account for Facebook reviewers
7. ✅ Upload 1024x1024 app icon
8. ✅ Set all required environment variables

**Estimated Testing Time:** 30-45 minutes

**Next Step:** Submit to Facebook App Review

---

## Resources

- **Facebook App Dashboard**: https://developers.facebook.com/apps/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **App Review Documentation**: https://developers.facebook.com/docs/app-review
- **Platform Policies**: https://developers.facebook.com/docs/development/release/policies

---

**Need Help?**

If you encounter issues during testing:
1. Check your server logs in Railway
2. Review `FACEBOOK_APP_SUBMISSION.md` for configuration
3. Test with the quick commands above
4. Verify all environment variables are set
