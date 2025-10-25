# 🚂 Railway Deployment with Your Token

## Your Railway Token
```
2a211ac2-6f2f-4720-947d-2f5ec3812ad3
```

## Quick Deploy Options

### Option 1: Using Railway CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login with your token:**
   ```bash
   railway login --token 2a211ac2-6f2f-4720-947d-2f5ec3812ad3
   ```

3. **Navigate to server directory:**
   ```bash
   cd server
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Option 2: Using the Deploy Script

1. **Run the deployment script:**
   ```bash
   ./deploy-to-railway.sh
   ```

### Option 3: Manual Railway Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `BuzzIt` repository
5. **IMPORTANT:** Set Root Directory to `server`
6. Click "Deploy"

## After Deployment

1. **Get your Railway URL** from the Railway dashboard
2. **Update the app configuration:**

   Edit `src/config/API_CONFIG.ts`:
   ```typescript
   PRODUCTION_BACKEND: 'https://your-actual-url.up.railway.app',
   ```

   Edit `src/services/APIService.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-actual-url.up.railway.app';
   ```

3. **Test the deployment:**
   ```bash
   curl https://your-url.up.railway.app/health
   ```

   Should return:
   ```json
   {
     "status": "ok",
     "uptime": 123.45,
     "timestamp": "2025-10-25T13:00:00.000Z"
   }
   ```

## Enable Backend in App

1. **Set `USE_BACKEND: true`** in `src/config/API_CONFIG.ts`
2. **Update UserContext** to use APIService instead of AsyncStorage
3. **Test the integration**

## Troubleshooting

### If deployment fails:
- Check that Root Directory is set to `server`
- Verify `server/package.json` exists
- Check Railway logs in dashboard

### If API calls fail:
- Verify the URL is correct
- Check CORS settings
- Test with curl first

## Your Token Details
- **Token:** `2a211ac2-6f2f-4720-947d-2f5ec3812ad3`
- **Usage:** For Railway CLI authentication
- **Security:** Keep this token secure

## Next Steps
1. Deploy backend using one of the methods above
2. Get your Railway URL
3. Update app configuration
4. Test the connection
5. Enable backend mode in the app