# 🚀 Deploy Stream Test UI to Railway

## ✅ What Was Created

A simple web UI for testing stream creation and preview:
- **File**: `server/public/stream-test.html`
- **Features**: Login, create stream, display playback URL, preview with Amazon IVS Player

## 🌐 Access URL

Once deployed, access the UI at:

```
https://buzzit-production.up.railway.app/stream-test.html
```

## 📤 Deployment Steps

### Option 1: Auto-Deploy (Recommended)

If Railway is connected to your Git repository:

1. **Commit the new file**:
   ```bash
   git add server/public/stream-test.html
   git commit -m "Add stream test UI with IVS player preview"
   git push
   ```

2. **Railway will auto-deploy** - Check Railway dashboard for deployment status

3. **Access the URL** after deployment completes

### Option 2: Manual Deploy via Railway CLI

1. **Install Railway CLI** (if not installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link your project**:
   ```bash
   railway link
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

## 🧪 Testing the UI

### Step 1: Login
1. Open: `https://buzzit-production.up.railway.app/stream-test.html`
2. Enter your username and password
3. Click "Login"
4. Token is saved in browser localStorage

### Step 2: Create Stream
1. Fill in the form:
   - **Title**: "Test Stream"
   - **Description**: "Testing IVS player"
   - **Category**: "general"
2. Click "Create Stream"
3. Wait for success message

### Step 3: View Preview
1. **Playback URL** appears above the preview window
2. **Amazon IVS Player** loads automatically
3. If stream is active, video will play

## 🔍 Verify Deployment

After deployment, verify:

1. ✅ **File exists**: Check Railway logs or container
2. ✅ **Static serving**: Access the URL directly
3. ✅ **API works**: Try creating a stream
4. ✅ **IVS Player loads**: Check browser console for SDK load

## 📋 Requirements

- ✅ Backend API running on Railway
- ✅ Database connected
- ✅ `IVS_PLAYBACK_URL` environment variable set (for playback URL)
- ✅ User account exists (for login)

## 🐛 Troubleshooting

### 404 Not Found
- Check if file exists in `server/public/stream-test.html`
- Verify Dockerfile copies HTML files correctly
- Check Railway deployment logs

### API Errors
- Verify backend is running
- Check API endpoints are accessible
- Verify authentication token is valid

### IVS Player Not Loading
- Check browser console for SDK load errors
- Verify playback URL is valid HLS (.m3u8) format
- Check if stream is actually active in Amazon IVS

## 📝 Notes

- The UI uses Amazon IVS Web Player SDK (loaded from CDN)
- Authentication token is stored in localStorage
- Playback URL is displayed above the preview window
- Stream must be active for preview to work

---

**Status**: ✅ Ready to deploy
**URL**: `https://buzzit-production.up.railway.app/stream-test.html`

