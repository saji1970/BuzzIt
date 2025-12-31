@echo off
REM Quick script to open BuzzIt Android project in Android Studio

set "PROJECT_PATH=%~dp0android"
set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"

if not exist "%STUDIO_PATH%" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if not exist "%STUDIO_PATH%" (
    echo Android Studio not found in common locations.
    echo Please open Android Studio manually and navigate to:
    echo %PROJECT_PATH%
    pause
    exit /b 1
)

echo Opening Android Studio with project: %PROJECT_PATH%
start "" "%STUDIO_PATH%" "%PROJECT_PATH%"

echo.
echo Android Studio is opening...
echo Wait for Gradle sync to complete before building.
pause





