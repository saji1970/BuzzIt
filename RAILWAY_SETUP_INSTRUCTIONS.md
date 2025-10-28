# Railway Backend Deployment Instructions

## Current Issue
The Railway URL `https://buzzit-production.up.railway.app` is currently serving the Expo app instead of the backend API.

## How to Fix

### Option 1: Redeploy Backend to Railway (Recommended)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Log in with your account

2. **Find Your Project**
   - Look for the project "buzzit-production"
   - Click on it to open

3. **Check Current Deployment**
   - Go to the "Settings" tab
   - Check the "Root Directory" setting
   - It's likely set to `/` (root) which deploys the entire project (including the Expo app)

4. **Change Root Directory**
   - Change the "Root Directory" to `/server`
   - This will make Railway deploy only the backend server

5. **Redeploy**
   - Go to the "Deployments" tab
   - Click "Redeploy" or trigger a new deployment

### Option 2: Create New Service for Backend

1. **Create New Service**
   - In your Railway project, click "New Service"
   - Choose "GitHub Repo" and connect your repository
   - Set the "Root Directory" to `/server`
   - Name it "buzzit-backend"

2. **Update API URL**
   - Once deployed, you'll get a new URL like `https://buzzit-backend-xxxx.up.railway.app`
   - Update the `API_BASE_URL` in `src/services/APIService.ts` to this new URL

### Option 3: Use Different Railway Project

1. **Create New Project**
   - In Railway dashboard, create a new project
   - Name it "buzzit-api"

2. **Deploy Backend**
   - Click "New Service" → "GitHub Repo"
   - Connect your Buzzit repository
   - Set "Root Directory" to `/server`
   - Deploy

3. **Update API URL**
   - Get the new deployment URL
   - Update the code to use the new URL

## Backend Server Requirements

The backend server should:
- Listen on the port specified by Railway (usually from `PORT` environment variable)
- Have a proper `package.json` with start script
- Have all dependencies installed

## Current Backend Configuration

The backend is located in the `/server` directory and includes:
- `index.js` - Main server file
- `package.json` - Dependencies and scripts
- `railway.json` - Railway configuration
- Proper start script: `npm start`

## Testing the Backend

Once deployed, you can test the backend by visiting:
- `https://your-railway-url.app/api/features`
- This should return JSON with feature configuration

## Current Status

- ✅ Backend code is ready and working locally
- ✅ All API endpoints are implemented
- ❌ Railway is serving the wrong project (Expo instead of backend)
- ⏳ Waiting for Railway dashboard access to fix deployment

## Quick Fix

If you need the app working immediately while fixing Railway:

1. The app is currently configured to use Railway API
2. If Railway is not working, you can temporarily switch to local backend by changing `API_BASE_URL` back to `'http://127.0.0.1:3000'`
3. Run the local backend server: `cd server && node index.js`

