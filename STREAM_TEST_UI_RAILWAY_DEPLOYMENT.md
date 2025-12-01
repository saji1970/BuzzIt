# 🚀 Stream Test UI - Railway Deployment Guide

## ✅ What Was Created

A simple web UI for testing stream creation and preview:
- **File**: `server/public/stream-test.html`
- **Features**: 
  - Login functionality
  - Create stream form
  - Display playback URL **above** the preview window
  - Amazon IVS Player preview
  - Copy playback URL to clipboard

## 🌐 Access URL

Once deployed to Railway, access the UI at:

```
https://buzzit-production.up.railway.app/stream-test.html
```

## 📋 Features

### 1. Authentication
- Login with username and password
- Token stored in browser localStorage
- Persistent login across page refreshes

### 2. Stream Creation
- Simple form to create a new stream
- Fields: Title, Description, Category
- Real-time status messages
- Automatic playback URL retrieval

### 3. Playback URL Display
- **Playback URL shown ABOVE the preview window** (as requested)
- Copy to clipboard button
- Displays IVS playback URL, Restream URL, or fallback stream URL
- Clear visual indication of URL availability

### 4. Stream Preview
- Amazon IVS Web Player SDK integration
- Automatic player initialization when stream is created
- Real-time playback status
- Error handling and user-friendly messages

## 📤 Deployment Steps

### Option 1: Auto-Deploy (Recommended)

If Railway is connected to your Git repository:

1. **Commit the changes**:
   ```bash
   git add server/public/stream-test.html
   git commit -m "Add improved stream test UI with playback URL display"
   git push
   ```

2. **Railway will auto-deploy** - Check Railway dashboard for deployment status

3. **Access the URL** after deployment completes:
   ```
   https://buzzit-production.up.railway.app/stream-test.html
   ```

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
5. Status shows "✅ Logged in"

### Step 2: Create Stream
1. Fill in the form:
   - **Title**: "Test Stream"
   - **Description**: "Testing IVS player with playback URL"
   - **Category**: "general"
2. Click "Create Stream"
3. Wait for success message

### Step 3: View Playback URL and Preview
1. **Playback URL** appears **ABOVE** the preview window
2. Click "📋 Copy URL" to copy to clipboard
3. **Amazon IVS Player** loads automatically below the URL
4. If stream is active, video will play
5. Check browser console for player status logs

## 🔍 Verify Deployment

After deployment, verify:

1. ✅ **File exists**: Check Railway logs or container
2. ✅ **Static serving**: Access the URL directly
3. ✅ **API works**: Try creating a stream
4. ✅ **IVS Player loads**: Check browser console for SDK load
5. ✅ **Playback URL displays**: Should appear above preview window

## 📋 Requirements

- ✅ Backend API running on Railway
- ✅ Database connected
- ✅ `IVS_PLAYBACK_URL` environment variable set (for playback URL)
- ✅ User account exists (for login)
- ✅ Static file serving enabled (already configured in `server/index.js`)

## 🐛 Troubleshooting

### 404 Not Found
- Check if file exists in `server/public/stream-test.html`
- Verify Dockerfile copies HTML files correctly
- Check Railway deployment logs
- Verify static file serving middleware is active

### API Errors
- Verify backend is running
- Check API endpoints are accessible
- Verify authentication token is valid
- Check browser console for CORS errors

### IVS Player Not Loading
- Check browser console for SDK load errors
- Verify playback URL is valid HLS (.m3u8) format
- Check if stream is actually active in Amazon IVS
- Verify `IVS_PLAYBACK_URL` environment variable is set

### Playback URL Not Showing
- Check if stream was created successfully
- Verify `ivsPlaybackUrl`, `restreamPlaybackUrl`, or `streamUrl` in response
- Check browser console for errors
- Verify the playback URL container is visible (check CSS)

## 📝 Technical Details

### File Structure
```
BuzzIt/
├── server/
│   ├── index.js (serves static files from public/)
│   └── public/
│       └── stream-test.html (the test UI)
```

### Static File Serving
The server already serves static files from `server/public/` directory:
```javascript
// In server/index.js
const publicPath = path.join(__dirname, 'public');
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/stream/')) {
    return next();
  }
  express.static(publicPath)(req, res, next);
});
```

### API Endpoints Used
- `POST /api/auth/login` - User authentication
- `POST /api/live-streams` - Create new stream (requires auth token)

### Environment Variables Needed
- `IVS_PLAYBACK_URL` - Amazon IVS playback URL (optional, but recommended)
- `JWT_SECRET` - For token validation
- `DATABASE_URL` - For user authentication

## 🎯 Next Steps

1. **Deploy to Railway** using one of the methods above
2. **Test the UI** with a real user account
3. **Verify playback URL** displays correctly above preview
4. **Test stream creation** and preview functionality
5. **Share the URL** with your team for testing

---

**Status**: ✅ Ready to deploy
**URL**: `https://buzzit-production.up.railway.app/stream-test.html`
**Last Updated**: 2025-01-27


