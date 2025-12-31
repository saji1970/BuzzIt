@echo off
echo ========================================
echo Testing Facebook OAuth URL
echo ========================================
echo.
echo Open this URL in your browser:
echo.
echo https://www.facebook.com/v18.0/dialog/oauth?client_id=2700884196937447^&redirect_uri=https%%3A%%2F%%2Fbuzzit-production.up.railway.app%%2Fapi%%2Fsocial-auth%%2Foauth%%2Ffacebook%%2Fcallback^&scope=email%%2Cpublic_profile^&response_type=code^&state=test
echo.
echo What you should see:
echo - Facebook login page (NOT an error!)
echo - Option to login and grant permissions
echo.
echo If you see an error like:
echo - "Invalid Redirect URI" = Need to add redirect URI to Facebook App
echo - "App Not Set Up" = Need to enable Facebook Login product
echo - "Invalid App ID" = Wrong App ID (but yours is correct now!)
echo.
pause
start "" "https://www.facebook.com/v18.0/dialog/oauth?client_id=2700884196937447&redirect_uri=https%%3A%%2F%%2Fbuzzit-production.up.railway.app%%2Fapi%%2Fsocial-auth%%2Foauth%%2Ffacebook%%2Fcallback&scope=email%%2Cpublic_profile&response_type=code&state=test"
