@echo off
REM Clean Deploy to Android Emulator
REM This script cleans, builds, and deploys to emulator

echo ====================================
echo  Clean Deploy to Android Emulator
echo ====================================
echo.

cd /d "%~dp0"

REM Step 1: Clean build directories
echo [1/5] Cleaning build directories...
if exist "build" rmdir /s /q "build"
if exist "app\build" rmdir /s /q "app\build"
echo [OK] Build directories cleaned
echo.

REM Step 2: Check if emulator is running
echo [2/5] Checking for Android emulator...
adb devices > temp_devices.txt
findstr /C:"emulator" temp_devices.txt >nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] No emulator found. Starting emulator...
    echo.
    echo Please start an emulator from Android Studio:
    echo   Tools -^> Device Manager -^> Start emulator
    echo.
    echo Or run: emulator -avd YOUR_AVD_NAME
    echo.
    set /p wait="Press Enter after emulator is running..."
)
del temp_devices.txt >nul 2>&1
echo.

REM Step 3: Wait for emulator to be ready
echo [3/5] Waiting for emulator to be ready...
:wait_loop
adb devices | findstr /C:"emulator" | findstr /C:"device" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Waiting for emulator...
    timeout /t 3 >nul
    goto wait_loop
)
echo [OK] Emulator is ready
echo.

REM Step 4: Build APK
echo [4/5] Building fresh APK...
call gradlew.bat clean assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] APK built successfully
echo.

REM Step 5: Uninstall old app (if exists)
echo [5/5] Deploying to emulator...
adb shell pm uninstall com.buzzit.app >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Old app uninstalled
)

REM Step 6: Install new APK
echo Installing new APK...
adb install -r "app\build\outputs\apk\debug\app-debug.apk"
if %ERRORLEVEL% EQU 0 (
    echo [OK] APK installed successfully
) else (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
)
echo.

REM Step 7: Launch app
echo Launching app...
adb shell am start -n com.buzzit.app/.MainActivity
if %ERRORLEVEL% EQU 0 (
    echo [OK] App launched
) else (
    echo [WARNING] Could not launch app automatically
)

echo.
echo ====================================
echo  Deployment Complete!
echo ====================================
echo.
echo APK Location:
echo   %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Next steps:
echo 1. Start Metro bundler (separate terminal):
echo    cd C:\BuzzIt\BuzzIt
echo    npm start
echo 2. Shake emulator to open dev menu
echo 3. Select "Debug" to connect to Metro
echo.
pause

