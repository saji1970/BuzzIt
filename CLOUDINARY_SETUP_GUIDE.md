# 📸 Cloudinary Integration - Persistent Image Storage

## Problem Solved

**Before:** Images uploaded to Railway were lost when the server restarted (ephemeral filesystem)
**After:** Images are stored permanently on Cloudinary's cloud storage

## What's New

### ✅ Cloudinary Integration
- All images/videos now upload to Cloudinary
- Images persist even when Railway restarts
- Free tier: 25 GB storage, 25 GB bandwidth/month
- Automatic image optimization and transformation

### ✅ Automatic Buzz Cleanup
- Buzzes older than 3 days are automatically deleted
- Runs cleanup every hour
- Configurable retention period via environment variable
- Keeps your database clean and efficient

## Setup Instructions

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. After signup, go to the Dashboard
4. You'll see your **Cloud Name**, **API Key**, and **API Secret**

### Step 2: Configure Railway Environment Variables

1. Go to Railway Dashboard → Your Backend Service
2. Click on **Variables** tab
3. Add these three environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Replace the values with your actual credentials from Cloudinary Dashboard

### Step 3: (Optional) Configure Buzz Retention Period

By default, buzzes are deleted after 3 days. To change this:

Add environment variable in Railway:
```
BUZZ_RETENTION_DAYS=7
```

Change `7` to any number of days you prefer.

### Step 4: Deploy Updated Server

1. Commit the changes to Git:
```bash
git add server/
git commit -m "Add Cloudinary integration and automatic buzz cleanup"
git push
```

2. Railway will automatically redeploy
3. Check Railway logs to verify:
   - ✅ "Cloudinary configured successfully"
   - 🧹 "Running buzz cleanup: deleting buzzes older than X days"

## How It Works

### Image Upload Flow

**Before (Local Storage):**
```
App → Server → /uploads folder → Lost on restart ❌
```

**Now (Cloudinary):**
```
App → Server → Cloudinary Cloud → Permanent storage ✅
```

### Upload Endpoint (`/api/uploads`)

```javascript
// New behavior:
1. Receive image from app (in memory)
2. Upload to Cloudinary
3. Return Cloudinary URL to app
4. App saves Cloudinary URL in database
5. Images persist forever (or until manually deleted)
```

### Automatic Cleanup

```javascript
Every hour:
  1. Find all buzzes older than BUZZ_RETENTION_DAYS
  2. Delete from PostgreSQL database
  3. Log how many were deleted
```

## Verifying It Works

### Check Cloudinary
1. Upload a new buzz with an image
2. Go to Cloudinary Dashboard → Media Library
3. Look in the `buzzit` folder
4. Your image should be there!

### Check Cleanup Logs
In Railway logs, look for:
```
🧹 Running buzz cleanup: deleting buzzes older than 3 days
✅ Deleted X old buzzes from database
```

### Test Image Persistence
1. Create a new buzz with an image
2. Wait for image to upload successfully
3. Restart Railway service (Settings → Restart)
4. Check the buzz - image should still load! ✅

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | - | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | - | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | - | Your Cloudinary API secret |
| `BUZZ_RETENTION_DAYS` | No | 3 | Days before buzzes are auto-deleted |

### Cloudinary Settings

Images are uploaded with these settings:
- **resource_type**: `auto` (detects image/video automatically)
- **folder**: `buzzit` (organizes all BuzzIt uploads)
- **public_id**: `timestamp-random` (unique filename)

## Fallback Behavior

If Cloudinary is NOT configured:
- Server will use local storage (development mode)
- ⚠️ Warning will be logged: "Cloudinary not configured - using local storage"
- Files will be lost on Railway restart

## Troubleshooting

### Images Still Not Showing

**Check Cloudinary Credentials:**
```bash
# In Railway logs, look for:
✅ Cloudinary configured successfully

# OR
⚠️ Cloudinary not configured - using local storage
```

If you see the warning, your credentials are missing or incorrect.

**Verify Environment Variables:**
1. Railway Dashboard → Backend Service → Variables
2. Ensure all 3 Cloudinary variables are set
3. No typos in variable names
4. No extra spaces in values

### Old Buzzes Not Deleting

**Check Logs:**
```bash
# Should see in Railway logs every hour:
🧹 Running buzz cleanup: deleting buzzes older than 3 days
✅ Deleted X old buzzes from database
```

**If cleanup isn't running:**
- Check server logs for errors
- Verify PostgreSQL connection is working
- Restart Railway service

### Upload Errors

**Check File Size:**
- Max upload: 50MB (configured in server)
- Cloudinary free tier: 10MB per image, 100MB per video

**Check File Type:**
- Only images and videos are allowed
- Accepted: `.jpg`, `.png`, `.gif`, `.mp4`, `.mov`, etc.

## Benefits

### Before Cloudinary

❌ Images lost on server restart
❌ Limited storage (500MB on Railway)
❌ No image optimization
❌ Manual cleanup required

### After Cloudinary

✅ Images persist forever
✅ 25GB free storage
✅ Automatic image optimization
✅ Automatic buzz cleanup
✅ CDN delivery (faster loading)
✅ Image transformations available

## Cost

**Cloudinary Free Tier:**
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- Perfect for BuzzIt! 🎉

**If you exceed free tier:**
- Pay-as-you-go: $0.0024/GB storage
- Bandwidth: $0.048/GB
- Still very affordable!

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Add environment variables to Railway
3. ✅ Deploy updated code
4. ✅ Test by creating a buzz with an image
5. ✅ Verify image appears in Cloudinary dashboard
6. ✅ Restart Railway and confirm image still loads

---

**Your images are now safe and will never be lost! 🎉**
