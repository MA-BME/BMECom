@echo off
echo ========================================
echo    BMECom - Deploy to GitHub Pages
echo ========================================
echo.

echo [1/4] Checking git status...
git status

echo.
echo [2/4] Adding all changes...
git add .

echo.
echo [3/4] Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Auto-deploy: Update BMECom site"

git commit -m "%commit_msg%"

echo.
echo [4/4] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Your site will be automatically deployed to:
echo https://ma-bme.github.io/BMECom/
echo.
echo It may take 2-5 minutes for changes to appear.
echo.
pause 