@echo off
echo ========================================
echo Social Media Integration Setup
echo ========================================
echo.

echo Step 1: Installing required dependencies...
cd server
call npm install axios
echo.

echo Step 2: Checking for .env file...
if exist ".env" (
    echo .env file found!
) else (
    echo Creating .env from example...
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo .env file created! Please edit it with your OAuth credentials.
    ) else (
        echo WARNING: .env.example not found!
    )
)
echo.

echo Step 3: Setup complete!
echo.
echo Next steps:
echo 1. Edit server/.env and add your OAuth credentials:
echo    - FACEBOOK_CLIENT_ID
echo    - FACEBOOK_CLIENT_SECRET
echo    - INSTAGRAM_CLIENT_ID
echo    - INSTAGRAM_CLIENT_SECRET
echo    - SNAPCHAT_CLIENT_ID
echo    - SNAPCHAT_CLIENT_SECRET
echo.
echo 2. Add PrivacySettingsScreen to your navigation (see SOCIAL_MEDIA_INTEGRATION.md)
echo.
echo 3. Register OAuth apps with Facebook, Instagram, and Snapchat
echo.
echo For detailed instructions, see SOCIAL_MEDIA_INTEGRATION.md
echo.
pause
