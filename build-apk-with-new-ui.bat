@echo off
echo ========================================
echo   Build APK with Fresh UI Bundle
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Clearing old bundles...
if exist "android\app\src\main\assets" rmdir /s /q "android\app\src\main\assets" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
echo Old bundles cleared.

echo [2/4] Creating assets directory...
mkdir "android\app\src\main\assets" 2>nul
echo Assets directory ready.

echo [3/4] Generating fresh JavaScript bundle...
echo This includes all latest UI changes!
echo.
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res --reset-cache
if errorlevel 1 (
    echo.
    echo Bundle generation failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Building APK with fresh bundle...
cd android
call gradlew assembleDebug
if errorlevel 1 (
    echo.
    echo APK build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   APK Built Successfully!
echo ========================================
echo.
echo APK Location:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo This APK includes:
echo   - Latest UI changes
echo   - Fresh JavaScript bundle
echo   - All recent updates
echo.
echo To install:
echo   adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
echo.
pause




