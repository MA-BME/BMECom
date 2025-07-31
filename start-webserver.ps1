# BMECom.com Web Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting BMECom.com Web Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "Running as regular user - using file:// protocol" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your website is available at:" -ForegroundColor Green
    Write-Host "file:///C:/Users/maizikovitch/Site/index.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening website in browser..." -ForegroundColor Green
    Start-Process "file:///C:/Users/maizikovitch/Site/index.html"
} else {
    Write-Host "Running as administrator - attempting to start HTTP server" -ForegroundColor Green
    
    # Try to use .NET HttpListener
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:8080/")
        $listener.Start()
        
        Write-Host "Server started successfully!" -ForegroundColor Green
        Write-Host "Your website is available at:" -ForegroundColor Green
        Write-Host "http://localhost:8080" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
        
        # Open browser
        Start-Process "http://localhost:8080"
        
        # Keep server running
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/" -or $localPath -eq "") {
                $localPath = "/index.html"
            }
            
            $filePath = Join-Path $PWD $localPath.TrimStart("/")
            
            if (Test-Path $filePath) {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
                $notFound = "File not found: $localPath"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            
            $response.Close()
        }
    } catch {
        Write-Host "Could not start HTTP server: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Using file:// protocol instead" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Your website is available at:" -ForegroundColor Green
        Write-Host "file:///C:/Users/maizikovitch/Site/index.html" -ForegroundColor Yellow
        Start-Process "file:///C:/Users/maizikovitch/Site/index.html"
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 