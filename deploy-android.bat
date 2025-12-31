@echo off
REM Deploy BuzzIt App to Android Studio
REM This script will start Metro bundler and open Android Studio

echo ========================================
echo   BuzzIt Android Deployment Script
echo ========================================
echo.

REM Change to project directory
cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the BuzzIt project root.
    pause
    exit /b 1
)

if not exist "android\app\build.gradle" (
    echo Error: Android project not found at android\app\build.gradle
    pause
    exit /b 1
)

echo [1/3] Starting Metro Bundler...
echo.
echo IMPORTANT: Keep this terminal open while Metro is running!
echo Metro bundler is required for React Native apps.
echo.
start "Metro Bundler" cmd /k "npm start"

REM Wait a moment for Metro to start
timeout /t 3 /nobreak >nul

echo.
echo [2/3] Opening Android Studio...
echo.

REM Try to find Android Studio
set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
if not exist "%STUDIO_PATH%" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if not exist "%STUDIO_PATH%" (
    echo Android Studio not found in common locations.
    echo.
    echo Please manually:
    echo 1. Open Android Studio
    echo 2. File -^> Open
    echo 3. Navigate to: %CD%\android
    echo.
    echo Then continue with the deployment steps below.
    echo.
) else (
    echo Opening Android Studio with project: %CD%\android
    start "" "%STUDIO_PATH%" "%CD%\android"
    echo.
    echo Android Studio is opening...
    echo Wait for Gradle sync to complete (5-10 minutes on first run).
    echo.
)

echo [3/3] Deployment Instructions:
echo.
echo ========================================
echo   Next Steps in Android Studio:
echo ========================================
echo.
echo 1. Wait for Gradle Sync to complete
echo    - Watch the progress bar at the bottom
echo    - First sync takes 5-10 minutes
echo.
echo 2. Connect a device or start an emulator:
echo    - Physical Device: Enable USB debugging and connect via USB
echo    - Emulator: Tools -^> Device Manager -^> Create/Start device
echo.
echo 3. Select your device from the device dropdown (top toolbar)
echo.
echo 4. Run the app:
echo    - Click the green Run button (^>^>)
echo    - Or press Shift + F10
echo    - Or Run -^> Run 'app'
echo.
echo 5. Wait for build and installation (1-3 minutes)
echo.
echo ========================================
echo   Alternative: Command Line Deployment
echo ========================================
echo.
echo To deploy from command line (after Metro is running):
echo   npm run android
echo.
echo ========================================
echo.
echo Metro bundler is running in a separate window.
echo Keep it open while developing!
echo.
pause




