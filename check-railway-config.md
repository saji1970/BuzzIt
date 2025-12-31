# How to Check Railway Environment Variables

Since Railway CLI is not installed locally, here's how to check your configuration:

## Method 1: Check Railway Dashboard (Recommended)

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on **BuzzIt** project

3. **View Service Variables**
   - Click on your backend service
   - Click the **"Variables"** tab

4. **Check for These Variables**
   ```
   FACEBOOK_CLIENT_ID
   FACEBOOK_CLIENT_SECRET
   INSTAGRAM_CLIENT_ID
   INSTAGRAM_CLIENT_SECRET
   APP_BASE_URL
   DATABASE_URL
   JWT_SECRET
   ```

5. **What You Should See**
   - ✅ Variables shown = configured correctly
   - ❌ Variables missing = need to add them

## Method 2: Check Deployment Logs

1. **Open Railway Dashboard**
   - Go to your BuzzIt project
   - Click on your service

2. **View Logs**
   - Click **"Deployments"** tab
   - Click on the latest deployment
   - Click **"View Logs"**

3. **Look for Debug Output**

   When someone tries to connect Facebook, you'll see:
   ```
   [OAuth] facebook - clientId configured: true   ← Good!
   [OAuth] Environment check - FACEBOOK_CLIENT_ID exists: true
   ```

   Or if NOT configured:
   ```
   [OAuth] facebook - clientId configured: false  ← Problem!
   [OAuth] Environment check - FACEBOOK_CLIENT_ID exists: false
   ```

## Method 3: Test the API Endpoint

You can test if the backend can see the credentials by trying to connect in the app and checking the error message:

- **"Failed to get authentication URL"** = Environment variables NOT set
- **Opens browser to Facebook OAuth** = Environment variables ARE set

## Current Status

Based on the app error screenshot:
```
Connection Error
Failed to get facebook authentication URL. Please check server configuration.
```

This confirms: **Environment variables are NOT set in Railway**

## What to Do Next

1. Go to Railway Dashboard → Variables
2. Add the missing variables:
   ```
   FACEBOOK_CLIENT_ID = your_facebook_app_id
   FACEBOOK_CLIENT_SECRET = your_facebook_app_secret
   INSTAGRAM_CLIENT_ID = your_facebook_app_id
   INSTAGRAM_CLIENT_SECRET = your_facebook_app_secret
   ```
3. Railway will auto-deploy (1-2 minutes)
4. Test again in the app

## Need Facebook App Credentials?

If you don't have them yet:
1. Go to: https://developers.facebook.com/apps/
2. Create a new app (Business type)
3. Settings → Basic → Get App ID and App Secret
4. Add Facebook Login and Instagram Graph API products
5. Configure OAuth redirect URIs (see RAILWAY_SETUP_REQUIRED.md)
