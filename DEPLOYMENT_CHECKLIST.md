# BuzzIt Live Streaming - Deployment Checklist

## ✅ Completed Fixes

### 1. Mobile App RTMP URL Bug Fixed ✓
**File:** `src/screens/GoBuzzLiveScreen.tsx`

**Issue:** When converting RTMPS URLs to RTMP, the port `:443` was not being removed, causing connection failures.

**Fix:** Updated `buildRtmpIngestUrl()` function to:
- Convert `rtmps://` to `rtmp://`
- Remove `:443` port specification
- Use default RTMP port (1935)

**Result:**
```typescript
// Before: rtmp://4232ed0fa439.global-contribute.live-video.net:443/app/sk_us-west-2_...
// After:  rtmp://4232ed0fa439.global-contribute.live-video.net/app/sk_us-west-2_...
```

### 2. Environment Configuration Created ✓
**File:** `server/.env.example`

Created template with all required IVS environment variables for Railway deployment.

### 3. Comprehensive Setup Guide Created ✓
**File:** `IVS_SETUP_GUIDE.md`

Complete documentation covering:
- Architecture overview
- Configuration steps
- Troubleshooting guide
- Security best practices
- Cost optimization tips

---

## 🚀 Deployment Steps (Required)

### Step 1: Set Environment Variables on Railway

⚠️ **CRITICAL:** These environment variables MUST be set for live streaming to work!

Go to Railway → Your Project → Backend Service → Variables Tab

**Add these variables:**

```bash
IVS_INGEST_RTMPS_URL=rtmps://4232ed0fa439.global-contribute.live-video.net:443/app/
IVS_STREAM_KEY=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
IVS_PLAYBACK_URL=https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8
IVS_SRT_URL=srt://4232ed0fa439.srt.live-video.net:9000?streamid=sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6
```

### Step 2: Deploy Backend Changes

```bash
# Commit and push changes
git add .
git commit -m "Fix IVS live streaming configuration and RTMP URL building"
git push origin main
```

Railway will automatically deploy the changes.

### Step 3: Verify Deployment

**Test Configuration Endpoint:**
```bash
curl https://buzzit-production.up.railway.app/api/live-streams/config
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "hasIvsIngest": true,
    "hasIvsStreamKey": true,
    "hasPlaybackUrl": true,
    "hasSrtCredentials": true,
    "ingestPreview": "rtmps://4232...net",
    "streamKeyPreview": "sk_u...PZ6",
    "playbackPreview": "https://4232...m3u8"
  }
}
```

### Step 4: Test Mobile App

1. **Build and install the mobile app:**
   ```bash
   # For Android
   npm run android

   # For iOS
   npm run ios
   ```

2. **Test live streaming:**
   - Open BuzzIt app
   - Navigate to "Go Buzz Live"
   - Enter stream title and description
   - Tap "Go Live"
   - **Expected:** Camera preview appears and stream starts
   - Verify broadcast credentials are shown

3. **Check connection:**
   - Status should change from "Connecting..." to "Live"
   - LIVE badge should appear in red
   - Camera controls should be functional

### Step 5: Test Web Viewer

1. **Get stream URL from mobile app:**
   - While streaming, tap the Share button
   - Copy the stream URL (e.g., `https://buzzit-production.up.railway.app/stream/abc123`)

2. **Open in web browser:**
   - Paste URL in Chrome, Firefox, or Safari
   - **Expected:** Video player loads and shows live stream
   - Viewer count increments
   - LIVE badge is visible

3. **Test controls:**
   - Play/pause should work
   - Share button should copy link
   - Viewer count should update every 5 seconds

---

## 🧪 Testing Checklist

### Mobile App Testing

- [ ] Stream creation succeeds
- [ ] Camera preview appears
- [ ] RTMP connection establishes (status: "Live")
- [ ] Camera switch button works
- [ ] Comments can be sent and appear
- [ ] Viewer count updates
- [ ] Share button works
- [ ] Stream can be ended gracefully
- [ ] Broadcast credentials are visible and copyable

### Web Viewer Testing

- [ ] Stream page loads (`/stream/:id`)
- [ ] Video player appears
- [ ] HLS stream plays successfully
- [ ] LIVE badge is visible
- [ ] Viewer count displays correctly
- [ ] Viewer count increments on page load
- [ ] Viewer count decrements on page close
- [ ] Share functionality works
- [ ] Stream ends gracefully when broadcaster stops

### Cross-Platform Testing

- [ ] Mobile broadcast → Web viewer can watch
- [ ] Multiple web viewers can watch simultaneously
- [ ] Viewer count reflects all connected viewers
- [ ] Stream quality is acceptable (1.8 Mbps)
- [ ] Latency is low (< 5 seconds)

---

## 🐛 Troubleshooting

### Issue: Mobile app shows "Streaming URL missing"

**Cause:** Environment variables not set on Railway

**Solution:**
1. Verify variables are set in Railway dashboard
2. Redeploy backend
3. Wait 2-3 minutes for deployment to complete
4. Test configuration endpoint
5. Restart mobile app

### Issue: Connection timeout or "Connecting..." never changes to "Live"

**Cause:** Invalid RTMP URL or network issue

**Solution:**
1. Check server logs on Railway for errors
2. Verify stream key is correct
3. Test RTMP endpoint with OBS:
   - Open OBS Studio
   - Settings → Stream
   - Service: Custom
   - Server: `rtmp://4232ed0fa439.global-contribute.live-video.net/app/`
   - Stream Key: `sk_us-west-2_aJE3SKSY6Wzy_CruB8zI61cLLda7jS7uRE4rTSrJPZ6`
   - Start Streaming
4. If OBS fails too, check AWS IVS console for channel status

### Issue: Web viewer shows "Stream not found"

**Cause:** Stream not in database or wrong ID

**Solution:**
1. Verify stream was created in mobile app
2. Check backend logs for stream creation
3. Query database for active streams:
   ```bash
   curl https://buzzit-production.up.railway.app/api/live-streams
   ```
4. Verify stream ID in URL matches database

### Issue: Video player loads but no video appears

**Cause:** Playback URL not configured or stream not active

**Solution:**
1. Verify `IVS_PLAYBACK_URL` is set on Railway
2. Test playback URL directly:
   ```bash
   curl -I https://4232ed0fa439.us-west-2.playback.live-video.net/api/video/v1/us-west-2.700880966833.channel.O48M91kSl9qu.m3u8
   ```
3. Ensure mobile app is actually streaming (status: "Live")
4. Check AWS IVS console for active streams

### Issue: Fallback credentials not working

**Cause:** Fallback credentials may be outdated or invalid

**Solution:**
1. **Always set Railway environment variables** (don't rely on fallbacks)
2. If you must use fallbacks, verify they match AWS IVS channel
3. Check `src/screens/GoBuzzLiveScreen.tsx` lines 24-26
4. Generate new IVS channel credentials in AWS console

---

## 📋 Post-Deployment Verification

### 1. Check Backend Health
```bash
curl https://buzzit-production.up.railway.app/health
```

### 2. Verify IVS Configuration
```bash
curl https://buzzit-production.up.railway.app/api/live-streams/config
```

### 3. Create Test Stream (Authenticated)
```bash
# Replace YOUR_AUTH_TOKEN with actual JWT token
curl -X POST https://buzzit-production.up.railway.app/api/live-streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "title": "Test Stream",
    "description": "Testing IVS configuration",
    "category": "general"
  }'
```

### 4. Monitor Server Logs
```bash
# In Railway dashboard
# Go to Deployments → Latest Deployment → View Logs
# Look for:
# - "IVS configuration loaded"
# - "Stream created: [stream-id]"
# - "RTMP connection established"
```

---

## 🔐 Security Notes

### Current State
- ✓ Fallback credentials exist in mobile app (for development)
- ✓ Server credentials in environment variables (not committed)
- ✓ Credentials masked in API responses

### Production Recommendations
1. **Remove fallback credentials** from `GoBuzzLiveScreen.tsx` after confirming Railway variables work
2. **Rotate IVS credentials** regularly (monthly)
3. **Implement rate limiting** on stream creation endpoint
4. **Monitor IVS usage** to prevent abuse
5. **Set up CloudWatch alarms** for unusual activity

---

## 📊 Monitoring

### Key Metrics to Watch

1. **Stream Creation Rate:**
   - Normal: 5-10 streams/hour
   - Alert: > 50 streams/hour (possible abuse)

2. **Concurrent Streams:**
   - Normal: 1-5 active streams
   - Alert: > 20 streams (check for issues)

3. **Average Stream Duration:**
   - Normal: 15-60 minutes
   - Alert: > 4 hours (implement auto-timeout)

4. **IVS Costs:**
   - Monitor AWS billing dashboard
   - Set up billing alerts at $50, $100, $200
   - Expected: $10-50/month for moderate usage

5. **Viewer Count:**
   - Track average viewers per stream
   - Peak concurrent viewers
   - Total viewer minutes

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] Railway environment variables are set
- [ ] Backend deployed successfully
- [ ] Configuration endpoint returns correct values
- [ ] Mobile app builds without errors
- [ ] Mobile app can create streams
- [ ] Mobile app can broadcast live video
- [ ] Web viewer can load stream pages
- [ ] Web viewer can play live streams
- [ ] Viewer count updates correctly
- [ ] Streams can be ended gracefully
- [ ] Error handling works (network issues, etc.)
- [ ] Server logs show no errors
- [ ] AWS IVS console shows active channel
- [ ] Documentation is accessible to team
- [ ] Backup plan exists for credential rotation

---

## 📞 Support Resources

- **IVS Setup Guide:** See `IVS_SETUP_GUIDE.md`
- **Server Env Template:** See `server/.env.example`
- **AWS IVS Docs:** https://docs.aws.amazon.com/ivs/
- **Railway Docs:** https://docs.railway.app/
- **Amazon IVS Player SDK:** https://docs.aws.amazon.com/ivs/latest/userguide/player.html

---

## 🎉 Success Criteria

Live streaming is working correctly when:

1. ✓ User can go live from mobile app without errors
2. ✓ Stream appears in live streams list
3. ✓ Web viewers can watch the stream with low latency (< 5 sec)
4. ✓ Viewer count updates in real-time
5. ✓ Stream quality is good (clear video and audio)
6. ✓ No connection drops or timeouts
7. ✓ Stream ends cleanly when broadcaster stops
8. ✓ Multiple viewers can watch simultaneously
9. ✓ Comments work in real-time
10. ✓ Share functionality distributes correct URLs

---

**Last Updated:** 2025-11-18
**Version:** 1.0
**Status:** Ready for Deployment ✅
