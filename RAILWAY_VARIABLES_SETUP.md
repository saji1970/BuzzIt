# Railway Environment Variables Setup Guide

## Problem: Variables Not Showing or Not Being Passed

If your Railway deployment runs but environment variables (like `DATABASE_URL`) aren't being picked up, follow these steps:

## Solution: Set Variables Correctly in Railway

### Method 1: Set Variable in Backend Service (Recommended)

1. **Go to Railway Dashboard**
   - Navigate to your project
   - Click on your **Backend Service** (the service running `node index.js`)

2. **Open Variables Tab**
   - Click on the **"Variables"** tab
   - This shows all environment variables for this service

3. **Add DATABASE_URL**
   - Click **"New Variable"** or **"Add Variable"** button
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:PVBWkzlYhxOcwmOGAsHMGbBiDeRInVFK@interchange.proxy.rlwy.net:49817/railway`
   - Click **"Add"** or **"Save"**

4. **Verify Variable is Added**
   - You should see `DATABASE_URL` in the variables list
   - Check that the value is correct (it will be hidden/redacted for security)

5. **Redeploy**
   - Railway should automatically redeploy
   - Or click **"Deploy"** or **"Redeploy"** button manually

### Method 2: Link PostgreSQL Service to Backend Service

1. **Go to Backend Service Settings**
   - Railway Dashboard → Your Project → Backend Service
   - Click **"Settings"** tab

2. **Check Service Dependencies**
   - Look for **"Service Dependencies"** or **"Linked Services"**
   - If PostgreSQL is not linked:
     - Click **"Add Service"** or **"Link Service"**
     - Select your PostgreSQL service
     - Railway will automatically share `DATABASE_URL`

3. **Verify**
   - Go back to **"Variables"** tab
   - You should see `DATABASE_URL` appear automatically

### Method 3: Set at Project Level (If Available)

Some Railway setups allow project-level variables:

1. **Go to Project Settings**
   - Railway Dashboard → Your Project
   - Click **"Settings"** (project level, not service level)

2. **Set Project Variables**
   - Look for **"Variables"** or **"Environment Variables"**
   - Add `DATABASE_URL` here
   - This will be available to all services in the project

## Troubleshooting

### Issue: Variable is Set But Still Not Working

1. **Check Variable Name**
   - Must be exactly: `DATABASE_URL` (case-sensitive, all caps)
   - No spaces before or after
   - No quotes around the value

2. **Check Service Context**
   - Make sure you're setting it in the **Backend Service**, not PostgreSQL service
   - Backend Service is the one that runs your Node.js app

3. **Force Redeploy**
   - After setting variable, manually trigger a redeploy
   - Railway Dashboard → Backend Service → **"Deploy"** button

4. **Check Build Logs**
   - Look for the debug output:
   ```
   🔍 Environment variable debug (filtered):
     - DATABASE_URL: postgresql://postgres:****@...
   ```
   - If you don't see this, the variable isn't being passed

### Issue: Variables Tab is Empty or Not Showing

1. **Refresh Railway Dashboard**
   - Sometimes the UI needs a refresh
   - Try logging out and back in

2. **Check Service Permissions**
   - Make sure you have edit access to the service
   - If you're using a team, check your role permissions

3. **Try Railway CLI**
   - Install Railway CLI: `npm i -g @railway/cli`
   - Set variable: `railway variables set DATABASE_URL="your_connection_string"`
   - Deploy: `railway up`

### Issue: Variable Shows But App Still Says "Not Set"

1. **Check Variable Scope**
   - Variables set in build-time might not be available at runtime
   - Make sure it's set as a **runtime** environment variable

2. **Verify Value Format**
   - Connection string should start with `postgresql://`
   - Should include username, password, host, port, and database
   - No extra quotes or spaces

3. **Check for Typos**
   - Variable name: `DATABASE_URL` (not `DATABASE-URL` or `database_url`)
   - Make sure it's exactly as shown

## Quick Verification Commands

After setting the variable, check Railway logs for:

```
🔍 Checking for database connection string...
  - DATABASE_URL: ✅ Set  <-- Should see this!
```

If you see `❌ Not set`, the variable is not being passed correctly.

## Alternative: Use Railway CLI

If the web UI isn't working:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set the variable
railway variables set DATABASE_URL="postgresql://postgres:PVBWkzlYhxOcwmOGAsHMGbBiDeRInVFK@interchange.proxy.rlwy.net:49817/railway"

# Verify it was set
railway variables

# Redeploy
railway up
```

## Still Not Working?

If variables still aren't showing or working:

1. **Take a screenshot** of:
   - The Variables tab in your Backend Service
   - The deployment logs showing the error

2. **Check Railway Status**
   - Visit Railway status page
   - Make sure there are no service issues

3. **Try Setting via Railway API**
   - Railway has an API for setting variables
   - Check Railway documentation for API access

