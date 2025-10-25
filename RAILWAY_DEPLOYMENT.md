# 🚂 Deploy Buzz it Backend to Railway

This guide will help you deploy the Buzz it backend API to Railway.com.

## Prerequisites

1. GitHub account
2. Railway account (login with GitHub)
3. Backend server code (in `/server` directory)

## Step 1: Push Code to GitHub

```bash
# Make sure you're in the project root
cd /Users/sajipillai/Buzzit

# Add all files
git add .

# Commit changes
git commit -m "Add backend API for Railway deployment"

# Push to GitHub
git push origin main
```

## Step 2: Deploy to Railway

### Method 1: Via Railway Web Dashboard (Recommended)

1. **Go to [railway.app](https://railway.app)** and login with GitHub
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Select your Buzz it repository**
5. **Configure the deployment:**
   - Root Directory: Set to `server` (since backend is in server folder)
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Click "Deploy"**

### Method 2: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Go to server directory
cd server

# Initialize Railway project
railway init

# Set root directory to server
railway link

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway dashboard:
1. Go to your project
2. Click on your service
3. Go to "Variables" tab
4. Add:
   - `NODE_ENV=production`
   - `PORT=3000` (Railway auto-assigns this)

## Step 4: Get Your API URL

1. In Railway dashboard, go to your service
2. Click on the domain
3. Copy the generated URL (e.g., `https://buzzit-backend.railway.app`)
4. This is your backend API URL

## Step 5: Update Frontend to Use API

In your React Native app, create an API configuration file:

```typescript
// src/config/api.ts
export const API_URL = 'https://your-backend-url.railway.app';
```

Then update your fetch calls to use this URL instead of AsyncStorage.

## Monitoring & Logs

- View logs: Railway dashboard → Service → Logs
- Monitor metrics: Railway dashboard → Service → Metrics
- Check domain: Railway dashboard → Service → Networking

## Troubleshooting

### Build Fails
- Check that `server/package.json` exists
- Verify Node.js version compatibility
- Check build logs in Railway dashboard

### API Not Responding
- Check if service is running (Status should be "Running")
- Verify PORT environment variable
- Check server logs for errors

### CORS Errors
- Add frontend domain to CORS whitelist in `server/index.js`
- Update CORS configuration in production

## Next Steps

1. **Add Database**: Replace in-memory storage with PostgreSQL
2. **Add Authentication**: Implement JWT tokens
3. **Add Rate Limiting**: Protect your API from abuse
4. **Set up Monitoring**: Add error tracking (Sentry)
5. **Configure Custom Domain**: Use your own domain name

## Support

For Railway-specific issues, check:
- [Railway Documentation](https://docs.railway.app)
- [Railway Community](https://community.railway.app)

For backend issues, check the server logs in Railway dashboard.
