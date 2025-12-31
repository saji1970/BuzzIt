@echo off
echo ========================================
echo BuzzIt Mobile OAuth Test Script
echo ========================================
echo.

REM Check if device/emulator is connected
echo [1/5] Checking for connected devices...
adb devices -l | findstr "device product"
if errorlevel 1 (
    echo.
    echo ERROR: No Android device or emulator found!
    echo Please:
    echo   - Connect your Android device via USB, OR
    echo   - Start Android Studio emulator
    echo.
    pause
    exit /b 1
)
echo.

REM Check if app is installed
echo [2/5] Checking if BuzzIt app is installed...
adb shell pm list packages | findstr "com.buzzit.app"
if errorlevel 1 (
    echo.
    echo WARNING: BuzzIt app not found on device
    echo Please install the app first using:
    echo   cd android
    echo   gradlew.bat installDebug
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)
echo.

REM Test deep linking
echo [3/5] Testing deep link configuration...
echo Testing: com.buzzit.app://oauth/callback/facebook?code=test
adb shell am start -a android.intent.action.VIEW -d "com.buzzit.app://oauth/callback/facebook?code=test"
timeout /t 2 /nobreak >nul
echo.

REM Check app logs
echo [4/5] Checking app logs for OAuth activity...
echo (Last 20 lines containing 'oauth', 'facebook', or 'social')
adb logcat -d | findstr /i "oauth facebook social" | more +1
echo.

REM Test OAuth URL
echo [5/5] OAuth URL for manual browser testing:
echo.
echo Open this URL in your mobile browser to test Facebook OAuth:
echo.
echo https://www.facebook.com/v18.0/dialog/oauth?client_id=1393033811657781^&redirect_uri=https%%3A%%2F%%2Fbuzzit-production.up.railway.app%%2Fapi%%2Fsocial-auth%%2Foauth%%2Ffacebook%%2Fcallback^&scope=email%%2Cpublic_profile^&response_type=code^&state=test
echo.
echo.

echo ========================================
echo Test Options:
echo ========================================
echo.
echo [A] Launch BuzzIt app
echo [B] Open Privacy Settings (requires app running)
echo [C] Test OAuth callback deep link
echo [D] Clear app data and restart
echo [E] View live logs
echo [Q] Quit
echo.

:menu
set /p choice="Enter your choice: "

if /i "%choice%"=="A" (
    echo Launching BuzzIt app...
    adb shell monkey -p com.buzzit.app -c android.intent.category.LAUNCHER 1
    goto menu
)

if /i "%choice%"=="B" (
    echo Opening Privacy Settings...
    echo Note: This requires app to be already running
    adb shell am start -n com.buzzit.app/.MainActivity -d "com.buzzit.app://settings/privacy"
    goto menu
)

if /i "%choice%"=="C" (
    echo Testing OAuth callback...
    adb shell am start -a android.intent.action.VIEW -d "com.buzzit.app://oauth/callback/facebook?code=test_code_12345&state=test_state"
    echo.
    echo Check if app received the deep link and shows a response
    goto menu
)

if /i "%choice%"=="D" (
    echo Clearing app data...
    adb shell pm clear com.buzzit.app
    echo App data cleared. Restarting app...
    timeout /t 2 /nobreak >nul
    adb shell monkey -p com.buzzit.app -c android.intent.category.LAUNCHER 1
    goto menu
)

if /i "%choice%"=="E" (
    echo Starting live log viewer (press Ctrl+C to stop)...
    echo.
    adb logcat | findstr /i "oauth facebook social buzzit ReactNative"
    goto menu
)

if /i "%choice%"=="Q" (
    echo Exiting...
    exit /b 0
)

echo Invalid choice. Please try again.
goto menu
