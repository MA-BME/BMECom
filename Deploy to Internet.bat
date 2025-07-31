@echo off
title BMECom Internet Deployment
color 0B

echo.
echo ========================================
echo    BMECom Internet Deployment Guide
echo ========================================
echo.
echo Choose your deployment option:
echo.
echo 1. GitHub Pages (FREE - Recommended)
echo 2. Netlify (FREE - Easy)
echo 3. Vercel (FREE - Fast)
echo 4. View Deployment Guide
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto github
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto guide
if "%choice%"=="5" goto exit
goto invalid

:github
echo.
echo ========================================
echo    GitHub Pages Deployment
echo ========================================
echo.
echo Step 1: Create GitHub Account
echo - Go to: https://github.com
echo - Click "Sign up" and create account
echo - Verify your email
echo.
echo Step 2: Create Repository
echo - Click "+" icon, select "New repository"
echo - Name it: bmecom
echo - Make it PUBLIC
echo - Click "Create repository"
echo.
echo Step 3: Upload Files
echo - Click "uploading an existing file"
echo - Drag ALL your BMECom files
echo - Click "Commit changes"
echo.
echo Step 4: Enable Pages
echo - Go to Settings ^> Pages
echo - Source: Deploy from branch
echo - Branch: main, Folder: / (root)
echo - Click "Save"
echo.
echo Your URL will be:
echo https://yourusername.github.io/bmecom
echo.
echo Press any key to open GitHub...
pause >nul
start https://github.com
goto end

:netlify
echo.
echo ========================================
echo    Netlify Deployment
echo ========================================
echo.
echo Step 1: Create Netlify Account
echo - Go to: https://netlify.com
echo - Click "Sign up"
echo - Complete registration
echo.
echo Step 2: Deploy Site
echo - Click "New site from Git" or "Deploy manually"
echo - Drag your entire BMECom folder
echo - Get URL like: https://amazing-site-123456.netlify.app
echo.
echo Step 3: Customize URL (Optional)
echo - Go to Site settings
echo - Change site name to: bmecom-articles
echo - URL becomes: https://bmecom-articles.netlify.app
echo.
echo Press any key to open Netlify...
pause >nul
start https://netlify.com
goto end

:vercel
echo.
echo ========================================
echo    Vercel Deployment
echo ========================================
echo.
echo Step 1: Create Vercel Account
echo - Go to: https://vercel.com
echo - Sign up with GitHub or email
echo - Complete verification
echo.
echo Step 2: Deploy Site
echo - Click "New Project"
echo - Import GitHub repo or drag files
echo - Get URL like: https://bmecom.vercel.app
echo.
echo Press any key to open Vercel...
pause >nul
start https://vercel.com
goto end

:guide
echo.
echo ========================================
echo    Opening Deployment Guide
echo ========================================
echo.
echo Opening detailed deployment guide...
start "" "DEPLOY_TO_INTERNET.md"
goto end

:invalid
echo.
echo Invalid choice. Please enter 1, 2, 3, 4, or 5.
echo.
pause
goto end

:exit
echo.
echo Goodbye!
exit

:end 