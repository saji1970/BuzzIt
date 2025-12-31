@echo off
echo ========================================
echo Deploy BuzzIt to Android Studio
echo ========================================
echo.
echo [Step 1/5] Checking devices...
adb devices
echo.
echo [Step 2/5] Cleaning build...
cd android
call gradlew.bat clean
echo.
echo [Step 3/5] Building APK...
call gradlew.bat assembleDebug
echo.
echo [Step 4/5] Installing...
call gradlew.bat installDebug
cd ..
echo.
echo [Step 5/5] Starting Metro...
start cmd /k npx react-native start --reset-cache
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
pause
