@echo off
echo ========================================
echo   Redeploying BuzzIt to Android Studio
echo ========================================
echo.

cd /d "%~dp0"

REM Step 1: Kill existing Metro if running
echo [1/4] Checking Metro Bundler...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    echo Port 8081 is in use by process %%a
    echo Stopping old Metro instance...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Step 2: Start Metro Bundler
echo.
echo [2/4] Starting Metro Bundler...
start "Metro Bundler - Keep Open!" cmd /k "cd /d %CD% && echo Starting Metro Bundler... && npm start"
timeout /t 3 /nobreak >nul

REM Step 3: Clean build (optional but recommended)
echo.
echo [3/4] Cleaning previous build...
cd android
call gradlew clean >nul 2>&1
cd ..

REM Step 4: Open Android Studio
echo.
echo [4/4] Opening Android Studio...
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
echo   Deployment Steps in Android Studio:
echo ========================================
echo.
echo 1. Wait for Gradle sync to complete
echo 2. Connect device or start emulator
echo 3. Select device from dropdown
echo 4. Click Run button (^>^>) or Shift+F10
echo.
echo ========================================
echo   Metro Bundler is running in separate window
echo   Keep it open while developing!
echo ========================================
echo.
pause




