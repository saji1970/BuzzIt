@echo off
REM Quick deploy script for Android Studio

echo ====================================
echo  Deploying BuzzIt to Android Studio
echo ====================================
echo.

cd /d "%~dp0"

REM Check if APK exists
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo [*] APK found: app\build\outputs\apk\debug\app-debug.apk
    for %%A in ("app\build\outputs\apk\debug\app-debug.apk") do (
        set "APK_SIZE=%%~zA"
        echo [*] APK Size: %%~zA bytes
    )
    echo.
) else (
    echo [!] APK not found. Building now...
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

echo [*] Opening Android Studio...
echo.

REM Find Android Studio
set "STUDIO_PATH="
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
)
if exist "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe"
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if "%STUDIO_PATH%"=="" (
    echo [!] Android Studio not found in common locations.
    echo.
    echo Please open manually:
    echo   1. Launch Android Studio
    echo   2. File -^> Open
    echo   3. Navigate to: %CD%
    echo.
    pause
    exit /b 1
)

echo [*] Opening: %STUDIO_PATH%
start "" "%STUDIO_PATH%" .

echo.
echo ====================================
echo  Next Steps:
echo ====================================
echo.
echo 1. Wait for Gradle sync to complete
echo 2. Connect your Android device or start emulator
echo 3. Start Metro bundler (separate terminal):
echo    cd C:\BuzzIt\BuzzIt
echo    npm start
echo 4. In Android Studio: Click Run button (^>^>)
echo.
echo APK Location:
echo   %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.
pause

