@echo off
echo ========================================
echo Fix Facebook OAuth - InAppBrowser Error
echo ========================================
echo.
echo [Step 1/5] Killing Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo [Step 2/5] Cleaning Android build...
cd android
call gradlew.bat clean
echo Done!
echo.

echo [Step 3/5] Rebuilding Android app...
call gradlew.bat assembleDebug
echo Done!
echo.

echo [Step 4/5] Installing on device...
call gradlew.bat installDebug
cd ..
echo Done!
echo.

echo [Step 5/5] Starting Metro with reset cache...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 5 /nobreak >nul
echo Done!
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Changes applied:
echo - Fixed InAppBrowser null check
echo - All UI fixes included
echo - Facebook OAuth should now work!
echo.
echo Next: Try connecting Facebook in the app!
echo Settings -^> Privacy ^& Social Media -^> Connect Facebook
echo.
pause
