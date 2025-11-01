# 🚂 Deploy Buzzit Backend to Railway

## ✅ Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app) with GitHub)

## 🚀 Quick Deploy (5 minutes)

### Step 1: Push Backend Code to GitHub

```bash
# Make sure your backend is ready
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

**Note:** The repository now includes Railway configuration files:
- `railway.json` - Railway deployment configuration
- `Dockerfile` - Docker build configuration (primary method)
- `railway.toml` - Alternative Railway configuration
- `Procfile` - Process definition (fallback)
- `.railwayignore` - Files to exclude from deployment

### Step 2: Deploy to Railway

1. **Visit:** https://railway.app
2. **Sign in** with GitHub
3. **Click** "New Project"
4. **Select** "Deploy from GitHub repo"
5. **Choose** your Buzzit repository
6. **Railway will automatically detect:**
   - Builder: Docker (using root `Dockerfile`)
   - Build Command: Auto-configured from `Dockerfile`
   - Start Command: Auto-configured from `Dockerfile`
7. **Click** "Deploy"

**No manual configuration needed!** Railway will use the Dockerfile for building and deployment.

**Note:** The Dockerfile is configured to build from the `server/` directory automatically.

### Step 3: Get Your API URL

Railway will provide a URL like:
- `https://buzzit-production.up.railway.app`

Copy this URL!

### Step 4: Update App Configuration

Edit `src/config/API_CONFIG.ts`:

```typescript
PRODUCTION_BACKEND: 'https://buzzit-production.up.railway.app',
```

### Step 5: Test Your Deployment

```bash
# Test the root endpoint
curl https://buzzit-production.up.railway.app/

# Should return:
# {"message":"Buzz it Backend API is running!","timestamp":"...","port":3000}

# Test API endpoints (examples)
curl https://buzzit-production.up.railway.app/api/users
curl https://buzzit-production.up.railway.app/api/channels
```

If you get responses, your deployment is successful! 🎉

## 🎉 Done!

Your backend is now live on Railway with automatic HTTPS!

## 📋 What You Get

- ✅ **Free Tier** - Up to $5/month free
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **Zero Config** - Railway handles everything
- ✅ **Instant Deploys** - Push to GitHub = auto-deploy
- ✅ **Built-in Monitoring** - Logs and metrics
- ✅ **Environment Variables** - Secure config management
- ✅ **Custom Domains** - Add your own domain easily

## 🔧 Environment Variables Setup

**Required Environment Variables:**

1. In Railway dashboard → Your project → **Variables** tab
2. Add these variables (click "New Variable" for each):

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Security (REQUIRED for production!)
JWT_SECRET=your-strong-random-secret-key-here

# Twilio (Optional - only if using SMS features)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Important:** 
- Generate a strong `JWT_SECRET` for production (use a random string generator)
- Railway automatically sets `PORT` - you don't need to set it manually
- Twilio variables are optional and only needed if you're using SMS features

**Quick JWT Secret Generator:**
```bash
# Generate a secure random secret
openssl rand -base64 32
```

## 📊 Railway Dashboard Features

- **Deployments** - View all deployments
- **Metrics** - CPU, memory, bandwidth usage
- **Logs** - Real-time logs
- **Settings** - Configure domain, environment, etc.

## 🆘 Troubleshooting

### Build Failed
- Check **Logs** tab in Railway dashboard for specific error messages
- Ensure `Dockerfile` exists in the root directory
- Verify `server/package.json` exists and is valid
- Test Docker build locally: `docker build -t buzzit-backend .`
- Check that all dependencies are listed in `server/package.json`
- **If Docker build fails:** Check logs for missing dependencies or syntax errors
- **To rebuild:** Railway dashboard → Deployments → Redeploy or clear cache

### App Won't Start
- Check **Logs** for errors (most common issue!)
- Verify `JWT_SECRET` environment variable is set
- Railway sets `PORT` automatically - don't override it
- Check that `Procfile` or `nixpacks.toml` start command is correct
- Ensure `server/index.js` exists and is valid

### 404 Errors
- Verify the service is running (check Metrics tab)
- Check your routes in `server/index.js`
- Test the root endpoint: `curl https://your-app.up.railway.app/`
- Look at logs for routing errors

### Deployment Hangs or Times Out
- Check if the build is taking too long
- Review the Logs tab for specific error messages
- Ensure all dependencies are in `package.json` (not just dev dependencies)

## 💰 Pricing

- **Free Tier:** $5/month credit (plenty for this app!)
- **Hobby:** $5/month (if you exceed free tier)
- No credit card needed for free tier

## 📚 More Resources

- Railway Docs: https://docs.railway.app
- Support: https://railway.app/discord
- Status: https://status.railway.app

## 🔄 Updating Your App

Just push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway automatically redeploys! ✨

