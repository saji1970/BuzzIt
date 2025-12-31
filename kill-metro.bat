@echo off
REM Kill Metro Bundler process on port 8081

echo ========================================
echo   Stopping Metro Bundler
echo ========================================
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    echo Found process %%a using port 8081
    taskkill /F /PID %%a
    if errorlevel 1 (
        echo Failed to kill process %%a
    ) else (
        echo Successfully stopped process %%a
    )
)

REM Also kill any node processes that might be Metro
echo.
echo Checking for other Metro/Node processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Metro*" >nul 2>&1

echo.
echo Done! Port 8081 should now be free.
echo.
pause




