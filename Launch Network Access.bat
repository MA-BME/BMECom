@echo off
title BMECom Network Access
color 0A

echo.
echo ========================================
echo    BMECom Network Access Launcher
echo ========================================
echo.
echo Your local IP address: 192.168.0.183
echo.
echo Choose an option:
echo.
echo 1. Start Network Server (Access from other devices)
echo 2. Open Local Site (Access from this computer only)
echo 3. Show Network Instructions
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto network
if "%choice%"=="2" goto local
if "%choice%"=="3" goto instructions
if "%choice%"=="4" goto exit
goto invalid

:network
echo.
echo Starting Network Server...
echo.
echo Your site will be available at:
echo http://192.168.0.183:8080
echo.
echo To access from other devices:
echo - Connect them to the same WiFi network
echo - Open browser and go to: http://192.168.0.183:8080
echo.
echo Press Ctrl+C to stop the server
echo.
powershell -ExecutionPolicy Bypass -File "start-network-server.ps1"
goto end

:local
echo.
echo Opening local site...
start "" "open.html"
goto end

:instructions
echo.
echo ========================================
echo    Network Access Instructions
echo ========================================
echo.
echo To access your BMECom site from other devices:
echo.
echo 1. Make sure all devices are connected to the same WiFi network
echo 2. Run this launcher and choose option 1
echo 3. On other devices, open a web browser
echo 4. Go to: http://192.168.0.183:8080
echo.
echo Supported devices:
echo - Smartphones (iPhone, Android)
echo - Tablets (iPad, Android tablets)
echo - Other computers (Windows, Mac, Linux)
echo - Smart TVs with web browsers
echo.
echo Troubleshooting:
echo - If it doesn't work, try running as Administrator
echo - Make sure Windows Firewall allows the connection
echo - Check that all devices are on the same network
echo.
pause
goto end

:invalid
echo.
echo Invalid choice. Please enter 1, 2, 3, or 4.
echo.
pause
goto end

:exit
echo.
echo Goodbye!
exit

:end 