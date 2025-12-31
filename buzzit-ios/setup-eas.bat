@echo off
REM EAS Setup Script for Windows
REM Run this script to set up EAS for iOS builds

echo.
echo ====================================
echo EAS Setup for buzzit-ios
echo ====================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] EAS CLI is not installed
    echo [*] Installing EAS CLI...
    npm install --global eas-cli
)

echo [*] EAS CLI version:
eas --version
echo.

REM Login to Expo
echo [*] Logging in to Expo...
echo Please enter your Expo credentials when prompted
eas login

REM Initialize EAS
echo.
echo [*] Initializing EAS with project ID...
eas init --id d537200a-e0fa-4ca6-892f-e5b6b40fb377

echo.
echo [*] EAS setup complete!
echo.
echo Next steps:
echo 1. Build iOS app: eas build --platform ios --profile preview
echo 2. Check build status: eas build:list
echo 3. Download IPA: eas build:download
echo.

pause

