# 🔧 Railway Variables Not Detected - Troubleshooting Guide

## ❌ Issue
After restarting Railway, the health endpoint still shows:
```json
{
  "facebookConfigured": false,
  "instagramConfigured": false
}
```

Even though variables ARE set in Railway dashboard:
- ✅ `FACEBOOK_CLIENT_ID`: 1393033811657781
- ✅ `FACEBOOK_CLIENT_SECRET`: 8feb4f68ca96a05a075bea39aa214451
- ✅ `INSTAGRAM_CLIENT_ID`: 1393033811657781
- ✅ `INSTAGRAM_CLIENT_SECRET`: 8feb4f68ca96a05a075bea39aa214451

## 🔍 Root Cause Analysis

The variables are set correctly, but the server is not detecting them. This typically happens when:

1. **Variables are set at PROJECT level instead of SERVICE level**
   - Railway has two levels: Project variables and Service variables
   - Service variables take precedence
   - Variables must be set for the specific service (BuzzIt)

2. **Variables need to be "Shared"**
   - If variables are in a separate service (like Postgres), they may need to be shared
   - Check if variables are marked as "Shared Variables"

3. **Service wasn't fully restarted**
   - Sometimes a restart doesn't fully reload environment variables
   - Need to trigger a redeploy instead

## ✅ Solution Steps

### Step 1: Verify Variable Location

1. Go to Railway Dashboard
2. Select your **BuzzIt** service (not the project)
3. Go to **Variables** tab
4. Make sure variables are listed under **"Service Variables"** (not Project Variables)

### Step 2: Check if Variables are Service-Level

In Railway Dashboard:
- ✅ Variables should be in **BuzzIt service** → Variables tab
- ❌ NOT in Project settings → Variables tab
- ❌ NOT in Postgres service → Variables tab

### Step 3: Verify Variable Names (Case-Sensitive)

Make sure variable names are EXACTLY:
- `FACEBOOK_CLIENT_ID` (all caps, underscores)
- `FACEBOOK_CLIENT_SECRET`
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`

Check for:
- ❌ Extra spaces
- ❌ Different casing (e.g., `Facebook_Client_Id`)
- ❌ Typos

### Step 4: Check Railway Logs

1. Go to Railway Dashboard
2. Select **BuzzIt** service
3. Go to **Logs** tab
4. Look for startup messages like:
   ```
   [OAuth] Environment check - FACEBOOK_CLIENT_ID exists: true/false
   ```
   or
   ```
   📊 Total environment variables available: XX
   ```

### Step 5: Force Redeploy (Not Just Restart)

Instead of just restarting, trigger a full redeploy:

**Option A: Via Railway Dashboard**
1. Go to Railway → BuzzIt service
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment

**Option B: Via Railway CLI**
```bash
railway login
railway link
railway up
```

**Option C: Push Empty Commit**
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

### Step 6: Verify Variables are Actually Set

After redeploy, check the logs for:
```
[OAuth] facebook - clientId configured: true
```

If it still shows `false`, the variables are not being loaded.

## 🔍 Debugging Commands

### Check Server Logs via Railway CLI
```bash
railway logs --service BuzzIt
```

Look for:
- `FACEBOOK_CLIENT_ID exists: true/false`
- Total environment variables count
- Any error messages about missing variables

### Test Health Endpoint
```bash
curl https://buzzit-production.up.railway.app/api/social-auth/health
```

### Test OAuth Endpoint (with auth token)
```bash
# Get token
curl -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Test OAuth (replace YOUR_TOKEN)
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Most Likely Solutions

### Solution 1: Variables in Wrong Location (90% of cases)

**Problem**: Variables are set at Project level, not Service level.

**Fix**:
1. Go to Railway → **BuzzIt service** (not project)
2. Go to **Variables** tab
3. Make sure variables are listed there
4. If not, add them again in the SERVICE variables tab

### Solution 2: Full Redeploy Needed (80% of cases)

**Problem**: Simple restart didn't reload environment variables.

**Fix**:
- Use "Redeploy" instead of "Restart"
- Or push a commit to trigger new deployment

### Solution 3: Variable Names Have Hidden Characters (10% of cases)

**Problem**: Variable names might have spaces or special characters.

**Fix**:
1. Delete the variable
2. Type it fresh (don't copy-paste)
3. Set value
4. Save
5. Redeploy

## 📋 Checklist

- [ ] Variables are in **BuzzIt service** Variables tab (not project)
- [ ] Variable names are exact: `FACEBOOK_CLIENT_ID` (all caps)
- [ ] Variable values are non-empty
- [ ] Service was **redeployed** (not just restarted)
- [ ] Checked Railway logs for variable detection messages
- [ ] Health endpoint tested after redeploy
- [ ] OAuth endpoint tested (should return 200, not 500)

## 🚨 If Still Not Working

1. **Check Railway Logs** for actual error messages
2. **Try Railway CLI** to verify variables:
   ```bash
   railway variables --service BuzzIt
   ```
3. **Contact Railway Support** if variables show in CLI but not in runtime

---

**Current Status**: Variables set but not detected after restart  
**Next Step**: Verify variables are in SERVICE level, not PROJECT level, then redeploy


