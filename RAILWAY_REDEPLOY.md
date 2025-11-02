# How to Trigger Redeployment in Railway

## Method 1: Via Railway Web Dashboard (Easiest)

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Log in to your account
   - Navigate to your project

2. **Select Your Backend Service**
   - Click on your backend service (the one running `node index.js`)

3. **Trigger Redeploy**
   - Option A: Click the **"Deploy"** or **"Redeploy"** button (usually at the top right)
   - Option B: Go to **"Settings"** tab → Look for **"Redeploy"** or **"Trigger Deploy"** button
   - Option C: Go to **"Deployments"** tab → Click **"New Deployment"** or **"Redeploy Latest"**

4. **Wait for Deployment**
   - Railway will start building and deploying
   - Watch the logs to see the progress

## Method 2: Via Railway CLI

If you have Railway CLI installed:

```bash
# Make sure you're in your project directory
cd /Users/sajipillai/Buzzit

# Login (if not already logged in)
railway login

# Link to your project (if not already linked)
railway link

# Trigger redeployment
railway up

# Or deploy specific service
railway up --service your-service-name
```

## Method 3: Force Redeploy by Pushing Empty Commit

You can also trigger a redeploy by pushing a commit to GitHub (Railway watches your repo):

```bash
cd /Users/sajipillai/Buzzit
git commit --allow-empty -m "Trigger Railway redeployment"
git push origin main
```

## Method 4: Via Railway API

If you have Railway API access:

1. Get your Railway API token from Settings
2. Use the API to trigger a deployment
3. See Railway API documentation for details

## Quick Check After Redeploy

After redeployment, check Railway logs for:

```
🔍 Environment variable check:
  ✅ Found database-related environment variables:
    - DATABASE_URL: postgresql://postgres:****@...
🔍 Checking for database connection string...
  - DATABASE_URL: ✅ Set
✅ PostgreSQL connected successfully
```

## Troubleshooting

- **Can't find Redeploy button**: Try refreshing the page or check different tabs
- **Deployment not starting**: Check if there are any pending changes or build errors
- **Variables not updating**: Make sure you saved the variables before redeploying

