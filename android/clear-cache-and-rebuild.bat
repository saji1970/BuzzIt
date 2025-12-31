@echo off
echo ========================================
echo   Clearing Cache and Rebuilding App
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Stopping Metro Bundler...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2/5] Clearing Metro cache...
if exist ".metro" rmdir /s /q ".metro" 2>nul
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
echo Metro cache cleared.

echo [3/5] Clearing React Native cache...
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul
echo Build cache cleared.

echo [4/5] Cleaning Android build...
cd android
call gradlew clean >nul 2>&1
cd ..
echo Android build cleaned.

echo [5/5] Starting Metro with cleared cache...
start "Metro Bundler - Fresh Start" cmd /k "cd /d %CD% && npm start -- --reset-cache"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Cache Cleared - Ready to Rebuild!
echo ========================================
echo.
echo Next steps in Android Studio:
echo   1. Build -^> Clean Project
echo   2. Build -^> Rebuild Project
echo   3. Run the app (Shift+F10)
echo.
echo Metro Bundler is starting with --reset-cache
echo Wait for "Metro waiting on port 8081" message.
echo.
pause

