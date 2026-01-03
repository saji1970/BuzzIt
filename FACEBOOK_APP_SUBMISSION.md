# Facebook App Submission - Requirements Checklist

This document contains all the information needed to complete your Facebook app submission.

## Current Status

You need to provide the following information to Facebook:

1. ✅ **Privacy Policy URL** - Created
2. ✅ **User Data Deletion Callback URL** - Implemented
3. ⚠️ **App Icon (1024 x 1024)** - Needs creation

---

## 1. App Icon (1024 x 1024)

### Requirements
- **Size**: Exactly 1024 x 1024 pixels
- **Format**: PNG or JPG
- **File Size**: Under 5MB
- **Content**:
  - Should represent your BuzzIt brand
  - No text or complex graphics (should be simple and recognizable)
  - Square icon that looks good when displayed at various sizes

### Current Status
You have a placeholder icon at `BuzzItDemo/assets/icon.png` but it's a generic adaptive icon template (concentric circles).

### Action Required
You need to create a proper 1024x1024 app icon. You have several options:

**Option 1: Use an Online Icon Generator**
- Use tools like:
  - https://icon.kitchen/
  - https://www.canva.com/ (free templates)
  - https://www.figma.com/ (design tool)
  - https://appicon.co/

**Option 2: Hire a Designer**
- Fiverr (starting at $5-20)
- Upwork
- 99designs

**Option 3: Create Your Own**
- Use design software (Photoshop, GIMP, Sketch, Figma)
- Create a simple logo with your app name or brand colors
- Export as 1024x1024 PNG

### Recommended Approach
Since you need this quickly, use **icon.kitchen** or **Canva**:

1. Go to https://icon.kitchen/
2. Choose a simple icon or upload a logo
3. Customize colors to match BuzzIt branding
4. Download the 1024x1024 version
5. Save it as `buzzit-app-icon-1024.png`

---

## 2. Privacy Policy URL

### Status: ✅ COMPLETED

Your privacy policy is hosted at:
```
https://your-domain.com/privacy-policy.html
```

**Local file location**: `server/public/privacy-policy.html`

### What to Submit to Facebook

In your Facebook App Dashboard:
1. Go to **App Settings** → **Basic**
2. Scroll to **Privacy Policy URL**
3. Enter: `https://your-railway-domain.up.railway.app/privacy-policy.html`
   - Replace `your-railway-domain` with your actual Railway domain
   - Or use your custom domain if you have one set up

**Example URLs:**
- Railway: `https://buzzit-backend-production.up.railway.app/privacy-policy.html`
- Custom Domain: `https://api.buzzit.com/privacy-policy.html`

### Testing Your Privacy Policy
Before submitting, test that it's accessible:
```bash
curl https://your-domain.com/privacy-policy.html
```
or simply open it in a browser.

---

## 3. User Data Deletion

### Status: ✅ COMPLETED

Two endpoints have been implemented:

#### A. User-Initiated Deletion (Web Form)
**URL**: `https://your-domain.com/data-deletion-request.html`

**Local file location**: `server/public/data-deletion-request.html`

Users can visit this page to request account deletion. The form submits to:
```
POST https://your-domain.com/api/data-deletion-request
```

#### B. Facebook Data Deletion Callback
**URL**: `https://your-domain.com/api/facebook-data-deletion`

**Endpoint**: `POST /api/facebook-data-deletion`
**Local code location**: `server/index.js` (line ~4155)

This endpoint receives deletion requests directly from Facebook when users delete your app from their Facebook account.

### What to Submit to Facebook

In your Facebook App Dashboard:
1. Go to **App Settings** → **Basic**
2. Scroll to **User Data Deletion**
3. Select **"Data Deletion Instructions URL"**
4. Enter: `https://your-railway-domain.up.railway.app/data-deletion-request.html`
5. OR select **"Data Deletion Callback URL"**
6. Enter: `https://your-railway-domain.up.railway.app/api/facebook-data-deletion`

**Recommended**: Use the **Callback URL** option for automatic processing.

### How It Works

**User-Initiated Deletion:**
1. User visits the data deletion request page
2. Fills out the form with their email
3. System finds the user and deletes all their data:
   - User account
   - Profile data
   - Buzz posts
   - Comments
   - Live streams
   - Social account connections
   - All related data

**Facebook-Initiated Deletion:**
1. User removes BuzzIt from their Facebook apps
2. Facebook sends a deletion request to your callback URL
3. System parses the signed request
4. Finds the user by Facebook ID
5. Deletes all their data
6. Returns a confirmation code to Facebook

### Testing Data Deletion

**Test the web form:**
1. Open `https://your-domain.com/data-deletion-request.html`
2. Enter a test user's email
3. Submit the form
4. Check server logs for deletion confirmation

**Test the Facebook callback:**
```bash
# You can test with a sample request
curl -X POST https://your-domain.com/api/facebook-data-deletion \
  -H "Content-Type: application/json" \
  -d '{"signed_request": "test.eyJ1c2VyX2lkIjoiMTIzNDU2IiwiYXBwX2lkIjoieW91ci1hcHAtaWQifQ=="}'
```

---

## 4. Complete Submission Checklist

Use this checklist when submitting to Facebook:

### Before Submission

- [ ] Deploy your backend to Railway (or your hosting provider)
- [ ] Verify your server is running and accessible
- [ ] Get your public URL (e.g., `https://buzzit-backend-production.up.railway.app`)
- [ ] Create your 1024x1024 app icon
- [ ] Test all URLs are accessible

### Facebook App Dashboard - Basic Settings

1. **App Icon**
   - [ ] Upload your 1024x1024 PNG icon
   - Location: **App Settings** → **Basic** → **App Icon**

2. **Privacy Policy URL**
   - [ ] Enter: `https://your-domain.com/privacy-policy.html`
   - Location: **App Settings** → **Basic** → **Privacy Policy URL**

3. **User Data Deletion**
   - [ ] Choose: **Data Deletion Callback URL**
   - [ ] Enter: `https://your-domain.com/api/facebook-data-deletion`
   - OR choose: **Data Deletion Instructions URL**
   - [ ] Enter: `https://your-domain.com/data-deletion-request.html`
   - Location: **App Settings** → **Basic** → **User Data Deletion**

4. **Terms of Service URL** (Optional but recommended)
   - [ ] Enter your Terms URL if you have one
   - Or create a simple terms page

### Test Everything

- [ ] Open privacy policy URL in browser - should load correctly
- [ ] Open data deletion page in browser - form should work
- [ ] Submit a test deletion request - should succeed
- [ ] Check server logs - should see deletion events

### Replace Placeholder URLs

Throughout your implementation, replace these placeholder URLs with your actual domain:

**Current placeholders to update:**

1. In `server/public/privacy-policy.html`:
   ```html
   <!-- Line with /data-deletion-request link -->
   <a href="/data-deletion-request">https://yourdomain.com/data-deletion-request</a>

   <!-- Email addresses -->
   privacy@buzzit.com → your-actual-email@yourdomain.com
   support@buzzit.com → your-actual-email@yourdomain.com
   ```

2. In `server/public/data-deletion-request.html`:
   ```html
   <!-- Email addresses in multiple places -->
   privacy@buzzit.com → your-actual-email@yourdomain.com
   support@buzzit.com → your-actual-email@yourdomain.com
   ```

3. In `server/index.js`:
   ```javascript
   // Line ~4214 and ~4223
   const statusUrl = `${process.env.APP_BASE_URL || 'https://yourdomain.com'}/data-deletion-status?id=${deletionRequestId}`;
   ```
   Make sure `APP_BASE_URL` environment variable is set in Railway.

---

## 5. Environment Variables Required

Make sure these are set in your Railway deployment:

```bash
# Required for data deletion status URLs
APP_BASE_URL=https://your-railway-domain.up.railway.app

# Database connection (should already be set)
DATABASE_URL=postgresql://...

# Facebook app credentials (should already be set)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

---

## 6. Quick Setup Script

Run these commands to verify everything is working:

```bash
# 1. Check if privacy policy is accessible
curl https://your-domain.com/privacy-policy.html

# 2. Check if data deletion page is accessible
curl https://your-domain.com/data-deletion-request.html

# 3. Test data deletion API endpoint
curl -X POST https://your-domain.com/api/data-deletion-request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","reason":"Testing"}'

# 4. Check if server is running
curl https://your-domain.com/health
```

---

## 7. Common Issues and Solutions

### Issue: Privacy policy returns 404
**Solution**:
- Make sure the file exists at `server/public/privacy-policy.html`
- Verify the server is serving static files from the `public` directory
- Check server logs for errors

### Issue: Data deletion endpoint returns error
**Solution**:
- Check that PostgreSQL database is connected
- Verify the `deleteUserData` function can access all tables
- Check server logs for specific error messages

### Issue: Facebook callback fails
**Solution**:
- Verify the endpoint URL is correct
- Check that the signed request parsing is working
- Ensure Facebook App ID matches your configuration
- Check server logs for parsing errors

---

## 8. Next Steps After Submission

Once you submit your app to Facebook:

1. **Wait for Review** (usually 1-7 days)
2. **Monitor Email** for Facebook notifications
3. **Check App Dashboard** for review status
4. **Be Ready to Respond** to any feedback from Facebook

### If Rejected

Facebook may ask for:
- Clarification on data usage
- Additional privacy policy details
- Demonstration video of your app
- More detailed data deletion instructions

You can resubmit after addressing their feedback.

---

## 9. Contact Information

If you need help or have questions:

- Review Facebook's Documentation: https://developers.facebook.com/docs/development
- Facebook Developer Support: https://developers.facebook.com/support/
- Check your server logs for debugging

---

## Summary

**You have completed:**
✅ Privacy Policy page and URL
✅ Data Deletion request page
✅ Data Deletion callback endpoint for Facebook
✅ Server configured to serve all required pages

**You still need:**
⚠️ Create a 1024x1024 app icon
⚠️ Update placeholder email addresses and URLs
⚠️ Set APP_BASE_URL environment variable in Railway
⚠️ Test all endpoints before submission

**Your submission URLs:**
- Privacy Policy: `https://your-domain.com/privacy-policy.html`
- Data Deletion (user-facing): `https://your-domain.com/data-deletion-request.html`
- Data Deletion (Facebook callback): `https://your-domain.com/api/facebook-data-deletion`

Replace `your-domain.com` with your actual Railway or custom domain before submitting!
