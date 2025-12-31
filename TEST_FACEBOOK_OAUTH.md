# 🔍 Facebook OAuth URL Endpoint Test Results

## 📋 Test Summary

**Endpoint:** `GET /api/social-auth/oauth/facebook/url`  
**Production URL:** `https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url`  
**Status:** ❌ **404 Not Found**

## 🔍 Test Results

### Test 1: Unauthenticated Request
```bash
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url
```
**Result:** ❌ 404 Not Found

### Test 2: Authenticated Request
```bash
# Step 1: Login
curl -X POST https://buzzit-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Step 2: Test OAuth URL endpoint (with token)
curl https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Result:** ❌ 404 Not Found

## ⚠️ Issue Identified

The endpoint is returning **404 Not Found**, which suggests one of the following:

1. **Routes not deployed**: The `socialAuthRoutes.js` file may not be included in the production deployment
2. **Routes failed to load**: The route loading may be failing silently in the try-catch block
3. **Path mismatch**: There may be a routing configuration issue

## 🔧 Next Steps to Fix

### 1. Check Railway Deployment Logs

Check if the social media routes are loading correctly:

```bash
# View Railway deployment logs
railway logs
```

Look for:
- ✅ `Social media routes loaded` (success)
- ⚠️ `Social media routes not available` (failure)

### 2. Verify Route File is Deployed

Ensure `server/routes/socialAuthRoutes.js` is included in your Railway deployment:
- Check `.gitignore` doesn't exclude it
- Verify it's in your repository
- Check Railway build logs for any errors

### 3. Test Locally First

Test the endpoint locally to ensure it works:

```bash
# Start local server
cd server
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/social-auth/oauth/facebook/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Expected Response (when working)

```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...&scope=...&response_type=code&state=...",
  "platform": "facebook"
}
```

### 5. Error Response (if not configured)

If the endpoint works but Facebook credentials aren't set:

```json
{
  "success": false,
  "error": "facebook OAuth is not configured on the server"
}
```

## 📝 Code Location

The route is defined in:
- **File:** `server/routes/socialAuthRoutes.js`
- **Line:** 52
- **Route:** `router.get('/oauth/:platform/url', verifyToken, ...)`
- **Mounted at:** `app.use('/api/social-auth', socialAuthRoutes)` (line 696 in `server/index.js`)

## ✅ Testing Checklist

- [ ] Verify `server/routes/socialAuthRoutes.js` exists in repository
- [ ] Check Railway deployment logs for route loading errors
- [ ] Test endpoint locally to confirm it works
- [ ] Verify `FACEBOOK_CLIENT_ID` is set in Railway environment variables
- [ ] Redeploy if routes file was missing
- [ ] Test again after redeployment

## 🚀 Quick Test Script

Use this PowerShell script to test the endpoint:

```powershell
# Login and get token
$loginBody = @{ username = "admin"; password = "admin" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "https://buzzit-production.up.railway.app/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Test OAuth URL endpoint
$headers = @{ "Authorization" = "Bearer $token" }
try {
    $response = Invoke-RestMethod -Uri "https://buzzit-production.up.railway.app/api/social-auth/oauth/facebook/url" -Method GET -Headers $headers
    Write-Host "✅ SUCCESS!"
    Write-Host $response | ConvertTo-Json
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode"
    }
}
```

---

**Last Tested:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Status:** ❌ Endpoint not accessible (404)


