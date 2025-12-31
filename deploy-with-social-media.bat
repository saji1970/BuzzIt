@echo off
echo ========================================
echo   Deploying BuzzIt with Social Media Integration
echo ========================================
echo.

cd /d "%~dp0"

REM Step 1: Kill Metro if running
echo [1/6] Stopping Metro Bundler...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    echo Stopping Metro process %%a...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Step 2: Clear Metro cache
echo.
echo [2/6] Clearing Metro cache...
call npm start -- --reset-cache &
timeout /t 5 /nobreak >nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Step 3: Rebuild React Native bundle
echo.
echo [3/6] Building React Native bundle with new social media code...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

REM Step 4: Clean Android build
echo.
echo [4/6] Cleaning Android build...
cd android
call gradlew clean
cd ..

REM Step 5: Start Metro Bundler
echo.
echo [5/6] Starting Metro Bundler...
start "Metro Bundler - Keep Open!" cmd /k "cd /d %CD% && echo Metro Bundler for BuzzIt && npm start"
timeout /t 3 /nobreak >nul

REM Step 6: Open Android Studio
echo.
echo [6/6] Opening Android Studio...
echo.

set "ANDROID_PATH=%CD%\android"
set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"

if not exist "%STUDIO_PATH%" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if exist "%STUDIO_PATH%" (
    echo Opening: %ANDROID_PATH%
    start "" "%STUDIO_PATH%" "%ANDROID_PATH%"
    echo.
    echo Android Studio is opening...
) else (
    echo Android Studio not found in default locations.
    echo.
    echo Please manually:
    echo   1. Open Android Studio
    echo   2. File -^> Open
    echo   3. Navigate to: %ANDROID_PATH%
    echo.
)

echo.
echo ========================================
echo   Social Media Integration Deployment
echo ========================================
echo.
echo New Features Added:
echo   - Facebook, Instagram, Snapchat OAuth integration
echo   - Social platform selector in Create Buzz
echo   - Automatic publishing to selected platforms
echo   - Token refresh and management
echo.
echo ========================================
echo   Next Steps in Android Studio:
echo ========================================
echo.
echo 1. Wait for Gradle sync to complete
echo 2. If sync errors occur, click "Sync Project with Gradle Files"
echo 3. Connect Android device or start emulator
echo 4. Select device from dropdown (top toolbar)
echo 5. Click Run button (green play icon) or press Shift+F10
echo 6. Wait for app to install and launch
echo.
echo ========================================
echo   Testing Social Media Integration:
echo ========================================
echo.
echo After app launches:
echo 1. Go to Settings -^> Privacy ^& Social
echo 2. Try connecting Instagram (credentials set in Railway)
echo 3. Create a buzz with an image
echo 4. Select Instagram platform
echo 5. Create buzz and verify it publishes
echo.
echo ========================================
echo   Important Notes:
echo ========================================
echo.
echo - Metro Bundler is running in separate window - KEEP IT OPEN!
echo - First build may take 5-10 minutes
echo - If build fails, run: cd android ^&^& gradlew clean
echo - Check Railway has environment variables set:
echo     * INSTAGRAM_CLIENT_ID
echo     * INSTAGRAM_CLIENT_SECRET
echo     * APP_BASE_URL
echo.
echo ========================================
pause
