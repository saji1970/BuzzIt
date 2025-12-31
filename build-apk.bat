@echo off
echo ========================================
echo   Building Local APK
echo ========================================
echo.

cd /d "%~dp0\android"

echo Building Debug APK...
echo This may take 2-5 minutes...
echo.

call gradlew assembleDebug

if errorlevel 1 (
    echo.
    echo Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   APK Build Successful!
echo ========================================
echo.
echo APK Location:
echo   app\build\outputs\apk\debug\app-debug.apk
echo.
echo Full Path:
cd /d "%~dp0"
echo   %CD%\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo   adb install -r "app\build\outputs\apk\debug\app-debug.apk"
echo.
echo Or navigate to the folder and transfer to device manually.
echo.
pause




