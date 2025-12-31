@echo off
echo ========================================
echo   Fix: Channel UI Changes Not Showing
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Stopping Metro Bundler...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2/6] Clearing Metro cache...
if exist ".metro" rmdir /s /q ".metro" 2>nul
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
echo Metro cache cleared.

echo [3/6] Clearing Android build cache...
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul
echo Build cache cleared.

echo [4/6] Cleaning Android project...
cd android
call gradlew clean >nul 2>&1
cd ..
echo Android project cleaned.

echo [5/6] Starting Metro with fresh cache...
start "Metro Bundler - Fresh Start" cmd /k "cd /d %CD% && echo Starting Metro with --reset-cache... && npm start -- --reset-cache"
timeout /t 3 /nobreak >nul

echo [6/6] Ready!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. In Android Studio:
echo    - Build -^> Clean Project
echo    - Build -^> Rebuild Project
echo.
echo 2. Uninstall old app from device:
echo    adb uninstall com.buzzit.app
echo.
echo 3. Run the app fresh:
echo    - Select device in Android Studio
echo    - Click Run (^>^>) or Shift+F10
echo.
echo 4. If still showing old UI:
echo    - Shake device -^> Dev Menu -^> Reload
echo    - Or: adb shell input keyevent 82
echo.
echo ========================================
echo   Metro is starting with --reset-cache
echo   Wait for "Metro waiting on port 8081"
echo ========================================
echo.
pause




