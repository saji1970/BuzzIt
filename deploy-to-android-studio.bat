@echo off
echo ========================================
echo Deploy BuzzIt to Android Studio
echo ========================================
echo.

echo [Step 1/6] Checking for connected devices...
adb devices -l | findstr "device product"
if errorlevel 1 (
    echo.
    echo ERROR: No Android device or emulator found!
    pause
    exit /b 1
)
echo Done!
echo.

echo [Step 2/6] Killing Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo Done!
echo.

echo [Step 3/6] Cleaning old build...
cd android
call gradlew.bat clean
echo Done!
echo.

echo [Step 4/6] Building debug APK...
call gradlew.bat assembleDebug
echo Done!
echo.

echo [Step 5/6] Installing on device...
call gradlew.bat installDebug
cd ..
echo Done!
echo.

echo [Step 6/6] Starting Metro...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"
timeout /t 5 /nobreak >nul
echo Done!
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Now test Facebook OAuth in the app!
pause
