# Quick Deployment Checklist

## Pre-Deployment Checklist

- [ ] Amazon IVS channel created in AWS Console
- [ ] IVS credentials obtained:
  - [ ] Ingest RTMPS URL
  - [ ] Stream Key
  - [ ] Playback URL
- [ ] Railway account created
- [ ] GitHub repository ready (if deploying from GitHub)

## Railway Deployment Steps

### Step 1: Prepare Repository
```bash
cd stream-test-app
git init
git add .
git commit -m "Initial commit: IVS Stream Test App"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Wait for initial deployment (it will fail without env vars - that's expected)

### Step 3: Configure Environment Variables

In Railway Dashboard → Your Project → Variables tab, add:

```env
IVS_INGEST_RTMPS_URL=rtmps://4232ed0fa439.global-contribute.live-video.net:443/app/
IVS_STREAM_KEY=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
IVS_PLAYBACK_URL=https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8
IVS_INGEST_URL=rtmp://4232ed0fa439.global-contribute.live-video.net/app/
PORT=3001
```

### Step 4: Redeploy

1. Railway will automatically redeploy after adding variables
2. Wait for deployment to complete (check logs for "IVS Stream Test App running on port 3001")
3. Click on the generated URL (e.g., `https://your-app.railway.app`)

### Step 5: Verify Deployment

- [ ] App loads without errors
- [ ] Status shows "Ready to stream!"
- [ ] Playback URL is displayed
- [ ] Streaming credentials are visible
- [ ] No configuration errors

## Testing the Stream

### Step 6: Configure OBS Studio

1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. Set **Service** to **"Custom"**
4. Copy **Server** URL from the web app: `rtmp://4232ed0fa439.global-contribute.live-video.net/app/`
5. Copy **Stream Key** from the web app: `sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6`
6. Click **OK**

### Step 7: Start Streaming

1. In OBS, add a source (Video Capture Device, Display Capture, etc.)
2. Click **"Start Streaming"** in OBS
3. Wait for OBS to show "Live" indicator

### Step 8: Watch the Stream

1. Go back to your deployed web app
2. Click **"Load Stream"** button
3. Stream should appear in the preview within 5-10 seconds
4. Status should change to "🔴 Live streaming!"

## Troubleshooting

### Deployment Issues

**App won't start:**
```bash
# Check Railway logs
railway logs
```
- Verify all environment variables are set
- Check for any error messages in logs

**Configuration incomplete error:**
- Double-check all IVS environment variables in Railway
- Ensure no typos in variable names
- Redeploy after adding variables

### Streaming Issues

**OBS won't connect:**
- Verify RTMP URL doesn't have `:443` in it (should be removed automatically)
- Check stream key is correct
- Try RTMPS URL if RTMP fails

**Stream not appearing:**
1. Verify OBS is streaming (check "Live" indicator)
2. Wait 10-15 seconds for stream to start
3. Click "Refresh" button in web app
4. Check browser console for errors
5. Verify playback URL is accessible

**Player error:**
- Check browser compatibility (use Chrome, Firefox, or Edge)
- Clear browser cache
- Try incognito/private mode
- Check AWS IVS console for channel status

### Network Issues

**CORS errors:**
- Ensure IVS playback domain allows cross-origin requests
- Check Railway deployment logs

**Connection timeout:**
- Verify IVS channel is active in AWS Console
- Check network firewall settings
- Try different network/internet connection

## Post-Deployment

### Monitoring

- [ ] Bookmark Railway deployment URL
- [ ] Save OBS streaming configuration
- [ ] Monitor Railway deployment logs for errors
- [ ] Test stream quality and latency

### Sharing

- [ ] Share deployment URL with team
- [ ] Document any custom configurations
- [ ] Add SSL certificate (Railway provides this automatically)

## Quick Commands

### Local Testing
```bash
cd stream-test-app
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
# Open http://localhost:3001
```

### Railway CLI Deployment
```bash
npm install -g @railway/cli
railway login
railway init
railway variables set IVS_INGEST_RTMPS_URL="rtmps://..."
railway variables set IVS_STREAM_KEY="sk_..."
railway variables set IVS_PLAYBACK_URL="https://..."
railway up
```

### View Logs
```bash
railway logs
```

### Update Deployment
```bash
git add .
git commit -m "Update app"
git push
# Railway auto-deploys on push
```

## Success Criteria

Your deployment is successful when:
- ✅ App loads at Railway URL
- ✅ Configuration shows "Ready to stream!"
- ✅ OBS connects and starts streaming
- ✅ Stream appears in web preview
- ✅ No errors in console or logs
- ✅ Status shows "🔴 Live streaming!"

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Amazon IVS Docs**: https://docs.aws.amazon.com/ivs/
- **OBS Studio**: https://obsproject.com/
- **IVS Console**: https://console.aws.amazon.com/ivs/

---

**Need Help?** Check the main README.md for detailed troubleshooting steps.
