# BMECom Network Server
# This script starts a simple HTTP server to serve your website on the local network

Write-Host "Starting BMECom Network Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Your site will be available at:" -ForegroundColor Yellow
Write-Host "http://192.168.0.183:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "To access from other devices on your network:" -ForegroundColor Yellow
Write-Host "- Make sure they're connected to the same WiFi/network" -ForegroundColor White
Write-Host "- Open a browser and go to: http://192.168.0.183:8080" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

try {
    # Create HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add('http://+:8080/')
    $listener.Start()
    
    Write-Host "Server is running at http://192.168.0.183:8080/" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
    Write-Host ""
    
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Get the requested file path
            $localPath = $request.Url.LocalPath
            $localPath = $localPath -replace '/', '\'
            
            # Default to index.html for root path
            if ($localPath -eq '\') {
                $localPath = '\index.html'
            }
            
            # Build the full file path
            $filePath = (Get-Location).Path + $localPath
            
            # Check if file exists
            if (Test-Path $filePath -PathType Leaf) {
                # Read file content
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $content.Length
                
                # Set content type based on file extension
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($extension) {
                    '.html' { $response.ContentType = 'text/html' }
                    '.css' { $response.ContentType = 'text/css' }
                    '.js' { $response.ContentType = 'application/javascript' }
                    '.json' { $response.ContentType = 'application/json' }
                    '.png' { $response.ContentType = 'image/png' }
                    '.jpg' { $response.ContentType = 'image/jpeg' }
                    '.jpeg' { $response.ContentType = 'image/jpeg' }
                    '.gif' { $response.ContentType = 'image/gif' }
                    '.svg' { $response.ContentType = 'image/svg+xml' }
                    default { $response.ContentType = 'text/plain' }
                }
                
                $response.OutputStream.Write($content, 0, $content.Length)
                Write-Host "Served: $localPath" -ForegroundColor Green
            } else {
                # File not found
                $response.StatusCode = 404
                $notFoundContent = [System.Text.Encoding]::UTF8.GetBytes("File not found: $localPath")
                $response.ContentLength64 = $notFoundContent.Length
                $response.ContentType = 'text/plain'
                $response.OutputStream.Write($notFoundContent, 0, $notFoundContent.Length)
                Write-Host "404 Not Found: $localPath" -ForegroundColor Red
            }
            
            $response.Close()
        } catch {
            Write-Host "Error handling request: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Failed to start server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative options:" -ForegroundColor Yellow
    Write-Host "1. Run as Administrator (right-click PowerShell and select 'Run as Administrator')" -ForegroundColor White
    Write-Host "2. Try a different port by changing 8080 to another number" -ForegroundColor White
    Write-Host "3. Check if another application is using port 8080" -ForegroundColor White
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
} 