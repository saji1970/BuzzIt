@echo off
echo ========================================
echo Building Clean APK for Download
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Cleaning previous builds...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo ERROR: Clean failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building Debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.

set APK_PATH=%CD%\app\build\outputs\apk\debug\app-debug.apk

if exist "%APK_PATH%" (
    echo APK Location:
    echo %APK_PATH%
    echo.
    echo File size:
    for %%A in ("%APK_PATH%") do echo %%~zA bytes
    echo.
    echo Opening APK directory in Explorer...
    explorer /select,"%APK_PATH%"
) else (
    echo ERROR: APK file not found at expected location!
    echo Expected: %APK_PATH%
    pause
    exit /b 1
)

pause

