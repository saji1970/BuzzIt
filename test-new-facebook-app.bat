@echo off
echo ========================================
echo Testing NEW Facebook App OAuth
echo ========================================
echo.
echo Your New App ID: 1385131833212514
echo.
echo This will open the Facebook OAuth URL in your browser.
echo.
echo What you should see:
echo - Facebook login page with your app name
echo - Request for permissions
echo - NOT an "Invalid App ID" error
echo.
echo If you see an error:
echo - "Invalid Redirect URI" = Add redirect URIs in Facebook app settings
echo - "Invalid App ID" = App ID might be wrong
echo - "App Not Set Up" = Add Facebook Login product
echo.
pause
echo.
echo Opening Facebook OAuth URL...
start "" "https://www.facebook.com/v18.0/dialog/oauth?client_id=1385131833212514&redirect_uri=https%%3A%%2F%%2Fbuzzit-production.up.railway.app%%2Fapi%%2Fsocial-auth%%2Foauth%%2Ffacebook%%2Fcallback&scope=email%%2Cpublic_profile&response_type=code&state=test"
echo.
echo ========================================
echo URL opened in browser!
echo ========================================
echo.
pause
