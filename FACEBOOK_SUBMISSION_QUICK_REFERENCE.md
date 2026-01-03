# Facebook App Submission - Quick Reference

Use this when filling out your Facebook App Dashboard forms.

## 📋 URLs to Submit to Facebook

### 1. Privacy Policy URL
```
https://YOUR-RAILWAY-DOMAIN.up.railway.app/privacy-policy.html
```
**Where to enter**: App Settings → Basic → Privacy Policy URL

---

### 2. User Data Deletion (Choose ONE option)

**Option A - Callback URL (Recommended):**
```
https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/facebook-data-deletion
```

**Option B - Instructions URL:**
```
https://YOUR-RAILWAY-DOMAIN.up.railway.app/data-deletion-request.html
```
**Where to enter**: App Settings → Basic → User Data Deletion

---

### 3. App Icon
**Requirements:**
- Exactly 1024 x 1024 pixels
- PNG or JPG format
- Under 5MB

**Where to upload**: App Settings → Basic → App Icon

**Action needed**: Create your icon using:
- https://icon.kitchen/
- https://www.canva.com/
- Or hire a designer on Fiverr ($5-20)

---

## 🔧 Before Submitting

### Replace "YOUR-RAILWAY-DOMAIN" with your actual Railway URL

**Find your Railway domain:**
1. Log into Railway dashboard
2. Go to your BuzzIt backend service
3. Look for the public URL (e.g., `buzzit-backend-production.up.railway.app`)
4. Copy that domain and replace `YOUR-RAILWAY-DOMAIN` in the URLs above

**Example:**
If your Railway URL is `buzzit-backend-production.up.railway.app`, then:
- Privacy Policy: `https://buzzit-backend-production.up.railway.app/privacy-policy.html`
- Data Deletion: `https://buzzit-backend-production.up.railway.app/api/facebook-data-deletion`

---

## ✅ Pre-Submission Checklist

Test each URL before submitting:

- [ ] Open privacy policy URL in browser → Should load a complete privacy policy page
- [ ] Open data deletion URL in browser → Should load a form or work as API endpoint
- [ ] Create 1024x1024 app icon
- [ ] Set environment variable: `APP_BASE_URL` in Railway

---

## 🚀 Environment Variables to Set in Railway

Go to Railway → Your Service → Variables tab:

```bash
APP_BASE_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
```

---

## 📧 Update Email Addresses

Before submitting, update these email addresses in your files:

### In `server/public/privacy-policy.html`:
Find and replace:
- `privacy@buzzit.com` → your actual email
- `support@buzzit.com` → your actual email

### In `server/public/data-deletion-request.html`:
Find and replace:
- `privacy@buzzit.com` → your actual email
- `support@buzzit.com` → your actual email

---

## 🧪 Test Your URLs

Run these tests before submitting to Facebook:

```bash
# Replace YOUR-DOMAIN with your actual Railway domain

# 1. Test privacy policy
curl https://YOUR-DOMAIN/privacy-policy.html

# 2. Test data deletion page
curl https://YOUR-DOMAIN/data-deletion-request.html

# 3. Test health endpoint
curl https://YOUR-DOMAIN/health

# 4. Test data deletion API
curl -X POST https://YOUR-DOMAIN/api/data-deletion-request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

All should return valid responses (not 404 or 500 errors).

---

## 📝 What Facebook Will See

When Facebook reviews your app, they will:

1. **Visit your privacy policy** → They'll see a complete privacy policy explaining:
   - What data you collect
   - How you use it
   - User rights (including deletion)
   - Facebook integration details

2. **Test data deletion** → They'll either:
   - Visit the deletion request page and test the form, OR
   - Send a test deletion request to your callback URL

3. **Check your app icon** → They'll verify it's:
   - 1024x1024 pixels
   - Appropriate for your app
   - Not copyrighted material

---

## ⚡ Quick Action Items

**Right now:**
1. Get your Railway URL
2. Create your 1024x1024 app icon
3. Update email addresses in HTML files
4. Set `APP_BASE_URL` in Railway

**Then:**
1. Test all URLs
2. Upload app icon to Facebook
3. Enter Privacy Policy URL
4. Enter Data Deletion URL
5. Click "Save Changes"
6. Submit for review

---

## 🆘 If Something Goes Wrong

**Privacy Policy returns 404:**
- Check that server is running on Railway
- Verify file exists at `server/public/privacy-policy.html`
- Redeploy your server to Railway

**Data Deletion doesn't work:**
- Check Railway logs for errors
- Verify database is connected
- Test with curl command above

**Can't find Railway URL:**
- Railway Dashboard → Your Service → Settings → Domains
- Look for "Public Domain" or "Generated Domain"

---

## 📚 Full Documentation

For complete details, see: `FACEBOOK_APP_SUBMISSION.md`

---

## 🎯 Summary

**Created for you:**
✅ Privacy Policy (fully compliant with Facebook requirements)
✅ Data Deletion Request page (user-friendly form)
✅ Data Deletion API endpoint (for Facebook callbacks)
✅ Complete deletion implementation (removes all user data)

**You need to do:**
1. Create app icon (1024x1024)
2. Get your Railway domain URL
3. Update email addresses
4. Test all URLs
5. Submit to Facebook

**Estimated time:** 15-30 minutes
