@echo off
echo ========================================
echo Checking OAuth Connection Logs
echo ========================================
echo.

echo [Step 1] Checking if device is connected...
adb devices -l | findstr "device product"
if errorlevel 1 (
    echo ERROR: No device found!
    pause
    exit /b 1
)
echo Device connected!
echo.

echo [Step 2] Clearing old logs...
adb logcat -c
echo Logs cleared.
echo.

echo [Step 3] Starting live log monitoring...
echo.
echo Watching for: OAuth, Facebook, DeepLink, Social, API errors
echo Press Ctrl+C to stop
echo ========================================
echo.

adb logcat -v time | findstr /i "oauth facebook social deeplink ReactNativeJS APIService SocialMedia ERROR WARN"
