@echo off
echo Starting BMECom Network Server...
echo.
echo Your site will be available at:
echo http://192.168.0.183:8080
echo.
echo To access from other devices on your network:
echo - Make sure they're connected to the same WiFi/network
echo - Open a browser and go to: http://192.168.0.183:8080
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try to use Python if available
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying alternative methods...
    
    REM Try PowerShell HTTP server
    powershell -ExecutionPolicy Bypass -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://+:8080/'); $listener.Start(); Write-Host 'Server running at http://192.168.0.183:8080/'; Write-Host 'Press Ctrl+C to stop'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; $localPath = $localPath -replace '/', '\'; if ($localPath -eq '\') { $localPath = '\index.html'; } $filePath = (Get-Location).Path + $localPath; if (Test-Path $filePath -PathType Leaf) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; } $response.Close(); } }" 2>nul
    if %errorlevel% neq 0 (
        echo PowerShell server failed, trying Node.js...
        
        REM Try Node.js if available
        node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { let filePath = '.' + req.url; if (filePath === './') filePath = './index.html'; const extname = path.extname(filePath); let contentType = 'text/html'; switch (extname) { case '.js': contentType = 'text/javascript'; break; case '.css': contentType = 'text/css'; break; case '.json': contentType = 'application/json'; break; case '.png': contentType = 'image/png'; break; case '.jpg': contentType = 'image/jpg'; break; } fs.readFile(filePath, (error, content) => { if (error) { if (error.code === 'ENOENT') { res.writeHead(404); res.end('File not found'); } else { res.writeHead(500); res.end('Server error: ' + error.code); } } else { res.writeHead(200, { 'Content-Type': contentType }); res.end(content, 'utf-8'); } }); }); server.listen(8080, '0.0.0.0', () => { console.log('Server running at http://192.168.0.183:8080/'); console.log('Press Ctrl+C to stop'); });" 2>nul
        if %errorlevel% neq 0 (
            echo All server methods failed.
            echo.
            echo Please install one of the following:
            echo - Python: https://www.python.org/downloads/
            echo - Node.js: https://nodejs.org/
            echo.
            echo Or manually open the files in your browser:
            echo - Right-click on index.html and select "Open with" > "Browser"
            pause
        )
    )
) 