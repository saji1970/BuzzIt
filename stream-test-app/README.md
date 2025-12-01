# Amazon IVS Stream Test App

A standalone web application for testing Amazon Interactive Video Service (IVS) live streaming functionality. This app provides an easy way to verify your IVS setup, start streaming, and watch the live stream with a built-in player.

## Features

- 🎥 **Live Stream Preview** - Watch your IVS stream in real-time
- 📋 **Streaming Instructions** - Step-by-step guide to start streaming with OBS
- 🔑 **Credentials Display** - Easy access to your RTMP server and stream key
- 📊 **Stream Status** - Real-time stream status monitoring
- 🎨 **Modern UI** - Clean, responsive interface with visual feedback
- ☁️ **Railway Ready** - Pre-configured for Railway deployment

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Amazon IVS credentials:
   - `IVS_INGEST_RTMPS_URL` - Your IVS RTMPS ingest endpoint
   - `IVS_STREAM_KEY` - Your IVS stream key
   - `IVS_PLAYBACK_URL` - Your IVS playback URL
   - `IVS_INGEST_URL` - (Optional) RTMP ingest endpoint

3. **Start the Server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:3001
   ```

## Railway Deployment

### Method 1: Deploy from GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the configuration

3. **Set Environment Variables**

   In Railway dashboard, go to your project → Variables tab and add:
   ```
   IVS_INGEST_RTMPS_URL=rtmps://your-endpoint.global-contribute.live-video.net:443/app/
   IVS_STREAM_KEY=sk_your_stream_key_here
   IVS_PLAYBACK_URL=https://your-endpoint.playback.live-video.net/api/video/v1/your-channel.m3u8
   IVS_INGEST_URL=rtmp://your-endpoint.global-contribute.live-video.net/app/
   PORT=3001
   ```

4. **Deploy**
   - Railway will automatically deploy your app
   - Your app will be available at `https://your-app.railway.app`

### Method 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set IVS_INGEST_RTMPS_URL="rtmps://..."
   railway variables set IVS_STREAM_KEY="sk_..."
   railway variables set IVS_PLAYBACK_URL="https://..."
   railway variables set IVS_INGEST_URL="rtmp://..."
   railway variables set PORT=3001
   ```

5. **Deploy**
   ```bash
   railway up
   ```

## How to Use

### 1. Access the App
Open the deployed app URL in your browser.

### 2. Configure OBS Studio
The app will display your streaming credentials. In OBS:
- Go to **Settings** → **Stream**
- Set **Service** to "Custom"
- Copy the **Server** URL from the app
- Copy the **Stream Key** from the app
- Click **OK**

### 3. Start Streaming
- In OBS, click **Start Streaming**
- Go back to the web app
- Click **"Load Stream"** button
- Your stream should appear in the preview!

### 4. Monitor Stream
The app displays:
- Live stream preview
- Playback URL
- Stream status (Live, Buffering, Idle, etc.)
- Real-time status updates

## API Endpoints

### GET `/health`
Health check endpoint
```json
{
  "status": "ok",
  "message": "IVS Stream Test App is running"
}
```

### GET `/api/config`
Get IVS configuration status
```json
{
  "playbackUrl": "https://...",
  "ingestUrl": "rtmps://...",
  "streamKey": "••••••••",
  "hasConfig": true
}
```

### GET `/api/stream/status`
Get current stream status
```json
{
  "status": "ready",
  "message": "Use streaming software (OBS, etc.) to start streaming",
  "playbackUrl": "https://..."
}
```

### GET `/api/stream/instructions`
Get full streaming instructions and credentials
```json
{
  "ingestUrl": "rtmp://...",
  "streamKey": "sk_...",
  "playbackUrl": "https://...",
  "srtUrl": "srt://...",
  "instructions": ["1. ...", "2. ...", ...]
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `IVS_INGEST_RTMPS_URL` | RTMPS ingest endpoint (with :443 port) | Yes |
| `IVS_STREAM_KEY` | IVS stream key | Yes |
| `IVS_PLAYBACK_URL` | HLS playback URL | Yes |
| `IVS_INGEST_URL` | RTMP ingest endpoint (fallback) | No |
| `IVS_SRT_URL` | SRT ingest endpoint | No |
| `PORT` | Server port (default: 3001) | No |

## Troubleshooting

### Stream Not Loading
1. Check that all environment variables are set correctly
2. Verify your IVS credentials in AWS Console
3. Ensure OBS is actively streaming
4. Check browser console for errors
5. Try clicking "Refresh" button

### Configuration Incomplete Error
- Ensure all required environment variables are set
- Check Railway dashboard Variables tab
- Restart the Railway deployment after adding variables

### CORS Errors
- The app includes CORS middleware, but ensure your IVS playback domain allows cross-origin requests

### Player Not Supported
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Ensure JavaScript is enabled
- Try a different browser if issues persist

## Technical Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + HTML5
- **Video Player**: Amazon IVS Web Player SDK v1.46.0
- **Styling**: Custom CSS with modern gradients
- **Deployment**: Railway (Nixpacks)

## Project Structure

```
stream-test-app/
├── public/
│   └── index.html          # Frontend UI with IVS player
├── server.js               # Express server with API endpoints
├── package.json            # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── railway.json           # Railway deployment config
└── README.md              # This file
```

## Security Notes

- Stream keys are masked in API responses for security
- Never commit `.env` file to version control
- Use environment variables for all sensitive credentials
- The app only exposes masked credentials in the frontend

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Amazon IVS documentation: https://docs.aws.amazon.com/ivs/
3. Check Railway deployment logs for errors

## License

MIT

---

**Made with ❤️ for BuzzIt**
