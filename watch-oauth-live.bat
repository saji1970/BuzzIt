@echo off
echo ========================================
echo Watching OAuth Connection Live
echo ========================================
echo.
echo Press Ctrl+C to stop watching
echo.
echo NOW: Try to connect Facebook in your app!
echo.
echo ========================================
echo.

adb logcat -c
adb logcat -v time *:W ReactNativeJS:I | findstr /i "oauth facebook social api error http fetch connect"
