# 🚂 Railway Deployment Setup for Buzz it Backend

## Important Configuration

When deploying to Railway, you MUST configure it to use the `server` directory as the root.

## Step-by-Step Deployment

### 1. Go to Railway Dashboard
Visit: https://railway.app

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `BuzzIt` repository

### 3. ⚠️ CRITICAL: Configure Root Directory
After selecting the repository, Railway will show deployment options.

**You must set the Root Directory to `server`**

In the deployment settings:
- **Root Directory**: `server` ⬅️ **THIS IS CRITICAL**
- **Build Command**: `npm install` (or leave empty)
- **Start Command**: `npm start`

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Why This Configuration?

Railway will:
1. Use `server/package.json` (not the root package.json)
2. Install only backend dependencies
3. Run the Express.js server from `server/index.js`

## If Deployment Fails

Check the build logs in Railway dashboard for:
- "No matching version found for react-native" → Root directory not set to `server`
- "Cannot find module" → Dependencies not installed
- "Port already in use" → Port configuration issue

## Troubleshooting

### Error: "copy package.json, server/package.json, package-lock.json"
This means Railway is trying to copy from root. Make sure Root Directory is set to `server`.

### Error: "npm ci" fails
Check that `server/package-lock.json` exists and is valid.

### Error: Module not found
Ensure all dependencies in `server/package.json` are correct.

## Test Your Deployment

Once deployed, Railway will provide a URL like:
`https://your-app.up.railway.app`

Test it:
```bash
curl https://your-app.up.railway.app/
```

Should return:
```json
{
  "message": "🔥 Buzz it Backend API",
  "version": "1.0.0"
}
```
