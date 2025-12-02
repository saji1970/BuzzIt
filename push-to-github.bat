@echo off
echo ===================================
echo Pushing changes to GitHub
echo ===================================
echo.

cd C:\BuzzIt\BuzzIt

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add -A
echo.

echo Step 3: Committing changes...
git commit -m "Fix stream viewer: Add user-initiated video loading to prevent bridge errors"
echo.

echo Step 4: Checking remote repository...
git remote -v
echo.

echo Step 5: Pushing to GitHub...
git push
echo.

echo ===================================
echo Done! Check GitHub for updates.
echo ===================================
pause




