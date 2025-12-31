@echo off
echo ========================================
echo   Force Fresh Deploy - Complete Cache Clear
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Stopping ALL Metro processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 3 /nobreak >nul

echo [2/7] Clearing Metro cache...
if exist ".metro" rmdir /s /q ".metro" 2>nul
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
echo Metro cache cleared.

echo [3/7] Clearing Android build cache...
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul
if exist "android\.gradle" rmdir /s /q "android\.gradle" 2>nul
if exist "android\app\.cxx" rmdir /s /q "android\app\.cxx" 2>nul
echo Build cache cleared.

echo [4/7] Cleaning Android project...
cd android
call gradlew clean --no-daemon >nul 2>&1
cd ..
echo Android project cleaned.

echo [5/7] Uninstalling app from device...
adb uninstall com.buzzit.app >nul 2>&1
echo App uninstalled (if it was installed).

echo [6/7] Starting Metro with fresh cache...
start "Metro Bundler - FRESH START" cmd /k "cd /d %CD% && echo ======================================== && echo   Metro Bundler - FRESH START && echo ======================================== && echo. && npm start -- --reset-cache"
timeout /t 4 /nobreak >nul

echo [7/7] Opening Android Studio...
set "ANDROID_PATH=%CD%\android"
set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
if not exist "%STUDIO_PATH%" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)
if exist "%STUDIO_PATH%" (
    start "" "%STUDIO_PATH" "%ANDROID_PATH%"
)

echo.
echo ========================================
echo   Complete! Next Steps:
echo ========================================
echo.
echo 1. In Android Studio:
echo    - Build -^> Clean Project
echo    - Build -^> Rebuild Project
echo.
echo 2. Wait for Gradle sync to complete
echo.
echo 3. Run the app (Shift+F10)
echo.
echo 4. If still showing old UI:
echo    - Shake device -^> Dev Menu -^> Reload
echo    - Or: adb shell pm clear com.buzzit.app
echo.
echo ========================================
echo   Metro is starting with --reset-cache
echo   Wait for "Metro waiting on port 8081"
echo ========================================
echo.
pause




