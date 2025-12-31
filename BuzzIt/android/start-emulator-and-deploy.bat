@echo off
REM Complete script to start emulator and deploy app

echo ====================================
echo  Clean Deploy to Android Emulator
echo ====================================
echo.

cd /d "%~dp0"

REM Step 1: Clean build
echo [1/6] Cleaning build directories...
if exist "build" rmdir /s /q "build"
if exist "app\build" rmdir /s /q "app\build"
echo [OK] Cleaned
echo.

REM Step 2: List available emulators
echo [2/6] Available Android Virtual Devices (AVDs):
echo.
"%LOCALAPPDATA%\Android\Sdk\emulator\emulator" -list-avds
echo.

REM Step 3: Start emulator
echo [3/6] Starting emulator...
echo.
set /p AVD_NAME="Enter AVD name (or press Enter for Pixel_7a): "
if "%AVD_NAME%"=="" set "AVD_NAME=Pixel_7a"

echo Starting %AVD_NAME%...
start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator" -avd %AVD_NAME%

echo.
echo Waiting for emulator to boot (this may take 1-2 minutes)...
timeout /t 5 >nul

REM Wait for emulator to be ready
:wait_boot
adb devices | findstr /C:"emulator" | findstr /C:"device" >nul
if %ERRORLEVEL% NEQ 0 (
    echo Still booting...
    timeout /t 5 >nul
    goto wait_boot
)

echo [OK] Emulator is ready
echo.

REM Step 4: Build APK
echo [4/6] Building fresh APK...
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)
echo [OK] APK built successfully
echo.

REM Step 5: Uninstall old app
echo [5/6] Uninstalling old app...
adb shell pm uninstall com.buzzit.app >nul 2>&1
echo [OK] Old app removed (if existed)
echo.

REM Step 6: Install and launch
echo [6/6] Installing and launching app...
adb install -r "app\build\outputs\apk\debug\app-debug.apk"
if %ERRORLEVEL% EQU 0 (
    echo [OK] App installed successfully
    
    REM Launch app
    timeout /t 2 >nul
    adb shell monkey -p com.buzzit.app -c android.intent.category.LAUNCHER 1
    echo [OK] App launched
) else (
    echo [ERROR] Installation failed!
    pause
    exit /b 1
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
echo 2. In emulator: Press Ctrl+M (or Cmd+M on Mac) to open dev menu
echo 3. Select "Debug" to connect to Metro
echo.
pause

