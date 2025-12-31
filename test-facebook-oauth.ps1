# Test Facebook OAuth
$baseUrl = "https://buzzit-production.up.railway.app"

Write-Host "🔍 Testing Facebook OAuth Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n"

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginBody = '{"username":"testuser","password":"Test123!"}'

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success -eq $true) {
        $token = $loginResponse.token
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host ""
        
        # Step 2: Get OAuth URL
        Write-Host "Step 2: Getting Facebook OAuth URL..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        $oauthResponse = Invoke-RestMethod -Uri "$baseUrl/api/social-auth/oauth/facebook/url" -Method Get -Headers $headers
        
        if ($oauthResponse.success -eq $true) {
            Write-Host "✅ Facebook OAuth URL retrieved!" -ForegroundColor Green
            Write-Host "`nOAuth URL:" -ForegroundColor Cyan
            Write-Host $oauthResponse.authUrl -ForegroundColor White
            Write-Host "`nPlatform: $($oauthResponse.platform)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "📋 Next Steps:" -ForegroundColor Yellow
            Write-Host "1. Copy the OAuth URL above"
            Write-Host "2. Open it in a browser"
            Write-Host "3. You should see Facebook's login/consent screen"
        }
        else {
            Write-Host "❌ Failed: $($oauthResponse.error)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Login failed: $($loginResponse.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
