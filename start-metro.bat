@echo off
REM Start Metro Bundler - kills existing process on port 8081 if needed

echo ========================================
echo   Starting Metro Bundler
echo ========================================
echo.

cd /d "%~dp0"

REM Check if port 8081 is in use
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    echo Port 8081 is in use by process %%a
    echo Killing process...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo Starting Metro Bundler...
echo.
echo IMPORTANT: Keep this window open while developing!
echo Metro bundler is required for React Native apps.
echo.

start "Metro Bundler" cmd /k "npm start"

echo.
echo Metro Bundler is starting in a new window.
echo Wait for "Metro waiting on port 8081" message.
echo.
pause




