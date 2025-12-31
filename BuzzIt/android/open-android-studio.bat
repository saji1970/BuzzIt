@echo off
REM Open Android Studio with the BuzzIt project

echo Opening BuzzIt in Android Studio...
echo.

REM Try to find Android Studio installation
set "STUDIO_PATH="

REM Common Android Studio installation paths
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files\Android\Android Studio\bin\studio64.exe"
)
if exist "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe"
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe" (
    set "STUDIO_PATH=%LOCALAPPDATA%\Programs\Android Studio\bin\studio64.exe"
)

if "%STUDIO_PATH%"=="" (
    echo Android Studio not found in common locations.
    echo Please open Android Studio manually:
    echo   1. Launch Android Studio
    echo   2. File -^> Open
    echo   3. Navigate to: %CD%
    echo.
    pause
    exit /b 1
)

echo Found Android Studio at: %STUDIO_PATH%
echo Opening project...
echo.

REM Change to android directory and open
cd /d "%~dp0"
start "" "%STUDIO_PATH%" .

echo.
echo Android Studio should be opening now...
echo.
echo If it doesn't open automatically:
echo   1. Launch Android Studio manually
echo   2. File -^> Open
echo   3. Select: %CD%
echo.
timeout /t 3 >nul

