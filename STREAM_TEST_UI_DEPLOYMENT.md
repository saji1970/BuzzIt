# Stream Test UI - Deployment Guide

## 📋 Overview

A simple web UI has been created to test stream creation and preview functionality using Amazon IVS Player.

**File Created**: `server/public/stream-test.html`

## 🎯 Features

1. **Authentication**: Login with username/password
2. **Stream Creation**: Create a new stream with title, description, and category
3. **Playback URL Display**: Shows the playback URL above the preview window
4. **Live Preview**: Uses Amazon IVS Web Player SDK to preview the stream in real-time

## 📁 File Location

```
BuzzIt/
└── server/
    └── public/
        └── stream-test.html
```

## 🚀 Deployment to Railway

The file is automatically included in the Docker build and will be served as a static file.

### Access URL

Once deployed to Railway, the UI will be accessible at:

```
https://buzzit-production.up.railway.app/stream-test.html
```

### How It Works

1. **Static File Serving**: The server already serves static files from `server/public/` directory
2. **No Route Needed**: Since it's in the public directory, it's automatically accessible
3. **Docker Build**: The Dockerfile copies all HTML files from `server/public/` to the container

## 🔧 Testing Locally

1. **Start the server**:
   ```bash
   cd BuzzIt/server
   npm start
   ```

2. **Access the UI**:
   ```
   http://localhost:3000/stream-test.html
   ```

## 📝 Usage Instructions

### Step 1: Login
1. Enter your username and password
2. Click "Login"
3. The token will be stored in localStorage

### Step 2: Create Stream
1. Fill in the stream form:
   - **Title** (required): Enter a stream title
   - **Description** (optional): Enter a description
   - **Category** (optional): Enter a category (default: "general")
2. Click "Create Stream"
3. The stream will be created via the API

### Step 3: View Preview
1. The playback URL will appear above the preview window
2. The Amazon IVS player will automatically load and play the stream
3. If the stream is active, you'll see the live video

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Gradient background, card-based layout
- **Real-time Status**: Shows success/error messages
- **IVS Player Integration**: Uses official Amazon IVS Web Player SDK
- **Auto-playback**: Streams start automatically when loaded

## 🔗 API Endpoints Used

1. **POST `/api/auth/login`**: User authentication
2. **POST `/api/live-streams`**: Create a new stream

## 📦 Dependencies

The UI uses:
- **Amazon IVS Web Player SDK**: Loaded from CDN (`https://player.live-video.net/1.0.0/amazon-ivs-player.min.js`)
- **Native JavaScript**: No framework dependencies
- **Fetch API**: For API calls

## 🐛 Troubleshooting

### Stream Not Playing?
- Check if the stream is actually active in Amazon IVS
- Verify the playback URL is valid (should be an HLS `.m3u8` URL)
- Check browser console for IVS player errors

### Login Fails?
- Verify username/password are correct
- Check if the API endpoint is accessible
- Check browser console for network errors

### Playback URL Not Showing?
- The stream may not have an `ivsPlaybackUrl` set
- Check if `IVS_PLAYBACK_URL` environment variable is configured in Railway
- The stream might need to be active first

## 🚢 Railway Deployment

The file is automatically included when you deploy to Railway:

1. **Push to Git**: The file is already in the repository
2. **Railway Auto-Deploy**: Railway will detect changes and rebuild
3. **Access**: Navigate to `https://buzzit-production.up.railway.app/stream-test.html`

### Verify Deployment

After deployment, check:
1. ✅ File exists in Railway container: `ls public/stream-test.html`
2. ✅ Static file serving works: Access the URL
3. ✅ API endpoints are accessible: Check network tab

## 📸 Screenshot Description

The UI has:
- **Top Section**: Header with title and description
- **Left Panel**: Stream creation form with authentication
- **Right Panel**: Stream preview with playback URL display
- **Status Messages**: Success/error notifications

## ✅ Next Steps

1. Deploy to Railway (or it will auto-deploy on next push)
2. Access the URL: `https://buzzit-production.up.railway.app/stream-test.html`
3. Test stream creation and preview
4. Share the URL for testing

---

**Status**: ✅ Ready for deployment
**URL**: `https://buzzit-production.up.railway.app/stream-test.html`

